# Batch 05 Production Raster Audit

## Scope

- Batch: `batch_05`
- Local directory: `data/raw/full/batch_05/`
- Auditor: `src/data/audit_raster.py`
- Command pattern: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Result: PASS, 5/5 automated local raster audits
- Manifest update: batch_05 rows promoted from `EXPECTED_PENDING` to `AUDITED_PASS`

Gate 4 is not complete yet. SHA-256 checksums and local storage >3 GiB
validation are complete; human QGIS production spot-check remains pending.

## File Reconciliation

- Expected files: 5
- Found files: 5
- Missing files: none
- Unexpected files: none
- Duplicate filenames: none
- Empty files: none

## Raster Results

### SULSEL_R005_C005

- Filename: `SULSEL_2021_SULSEL_R005_C005_S2WC_V1.tif`
- Audit status: PASS
- Dimensions: 5000x5000
- Total pixels: 25000000
- CRS: EPSG:3857
- Pixel size: 10 m
- Bands: B2,B3,B4,B8,label
- Dtype: float32
- NoData: -9999
- Valid pixels: 22300280
- NoData pixels: 2699720
- Invalid label pixels: 0
- Coverage: 89.201120%
- Unique labels: 0,1,2,3,4,5,7,8,9
- Class pixel counts:
  - 0: 16215515
  - 1: 3
  - 2: 1674716
  - 3: 3756291
  - 4: 295293
  - 5: 9256
  - 7: 296593
  - 8: 7444
  - 9: 45169
- All-NoData: false
- Warnings: none
- Failures: none

### SULSEL_R005_C006

- Filename: `SULSEL_2021_SULSEL_R005_C006_S2WC_V1.tif`
- Audit status: PASS
- Dimensions: 5000x5000
- Total pixels: 25000000
- CRS: EPSG:3857
- Pixel size: 10 m
- Bands: B2,B3,B4,B8,label
- Dtype: float32
- NoData: -9999
- Valid pixels: 151603
- NoData pixels: 24848397
- Invalid label pixels: 0
- Coverage: 0.606412%
- Unique labels: 0,1,2,3,4,5,7,8,9
- Class pixel counts:
  - 0: 13629
  - 1: 1
  - 2: 4330
  - 3: 22137
  - 4: 1239
  - 5: 949
  - 7: 103447
  - 8: 5552
  - 9: 319
- All-NoData: false
- Warnings: none
- Failures: none

### SULSEL_R006_C002

- Filename: `SULSEL_2021_SULSEL_R006_C002_S2WC_V1.tif`
- Audit status: PASS
- Dimensions: 5000x5000
- Total pixels: 25000000
- CRS: EPSG:3857
- Pixel size: 10 m
- Bands: B2,B3,B4,B8,label
- Dtype: float32
- NoData: -9999
- Valid pixels: 8095
- NoData pixels: 24991905
- Invalid label pixels: 0
- Coverage: 0.032380%
- Unique labels: 0,2,7,8
- Class pixel counts:
  - 0: 33
  - 2: 5
  - 7: 8055
  - 8: 2
- All-NoData: false
- Warnings: none
- Failures: none

### SULSEL_R006_C003

- Filename: `SULSEL_2021_SULSEL_R006_C003_S2WC_V1.tif`
- Audit status: PASS
- Dimensions: 5000x5000
- Total pixels: 25000000
- CRS: EPSG:3857
- Pixel size: 10 m
- Bands: B2,B3,B4,B8,label
- Dtype: float32
- NoData: -9999
- Valid pixels: 920
- NoData pixels: 24999080
- Invalid label pixels: 0
- Coverage: 0.003680%
- Unique labels: 7
- Class pixel counts:
  - 7: 920
- All-NoData: false
- Warnings: none
- Failures: none

### SULSEL_R006_C004

- Filename: `SULSEL_2021_SULSEL_R006_C004_S2WC_V1.tif`
- Audit status: PASS
- Dimensions: 5000x5000
- Total pixels: 25000000
- CRS: EPSG:3857
- Pixel size: 10 m
- Bands: B2,B3,B4,B8,label
- Dtype: float32
- NoData: -9999
- Valid pixels: 18892315
- NoData pixels: 6107685
- Invalid label pixels: 0
- Coverage: 75.569260%
- Unique labels: 0,1,2,3,4,5,7,8,9
- Class pixel counts:
  - 0: 14016307
  - 1: 723
  - 2: 1716290
  - 3: 1645994
  - 4: 237022
  - 5: 28798
  - 7: 869184
  - 8: 374475
  - 9: 3522
- All-NoData: false
- Warnings: none
- Failures: none

## Pixel Accounting

Each raster satisfies:

`valid pixels + NoData pixels + invalid label pixels = 25000000`

## Current Batch State

- Automated raster audit: PASS, 5/5
- Batch_05 manifest statuses: AUDITED_PASS, 5/5
- Production automated-audit PASS: 30 of 55
- Production remaining: 25
- M6 status: IN_PROGRESS
- Patch extraction: NOT STARTED

## SHA-256 Checksums

- `SULSEL_2021_SULSEL_R005_C005_S2WC_V1.tif`: `0515f2640ceb812c8299ab58ec56458b680cd80c7b0fe1a296819a9033adda4d`
- `SULSEL_2021_SULSEL_R005_C006_S2WC_V1.tif`: `dc04c77e1cb253e19a719daa9145da0868148f6fba8872e5954e603195d0ed19`
- `SULSEL_2021_SULSEL_R006_C002_S2WC_V1.tif`: `4752424e85fe0d620f5e607298f528e5dba0c29f9f722df9cbb9aafac647420d`
- `SULSEL_2021_SULSEL_R006_C003_S2WC_V1.tif`: `9d6f8730fa1d226cba171bf0130795207c96ea06f6959a2ec9bbc02251d1b996`
- `SULSEL_2021_SULSEL_R006_C004_S2WC_V1.tif`: `a0d8476f35ece4943f66e58b5c6a76aa0e53a1101b97771e5044d34126c6eb4f`

## Local Storage Gate

- Drive: `H:`
- Free bytes: 5461147648
- Free GiB: 5.086090
- >3.0 GiB Gate-4 buffer: PASS

## Human QGIS Production Spot-Check

- Evidence directory: `docs/evidence/batch05_qgis_spotcheck/`
- Production visual evidence already exists: NO
- Status: PENDING_HUMAN_QGIS_SPOT_CHECK

Recommended human tiles:

1. `SULSEL_R006_C003`
   - Reason: extreme low coverage
   - Valid pixels: 920
   - NoData pixels: 24999080
   - Coverage: 0.003680%
   - Unique labels: 7 only
   - Class 7 pixels: 920
   - All-NoData: false

2. `SULSEL_R005_C005`
   - Reason: dense/high-coverage production tile
   - Valid pixels: 22300280
   - NoData pixels: 2699720
   - Coverage: 89.201120%
   - Unique labels: 0,1,2,3,4,5,7,8,9
