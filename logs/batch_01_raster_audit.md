# Batch 01 Raster Audit

## Scope

- Milestone: M6 Full Dataset Export and Raster Audit
- Batch: `batch_01`
- Local directory: `data/raw/full/batch_01/`
- Audit command: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Audit mode: read-only raster audit
- Automated raster audit batch status: PASS
- Gate 4 status: PASS for batch_01 only

## Local File Reconciliation

- expected files: 5
- found files: 5
- missing files: none
- unexpected files: none
- duplicate filenames: none
- zero-byte files: none

Files found:

- `SULSEL_2021_SULSEL_R000_C006_S2WC_V1.tif` (44288567 bytes)
- `SULSEL_2021_SULSEL_R000_C007_S2WC_V1.tif` (47271187 bytes)
- `SULSEL_2021_SULSEL_R000_C009_S2WC_V1.tif` (28946372 bytes)
- `SULSEL_2021_SULSEL_R001_C006_S2WC_V1.tif` (11996465 bytes)
- `SULSEL_2021_SULSEL_R001_C007_S2WC_V1.tif` (6056227 bytes)

## Common Raster Contract

The per-tile sections below repeat the common raster contract so each raster
record is self-contained.

## Per-Tile Results

### R000_C006

- file: `SULSEL_2021_SULSEL_R000_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1584848
- NoData pixels: 23415152
- invalid label pixels: 0
- coverage: 6.339392%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 1118281
  - 1: 18
  - 2: 121397
  - 3: 84922
  - 4: 7563
  - 5: 3316
  - 7: 223636
  - 8: 4853
  - 9: 20862

### R000_C007

- file: `SULSEL_2021_SULSEL_R000_C007_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1744051
- NoData pixels: 23255949
- invalid label pixels: 0
- coverage: 6.976204%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 1173260
  - 1: 3390
  - 2: 294012
  - 3: 20
  - 4: 5139
  - 5: 726
  - 7: 266435
  - 8: 125
  - 9: 944

### R000_C009

- file: `SULSEL_2021_SULSEL_R000_C009_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1014409
- NoData pixels: 23985591
- invalid label pixels: 0
- coverage: 4.057636%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 902610
  - 1: 924
  - 2: 43122
  - 3: 83
  - 4: 4297
  - 5: 752
  - 7: 58591
  - 8: 54
  - 9: 3976

### R001_C006

- file: `SULSEL_2021_SULSEL_R001_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 344292
- NoData pixels: 24655708
- invalid label pixels: 0
- coverage: 1.377168%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 236220
  - 1: 32
  - 2: 17521
  - 3: 4807
  - 4: 5252
  - 5: 3710
  - 7: 69637
  - 8: 887
  - 9: 6226

### R001_C007

- file: `SULSEL_2021_SULSEL_R001_C007_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 130375
- NoData pixels: 24869625
- invalid label pixels: 0
- coverage: 0.521500%
- unique labels: 0,2,3,4,5,7,8
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 101901
  - 2: 12963
  - 3: 51
  - 4: 1345
  - 5: 808
  - 7: 13287
  - 8: 20

## Pixel Accounting

- `R000_C006`: 1584848 valid + 23415152 NoData + 0 invalid = 25000000
- `R000_C007`: 1744051 valid + 23255949 NoData + 0 invalid = 25000000
- `R000_C009`: 1014409 valid + 23985591 NoData + 0 invalid = 25000000
- `R001_C006`: 344292 valid + 24655708 NoData + 0 invalid = 25000000
- `R001_C007`: 130375 valid + 24869625 NoData + 0 invalid = 25000000

Pixel accounting status: PASS

## Gate-4 Integrity and Storage Checks

### SHA-256

- `SULSEL_2021_SULSEL_R000_C006_S2WC_V1.tif`: `82b752017dc405428e1536a95bcd03a96b197e6efdff6cd8349b48699cc3bf6b`
- `SULSEL_2021_SULSEL_R000_C007_S2WC_V1.tif`: `fe62b7abf268c2e328a3fbac96087860b0f6ca616049b2546416f8f33292ff30`
- `SULSEL_2021_SULSEL_R000_C009_S2WC_V1.tif`: `dfd4996295563fa1bcff4a571d8a2b391164746604a153167b566ea30f60dd78`
- `SULSEL_2021_SULSEL_R001_C006_S2WC_V1.tif`: `fe0e4420f4163612df31e6e7ba1746a7c5d9d5d671c0286d57c9f4cadadc8f25`
- `SULSEL_2021_SULSEL_R001_C007_S2WC_V1.tif`: `bcc73826afcdd335698534e8c5c5f4766e2efe26d3094eb770045e83246ee487`

### Local Storage

- checked drive: `H:\`
- free bytes: 7821402112
- free GiB: 7.284248
- `>3.0 GiB` Gate-4 buffer: PASS

### Human QGIS Production Spot-Check

- evidence directory: `docs/evidence/batch01_qgis_spotcheck/`
- dedicated production evidence already exists: YES
- status: PASS

Evidence files found:

- `batch01_qgis_r000_c007_01_label_unique_values.png`
- `batch01_qgis_r000_c007_02_rgb_label_alignment.png`
- `batch01_qgis_r001_c007_01_label_unique_values.png`
- `batch01_qgis_r001_c007_02_rgb_label_alignment.png`

#### R001_C007

- visual status: PASS
- Band 5 observed values: 0,2,3,4,5,7,8
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO
- note: low coverage is expected

#### R000_C007

- visual status: PASS
- Band 5 observed values: 0,1,2,3,4,5,7,8,9
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO

- Gate 4 final status: PASS for batch_01 only

## Small-Coverage Focus

`R001_C006` and `R001_C007` both contain valid label pixels, are not all-NoData,
and pass all raster-contract checks. Low valid coverage alone does not fail a
production tile.

## Closure Note

Batch_01 has passed the automated local raster audit. The five batch_01
manifest rows are `AUDITED_PASS`. SHA-256 checksum capture and local storage
buffer validation are recorded above. Human QGIS production spot-check is
`PASS` for exactly two production tiles. Batch_01 Gate 4 is `PASS` for
batch_01 only. M6 remains `IN_PROGRESS` with 15 of 55 production tiles
`AUDITED_PASS` and 40 production tiles `EXPECTED_PENDING`.
