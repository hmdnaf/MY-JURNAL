# Batch 02 Raster Audit

## Scope

- Milestone: M6 Full Dataset Export and Raster Audit
- Batch: `batch_02`
- Local directory: `data/raw/full/batch_02/`
- Audit command: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Audit mode: read-only raster audit
- Automated raster audit batch status: PASS
- Gate 4 status: PASS for batch_02 only

## Local File Reconciliation

- expected files: 5
- found files: 5
- missing files: none
- unexpected files: none
- duplicate filenames: none
- zero-byte files: none

Files found:

- `SULSEL_2021_SULSEL_R001_C010_S2WC_V1.tif` (2694460 bytes)
- `SULSEL_2021_SULSEL_R002_C006_S2WC_V1.tif` (72701055 bytes)
- `SULSEL_2021_SULSEL_R002_C007_S2WC_V1.tif` (3139971 bytes)
- `SULSEL_2021_SULSEL_R003_C006_S2WC_V1.tif` (112362706 bytes)
- `SULSEL_2021_SULSEL_R004_C000_S2WC_V1.tif` (6729888 bytes)

## Common Raster Contract

The per-tile sections below repeat the common raster contract so each raster
record is self-contained.

## Per-Tile Results

### R001_C010

- filename: `SULSEL_2021_SULSEL_R001_C010_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 6804
- NoData pixels: 24993196
- invalid label pixels: 0
- valid coverage: 0.027216%
- unique labels: 7
- all-NoData: false
- warnings: none
- failures: none
- class_pixel_counts:
  - 7: 6804

### R002_C006

- filename: `SULSEL_2021_SULSEL_R002_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 2712543
- NoData pixels: 22287457
- invalid label pixels: 0
- valid coverage: 10.850172%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- warnings: none
- failures: none
- class_pixel_counts:
  - 0: 2341491
  - 1: 128
  - 2: 82077
  - 3: 729
  - 4: 12082
  - 5: 3592
  - 7: 257191
  - 8: 4769
  - 9: 10484

### R002_C007

- filename: `SULSEL_2021_SULSEL_R002_C007_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 21248
- NoData pixels: 24978752
- invalid label pixels: 0
- valid coverage: 0.084992%
- unique labels: 0,1,2,4,5,7,8
- all-NoData: false
- warnings: none
- failures: none
- class_pixel_counts:
  - 0: 367
  - 1: 4
  - 2: 8234
  - 4: 299
  - 5: 576
  - 7: 11765
  - 8: 3

### R003_C006

- filename: `SULSEL_2021_SULSEL_R003_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 4270587
- NoData pixels: 20729413
- invalid label pixels: 0
- valid coverage: 17.082348%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- warnings: none
- failures: none
- class_pixel_counts:
  - 0: 3565411
  - 1: 524
  - 2: 423098
  - 3: 377
  - 4: 37371
  - 5: 3364
  - 7: 234828
  - 8: 888
  - 9: 4726

### R004_C000

- filename: `SULSEL_2021_SULSEL_R004_C000_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 149124
- NoData pixels: 24850876
- invalid label pixels: 0
- valid coverage: 0.596496%
- unique labels: 0,1,2,4,5,7,8,9
- all-NoData: false
- warnings: none
- failures: none
- class_pixel_counts:
  - 0: 37877
  - 1: 46
  - 2: 6656
  - 4: 159
  - 5: 251
  - 7: 34748
  - 8: 451
  - 9: 68936

## Pixel Accounting

- `R001_C010`: 6804 valid + 24993196 NoData + 0 invalid = 25000000
- `R002_C006`: 2712543 valid + 22287457 NoData + 0 invalid = 25000000
- `R002_C007`: 21248 valid + 24978752 NoData + 0 invalid = 25000000
- `R003_C006`: 4270587 valid + 20729413 NoData + 0 invalid = 25000000
- `R004_C000`: 149124 valid + 24850876 NoData + 0 invalid = 25000000

Pixel accounting status: PASS

## Gate-4 Integrity and Storage Checks

### SHA-256

- `SULSEL_2021_SULSEL_R001_C010_S2WC_V1.tif`: `ffdf67411fea97c09676b48e20cd49d7f119a548b7a4aec780d91b574abb681f`
- `SULSEL_2021_SULSEL_R002_C006_S2WC_V1.tif`: `d1edd534e624fa32a3ae2b94c18adbc39dedf9a3b0dd60b382d7d12c69cde438`
- `SULSEL_2021_SULSEL_R002_C007_S2WC_V1.tif`: `0ed5a6518f2a30fd92622f51be3e4b5b3cb6fe03912bc40382f6c6940b0a91c1`
- `SULSEL_2021_SULSEL_R003_C006_S2WC_V1.tif`: `f0d795ffea4a031c0a64059ac9c42c6040ad26bf998e4a973222f3f710548f70`
- `SULSEL_2021_SULSEL_R004_C000_S2WC_V1.tif`: `0d133e68e77ed8702a5bc8d2f3e77688f5fbf0c8201faf3182ca166f618c5129`

### Local Storage

- checked drive: `H:\`
- free bytes: 7617843200
- free GiB: 7.094669
- `>3.0 GiB` Gate-4 buffer: PASS

### Human QGIS Production Spot-Check

- evidence directory: `docs/evidence/batch02_qgis_spotcheck/`
- dedicated production evidence already exists: YES
- visual status: PASS

Evidence files:

- `docs/evidence/batch02_qgis_spotcheck/batch02_qgis_r001_c010_01_label_unique_values.png`
- `docs/evidence/batch02_qgis_spotcheck/batch02_qgis_r001_c010_02_rgb_label_alignment.png`
- `docs/evidence/batch02_qgis_spotcheck/batch02_qgis_r003_c006_01_label_unique_values.png`
- `docs/evidence/batch02_qgis_spotcheck/batch02_qgis_r003_c006_02_rgb_label_alignment.png`

`R001_C010`:

- visual status: PASS
- Band 5 observed values: 7
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO
- extreme low coverage expected: YES

`R003_C006`:

- visual status: PASS
- Band 5 observed values: 0,1,2,3,4,5,7,8,9
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO

- Gate 4 final status: PASS for batch_02 only

## Small-File Focus

`R001_C010`, `R002_C007`, and `R004_C000` contain valid label pixels, are not
all-NoData, and pass all raster-contract checks. Low valid coverage alone does
not fail a production tile.

## Manifest Update

All five batch_02 rasters passed automated local raster audit, and the five
batch_02 manifest rows are `AUDITED_PASS`. No other manifest lifecycle statuses
changed during this final Gate-4 closure task.

## Closure Note

Batch_02 has passed automated local raster audit, SHA-256 checksum capture,
local storage buffer validation, and human QGIS production spot-check. Batch_02
Gate 4 is `PASS` for batch_02 only. M6 remains `IN_PROGRESS` with 20 of 55
production tiles `AUDITED_PASS` and 35 production tiles `EXPECTED_PENDING`.
