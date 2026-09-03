# Batch 04 Raster Audit

## Scope

- Milestone: M6 Full Dataset Export and Raster Audit
- Batch: `batch_04`
- Local directory: `data/raw/full/batch_04/`
- Audit command: `.\.venv\Scripts\python.exe src/data/audit_raster.py <raster> --expected-width 5000 --expected-height 5000 --fail-on-all-nodata`
- Audit mode: read-only raster audit
- Automated raster audit batch status: PASS

## Common Raster Contract

The per-tile sections below repeat the common raster contract so each raster
record is self-contained.

## Per-Tile Results

### R004_C006

- file: `SULSEL_2021_SULSEL_R004_C006_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 2567783
- NoData: 22432217
- coverage: 10.271132%
- unique labels: 0,1,2,3,4,5,7,8,9
- invalid label pixels: 0
- all-NoData: false
- audit warnings: none
- class_pixel_counts:
  - 0: 2238858
  - 1: 759
  - 2: 133245
  - 3: 34578
  - 4: 53861
  - 5: 4475
  - 7: 98840
  - 8: 2449
  - 9: 718

### R005_C000

- file: `SULSEL_2021_SULSEL_R005_C000_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 113102
- NoData: 24886898
- coverage: 0.452408%
- unique labels: 0,1,2,4,5,7,8,9
- invalid label pixels: 0
- all-NoData: false
- audit warnings: none
- class_pixel_counts:
  - 0: 57775
  - 1: 3
  - 2: 7469
  - 4: 1387
  - 5: 617
  - 7: 25766
  - 8: 49
  - 9: 20036

### R005_C001

- file: `SULSEL_2021_SULSEL_R005_C001_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 13829
- NoData: 24986171
- coverage: 0.055316%
- unique labels: 0,2,4,7
- invalid label pixels: 0
- all-NoData: false
- audit warnings: none
- class_pixel_counts:
  - 0: 8680
  - 2: 1601
  - 4: 72
  - 7: 3476

### R005_C003

- file: `SULSEL_2021_SULSEL_R005_C003_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 1142515
- NoData: 23857485
- coverage: 4.570060%
- unique labels: 0,1,2,3,4,5,7,8,9
- invalid label pixels: 0
- all-NoData: false
- audit warnings: none
- class_pixel_counts:
  - 0: 144855
  - 1: 102
  - 2: 85080
  - 3: 267878
  - 4: 495393
  - 5: 7916
  - 7: 134521
  - 8: 6364
  - 9: 406

### R005_C004

- file: `SULSEL_2021_SULSEL_R005_C004_S2WC_V1.tif`
- audit status: PASS
- dimensions: 5000x5000
- total pixels: 25000000
- CRS: EPSG:3857
- pixel size: 10 m
- bands: B2,B3,B4,B8,label
- dtype: float32
- nodata value: -9999
- valid pixels: 23442982
- NoData: 1557018
- coverage: 93.771928%
- unique labels: 0,1,2,3,4,5,7,8,9
- invalid label pixels: 0
- all-NoData: false
- audit warnings: none
- class_pixel_counts:
  - 0: 15309517
  - 1: 600
  - 2: 1957360
  - 3: 3107916
  - 4: 1139446
  - 5: 70757
  - 7: 1471504
  - 8: 345885
  - 9: 39997

## Gate-4 Integrity and Storage Checks

### SHA-256

- `SULSEL_2021_SULSEL_R004_C006_S2WC_V1.tif`: `63C46315FF615256FA8DC5217F380FFF1EF16B015748695B0EE705A347F42B65`
- `SULSEL_2021_SULSEL_R005_C000_S2WC_V1.tif`: `734F5EA5B0CA96D9F19976A54231C9F24B26E794FCD58FDFD6466258467A6D1C`
- `SULSEL_2021_SULSEL_R005_C001_S2WC_V1.tif`: `DA9DE86991EEBC8087F2683419D2A84C851EECB0281D84900AA5D72C4AE90484`
- `SULSEL_2021_SULSEL_R005_C003_S2WC_V1.tif`: `F461916AC87C447E1567C4A0ED3FD8A86148A2FA44FE03329B28E50CFBCEAC8D`
- `SULSEL_2021_SULSEL_R005_C004_S2WC_V1.tif`: `38ECCD5255B532DD4C19F85120CB31DC362C4356C99B3043D751D57BAF829235`

### Local Storage

- drive: `H:`
- free bytes: `9210994688`
- free GiB: `8.578407`
- >3.0 GiB Gate-4 buffer: PASS

### Human QGIS Production Spot-Check

- dedicated production batch_04 visual evidence already exists: YES
- visual spot-check tile count: 2 production tiles
- status: PASS

#### SULSEL_R005_C001

- visual status: PASS
- Band 5 observed categorical values: 0,2,4,7
- RGB bands: B4/B3/B2
- image-label alignment: PASS
- systematic offset observed: NO
- rotation observed: NO
- note: very low valid coverage is expected and was already accepted by the automated audit

#### SULSEL_R005_C004

- visual status: PASS
- Band 5 observed categorical values: 0,1,2,3,4,5,7,8,9
- RGB bands: B4/B3/B2
- image-label alignment: PASS
- systematic offset observed: NO
- rotation observed: NO

#### Evidence Files

Evidence directory: `docs/evidence/batch04_qgis_spotcheck/`

- `batch04_qgis_r005_c001_01_label_unique_values.png`
- `batch04_qgis_r005_c001_02_rgb_label_alignment.png`
- `batch04_qgis_r005_c004_01_label_unique_values.png`
- `batch04_qgis_r005_c004_02_rgb_label_alignment.png`

#### Final Gate-4 Status

- overall Gate 4: PASS

## Closure Note

Batch_04 Gate 4 is PASS. M6 remains IN_PROGRESS because only 5 of 55
production tiles have passed; 50 production tiles remain.
