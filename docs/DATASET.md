# Dataset Configuration

## 1. Project Identity

- Project: SegFormer Land Cover Sulawesi Selatan
- Study area: Provinsi Sulawesi Selatan, Indonesia
- Task: Semantic segmentation tutupan lahan
- Main model: SegFormer-B0
- Dataset configuration status: PASS

## 2. Area of Interest

- Source: `FAO/GAUL/2015/level1`
- Administrative level: Province
- Country field: `ADM0_NAME`
- Country value: `Indonesia`
- Region field: `ADM1_NAME`
- Region value: `Sulawesi Selatan`
- Feature count: 1
- AOI validation status: PASS

The administrative boundary is used as the study-area boundary. Small
differences between the GAUL boundary and the visual coastline of a
basemap may appear at large zoom levels.

## 3. Sentinel-2 Input

- Collection: `COPERNICUS/S2_SR_HARMONIZED`
- Period: 2021-01-01 to 2022-01-01
- Input bands: B2, B3, B4, B8
- Native input resolution: 10 meters
- Reflectance scale factor: 10000
- Scene cloud threshold: 40 percent
- Composite method: median
- Output image type: Float32

Band order:

1. B2 — Blue
2. B3 — Green
3. B4 — Red
4. B8 — Near Infrared

## 4. Cloud and Invalid-Pixel Masking

- Cloud collection: `COPERNICUS/S2_CLOUD_PROBABILITY`
- Join field: `system:index`
- Cloud probability threshold: 50
- Edge-mask bands: B8A and B9
- Excluded SCL values: 0, 1, 3, 8, 9, 10, 11

Bilinear resampling is applied to each source Sentinel-2 image before
the median composite is created. Bilinear resampling is not applied
directly to the final image collection composite.

Visual Sentinel-2 validation was completed over Makassar, Maros, and
Palopo.

## 5. Reference Label

- Dataset: `ESA/WorldCover/v200`
- Reference year: 2021
- Source band: `Map`
- Output band: `label`
- Original class values: 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100
- Training class values: 0 to 10
- Ignore index: 255
- Label resampling: nearest-neighbor

ESA WorldCover is treated as a reference or pseudo-label. It is not
described as field-observed ground truth.

## 6. Class Mapping

| Training ID | Original WorldCover ID | Class |
|---:|---:|---|
| 0 | 10 | Tree cover |
| 1 | 20 | Shrubland |
| 2 | 30 | Grassland |
| 3 | 40 | Cropland |
| 4 | 50 | Built-up |
| 5 | 60 | Bare or sparse vegetation |
| 6 | 70 | Snow and ice |
| 7 | 80 | Permanent water bodies |
| 8 | 90 | Herbaceous wetland |
| 9 | 95 | Mangroves |
| 10 | 100 | Moss and lichen |

## 7. Grid Configuration

- CRS: `EPSG:3857`
- CRS name: WGS 84 / Pseudo-Mercator
- Units: meters
- Pixel size: 10 × 10 meters
- Affine transform pattern: `[10, 0, x_origin, 0, -10, y_origin]`
- Grid configuration status: PASS

The image bands and label use the same export region, CRS, affine
transform, dimensions, and pixel grid. Accepted rasters may have fractional
projected origins; origin `0,0` is not required.

## 8. Dataset Stack

Final band order:

1. B2
2. B3
3. B4
4. B8
5. label

- Band count: 5
- Export type: Float32
- NoData value: -9999
- Format: GeoTIFF
- Cloud optimized: yes
- Compression: LZW

The label band is stored in the combined GeoTIFF as Float32, but its
values must remain exact categorical integers.

## 9. Sample Region

- Sample ID: `Makassar_Maros_Sample_003`
- Longitude minimum: 119.50
- Latitude minimum: -5.20
- Longitude maximum: 119.65
- Latitude maximum: -5.05
- Approximate sample area: 277.0855 square kilometers
- Intersection with administrative AOI: yes
- Unique classes present: 8

