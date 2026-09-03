# Repository Status and Progress

## Ringkasan

Repository ini adalah proyek riset untuk:

**Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform Google Earth Engine (GEE).**

Fokus proyek adalah menyiapkan dataset citra-label tutupan lahan yang sejajar secara spasial, lalu melatih model **SegFormer-B0** untuk semantic segmentation.

Wilayah penelitian resmi:

- Provinsi Sulawesi Selatan, Indonesia
- Bukan Kabupaten Maros sebagai wilayah utama
- Bukan seluruh Pulau Sulawesi
- Bukan seluruh Indonesia

Dataset utama:

- Sentinel-2 Surface Reflectance Harmonized: `COPERNICUS/S2_SR_HARMONIZED`
- Sentinel-2 Cloud Probability: `COPERNICUS/S2_CLOUD_PROBABILITY`
- ESA WorldCover v200: `ESA/WorldCover/v200`
- AOI administrasi: `FAO/GAUL/2015/level1`

## Isi Repository

| Direktori / File | Isi / Fungsi |
|---|---|
| `README.md` | Dokumentasi utama proyek, ringkasan arsitektur, progres, dan next steps. |
| `requirements.txt` | Daftar dependensi Python untuk audit raster, patching, training, evaluasi, dan inferensi. |
| `.gitignore` | Mengabaikan data besar, checkpoint model, output, credential, cache Python, dan file sementara. |
| `configs/data.yaml` | Konfigurasi data utama: AOI, Sentinel-2, WorldCover, kelas, grid, sample export, patch, split, dan status export. |
| `docs/PRD.md` | Product Requirements Document sebagai acuan kebutuhan proyek. |
| `docs/TASK.md` | Orkestrasi task teknis dari fase awal sampai final audit. |
| `docs/ROADMAP.md` | Roadmap milestone M0 sampai M12. |
| `docs/DATASET.md` | Spesifikasi dataset, band, label, kelas, grid, sample export, dan audit QGIS. |
| `docs/PILOT_TILE_SELECTION.md` | Dokumentasi pemilihan 3 tile pilot. |
| `docs/FULL_EXPORT_PLAN.md` | Rencana teknis ekspor penuh 55 tile secara bertahap. |
| `docs/evidence/` | Screenshot bukti validasi AOI, Sentinel-2, WorldCover, sample export, grid, pilot selection, dan pilot precheck. |
| `gee/` | Script JavaScript Google Earth Engine. |
| `data/` | Data raster lokal. Folder ini sebagian besar diabaikan Git karena ukurannya besar. |
| `src/` | Modul Python proyek. Saat ini berisi automated raster auditor untuk M6. |
| `tests/` | Unit test proyek. Saat ini berisi test automated raster auditor. |
| `models/` | Tempat checkpoint model. Saat ini belum ada model terlatih. |
| `outputs/` | Tempat output metrik, figur, prediksi, dan peta. Saat ini belum ada output final. |
| `qgis/` | Project QGIS untuk audit visual raster. |
| `logs/` | Log audit environment, scope, grid, link GEE, dan eksekusi task. |

## Script GEE

| File | Fungsi | Status Praktis |
|---|---|---|
| `gee/01_AOI.js` | Memuat dan memvalidasi AOI Sulawesi Selatan dari FAO GAUL level 1. | PASS |
| `gee/02_Sentinel2.js` | Membuat komposit Sentinel-2 2021 dengan cloud masking dan visualisasi diagnostik. | PASS |
| `gee/02_Sentinel2_SCL_backup.js` | Versi cadangan masking berbasis SCL. | Backup |
| `gee/03_WorldCover.js` | Memuat ESA WorldCover v200 dan remap kelas 10..100 menjadi 0..10. | PASS |
| `gee/04_Dataset_Sample_Export.js` | Membuat stack 5 band dan export sample Makassar-Maros `SULSEL_DATASET_SAMPLE_003`. | PASS |
| `gee/05_Export_Grid.js` | Membuat grid 50 km x 50 km dalam `EPSG:3857`, menghasilkan 55 tile berpotongan AOI. | PASS |
| `gee/06_Pilot_Export.js` | Script pilot export 3 tile representatif dengan output 5000 x 5000 piksel. | Tiga pilot V2 selesai; final pilot audit PASS |
| `gee/07_Full_Export.js` | Script produksi aman-by-default untuk 55 tile expected/pending, batch 5 tile, dan rerun tile spesifik. | PREPARED; both safety switches OFF; batch_04 exported and audited PASS |

## Progres Aktual

Berdasarkan isi repository lokal, konfigurasi, script GEE, evidence, dan data raster yang tersedia, progres praktis proyek sudah sampai:

**M6 - Full Dataset Export and Raster Audit: IN_PROGRESS**

Tahap yang sudah selesai:

