# Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform Google Earth Engine (GEE)

[![Project Status](https://img.shields.io/badge/Status-M6%20In%20Progress%20%7C%20Pre--Production%20Prepared-blue.svg)](#ringkasan-progres-milestone)
[![Platform](https://img.shields.io/badge/Platform-GEE%20%7C%20Google%20Colab%20%7C%20QGIS-blue.svg)](#arsitektur-dan-platform-eksekusi)
[![Model](https://img.shields.io/badge/Model-SegFormer--B0-orange.svg)](#arsitektur-model-dan-klasifikasi)
[![Study Area](https://img.shields.io/badge/Area-Provinsi%20Sulawesi%20Selatan-green.svg)](#ruang-lingkup-dan-area-studi)

Dokumen ini menyajikan gambaran komprehensif repositori, arsitektur data, status sinkronisasi GitHub vs lokal, serta catatan progres pengerjaan proyek dari tahap inisialisasi hingga tahap terkini.

---

## Daftar Isi

1. [Konteks dan Tujuan Penelitian](#1-konteks-dan-tujuan-penelitian)
2. [Status GitHub vs Penyimpanan Lokal (.gitignore Explanation)](#2-status-github-vs-penyimpanan-lokal-gitignore-explanation)
3. [Ruang Lingkup dan Spesifikasi Dataset](#3-ruang-lingkup-dan-spesifikasi-dataset)
4. [Arsitektur dan Platform Eksekusi](#4-arsitektur-dan-platform-eksekusi)
5. [Struktur Lengkap Direktori Repositori](#5-struktur-lengkap-direktori-repositori)
6. [Skrip dan Kode yang Telah Dibangun](#6-skrip-dan-kode-yang-telah-dibangun)
7. [Ringkasan Progres Milestone (M0 – M12)](#7-ringkasan-progres-milestone-m0--m12)
8. [Detail Pencapaian Saat Ini (Status Terkini: M6 Batch_04 PASS)](#8-detail-pencapaian-saat-ini-status-terkini-m6-batch_04-pass)
9. [Langkah Selanjutnya (Next Steps)](#9-langkah-selanjutnya-next-steps)

---

## 1. Konteks dan Tujuan Penelitian

Proyek riset ini berfokus pada segmentasi semantik tutupan lahan (*Land Cover Semantic Segmentation*) berskala provinsi di **Provinsi Sulawesi Selatan** menggunakan citra satelit **Sentinel-2 Surface Reflectance (Harmonized)** dan data referensi **ESA WorldCover v200 (2021)** dengan arsitektur Transformer mutakhir **SegFormer (SegFormer-B0)**.

### Sasaran Utama:
- Menghasilkan komposit bebas awan (*cloud-free median composite*) tahun 2021 bersolusi 10 meter untuk seluruh Provinsi Sulawesi Selatan via **Google Earth Engine (GEE)**.
- Menyelaraskan citra multikanal (4 kanal: Blue, Green, Red, NIR) dengan *label* tutupan lahan (11 kelas ESA WorldCover) dalam kisi koordinat terproyeksi yang seragam (`EPSG:3857`).
- Membagi wilayah provinsi ke dalam grid ubin (*tiling system*) deterministik 50 km × 50 km (55 ubin daratan).
- Melatih model transformer **SegFormer-B0** menggunakan akselerasi GPU di **Google Colab**.
- Menghasilkan peta tutupan lahan resolusi tinggi untuk seluruh wilayah Sulawesi Selatan berserta evaluasi metrik akurasi (*mIoU*, *Overall Accuracy*, *F1-Score* per kelas).

---

## 2. Status GitHub vs Penyimpanan Lokal (.gitignore Explanation)

Banyak file besar yang ada di lokal **sengaja tidak di-push ke GitHub**. Hal ini merupakan standar baku (*best practice*) dalam riset *Remote Sensing & Geospatial Deep Learning* untuk mencegah repositori menjadi lambat (*bloated*) dan menghindari batasan ukuran file Git (GitHub maksimal 100 MB per file).

### Perbandingan Komponen Terlacak (GitHub) vs Lokal:

| Komponen | Status di GitHub (Tracked) | Status di Lokal (Drive `H:`) | Keterangan / Alasan |
|---|:---:|:---:|---|
| **Kode Sumber GEE (`gee/*.js`)** | ✅ Lengkap | ✅ Lengkap | Seluruh skrip ekstraksi GEE (AOI, Sentinel-2, WorldCover, Grid, Pilot Export). |
| **Dokumentasi & Desain (`docs/*.md`)** | ✅ Lengkap | ✅ Lengkap | Dokumen PRD, ROADMAP, TASK, DATASET, FULL_EXPORT_PLAN, dll. |
| **Konfigurasi (`configs/*.yaml`)** | ✅ Lengkap | ✅ Lengkap | Konfigurasi deklaratif proyek (`data.yaml`). |
| **Bukti Audit & Visual (`docs/evidence/`)** | ✅ Lengkap | ✅ Lengkap | Screenshot visualisasi QGIS, konsol GEE, dan validasi spektral. |
| **Log Eksekusi (`logs/`)** | ✅ Lengkap | ✅ Lengkap | Catatan audit hardware, lingkup, dan log eksekusi tugas. |
| **Data Citra Mentah (`data/raw/`)** | ❌ Diabaikan (`.gitignore`) | 📦 Tersimpan (~1.8 GB) | Berkas GeoTIFF hasil unduhan dari Google Drive (Sample 003, Pilot V2 Tiles). |
| **Dataset Patch (`data/patches/`)** | ❌ Diabaikan (`.gitignore`) | ⏳ Tahap M7 | Patch potongan (256×256 / 512×512) berukuran gigabyte. |
| **Bobot Model (`models/*.pth`, `.pt`)** | ❌ Diabaikan (`.gitignore`) | ⏳ Tahap M9 | Checkpoint bobot SegFormer hasil training Colab. |
| **Hasil Inferensi (`outputs/`)** | ❌ Diabaikan (`.gitignore`) | ⏳ Tahap M11 | Peta GeoTIFF prediksi resolusi penuh. |
| **Environment & Kredensial (`.env`, `venv/`)** | ❌ Diabaikan (`.gitignore`) | 🔒 Diamankan | Mencegah kebocoran kunci API / token GEE. |

> [!NOTE]
> File raster lokal yang telah berhasil diekspor dan diverifikasi saat ini meliputi:
> - `data/raw/sample/SULSEL_DATASET_SAMPLE_003.tif` (71.6 MB) — Sampel uji Makassar–Maros.
> - `data/raw/pilot/SULSEL_2021_SULSEL_R005_C004_S2WC_V2.tif` (594.1 MB) — Pilot Urban/Pesisir.
> - `data/raw/pilot/SULSEL_2021_SULSEL_R009_C004_S2WC_V2.tif` (559.2 MB) — Pilot Hutan/Pegunungan.
> - `data/raw/pilot/SULSEL_2021_SULSEL_R005_C000_S2WC_V2.tif` (5.6 MB) — Pilot Kepulauan/Pesisir Rendah.

---

## 3. Ruang Lingkup dan Spesifikasi Dataset

### A. Wilayah Penelitian (AOI)
- **Sumber Batas:** `FAO/GAUL/2015/level1` (`ADM0_NAME: Indonesia`, `ADM1_NAME: Sulawesi Selatan`).
- **Fitur Administrasi:** 1 poligon tunggal mencakup seluruh daratan utama dan pulau-pulau luar (Spermonde, Selayar, dll.).

### B. Citra Satelit Input (Sentinel-2 Harmonized)
- **Koleksi:** `COPERNICUS/S2_SR_HARMONIZED` (Tahun 2021).
- **Masking Awan:** Integrasi `COPERNICUS/S2_CLOUD_PROBABILITY` (ambang batas 50%) + filtering Scene Classification Layer (SCL) + masking artefak tepi (B8A/B9).
- **Agregasi:** Reduksi Median Temporal tahunan dengan *bilinear resampling* per-scene sebelum mosaik.
- **Kanal Input (4 Bands):**
  1. `B2` — Blue (10m)
  2. `B3` — Green (10m)
  3. `B4` — Red (10m)
  4. `B8` — Near-Infrared / NIR (10m)
- **Skala Reflektansi:** Faktor skala 10.000 (disimpan dalam format Float32).

### C. Data Referensi Tutupan Lahan (ESA WorldCover 2021)
- **Koleksi:** `ESA/WorldCover/v200` (Tahun referensi 2021, resolusi 10m).
- **Remapping Kelas (11 Kelas Kontinu 0–10):**

| ID Training | Nilai Asli ESA | Nama Kelas (Tutupan Lahan) | Representasi Visual / Karakteristik |
|:---:|:---:|---|---|
| **0** | 10 | **Tree cover** | Hutan primer/sekunder, perkebunan pohon lebat |
| **1** | 20 | **Shrubland** | Semak belukar |
| **2** | 30 | **Grassland** | Padang rumput |
| **3** | 40 | **Cropland** | Lahan pertanian, sawah, tegalan |
| **4** | 50 | **Built-up** | Area terbangun, pemukiman, perkotaan |
| **5** | 60 | **Bare / sparse vegetation** | Lahan terbuka, tanah gundul, batuan |
| **6** | 70 | **Snow and ice** | Salju/es (tidak ada di Sulsel, dipertahankan demi skema baku) |
| **7** | 80 | **Permanent water bodies** | Laut, danau (Tempe, Matano, Towuti), sungai besar |
| **8** | 90 | **Herbaceous wetland** | Lahan basah herba, rawa |
| **9** | 95 | **Mangroves** | Hutan bakau pesisir |
| **10** | 100 | **Moss and lichen** | Lumut kerak |
| **255** | - | **NoData / Ignore** | Area luar batas / piksel tidak valid |

---

## 4. Arsitektur dan Platform Eksekusi

```
+-------------------------------------------------------------------------------+
|                        GOOGLE EARTH ENGINE (GEE)                              |
|  - Akuisisi Sentinel-2 SR Harmonized 2021 & ESA WorldCover 2021               |
|  - Masking awan S2_CLOUD_PROBABILITY (50%) + SCL + Resampling Bilinear        |
|  - Grid 50 km x 50 km (55 Tiles daratan Sulawesi Selatan)                     |
|  - Ekspor 5-band GeoTIFF (B2, B3, B4, B8, label) ke Google Drive              |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                      GOOGLE DRIVE / CLOUD STORAGE                             |
|  - Penampung sementara hasil ekspor GeoTIFF (Batch 01 s/d Batch 11)           |
+-------------------------------------------------------------------------------+
         |                                                            |
         v                                                            v
+------------------------------------+      +-----------------------------------+
|     LINGKUNGAN LOKAL (Drive H:)    |      |       GOOGLE COLAB (Cloud GPU)    |
|  - Audit Raster & QGIS Validation  |      |  - Ekstraksi Patches (256x256)    |
|  - Windowed I/O via Rasterio       |      |  - Spatial Train/Val/Test Split   |
|  - Penyimpanan Kode & Dokumen Git  |      |  - Training SegFormer-B0          |
|  - Dokumentasi & Log Eksekusi      |      |  - Evaluasi Metrik & Checkpoints  |
+------------------------------------+      +-----------------------------------+
```

- **Komputasi Lokal:** Digunakan untuk *scripting*, audit berkas, inspeksi geospasial di QGIS, dan manipulasi data hemat memori (*windowed reading* via Rasterio pada RAM ~8 GB).
- **Komputasi Cloud GEE:** Digunakan untuk seluruh beban komputasi pemrosesan citra satelit skala provinsi.
- **Komputasi Cloud Colab:** Digunakan untuk ekstraksi patch tensor dan pelatihan deep learning menggunakan GPU (NVIDIA T4 / V100).

---

## 5. Struktur Lengkap Direktori Repositori

```text
h:/segFormer/
├── README.md                           # Dokumentasi utama repositori (file ini)
├── requirements.txt                    # Spesifikasi dependensi Python (PyTorch, Rasterio, dll.)
├── .gitignore                          # Aturan pencegah data besar/rahasia masuk Git
│
├── configs/                            # Konfigurasi proyek
│   ├── data.yaml                       # Konfigurasi deklaratif data, band, kelas, dan grid
│   └── .gitkeep
│
├── docs/                               # Dokumentasi formal perancangan & eksekusi
│   ├── PRD.md                          # Product Requirement Document & aturan arsitektur
│   ├── TASK.md                         # Dokumen orkestrasi task granular berurutan (Phase 0-12)
│   ├── ROADMAP.md                      # Peta jalan milestone proyek & status ketergantungan
│   ├── DATASET.md                      # Spesifikasi teknis dataset citra dan label
│   ├── PILOT_TILE_SELECTION.md         # Dokumentasi pemilihan 3 ubin pilot representative
│   ├── FULL_EXPORT_PLAN.md             # Dokumen strategi ekspor penuh 55 ubin berskala besar
│   └── evidence/                       # Bukti tangkapan layar validasi QGIS & konsol GEE
│       ├── aoi/                        # Bukti batas administrasi Sulsel
│       ├── sentinel2/                  # Bukti visual komposit spektral bebas awan
│       ├── worldcover/                 # Bukti keselarasan label ESA WorldCover
│       ├── dataset_sample/             # Bukti audit QGIS sampel Makassar-Maros
│       ├── export_grid/                # Bukti pembagian grid 55 tiles
│       ├── pilot_selection/            # Bukti seleksi ubin pilot
│       └── pilot_export_precheck/      # Bukti inspeksi QGIS & konsol ubin pilot V2
│
├── gee/                                # Skrip JavaScript Google Earth Engine
│   ├── 01_AOI.js                       # Ekstraksi dan inspeksi batas AOI Sulsel
│   ├── 02_Sentinel2.js                 # Komposit Sentinel-2 2021 bebas awan
│   ├── 02_Sentinel2_SCL_backup.js      # Skrip cadangan pemrosesan SCL
│   ├── 03_WorldCover.js                # Penyelarasan label ESA WorldCover 2021
│   ├── 04_Dataset_Sample_Export.js     # Ekspor sampel teknis (Sample 003)
│   ├── 05_Export_Grid.js               # Pembuatan grid ubin 50km (55 ubin daratan)
│   ├── 06_Pilot_Export.js              # Ekspor 3 ubin pilot tervalidasi (V2 exact 5000x5000)
│   └── 07_Full_Export.js               # Script produksi aman-by-default untuk batch 55 tile
│
├── logs/                               # Laporan audit dan catatan eksekusi sistem
│   ├── task_execution.log              # Log eksekusi berurutan task demi task
│   ├── scope_audit.md                  # Laporan audit keselarasan ruang lingkup
│   ├── environment_audit.md            # Laporan audit hardware dan lingkungan lokal
│   ├── export_grid_audit.md            # Laporan audit grid ubin 50km
│   ├── gee_script_links.md             # Tautan script repository GEE
│   └── project_tree.txt                # Pohon direktori proyek
│
├── qgis/                               # Proyek visualisasi QGIS untuk audit spasial
│   └── dataset_sample_audit.qgz        # Proyek QGIS audit sampel & pilot dataset
│
├── src/                                # Modul kode sumber Python (akan diisi di M7-M11)
│   ├── data/                           # Skrip audit raster, ekstraksi patch, & spatial split
│   ├── models/                         # Arsitektur model SegFormer-B0
│   ├── training/                       # Loop pelatihan & loss function (CrossEntropy + Dice)
│   ├── evaluation/                     # Perhitungan metrik mIoU, confusion matrix, F1
│   └── inference/                      # Prediksi ubin dan rekonstruksi mosaik provinsi
│
├── data/                               # Direktori data lokal (diabaikan Git)
│   ├── raw/                            # Data raster GeoTIFF utuh hasil unduh GEE
│   │   ├── sample/                     # GeoTIFF sampel uji (Sample 002, Sample 003)
│   │   └── pilot/                      # GeoTIFF 3 ubin pilot (V1 & V2)
│   ├── interim/                        # Data antara
│   ├── processed/                      # Data siap pakai
│   ├── patches/                        # Potongan patch tensor (256x256)
│   └── splits/                         # File daftar CSV pembagian train/val/test
│
├── models/                             # Bobot model terlatih (.pth / .pt) (diabaikan Git)
├── notebooks/                          # Jupyter Notebooks untuk eksperimen & Colab
├── outputs/                            # Luaran metrik, gambar grafik, dan peta prediksi
└── tests/                              # Unit test & validasi modul Python
```

---

## 6. Skrip dan Kode yang Telah Dibangun

| Skrip | Jalur Berkas | Fungsi Utama | Status |
|---|---|---|:---:|
| **01_AOI** | [`gee/01_AOI.js`](file:///h:/segFormer/gee/01_AOI.js) | Memuat dan memvalidasi batas provinsi Sulawesi Selatan dari FAO GAUL level 1. | `PASS` |
| **02_Sentinel2** | [`gee/02_Sentinel2.js`](file:///h:/segFormer/gee/02_Sentinel2.js) | Pipeline komposit Sentinel-2 2021 bebas awan (B2, B3, B4, B8) dengan Cloud Probability. | `PASS` |
| **03_WorldCover** | [`gee/03_WorldCover.js`](file:///h:/segFormer/gee/03_WorldCover.js) | Remapping label ESA WorldCover 2021 ke nilai kontinu 0–10 via nearest neighbor. | `PASS` |
| **04_Sample_Export** | [`gee/04_Dataset_Sample_Export.js`](file:///h:/segFormer/gee/04_Dataset_Sample_Export.js) | Menggabungkan 4 band citra + 1 band label menjadi GeoTIFF 5-band pada area sampel Makassar-Maros. | `PASS` |
| **05_Export_Grid** | [`gee/05_Export_Grid.js`](file:///h:/segFormer/gee/05_Export_Grid.js) | Membuat grid ubin 50km × 50km (55 ubin berpotongan daratan) dalam proyeksi `EPSG:3857`. | `PASS` |
| **06_Pilot_Export** | [`gee/06_Pilot_Export.js`](file:///h:/segFormer/gee/06_Pilot_Export.js) | Mengekspor 3 ubin pilot representative (V2 dimensi presisi 5000×5000 piksel) ke Google Drive. | `PASS` |
| **07_Full_Export** | [`gee/07_Full_Export.js`](file:///h:/segFormer/gee/07_Full_Export.js) | Menyiapkan ekspor produksi 55 tile secara batch 5 tile dengan dua safety switch default OFF. | `PREPARED` |

---

## 7. Ringkasan Progres Milestone (M0 – M12)

Berikut adalah status terkini setiap *Milestone* yang tercatat dalam [docs/ROADMAP.md](file:///h:/segFormer/docs/ROADMAP.md) dan [docs/TASK.md](file:///h:/segFormer/docs/TASK.md):

```
[M0] PASS ──► [M1] PASS ──► [M2] PASS ──► [M3] PASS ──► [M4] PASS ──► [M5] PASS
                                                                          │
[M6] IN_PROGRESS ◄────────────────────────────────────────────────────────┘
  │
  ├──► [M7] BLOCKED ──► [M8] BLOCKED ──► [M9] BLOCKED ──► [M10] BLOCKED ──► [M11] BLOCKED ──► [M12] BLOCKED
```

| Milestone | Nama Tahap | Ruang Lingkup Kerja | Status |
|:---:|---|---|:---:|
| **M0** | **Documentation Alignment** | Audit keselarasan dokumen, penghapusan anomali lingkup (Kabupaten Maros), penyusunan `.gitignore`. | `PASS` |
| **M1** | **Environment & Repo Setup** | Pembuatan struktur folder lengkap, pencatatan audit hardware (RAM 8GB, CPU AMD), perumusan `requirements.txt`. | `PASS` |
| **M2** | **AOI Sulawesi Selatan** | Ekstraksi batas FAO GAUL level 1 Provinsi Sulawesi Selatan di Google Earth Engine. | `PASS` |
| **M3** | **Sentinel-2 Pipeline** | Filter awan, komposit median 2021, *bilinear resampling*, validasi spektral RGB/NIR di Makassar, Maros, Palopo. | `PASS` |
| **M4** | **WorldCover Label Pipeline** | Remapping kelas diskrit ESA WorldCover (10..100 ke 0..10), *nearest-neighbor resampling*, verifikasi integritas kategorikal. | `PASS` |
| **M5** | **Export Grid & Pilot Validation** | Pembuatan grid 55 ubin (50km), ekspor & audit QGIS sampel teknis (`Sample_003`), seleksi dan ekspor 3 ubin pilot (V2). | `PASS` |
| **M6** | **Full Dataset Export & Audit** | TASK 6.1 automated auditor `PASS`; batch_04 production export dan local raster audit `PASS`; 5 dari 55 production tiles sudah melewati local raster gate; 50 tersisa. | `IN_PROGRESS` |
| **M7** | **Patch Dataset & Spatial Split** | Pemotongan ubin menjadi patch (256×256 / 512×512) serta pembagian data (*Spatial Split*: Train/Val/Test tanpa kebocoran data). | `BLOCKED` |
| **M8** | **SegFormer-B0 Preparation** | Penyusunan arsitektur SegFormer-B0, konfigurasi *hyperparameter*, *dataloader*, dan fungsi augmentasi spektral. | `BLOCKED` |
| **M9** | **Training (Google Colab)** | Pelatihan model SegFormer-B0 pada GPU Google Colab menggunakan kombinasi loss Cross-Entropy + Dice Loss. | `BLOCKED` |
| **M10** | **Evaluation & Validation** | Evaluasi performa kuantitatif (*Mean IoU*, *Overall Accuracy*, *F1-Score*, matriks konfusi) pada set pengujian independen. | `BLOCKED` |
| **M11** | **Inference & Map Mosaicking** | Inferensi spasial untuk seluruh ubin provinsi, penggabungan mosaik tanpa batas (*seamless mosaic*), dan ekspor peta tutupan lahan. | `BLOCKED` |
| **M12** | **Reproducibility & Final Audit** | Validasi akhir keterulangan (*reproducibility*), penyusunan dokumentasi laporan akhir / artikel ilmiah. | `BLOCKED` |

---

## 8. Detail Pencapaian Saat Ini (Status Terkini: M6 Batch_04 PASS)

Saat ini proyek berada pada **Milestone 6 (M6)**. M5 sudah `PASS`, TASK 6.1
automated raster auditor sudah `PASS`, batch_04 production export dan local
raster audit sudah `PASS`, 5 dari 55 production tiles sudah melewati local
raster gate, dan 50 production tiles masih tersisa.

1. **Uji Sampel Teknis Berhasil (`SULSEL_DATASET_SAMPLE_003.tif`):**
   - Berisi 5 kanal berurutan: `B2`, `B3`, `B4`, `B8`, `label`.
   - Diperiksa di QGIS: Tumpang tindih piksel antara citra satelit dan label tutupan lahan selaras 100%, nilai label berupa integer diskrit murni tanpa interpolasi desimal.

2. **Perbaikan Dimensi Ubin Pilot (V2 Fix):**
   - Sebelumnya ubin pilot V1 berukuran `5001 × 5001` piksel akibat kombinasi parameter `scale` dan `region` di GEE.
   - Skrip [`gee/06_Pilot_Export.js`](file:///h:/segFormer/gee/06_Pilot_Export.js) telah diperbaiki dengan parameter `dimensions: '5000x5000'`, menghasilkan ubin **V2** yang presisi tepat `5000 × 5000` piksel (50 km × 50 km pada resolusi 10 m).

3. **Tiga Ubin Pilot Representative Berhasil Diekspor & Diaudit:**
   - **`SULSEL_R005_C004` V2 (Urban & Pesisir):** Final pilot audit `PASS`; ukuran file terkompresi LZW ~594.1 MB.
   - **`SULSEL_R009_C004` V2 (Pegunungan & Vegetasi):** Final pilot audit `PASS`; ukuran file ~559.2 MB.
   - **`SULSEL_R005_C000` V2 (Kepulauan & Pesisir Luar):** Manual QGIS audit `PASS`; dimensi 5000 × 5000, lima band, `EPSG:3857`, 10 m, Float32, NoData `-9999`, LZW, label integer `0, 1, 2, 4, 5, 7, 8, 9`, serta RGB dan image-label alignment `PASS`.

4. **TASK 6.1 Automated Raster Auditor Berhasil:**
   - [`src/data/audit_raster.py`](file:///h:/segFormer/src/data/audit_raster.py) mengaudit GeoTIFF stack 5-band secara windowed, hanya membaca Band 5 untuk statistik label.
   - [`tests/test_audit_raster.py`](file:///h:/segFormer/tests/test_audit_raster.py) mencakup valid/invalid raster, dtype, CRS, resolusi, band order, NoData, label fraksional, label out-of-range, all-NoData policy, dimensi, dan config YAML.

5. **Pre-Production Export M6 Telah Disiapkan:**
   - [`gee/07_Full_Export.js`](file:///h:/segFormer/gee/07_Full_Export.js) berisi safety switch `ENABLE_PRODUCTION_EXPORT_TASKS = false` dan `PREFLIGHT_CONFIRMED_BY_HUMAN = false`, batch 5 tile, dan mekanisme rerun tile spesifik.
   - [`data/raw/export_manifest.csv`](file:///h:/segFormer/data/raw/export_manifest.csv) berisi 55 row expected/pending dengan status awal `EXPECTED_PENDING`.
   - Untuk audit produksi, all-NoData raw tile wajib dikarantina/review dan auditor dijalankan dengan `--fail-on-all-nodata`. Low coverage yang masih memiliki piksel label valid tidak otomatis gagal.

6. **Batch_04 Production Raster Gate PASS:**
   - Batch_04 memiliki 5/5 GEE production tasks `COMPLETED`, Google Drive completeness `PASS`, dan 5/5 GeoTIFF tersedia lokal.
   - Automated local raster audit batch_04 `PASS`; tidak ada invalid label, fractional label, atau all-NoData tile.
   - Catatan audit: [`logs/batch_04_raster_audit.md`](file:///h:/segFormer/logs/batch_04_raster_audit.md).

---

## 9. Langkah Selanjutnya (Next Steps)

1. **Jalankan full tiled export hanya setelah otorisasi pengguna:**
   - Ekspor dilakukan bertahap, dipantau di GEE, lalu seluruh raster diaudit sebelum M7.
2. **Audit semua raw production tile:**
   - Jalankan auditor dengan `--expected-width 5000 --expected-height 5000 --fail-on-all-nodata`.
   - Buat `logs/raw_raster_audit.csv` dan `logs/raw_raster_audit_summary.md` pada task M6 berikutnya.