Classes found in the sample:

- 0 — Tree cover
- 1 — Shrubland
- 2 — Grassland
- 3 — Cropland
- 4 — Built-up
- 5 — Bare or sparse vegetation
- 7 — Permanent water bodies
- 8 — Herbaceous wetland

Classes 6, 9, and 10 are not required to appear in this technical sample.

## 10. Final Sample Export

- Task ID: `SULSEL_DATASET_SAMPLE_003`
- Filename: `SULSEL_DATASET_SAMPLE_003.tif`
- Google Drive folder: `SegFormer_LandCover_Sulsel`
- Local path: `data/raw/sample/SULSEL_DATASET_SAMPLE_003.tif`
- Export status: COMPLETED

Raster properties:

- Width: 1671 pixels
- Height: 1677 pixels
- Total pixels: 2,802,267
- Pixel size: 10 × 10 meters
- CRS: EPSG:3857
- Band count: 5
- Data type: Float32
- NoData: -9999
- NoData pixels in sample: 0
- Label minimum: 0
- Label maximum: 8

## 11. QGIS Audit

The sample was audited in QGIS using the project:

`qgis/dataset_sample_audit.qgz`

Validation results:

- GeoTIFF opened successfully: PASS
- CRS EPSG:3857: PASS
- Pixel size 10 × 10 meters: PASS
- Width 1671 pixels: PASS
- Height 1677 pixels: PASS
- Band count 5: PASS
- Data type Float32: PASS
- NoData -9999: PASS
- Band order B2, B3, B4, B8, label: PASS
- RGB spatial detail visible: PASS
- Band 5 integer values: PASS
- Fractional Band 5 values absent: PASS
- Unique labels limited to valid classes: PASS
- Image-label visual alignment: PASS
- Evidence screenshots complete: PASS

Unique label values found:

`0, 1, 2, 3, 4, 5, 7, 8`

Pixel counts:

| Label | Pixel count | Area (m²) |
|---:|---:|---:|
| 0 | 1,372,721 | 137,272,100 |
| 1 | 113 | 11,300 |
| 2 | 462,177 | 46,217,700 |
| 3 | 578,134 | 57,813,400 |
| 4 | 338,917 | 33,891,700 |
| 5 | 15,656 | 1,565,600 |
| 7 | 25,359 | 2,535,900 |
| 8 | 9,190 | 919,000 |

QGIS sample audit status: PASS

## 12. Evidence Files

Evidence directory:

`docs/evidence/dataset_sample/`

Files:

- `sample_export_task_completed.png`
- `sample_qgis_identify_band5.png`
- `sample_qgis_label_unique_values.png`
- `sample_qgis_raster_information_1.png`
- `sample_qgis_raster_information_2.png`
- `sample_qgis_raster_information_3.png`
- `sample_qgis_rgb_visualization.png`
- `sample_qgis_label_alignment.png`

## 13. Planned Patch Configuration

- Patch size: 256 × 256 pixels
- Approximate ground coverage: 2.56 × 2.56 kilometers
- Initial stride: 256 pixels
- Initial overlap: none
- Remove patches containing only NoData: yes
- Remove single-class patches: no

Patch extraction status: NOT STARTED

## 14. Planned Dataset Split

- Split method: spatial
- Training: 70 percent
- Validation: 15 percent
- Test: 15 percent

Spatial split status: NOT STARTED

## 15. Final Configuration Status