1. Scope dan dokumentasi dasar.
2. Struktur repository dan audit environment.
3. AOI Sulawesi Selatan.
4. Pipeline Sentinel-2 2021.
5. Pipeline ESA WorldCover v200.
6. Sample export 5-band GeoTIFF.
7. Grid export 50 km x 50 km.
8. Seleksi 3 tile pilot.
9. Export, final validation, dan automated raster audit 3 tile pilot V2; bukti manual QGIS label/alignment khusus tersedia untuk `SULSEL_R005_C000`.
10. Automated raster auditor TASK 6.1.
11. Safe production export script dan expected manifest untuk 55 tile.
12. Batch_04 production export completed, downloaded locally, passed automated local raster audit, and passed Gate 4.

Tahap berikutnya dalam M6:

Batch production export remains in progress. Batch_04 has passed the local
raster gate, 5 of 55 production tiles have passed, and 50 production tiles
remain. Do not start another GEE batch without explicit user authorization.

## Status Milestone

| Milestone | Nama | Status Aktual |
|---|---|---|
| M0 | Documentation Alignment | PASS |
| M1 | Local Environment and Repository Setup | PASS |
| M2 | AOI Sulawesi Selatan | PASS |
| M3 | Sentinel-2 Pipeline | PASS |
| M4 | ESA WorldCover Label Pipeline | PASS |
| M5 | Export Grid and Pilot Validation | PASS |
| M6 | Full Dataset Export and Raster Audit | IN_PROGRESS |
| M7 | Patch Dataset and Spatial Split | BLOCKED |
| M8 | SegFormer-B0 Preparation | BLOCKED |
| M9 | Training | BLOCKED |
| M10 | Evaluation | BLOCKED |
| M11 | Inference and Map Reconstruction | BLOCKED |
| M12 | Reproducibility and Final Audit | BLOCKED |

## Bukti Progres Utama

### AOI

- File: `gee/01_AOI.js`
- Source: `FAO/GAUL/2015/level1`
- Filter: `ADM0_NAME = Indonesia`, `ADM1_NAME = Sulawesi Selatan`
- Feature count: 1
- Status: PASS

### Sentinel-2

- File: `gee/02_Sentinel2.js`
- Periode: `2021-01-01` sampai `2022-01-01`
- Bands: `B2`, `B3`, `B4`, `B8`
- Cloud masking:
  - Metadata `CLOUDY_PIXEL_PERCENTAGE < 40`
  - Cloud probability `< 50`
  - SCL exclude `0, 1, 3, 8, 9, 10, 11`
  - Edge mask `B8A` dan `B9`
- Composite: median
- Status: PASS

### WorldCover

- File: `gee/03_WorldCover.js`
- Source: `ESA/WorldCover/v200`
- Source band: `Map`
- Output band: `label`
- Original classes: `10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100`
- Training classes: `0..10`
- Ignore index: `255`
- Status: PASS

### Sample Export

- File: `gee/04_Dataset_Sample_Export.js`
- Output lokal: `data/raw/sample/SULSEL_DATASET_SAMPLE_003.tif`
- Band order: `B2`, `B3`, `B4`, `B8`, `label`
- CRS: `EPSG:3857`
- Pixel size: 10 m
- NoData: `-9999`
- Status: PASS

### Export Grid

- File: `gee/05_Export_Grid.js`
- CRS: `EPSG:3857`
- Tile size: 50,000 m x 50,000 m
- Tile pixel size: 5000 x 5000
- Candidate grid: 143
- Retained intersecting tile: 55
- Tile ID format: `SULSEL_R000_C000`
- Status: PASS

### Pilot Export

- File: `gee/06_Pilot_Export.js`
- Pilot tiles:
  - `SULSEL_R005_C004`: urban/coastal
  - `SULSEL_R009_C004`: vegetated/mountainous
  - `SULSEL_R005_C000`: low-coverage coastal/island
- Output V2:
  - `data/raw/pilot/SULSEL_2021_SULSEL_R005_C004_S2WC_V2.tif`
  - `data/raw/pilot/SULSEL_2021_SULSEL_R009_C004_S2WC_V2.tif`
  - `data/raw/pilot/SULSEL_2021_SULSEL_R005_C000_S2WC_V2.tif`
- Dimensions: 5000 x 5000
- Final V2 audit status:
  - `SULSEL_R005_C004` urban/coastal: PASS
  - `SULSEL_R009_C004` vegetated/mountainous: PASS
  - `SULSEL_R005_C000` low-coverage coastal/island: PASS

Ketiga pilot V2 lolos automated raster audit. Bukti manual QGIS khusus yang
mencakup label dan image-label alignment tersedia untuk `SULSEL_R005_C000`.
Screenshot manual QGIS khusus `SULSEL_R009_C004` tidak tercatat dan tidak
diklaim.

Low-coverage `SULSEL_R005_C000` V2 manual QGIS audit verified:

