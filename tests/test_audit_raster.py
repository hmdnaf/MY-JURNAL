from __future__ import annotations

import subprocess
import sys
from dataclasses import replace
from pathlib import Path

import numpy as np
import pytest
import rasterio
from affine import Affine
from rasterio.transform import from_origin

from src.data.audit_raster import AuditConfig, audit_raster, load_audit_config


BAND_ORDER = ("B2", "B3", "B4", "B8", "label")


@pytest.fixture()
def base_config() -> AuditConfig:
    return AuditConfig(
        expected_crs="EPSG:3857",
        expected_pixel_size_x=10.0,
        expected_pixel_size_y=-10.0,
        expected_band_count=5,
        expected_band_descriptions=BAND_ORDER,
        expected_dtype="float32",
        expected_nodata=-9999.0,
        valid_label_values=tuple(range(11)),
    )


def write_stack(
    path: Path,
    *,
    width: int = 6,
    height: int = 5,
    count: int = 5,
    crs: str = "EPSG:3857",
    x_resolution: float = 10.0,
    y_resolution: float = 10.0,
    descriptions: tuple[str, ...] | None = BAND_ORDER,
    nodata: float = -9999.0,
    dtype: str = "float32",
    label_values: np.ndarray | None = None,
    transform: Affine | None = None,
) -> Path:
    if transform is None:
        transform = from_origin(123.25, -456.75, x_resolution, y_resolution)
    data = np.zeros((count, height, width), dtype=dtype)
    data[: min(count, 4), :, :] = 0.1

    if count >= 5:
        if label_values is None:
            label_values = np.array(
                [
                    [0, 1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10, 0],
                    [1, 2, 3, 4, 5, 6],
                    [7, 8, 9, 10, 0, 1],
                    [2, 3, 4, 5, 6, 7],
                ],
                dtype=dtype,
            )
        data[4, :, :] = label_values.astype(dtype, copy=False)

    with rasterio.open(
        path,
        "w",
        driver="GTiff",
        width=width,
        height=height,
        count=count,
        dtype=dtype,
        crs=crs,
        transform=transform,
        nodata=nodata,
        tiled=True,
        blockxsize=16,
        blockysize=16,
    ) as dataset:
        dataset.write(data)
        if descriptions is not None:
            for index, description in enumerate(descriptions[:count], start=1):
                dataset.set_band_description(index, description)

    return path


def test_valid_five_band_raster_passes(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "valid.tif")
    result = audit_raster(raster, base_config)

    assert result.passed
    assert result.failures == ()
    assert result.label_stats is not None
    assert result.label_stats.unique_valid_class_ids == tuple(range(11))


def test_wrong_crs_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "wrong_crs.tif", crs="EPSG:4326")
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("CRS mismatch" in failure for failure in result.failures)


def test_wrong_pixel_resolution_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "wrong_resolution.tif", x_resolution=20.0, y_resolution=20.0)
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Pixel width mismatch" in failure for failure in result.failures)
    assert any("Pixel height mismatch" in failure for failure in result.failures)


def test_wrong_band_count_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "wrong_band_count.tif", count=4, descriptions=BAND_ORDER[:4])
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Band count mismatch" in failure for failure in result.failures)
    assert any("Cannot scan label band" in failure for failure in result.failures)


def test_wrong_band_description_order_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(
        tmp_path / "wrong_band_order.tif",
        descriptions=("B2", "B4", "B3", "B8", "label"),
    )
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Band description/order mismatch" in failure for failure in result.failures)


def test_wrong_nodata_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "wrong_nodata.tif", nodata=-999.0)
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("NoData mismatch" in failure for failure in result.failures)


def test_wrong_dtype_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "wrong_dtype.tif", dtype="float64")
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Dtype mismatch" in failure for failure in result.failures)


def test_unexpected_rotation_shear_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    transform = Affine(10.0, 1.0, 123.25, 0.0, -10.0, -456.75)
    raster = write_stack(tmp_path / "rotation_shear.tif", transform=transform)
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Unexpected rotation/shear" in failure for failure in result.failures)


def test_fractional_label_value_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.zeros((5, 6), dtype="float32")
    labels[2, 3] = 2.2
    raster = write_stack(tmp_path / "fractional_label.tif", label_values=labels)
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Fractional label values" in failure for failure in result.failures)


def test_out_of_range_label_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.zeros((5, 6), dtype="float32")
    labels[1, 1] = 11.0
    raster = write_stack(tmp_path / "out_of_range_label.tif", label_values=labels)
    result = audit_raster(raster, base_config)

    assert not result.passed
    assert any("Out-of-range label values" in failure for failure in result.failures)


