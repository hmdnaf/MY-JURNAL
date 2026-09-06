# Batch 03 Raster Audit

## Scope

- Task: M6 Batch 03 Local Raster Audit
- Batch ID: batch_03
- Local directory: `data/raw/full/batch_03/`
- Audit command: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Gate 4 status: PASS
- Gate 4 closure: GEE reconciliation PASS; download reconciliation PASS; automated raster audit PASS; SHA-256 capture PASS; local storage buffer PASS; human QGIS production spot-check PASS

## File Reconciliation

- Expected files: 5
- Found files: 5
- Missing files: none
- Unexpected files: none
- Duplicate filenames: none
- Zero-byte files: none

## Raster Results

### SULSEL_R004_C001

- filename: `SULSEL_2021_SULSEL_R004_C001_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 18207
- NoData pixels: 24981793
- invalid label pixels: 0
- coverage: 0.072828%
- unique labels: 0,2,3,4,5,7,8
- class_pixel_counts:
  - 0: 9725
  - 2: 6184
  - 3: 12
  - 4: 209
  - 5: 19
  - 7: 2043
  - 8: 15
- all-NoData: false
- warnings: none
- failures: none

### SULSEL_R004_C002

- filename: `SULSEL_2021_SULSEL_R004_C002_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 3127
- NoData pixels: 24996873
- invalid label pixels: 0
- coverage: 0.012508%
- unique labels: 0,2,5,7
- class_pixel_counts:
  - 0: 1393
  - 2: 83
  - 5: 30
  - 7: 1621
- all-NoData: false
- warnings: none
- failures: none

### SULSEL_R004_C003

- filename: `SULSEL_2021_SULSEL_R004_C003_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 2765673
- NoData pixels: 22234327
- invalid label pixels: 0
- coverage: 11.062692%
- unique labels: 0,1,2,3,4,5,7,8,9
- class_pixel_counts:
  - 0: 579347
  - 1: 5
  - 2: 176776
  - 3: 1211885
  - 4: 221146
  - 5: 7262
  - 7: 483150
  - 8: 65491
  - 9: 20611
- all-NoData: false
- warnings: none
- failures: none

### SULSEL_R004_C004

- filename: `SULSEL_2021_SULSEL_R004_C004_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 21481839
- NoData pixels: 3518161
- invalid label pixels: 0
- coverage: 85.927356%
- unique labels: 0,1,2,3,4,5,7,8
- class_pixel_counts:
  - 0: 13515482
  - 1: 20
  - 2: 2637995
  - 3: 4128133
  - 4: 596940
  - 5: 66408
  - 7: 482156
  - 8: 54705
- all-NoData: false
- warnings: none
- failures: none

### SULSEL_R004_C005

- filename: `SULSEL_2021_SULSEL_R004_C005_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- band order: B2,B3,B4,B8,label
- dtype: float32
- NoData: -9999
- valid pixels: 16539349
- NoData pixels: 8460651
- invalid label pixels: 0
- coverage: 66.157396%
- unique labels: 0,1,2,3,4,5,7,8,9
- class_pixel_counts:
  - 0: 12218918
  - 1: 103
  - 2: 907078
  - 3: 2548578
  - 4: 496613
  - 5: 30783
  - 7: 308459
  - 8: 18431
  - 9: 10386
- all-NoData: false
- warnings: none
- failures: none

## Pixel Accounting

- SULSEL_R004_C001: 18207 + 24981793 + 0 = 25000000
- SULSEL_R004_C002: 3127 + 24996873 + 0 = 25000000
- SULSEL_R004_C003: 2765673 + 22234327 + 0 = 25000000
- SULSEL_R004_C004: 21481839 + 3518161 + 0 = 25000000
- SULSEL_R004_C005: 16539349 + 8460651 + 0 = 25000000
- every raster = 25000000 pixels: YES

## SHA-256 Checksums

- `SULSEL_2021_SULSEL_R004_C001_S2WC_V1.tif`: `697c82df9bbfd4e350a2d2dfd066991a668728598cb30b8c587e3ca8d0e372bc`
- `SULSEL_2021_SULSEL_R004_C002_S2WC_V1.tif`: `0ff9513d7b472d7e5b86cd23fbcf7073b41c9c7bc1ca76a4366f5567346f9339`
- `SULSEL_2021_SULSEL_R004_C003_S2WC_V1.tif`: `4edf2e48dd5d544821d48bfb70b88d80c5f40d277654ce9a4046661d8074047c`
- `SULSEL_2021_SULSEL_R004_C004_S2WC_V1.tif`: `210b6cbe73d56479b81d46a810468adecf1b5c2aa7ebcd36279dc0813878e6c3`
- `SULSEL_2021_SULSEL_R004_C005_S2WC_V1.tif`: `b49b733d9f17415a8afb3b9f666072f48ff86c48ff3d01340ef4a2d75197b1e6`

## Local Storage Gate

- Drive checked: `H:`
- Free bytes: 6545727488
- Free GiB: 6.095133
- Gate-4 buffer requirement: >3.0 GiB
- Gate-4 buffer status: PASS

## Human QGIS Production Spot-Check

- Evidence directory checked: `docs/evidence/batch03_qgis_spotcheck/`
- Evidence already exists: YES
- Status: PASS
- Gate 4 status: PASS
- Spot-checked production tiles: 2

### SULSEL_R004_C002

- visual status: PASS
- Band 5 observed values: 0,2,5,7
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO
- flip: NO
- extreme low coverage expected: YES

### SULSEL_R004_C004

- visual status: PASS
- Band 5 observed values: 0,1,2,3,4,5,7,8
- RGB bands: B4/B3/B2
- RGB-label alignment: PASS
- systematic offset: NO
- rotation: NO
- flip: NO

### Evidence Files

- `batch03_qgis_r004_c002_01_label_unique_values.png`
- `batch03_qgis_r004_c002_02_rgb_label_alignment.png`
- `batch03_qgis_r004_c004_01_label_unique_values.png`
- `batch03_qgis_r004_c004_02_rgb_label_alignment.png`

## Manifest Update

- Previous batch_03 status: EXPECTED_PENDING
- Updated batch_03 status: AUDITED_PASS
- Updated rows: SULSEL_R004_C001, SULSEL_R004_C002, SULSEL_R004_C003, SULSEL_R004_C004, SULSEL_R004_C005
- M6 status after this audit: IN_PROGRESS
- Production automated-audit PASS after this audit: 25 of 55
- Production remaining after this audit: 30
