"""Automated GeoTIFF raster auditor for the South Sulawesi dataset stack.

Purpose:
    Validate one combined five-band Sentinel-2 + ESA WorldCover GeoTIFF stack.

Input:
    A raster path, optionally with expected width and height constraints.

Output:
    A deterministic PASS/FAIL result and a human-readable console report.

Configuration:
    Defaults are loaded from configs/data.yaml when available. CLI arguments can
    override selected expectations for focused checks such as pilot dimensions.

Validation:
    Metadata is checked without reading pixel data. Label integrity is checked
    by reading Band 5 only, one Rasterio block/window at a time.

Error handling:
    Unreadable rasters and invalid metadata are reported as FAIL without
    modifying the source file.
"""

from __future__ import annotations

import argparse
import math
import sys
from collections import Counter
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np
import rasterio
import yaml
from affine import Affine
from rasterio.crs import CRS
from rasterio.errors import RasterioError


DEFAULT_BAND_ORDER = ("B2", "B3", "B4", "B8", "label")
DEFAULT_VALID_LABEL_VALUES = tuple(range(11))
DEFAULT_SUPPORTED_DRIVERS = ("GTiff", "COG")
LABEL_BAND_INDEX = 5


@dataclass(frozen=True)
class AuditConfig:
    expected_crs: str = "EPSG:3857"
    expected_pixel_size_x: float = 10.0
    expected_pixel_size_y: float = -10.0
    expected_band_count: int = 5
    expected_band_descriptions: tuple[str, ...] = DEFAULT_BAND_ORDER
    expected_dtype: str = "float32"
    expected_nodata: float = -9999.0
    valid_label_values: tuple[int, ...] = DEFAULT_VALID_LABEL_VALUES
    supported_drivers: tuple[str, ...] = DEFAULT_SUPPORTED_DRIVERS
    expected_width: int | None = None
    expected_height: int | None = None
    allow_rotation_shear: bool = False
    resolution_tolerance: float = 1e-6
    nodata_tolerance: float = 1e-6
    integer_tolerance: float = 1e-6
    fail_on_all_nodata: bool = False
    coverage_warning_threshold: float = 0.0


@dataclass(frozen=True)
class LabelStats:
    total_pixels: int
    valid_label_pixels: int
    nodata_label_pixels: int
    invalid_label_pixels: int
    unique_valid_class_ids: tuple[int, ...]
    class_pixel_counts: dict[int, int]
    scanned_windows: int
    max_window_pixels: int
    all_nodata: bool

    @property
    def valid_coverage_ratio(self) -> float:
        if self.total_pixels == 0:
            return 0.0
        return self.valid_label_pixels / self.total_pixels

    @property
    def valid_coverage_percent(self) -> float:
        return self.valid_coverage_ratio * 100.0


@dataclass(frozen=True)
class AuditResult:
    path: Path
    passed: bool
    failures: tuple[str, ...]
    warnings: tuple[str, ...]
    metadata: dict[str, object]
    label_stats: LabelStats | None

    @property
    def status(self) -> str:
        return "PASS" if self.passed else "FAIL"


def default_config_path() -> Path:
    return Path(__file__).resolve().parents[2] / "configs" / "data.yaml"


def load_audit_config(config_path: Path | None = None) -> AuditConfig:
    path = config_path or default_config_path()
    if not path.exists():
        if config_path is not None:
            raise FileNotFoundError(f"Config file does not exist: {path}")
        return AuditConfig()

    with path.open("r", encoding="utf-8") as handle:
        raw = yaml.safe_load(handle) or {}

    grid = raw.get("grid", {}) or {}
    stack = raw.get("dataset_stack", {}) or {}
    label = raw.get("label", {}) or {}

    band_order = tuple(stack.get("band_order") or DEFAULT_BAND_ORDER)
    training_values = tuple(
        int(value) for value in (label.get("training_values") or DEFAULT_VALID_LABEL_VALUES)
    )

    return AuditConfig(
        expected_crs=str(grid.get("crs", "EPSG:3857")),
        expected_pixel_size_x=float(grid.get("pixel_size_x", 10.0)),
        expected_pixel_size_y=float(grid.get("pixel_size_y", -10.0)),
        expected_band_count=int(stack.get("band_count", len(band_order))),
        expected_band_descriptions=band_order,
        expected_dtype=normalize_dtype_name(stack.get("output_data_type", "float32")),
        expected_nodata=float(stack.get("nodata", -9999.0)),
        valid_label_values=training_values,
    )


