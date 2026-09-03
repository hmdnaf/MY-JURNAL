# Batch 08 Raster Audit

## Scope

- Milestone: M6 Full Dataset Export and Raster Audit
- Batch: `batch_08`
- Local directory: `data/raw/full/batch_08/`
- Audit command: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Audit mode: read-only raster audit
- Automated raster audit batch status: PASS
- Gate 4 status: NOT CLOSED; SHA-256 and local storage checks are recorded below, and human QGIS spot-check is pending

## Local File Reconciliation

- expected files: 5
- found files: 5
- missing files: none
- unexpected files: none
- duplicate filenames: none
- zero-byte files: none

Files found:

- `SULSEL_2021_SULSEL_R009_C004_S2WC_V1.tif` (575110694 bytes)
- `SULSEL_2021_SULSEL_R009_C005_S2WC_V1.tif` (594314903 bytes)
- `SULSEL_2021_SULSEL_R009_C006_S2WC_V1.tif` (43269940 bytes)
- `SULSEL_2021_SULSEL_R009_C007_S2WC_V1.tif` (2545114 bytes)
- `SULSEL_2021_SULSEL_R009_C008_S2WC_V1.tif` (16198345 bytes)

## Common Raster Contract

The per-tile sections below repeat the common raster contract so each raster
record is self-contained.

## Per-Tile Results

### R009_C004

- file: `SULSEL_2021_SULSEL_R009_C004_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 22028322
- NoData pixels: 2971678
- invalid label pixels: 0
- coverage: 88.113288%
- unique labels: 0,2,3,4,5,7,8
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 15857189
  - 2: 5474316
  - 3: 454206
  - 4: 169210
  - 5: 23289
  - 7: 50110
  - 8: 2

### R009_C005

- file: `SULSEL_2021_SULSEL_R009_C005_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 23108918
- NoData pixels: 1891082
- invalid label pixels: 0
- coverage: 92.435672%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 18786700
  - 1: 232
  - 2: 2116537
  - 3: 1817296
  - 4: 186371
  - 5: 24167
  - 7: 142681
  - 8: 12347
  - 9: 22587

### R009_C006

- file: `SULSEL_2021_SULSEL_R009_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1554346
- NoData pixels: 23445654
- invalid label pixels: 0
- coverage: 6.217384%
- unique labels: 0,1,2,3,4,5,7,8,9
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 455022
  - 1: 980
  - 2: 75538
  - 3: 578789
  - 4: 74337
  - 5: 5207
  - 7: 280324
  - 8: 13431
  - 9: 70718

### R009_C007

- file: `SULSEL_2021_SULSEL_R009_C007_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1561
- NoData pixels: 24998439
- invalid label pixels: 0
- coverage: 0.006244%
- unique labels: 0,2
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 1494
  - 2: 67

### R009_C008

- file: `SULSEL_2021_SULSEL_R009_C008_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 539939
- NoData pixels: 24460061
- invalid label pixels: 0
- coverage: 2.159756%
- unique labels: 0,2
- all-NoData: false
- audit warnings: none
- audit failures: none
- class_pixel_counts:
  - 0: 522021
  - 2: 17918

## R009_C004 Pilot Canary Cross-Check

Accepted V2 automated baseline:

- valid pixels: 22028322
- NoData pixels: 2971678
- valid coverage: 88.113288%
- unique labels: 0,2,3,4,5,7,8

Production V1 result:

- valid pixels: 22028322
- NoData pixels: 2971678
- valid coverage: 88.113288%
- unique labels: 0,2,3,4,5,7,8

Cross-check result: PASS; no material difference found against the accepted V2
automated baseline values listed above.

## Pixel Accounting

- `R009_C004`: 22028322 valid + 2971678 NoData + 0 invalid = 25000000
- `R009_C005`: 23108918 valid + 1891082 NoData + 0 invalid = 25000000
- `R009_C006`: 1554346 valid + 23445654 NoData + 0 invalid = 25000000
- `R009_C007`: 1561 valid + 24998439 NoData + 0 invalid = 25000000
- `R009_C008`: 539939 valid + 24460061 NoData + 0 invalid = 25000000

Pixel accounting status: PASS

## Gate-4 Integrity and Storage Checks

### SHA-256

- `SULSEL_2021_SULSEL_R009_C004_S2WC_V1.tif`: `f23b392bf109bcaf97595330cfb2120c7e6216fbf47426ce5225b8be722b403a`
- `SULSEL_2021_SULSEL_R009_C005_S2WC_V1.tif`: `9d4a18797a484c55cdb4096c9cb41f8083ac65a32a0cb568ecb631c0ec30e2b2`
- `SULSEL_2021_SULSEL_R009_C006_S2WC_V1.tif`: `94ccfa5866f0087d6f6bd39579167ddbf85213f2de8151d1c5ba46c1c77f7f5b`
- `SULSEL_2021_SULSEL_R009_C007_S2WC_V1.tif`: `540c824e3fdbe20c8b8c16e27ad7a267247caad13f4241a290ef1477ba992d56`
- `SULSEL_2021_SULSEL_R009_C008_S2WC_V1.tif`: `b0289f36b60019a6a5ec8ec308c7d567979f319a553e79db6cd3a7163f768fde`

### Local Storage

- checked drive: `H:`
- free bytes: 7969374208
- free GiB: 7.422058
- >3.0 GiB Gate-4 buffer: PASS

### Production QGIS Visual Spot-Check

- evidence directory: `docs/evidence/batch08_qgis_spotcheck/`
- dedicated production evidence already exists: NO
- status: PENDING_HUMAN_QGIS_SPOT_CHECK
- recommended human tile: `SULSEL_R009_C007`
- reason: extreme low coverage; 1561 valid pixels, 0.006244% coverage, labels 0,2
- recommended human tile: `SULSEL_R009_C004`
- reason: mountainous/vegetated production canary with accepted V2 pilot baseline
- Gate 4 final status: NOT CLOSED; pending human QGIS production spot-check

## Closure Note

Batch_08 has passed the automated local raster audit. SHA-256 checksum capture
and local storage buffer validation are recorded above. Batch_08 Gate 4 is not
yet complete; human QGIS production spot-check remains pending. M6 remains
`IN_PROGRESS`; 10 of 55 production rasters are `AUDITED_PASS`, and 45 remain
`EXPECTED_PENDING`.