AOI configuration: PASS  
Sentinel-2 configuration: PASS  
Cloud-mask configuration: PASS  
WorldCover configuration: PASS  
Grid configuration: PASS  
Dataset-stack configuration: PASS  
Sample export: PASS  
QGIS sample audit: PASS  
Evidence collection: PASS  
- Three-pilot V2 export: PASS
- Three-pilot V2 final validation: PASS
- Three-pilot V2 automated raster audit: PASS
- Low-coverage `SULSEL_R005_C000` V2 manual QGIS audit: PASS
- Dedicated `SULSEL_R009_C004` manual QGIS screenshots: not recorded
- M5 Export Grid and Pilot Validation: PASS
- TASK 6.1 automated raster auditor: PASS
- M6 pre-production export preparation: PASS
- M6 Full Dataset Export and Raster Audit: IN_PROGRESS
- Production export manifest: 5 AUDITED_PASS; 50 EXPECTED_PENDING
- Batch_04 production export: COMPLETED
- Batch_04 local raster audit: PASS
- Batch_04 Gate 4: PASS
- Passed production tiles: 5 of 55
- Remaining production tiles: 50

**M5 DATASET AND PILOT VALIDATION STATUS: PASS**

## 16. Export Grid Audit (TASK 5.2)

- Script path: `gee/05_Export_Grid.js`
- CRS: `EPSG:3857`
- Approved production tile size: 50,000 meters (50 km × 50 km)
- Tile pixel dimensions: 5,000 × 5,000 pixels at 10-meter resolution
- Number of rows: 13
- Number of columns: 11
- Candidate tile count: 143
- Retained tile count: 55
- Tile ID format: `SULSEL_R000_C000`
- Tile properties: `tile_id`, `row`, `col`, `tile_size_m`, `crs`, `intersects_aoi`, `intersection_area_m2`, `tile_area_m2`, `aoi_coverage_ratio`
- Minimum AOI coverage ratio: ~0.000046
- Maximum AOI coverage ratio: ~1.0000000000000007 (floating-point precision artifact only)
- Map validation result: PASS (Full AOI coverage, zoom alignment, and rectangular tile geometry confirmed)
- No-export confirmation: PASS (Zero `Export.*` calls exist in script; zero new export tasks created)
- **TASK 5.2 FINAL STATUS: PASS**

### Evidence Paths (`docs/evidence/export_grid/`)
- `grid_console_first_tile_properties.png`
- `grid_map_alignment_zoom.png`
- `grid_map_full_aoi.png`
- `grid_tasks_no_new_export.png`
- `grid_console_aoi_configuration.png`
- `grid_console_first_tile_ids_and_property_names.png`
- `grid_console_coverage_ratio.png`
- `grid_console_grid_diagnostics.png`

> [!WARNING]
> - **Production Tile Size:** `50,000 meters` (`50 km × 50 km`) is approved for production after sample export validation, final validation and automated raster audits for all three V2 pilots, and dedicated manual QGIS label/alignment evidence for `SULSEL_R005_C000`.
> - **Full Tiled Export:** Full 55-tile export (`TASK 5.4`) is `IN_PROGRESS`; batch_04 has passed local raster audit, 5 of 55 production tiles have passed, and 50 production tiles remain. No next batch is authorized to run automatically.

The current milestone is M6 full dataset export and raster audit for Provinsi
Sulawesi Selatan. Batch_04 has passed the local raster gate, but M6 remains
`IN_PROGRESS` until all production tiles complete and pass audit.

## 17. Final Three-Pilot V2 Validation (M5 Closure)

All three accepted V2 pilot rasters exist locally and have final pilot audit
status `PASS`:

| Role | Tile ID | Accepted local file | Final V2 audit |
|---|---|---|---|
| Urban/coastal | `SULSEL_R005_C004` | `data/raw/pilot/SULSEL_2021_SULSEL_R005_C004_S2WC_V2.tif` | PASS |
| Vegetated/mountainous | `SULSEL_R009_C004` | `data/raw/pilot/SULSEL_2021_SULSEL_R009_C004_S2WC_V2.tif` | PASS |
| Low-coverage coastal/island | `SULSEL_R005_C000` | `data/raw/pilot/SULSEL_2021_SULSEL_R005_C000_S2WC_V2.tif` | PASS |