def normalize_dtype_name(dtype: object) -> str:
    try:
        return np.dtype(str(dtype)).name
    except TypeError:
        return str(dtype).lower()


def finite_number(value: float) -> bool:
    return math.isfinite(float(value))


def is_close(actual: float, expected: float, tolerance: float) -> bool:
    return math.isclose(float(actual), float(expected), rel_tol=0.0, abs_tol=tolerance)


def validate_metadata(dataset: rasterio.io.DatasetReader, config: AuditConfig) -> tuple[list[str], list[str], dict[str, object]]:
    failures: list[str] = []
    warnings: list[str] = []

    transform = dataset.transform
    bounds = dataset.bounds
    actual_descriptions = tuple(description or "" for description in dataset.descriptions)
    actual_dtypes = tuple(normalize_dtype_name(dtype) for dtype in dataset.dtypes)
    nodata_values = dataset.nodatavals

    metadata: dict[str, object] = {
        "driver": dataset.driver,
        "crs": dataset.crs.to_string() if dataset.crs else None,
        "width": dataset.width,
        "height": dataset.height,
        "band_count": dataset.count,
        "band_descriptions": actual_descriptions,
        "dtypes": actual_dtypes,
        "nodata_values": nodata_values,
        "transform": tuple(transform)[:6],
        "bounds": tuple(bounds),
        "resolution": (abs(transform.a), abs(transform.e)),
        "rotation_shear": (transform.b, transform.d),
    }

    supported_drivers = {driver.upper() for driver in config.supported_drivers}
    if (dataset.driver or "").upper() not in supported_drivers:
        failures.append(
            f"Unsupported raster driver {dataset.driver!r}; expected one of {sorted(supported_drivers)}."
        )

    if dataset.crs is None:
        failures.append("CRS is missing.")
    else:
        expected_crs = CRS.from_string(config.expected_crs)
        if dataset.crs != expected_crs:
            failures.append(
                f"CRS mismatch: actual {dataset.crs.to_string()}, expected {expected_crs.to_string()}."
            )

    if not transform_is_valid(transform):
        failures.append(f"Affine transform is invalid: {tuple(transform)[:6]}.")

    if not config.allow_rotation_shear:
        if not is_close(transform.b, 0.0, config.resolution_tolerance) or not is_close(
            transform.d, 0.0, config.resolution_tolerance
        ):
            failures.append(
                "Unexpected rotation/shear: "
                f"b={transform.b}, d={transform.d}; pass --allow-rotation-shear to permit it."
            )

    if not is_close(abs(transform.a), abs(config.expected_pixel_size_x), config.resolution_tolerance):
        failures.append(
            "Pixel width mismatch: "
            f"actual {abs(transform.a)}, expected {abs(config.expected_pixel_size_x)}."
        )

    if not is_close(abs(transform.e), abs(config.expected_pixel_size_y), config.resolution_tolerance):
        failures.append(
            "Pixel height mismatch: "
            f"actual {abs(transform.e)}, expected {abs(config.expected_pixel_size_y)}."
        )

    if dataset.width <= 0 or dataset.height <= 0:
        failures.append(f"Raster dimensions must be positive; got {dataset.width} x {dataset.height}.")

    if config.expected_width is not None and dataset.width != config.expected_width:
        failures.append(
            f"Width mismatch: actual {dataset.width}, expected {config.expected_width}."
        )

    if config.expected_height is not None and dataset.height != config.expected_height:
        failures.append(
            f"Height mismatch: actual {dataset.height}, expected {config.expected_height}."
        )

    if not bounds_are_valid(bounds):
        failures.append(f"Bounds are invalid: {tuple(bounds)}.")

    if dataset.count != config.expected_band_count:
        failures.append(
            f"Band count mismatch: actual {dataset.count}, expected {config.expected_band_count}."
        )
    elif actual_descriptions != config.expected_band_descriptions:
        failures.append(
            "Band description/order mismatch: "
            f"actual {actual_descriptions}, expected {config.expected_band_descriptions}."
        )

    if any(dtype != config.expected_dtype for dtype in actual_dtypes):
        failures.append(
            f"Dtype mismatch: actual {actual_dtypes}, expected all bands {config.expected_dtype}."
        )

    if not nodata_values or any(value is None for value in nodata_values):
        failures.append("NoData is missing for one or more bands.")
    else:
        wrong_nodata = [
            value
            for value in nodata_values
            if not is_close(float(value), config.expected_nodata, config.nodata_tolerance)
        ]
        if wrong_nodata:
            failures.append(
                f"NoData mismatch: actual {nodata_values}, expected {config.expected_nodata}."
            )

    if transform.c == 0.0 and transform.f == 0.0:
        warnings.append("Affine origin is 0,0; this is allowed but not required.")

    return failures, warnings, metadata