def test_valid_subset_of_labels_passes(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.full((5, 6), 7.0, dtype="float32")
    labels[0, 0] = 1.0
    raster = write_stack(tmp_path / "valid_subset.tif", label_values=labels)
    result = audit_raster(raster, base_config)

    assert result.passed
    assert result.label_stats is not None
    assert result.label_stats.unique_valid_class_ids == (1, 7)
    assert result.label_stats.class_pixel_counts == {1: 1, 7: 29}


def test_low_valid_coverage_passes_and_excludes_nodata(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.full((5, 6), -9999.0, dtype="float32")
    labels[0, 0] = 8.0
    config = replace(base_config, coverage_warning_threshold=0.5)
    raster = write_stack(tmp_path / "low_coverage.tif", label_values=labels)
    result = audit_raster(raster, config)

    assert result.passed
    assert result.label_stats is not None
    assert result.label_stats.valid_label_pixels == 1
    assert result.label_stats.nodata_label_pixels == 29
    assert result.label_stats.class_pixel_counts == {8: 1}
    assert result.warnings


def test_all_nodata_warns_without_failing_by_default(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.full((5, 6), -9999.0, dtype="float32")
    raster = write_stack(tmp_path / "all_nodata_default.tif", label_values=labels)
    result = audit_raster(raster, base_config)

    assert result.passed
    assert result.label_stats is not None
    assert result.label_stats.all_nodata
    assert result.label_stats.valid_label_pixels == 0
    assert result.label_stats.nodata_label_pixels == 30
    assert any("all NoData" in warning for warning in result.warnings)


def test_all_nodata_fails_when_configured(tmp_path: Path, base_config: AuditConfig) -> None:
    labels = np.full((5, 6), -9999.0, dtype="float32")
    config = replace(base_config, fail_on_all_nodata=True)
    raster = write_stack(tmp_path / "all_nodata_fail.tif", label_values=labels)
    result = audit_raster(raster, config)

    assert not result.passed
    assert result.label_stats is not None
    assert result.label_stats.all_nodata
    assert any("all NoData" in failure for failure in result.failures)


def test_expected_dimension_mismatch_fails(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "dimension_mismatch.tif", width=6, height=5)
    config = replace(base_config, expected_width=5000, expected_height=5000)
    result = audit_raster(raster, config)

    assert not result.passed
    assert any("Width mismatch" in failure for failure in result.failures)
    assert any("Height mismatch" in failure for failure in result.failures)


def test_expected_dimension_match_passes(tmp_path: Path, base_config: AuditConfig) -> None:
    raster = write_stack(tmp_path / "dimension_match.tif", width=6, height=5)
    config = replace(base_config, expected_width=6, expected_height=5)
    result = audit_raster(raster, config)

    assert result.passed


def test_loads_configuration_from_temporary_yaml(tmp_path: Path) -> None:
    config_path = tmp_path / "data.yaml"
    config_path.write_text(
        """
grid:
  crs: EPSG:3857
  pixel_size_x: 20
  pixel_size_y: -20
dataset_stack:
  band_order:
    - B2
    - B3
    - B4
    - B8
    - label
  band_count: 5
  output_data_type: float64
  nodata: -7777
label:
  training_values:
    - 0
    - 1
""".lstrip(),
        encoding="utf-8",
    )

    config = load_audit_config(config_path)

    assert config.expected_pixel_size_x == 20.0
    assert config.expected_pixel_size_y == -20.0
    assert config.expected_dtype == "float64"
    assert config.expected_nodata == -7777.0
    assert config.valid_label_values == (0, 1)


def test_cli_public_interface_rejects_invalid_fixture_with_message(
    tmp_path: Path,
) -> None:
    labels = np.zeros((5, 6), dtype="float32")
    labels[0, 0] = 0.5
    raster = write_stack(tmp_path / "cli_invalid_fractional.tif", label_values=labels)
    script = Path(__file__).resolve().parents[1] / "src" / "data" / "audit_raster.py"

    completed = subprocess.run(
        [sys.executable, str(script), str(raster)],
        check=False,
        capture_output=True,
        text=True,
    )

    assert completed.returncode == 1
    assert "Status: FAIL" in completed.stdout
    assert "Fractional label values" in completed.stdout


def test_cli_explicit_missing_config_path_fails(tmp_path: Path) -> None:
    raster = write_stack(tmp_path / "valid_for_missing_config_cli.tif")
    missing_config = tmp_path / "missing_data.yaml"
    script = Path(__file__).resolve().parents[1] / "src" / "data" / "audit_raster.py"

    completed = subprocess.run(
        [sys.executable, str(script), str(raster), "--config", str(missing_config)],
        check=False,
        capture_output=True,
        text=True,
    )

    assert completed.returncode == 2
    assert "Config file does not exist" in completed.stderr