All three V2 pilots passed automated raster audit. Dedicated manual QGIS
evidence including label and image-label alignment exists for
`SULSEL_R005_C000`. Dedicated manual QGIS screenshots are not recorded for
`SULSEL_R009_C004` and are not claimed here.

### 17.1 Low-Coverage Pilot `SULSEL_R005_C000` V2

Verified manual QGIS properties:

- Dimensions: `5000 × 5000` pixels
- Band count: `5`
- Band order: `B2`, `B3`, `B4`, `B8`, `label`
- CRS: `EPSG:3857`
- Pixel size: `10 × 10` meters
- Raster type: `Float32`
- NoData: `-9999`
- Compression: `LZW`
- Label minimum: `0`
- Label maximum: `9`
- Observed labels: `0, 1, 2, 4, 5, 7, 8, 9`
- RGB `B4/B3/B2` visualization: PASS
- Categorical label visualization: PASS
- Identify Features confirms exact integer Band 5 label: PASS
- Image-label visual alignment: PASS

Verified evidence under `docs/evidence/pilot_export_precheck/`:

- `pilot_low_coverage_raster_information_1.png`
- `pilot_low_coverage_raster_information_2.png`
- `pilot_low_coverage_raster_information_3.png`
- `pilot_low_coverage_rgb_visualization.png`
- `pilot_low_coverage_label_unique_values.png`
- `pilot_low_coverage_label_visualization.png`
- `pilot_low_coverage_identify_label.png`
- `pilot_low_coverage_label_alignment.png`

This pilot closure validates the M5 pilot gate only. It is not evidence that the
55-tile full export, production manifest, or automated all-raster audit is
complete.

## 18. M6 Pre-Production Export Preparation

Prepared artifacts:

- Automated raster auditor: `src/data/audit_raster.py` (`PASS`)
- Unit tests: `tests/test_audit_raster.py` (`PASS`)
- Safe production export script: `gee/07_Full_Export.js`
- Expected production manifest: `data/raw/export_manifest.csv`

The manifest contains 55 expected production rows with initial status
`EXPECTED_PENDING`. The approved status values are:

- `EXPECTED_PENDING`: expected production raster has not yet completed the production export + local-audit lifecycle.
- `EXPORTED_PENDING_AUDIT`: production output exists, but local production audit has not yet passed.
- `AUDITED_PASS`: production output exists locally and automated production raster audit passed.
- `AUDITED_FAIL`: automated production raster audit failed.
- `QUARANTINED`: failed production raster has been deliberately quarantined and must not proceed to patch extraction.

It records deterministic tile IDs, row/column values, expected filenames, batch
IDs, dimensions, CRS, pixel size, band count, band order, dtype, NoData, and
current lifecycle status. The tile set is derived from the same FAO GAUL 2015
Level 1 source used by the GEE scripts and cross-checked against accepted V2
pilot raster grid origins and coverage ratios; no boundary dataset copy is
stored in the repository.

Production raster contract:

- Combined single GeoTIFF stack
- Band order: `B2`, `B3`, `B4`, `B8`, `label`
- Tile size status: `approved_for_production`
- Dimensions: `5000 × 5000` pixels per production tile
- CRS: `EPSG:3857`
- Pixel size: `10 × 10` meters
- Dtype: `Float32`
- NoData: `-9999`

Production all-NoData policy:

- Low valid coverage alone does not fail a tile.
- An all-NoData production raster must be quarantined/reviewed and must not
  proceed to patch creation.
- Production audit should invoke the auditor with `--fail-on-all-nodata`.

Batch_04 production export is `COMPLETED`, batch_04 local raster audit is
`PASS`, the five batch_04 manifest rows are `AUDITED_PASS`, and Batch_04 Gate 4
is `PASS`; see `logs/batch_04_raster_audit.md`. M6 remains `IN_PROGRESS` until
the remaining 50 production tiles complete and pass audit, downloaded files
match the manifest, all raw rasters are audited, and invalid tiles are
quarantined.