def transform_is_valid(transform: Affine) -> bool:
    coefficients = tuple(transform)[:6]
    if not all(finite_number(value) for value in coefficients):
        return False
    determinant = transform.a * transform.e - transform.b * transform.d
    return finite_number(determinant) and not is_close(determinant, 0.0, 1e-12)


def bounds_are_valid(bounds: object) -> bool:
    values = tuple(bounds)
    if len(values) != 4 or not all(finite_number(value) for value in values):
        return False
    left, bottom, right, top = values
    return left < right and bottom < top


def scan_label_band(dataset: rasterio.io.DatasetReader, config: AuditConfig) -> tuple[LabelStats, list[str], list[str]]:
    failures: list[str] = []
    warnings: list[str] = []
    class_counts: Counter[int] = Counter()
    valid_values = np.array(config.valid_label_values, dtype=np.int64)

    total_pixels = 0
    valid_label_pixels = 0
    nodata_label_pixels = 0
    invalid_label_pixels = 0
    scanned_windows = 0
    max_window_pixels = 0
    fractional_examples: list[float] = []
    out_of_range_examples: list[float] = []
    non_finite_examples: list[float] = []

    if dataset.count < LABEL_BAND_INDEX:
        failures.append(f"Cannot scan label band {LABEL_BAND_INDEX}; raster has {dataset.count} bands.")
        stats = LabelStats(
            total_pixels=dataset.width * dataset.height,
            valid_label_pixels=0,
            nodata_label_pixels=0,
            invalid_label_pixels=dataset.width * dataset.height,
            unique_valid_class_ids=(),
            class_pixel_counts={},
            scanned_windows=0,
            max_window_pixels=0,
            all_nodata=False,
        )
        return stats, failures, warnings

    for _, window in dataset.block_windows(LABEL_BAND_INDEX):
        labels = dataset.read(LABEL_BAND_INDEX, window=window, masked=False)
        scanned_windows += 1
        total_pixels += int(labels.size)
        max_window_pixels = max(max_window_pixels, int(labels.size))

        nodata_mask = np.isclose(
            labels,
            config.expected_nodata,
            rtol=0.0,
            atol=config.nodata_tolerance,
        )
        nodata_label_pixels += int(np.count_nonzero(nodata_mask))

        candidate = labels[~nodata_mask]
        if candidate.size == 0:
            continue

        finite_mask = np.isfinite(candidate)
        if not np.all(finite_mask):
            non_finite = candidate[~finite_mask]
            invalid_label_pixels += int(non_finite.size)
            add_examples(non_finite_examples, non_finite)

        candidate = candidate[finite_mask]
        if candidate.size == 0:
            continue

        rounded = np.rint(candidate)
        integer_mask = np.isclose(
            candidate,
            rounded,
            rtol=0.0,
            atol=config.integer_tolerance,
        )
        if not np.all(integer_mask):
            fractional = candidate[~integer_mask]
            invalid_label_pixels += int(fractional.size)
            add_examples(fractional_examples, fractional)

        integer_labels = rounded[integer_mask].astype(np.int64, copy=False)
        if integer_labels.size == 0:
            continue

        in_range_mask = np.isin(integer_labels, valid_values)
        if not np.all(in_range_mask):
            bad_values = integer_labels[~in_range_mask]
            invalid_label_pixels += int(bad_values.size)
            add_examples(out_of_range_examples, bad_values)

        accepted_labels = integer_labels[in_range_mask]
        valid_label_pixels += int(accepted_labels.size)

        if accepted_labels.size:
            unique_values, counts = np.unique(accepted_labels, return_counts=True)
            for value, count in zip(unique_values, counts, strict=True):
                class_counts[int(value)] += int(count)

    if non_finite_examples:
        failures.append(f"Non-finite label values found in Band 5: {format_examples(non_finite_examples)}.")
    if fractional_examples:
        failures.append(f"Fractional label values found in Band 5: {format_examples(fractional_examples)}.")
    if out_of_range_examples:
        failures.append(
            "Out-of-range label values found in Band 5: "
            f"{format_examples(out_of_range_examples)}; expected subset of {tuple(config.valid_label_values)}."
        )

    all_nodata = nodata_label_pixels == total_pixels
    if all_nodata:
        message = "Band 5 label is all NoData."
        if config.fail_on_all_nodata:
            failures.append(message)
        else:
            warnings.append(message + " No documented rule marks this as FAIL by default.")

    coverage = valid_label_pixels / total_pixels if total_pixels else 0.0
    if (
        config.coverage_warning_threshold > 0.0
        and not all_nodata
        and coverage < config.coverage_warning_threshold
    ):
        warnings.append(
            "Low valid-label coverage: "
            f"{coverage:.6f} is below warning threshold {config.coverage_warning_threshold:.6f}; "
            "this does not fail the raster."
        )

    stats = LabelStats(
        total_pixels=total_pixels,
        valid_label_pixels=valid_label_pixels,
        nodata_label_pixels=nodata_label_pixels,
        invalid_label_pixels=invalid_label_pixels,
        unique_valid_class_ids=tuple(sorted(class_counts)),
        class_pixel_counts=dict(sorted(class_counts.items())),
        scanned_windows=scanned_windows,
        max_window_pixels=max_window_pixels,
        all_nodata=all_nodata,
    )
    return stats, failures, warnings