- 5 bands in order `B2`, `B3`, `B4`, `B8`, `label`
- `EPSG:3857`, 10 x 10 meter pixels, Float32, NoData `-9999`, LZW
- label range 0 to 9
- observed labels `0, 1, 2, 4, 5, 7, 8, 9`
- RGB visualization: PASS
- categorical label visualization: PASS
- exact integer label through Identify Features: PASS
- image-label visual alignment: PASS

All eight accepted low-coverage evidence files exist under
`docs/evidence/pilot_export_precheck/`.

### TASK 6.1 Automated Raster Auditor

- File: `src/data/audit_raster.py`
- Test: `tests/test_audit_raster.py`
- Runtime: Python `.venv`
- Audit mode: opens rasters read-only and scans only Band 5 by block/window
- Validates: GeoTIFF driver, CRS, transform, resolution, rotation/shear, optional dimensions, band count/order, dtype, NoData, integer labels, allowed class subset, class counts, coverage, and all-NoData reporting
- Status: PASS

### M6 Pre-Production Export Preparation

- Safe production script: `gee/07_Full_Export.js`
- Tile size status: `approved_for_production`
- Safety switches: `ENABLE_PRODUCTION_EXPORT_TASKS = false`; `PREFLIGHT_CONFIRMED_BY_HUMAN = false`
- Batch size: 5 tiles
- Batch count: 11
- Expected manifest: `data/raw/export_manifest.csv`
- Manifest rows: 55
- Manifest status: 5 `AUDITED_PASS`; 50 `EXPECTED_PENDING`
- Production all-NoData policy: audit with `--fail-on-all-nodata`; all-NoData production tiles go to quarantine/review and must not proceed to patch creation
- Batch_04 production export: COMPLETED
- Batch_04 local raster audit: PASS
- Batch_04 manifest status: AUDITED_PASS
- Batch_04 Gate-4 visual status: PASS
- Passed production tiles: 5 of 55
- Remaining production tiles: 50

## Gap yang Belum Selesai

1. Full export 55 tile belum selesai.
2. Raw raster produksi 50 tile belum ada lokal.
3. Audit raster seluruh tile produksi belum selesai; batch_04 sudah PASS.
4. Patch dataset belum dibuat.
5. Spatial train/validation/test split belum dibuat.
6. PyTorch Dataset class belum dibuat.
7. Wrapper model SegFormer-B0 belum dibuat.
8. Training config dan training loop belum dibuat.
9. Model checkpoint belum ada.
10. Evaluation metrics belum dibuat.
11. Output prediksi GeoTIFF dan mosaik belum ada.
12. Final reproducibility audit belum dilakukan.

## Catatan Sinkronisasi

Status terkini pada `docs/PRD.md`, `docs/TASK.md`, `docs/ROADMAP.md`,
`docs/DATASET.md`, `docs/PILOT_TILE_SELECTION.md`, `docs/FULL_EXPORT_PLAN.md`,
dan `README.md` telah diselaraskan dengan penutupan M5:

- M0-M5: PASS
- M6: IN_PROGRESS; batch_04 production export completed and local raster audit PASS
- M7-M12: belum dimulai dan tertahan oleh dependency gate
- passed production tiles: 5 of 55
- remaining production tiles: 50

## Rekomendasi Langkah Berikutnya

1. Setelah otorisasi pengguna, jalankan `gee/07_Full_Export.js` per batch.
2. Unduh batch yang selesai tanpa membuat duplikasi lokal yang tidak perlu.
3. Jalankan `src/data/audit_raster.py` dengan `--expected-width 5000`, `--expected-height 5000`, dan `--fail-on-all-nodata` untuk setiap raster produksi.
4. Buat `logs/raw_raster_audit.csv` dan `logs/raw_raster_audit_summary.md`.
5. Setelah semua tile selesai dan valid, lanjut M7 patch extraction dan spatial split.

## Kesimpulan

Repository ini sudah kuat pada tahap persiapan dataset di Google Earth Engine:

- AOI sudah tervalidasi.
- Sentinel-2 dan WorldCover sudah diproses.
- Sample export sudah lolos audit.
- Grid 55 tile sudah dibuat.
- Tiga tile pilot V2 sudah tersedia lokal dan berstatus final audit PASS.
- Automated raster auditor sudah tersedia dan berstatus PASS.
- Safe production export script serta manifest expected/pending 55 tile sudah disiapkan.
- Manual QGIS audit low-coverage `SULSEL_R005_C000` V2 berstatus PASS.
- Batch_04 production export sudah selesai, 5/5 raster batch_04 lolos automated local raster audit, dan Batch_04 Gate 4 berstatus PASS.

Namun proyek belum masuk tahap machine learning utama. Belum ada patch dataset, DataLoader, model SegFormer, training, evaluasi, inferensi, atau peta prediksi final.

**Status akhir saat ini: M5 PASS; TASK 6.1 PASS; M6 IN_PROGRESS; batch_04 Gate 4 PASS; 5/55 production tiles passed; 50 production tiles remain.**