def add_examples(target: list[float], values: np.ndarray, limit: int = 8) -> None:
    if len(target) >= limit:
        return
    for value in values[: max(0, limit - len(target))]:
        target.append(float(value))


def format_examples(values: Sequence[float]) -> str:
    return ", ".join(f"{value:g}" for value in values)


def audit_raster(raster_path: str | Path, config: AuditConfig | None = None) -> AuditResult:
    path = Path(raster_path)
    audit_config = config or load_audit_config()
    failures: list[str] = []
    warnings: list[str] = []
    metadata: dict[str, object] = {}
    label_stats: LabelStats | None = None

    if not path.exists():
        failures.append(f"File does not exist: {path}")
        return AuditResult(path, False, tuple(failures), tuple(warnings), metadata, label_stats)

    try:
        with rasterio.Env(GDAL_PAM_ENABLED="NO"):
            with rasterio.open(path, "r", sharing=False) as dataset:
                meta_failures, meta_warnings, metadata = validate_metadata(dataset, audit_config)
                failures.extend(meta_failures)
                warnings.extend(meta_warnings)

                label_stats, label_failures, label_warnings = scan_label_band(dataset, audit_config)
                failures.extend(label_failures)
                warnings.extend(label_warnings)
    except RasterioError as exc:
        failures.append(f"Rasterio could not open/read file: {exc}")
    except OSError as exc:
        failures.append(f"OS error while opening/reading file: {exc}")

    return AuditResult(
        path=path,
        passed=not failures,
        failures=tuple(failures),
        warnings=tuple(warnings),
        metadata=metadata,
        label_stats=label_stats,
    )


def build_report(result: AuditResult) -> str:
    lines = [
        "Raster Audit Report",
        "===================",
        f"Status: {result.status}",
        f"Path: {result.path}",
        "",
        "Metadata",
        "--------",
    ]

    if result.metadata:
        for key in (
            "driver",
            "crs",
            "width",
            "height",
            "band_count",
            "band_descriptions",
            "dtypes",
            "nodata_values",
            "transform",
            "bounds",
            "resolution",
            "rotation_shear",
        ):
            lines.append(f"{key}: {result.metadata.get(key)}")
        lines.append("internal_spatial_consistency: single combined stack; all bands share one grid")
    else:
        lines.append("metadata: unavailable")

    lines.extend(["", "Label Statistics", "----------------"])
    if result.label_stats is None:
        lines.append("label_stats: unavailable")
    else:
        stats = result.label_stats
        lines.extend(
            [
                f"total_pixels: {stats.total_pixels}",
                f"valid_label_pixels: {stats.valid_label_pixels}",
                f"nodata_label_pixels: {stats.nodata_label_pixels}",
                f"invalid_label_pixels: {stats.invalid_label_pixels}",
                f"valid_coverage_ratio: {stats.valid_coverage_ratio:.12f}",
                f"valid_coverage_percent: {stats.valid_coverage_percent:.6f}",
                f"all_nodata_label: {stats.all_nodata}",
                f"scanned_windows: {stats.scanned_windows}",
                f"max_window_pixels: {stats.max_window_pixels}",
                f"unique_valid_class_ids: {list(stats.unique_valid_class_ids)}",
                "class_pixel_counts:",
            ]
        )
        if stats.class_pixel_counts:
            for class_id, count in stats.class_pixel_counts.items():
                lines.append(f"  {class_id}: {count}")
        else:
            lines.append("  none")

    lines.extend(["", "Failures", "--------"])
    if result.failures:
        lines.extend(f"- {failure}" for failure in result.failures)
    else:
        lines.append("- none")

    lines.extend(["", "Warnings", "--------"])
    if result.warnings:
        lines.extend(f"- {warning}" for warning in result.warnings)
    else:
        lines.append("- none")

    return "\n".join(lines)


def parse_int_list(raw_values: Iterable[str]) -> tuple[int, ...]:
    values: list[int] = []
    for raw in raw_values:
        for piece in raw.split(","):
            piece = piece.strip()
            if piece:
                values.append(int(piece))
    return tuple(values)


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit one combined five-band Sentinel-2 + WorldCover GeoTIFF stack."
    )
    parser.add_argument("raster", type=Path, help="Path to the GeoTIFF raster stack.")
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Path to data.yaml with expected raster configuration.",
    )
    parser.add_argument("--expected-width", type=int, default=None)
    parser.add_argument("--expected-height", type=int, default=None)
    parser.add_argument("--expected-crs", default=None)
    parser.add_argument("--expected-x-resolution", type=float, default=None)
    parser.add_argument("--expected-y-resolution", type=float, default=None)
    parser.add_argument("--expected-dtype", default=None)
    parser.add_argument("--expected-nodata", type=float, default=None)
    parser.add_argument(
        "--valid-label-values",
        nargs="+",
        default=None,
        help="Valid raw label IDs, as space-separated or comma-separated integers.",
    )
    parser.add_argument("--allow-rotation-shear", action="store_true")
    parser.add_argument("--fail-on-all-nodata", action="store_true")
    parser.add_argument("--resolution-tolerance", type=float, default=None)
    parser.add_argument("--integer-tolerance", type=float, default=None)
    parser.add_argument("--nodata-tolerance", type=float, default=None)
    parser.add_argument("--coverage-warning-threshold", type=float, default=None)
    return parser.parse_args(argv)


def config_from_args(args: argparse.Namespace) -> AuditConfig:
    config = load_audit_config(args.config)

    overrides: dict[str, object] = {
        "expected_width": args.expected_width,
        "expected_height": args.expected_height,
        "allow_rotation_shear": args.allow_rotation_shear,
        "fail_on_all_nodata": args.fail_on_all_nodata,
    }

    optional_overrides = {
        "expected_crs": args.expected_crs,
        "expected_pixel_size_x": args.expected_x_resolution,
        "expected_pixel_size_y": args.expected_y_resolution,
        "expected_dtype": normalize_dtype_name(args.expected_dtype) if args.expected_dtype else None,
        "expected_nodata": args.expected_nodata,
        "resolution_tolerance": args.resolution_tolerance,
        "integer_tolerance": args.integer_tolerance,
        "nodata_tolerance": args.nodata_tolerance,
        "coverage_warning_threshold": args.coverage_warning_threshold,
    }
    overrides.update(
        {key: value for key, value in optional_overrides.items() if value is not None}
    )

    if args.valid_label_values is not None:
        overrides["valid_label_values"] = parse_int_list(args.valid_label_values)

    return replace(config, **overrides)


def main(argv: Sequence[str] | None = None) -> int:
    try:
        args = parse_args(argv)
        config = config_from_args(args)
        result = audit_raster(args.raster, config)
        print(build_report(result))
        return 0 if result.passed else 1
    except Exception as exc:  # pragma: no cover - defensive CLI guard
        print(f"Execution error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
