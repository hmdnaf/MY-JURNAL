# ROADMAP.md

## Project Roadmap

**Project:** Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform GEE  
**Version:** 3.0  
**Primary References:** `PRD.md` and `TASK.md`  
**Execution Style:** Sequential milestones with validation gates  

---

# 1. Purpose

Dokumen ini digunakan untuk:

1. Menjelaskan urutan besar pengerjaan proyek.
2. Menjadi ringkasan milestone dari `TASK.md`.
3. Membantu Antigravity IDE memahami prioritas pengerjaan.
4. Menunjukkan dependensi antar fase.
5. Menandai progres proyek secara ringkas.
6. Mencegah AI Agent melompat ke tahap berikutnya sebelum tahap sebelumnya tervalidasi.

`ROADMAP.md` tidak menggantikan `TASK.md`.

- `PRD.md` menjelaskan kebutuhan dan aturan proyek.
- `ROADMAP.md` menjelaskan urutan milestone.
- `TASK.md` menjelaskan pekerjaan teknis per task beserta validasinya.

---

# 2. Project Scope

## Study Area

**Provinsi Sulawesi Selatan, Indonesia**

## Main Data

- Sentinel-2 Surface Reflectance Harmonized
- ESA WorldCover v200
- batas administrasi Provinsi Sulawesi Selatan

## Main Platform

- Google Earth Engine untuk akuisisi dan preprocessing
- Google Colab untuk training model
- QGIS untuk inspeksi dan visualisasi geospasial

## Main Model

**SegFormer-B0**

## Main Output

- dataset citra-label yang sejajar;
- model SegFormer-B0 terlatih;
- laporan evaluasi;
- GeoTIFF prediksi;
- peta tutupan lahan Provinsi Sulawesi Selatan.

---

# 3. Milestone Status Legend

| Status | Meaning |
|---|---|
| `TODO` | Belum dimulai |
| `IN_PROGRESS` | Sedang dikerjakan |
| `HUMAN_ACTION_REQUIRED` | Membutuhkan tindakan manual pengguna |
| `BLOCKED` | Menunggu milestone sebelumnya |
| `FAIL` | Validasi gagal |
| `PASS` | Selesai dan tervalidasi |
| `SKIPPED` | Dilewati dengan persetujuan terdokumentasi |

---

# 4. High-Level Roadmap

```text
M0  Documentation Alignment
        ↓
M1  Local Environment and Repository
        ↓
M2  AOI South Sulawesi
        ↓
M3  Sentinel-2 Sample Pipeline
        ↓
M4  ESA WorldCover Label Pipeline
        ↓
M5  Export Grid and Pilot Validation
        ↓
M6  Full Dataset Export and Audit
        ↓
M7  Patch Dataset and Spatial Split
        ↓
M8  SegFormer-B0 Preparation
        ↓
M9  Training
        ↓
M10 Evaluation
        ↓
M11 Inference and Map Reconstruction
        ↓
M12 Reproducibility and Final Audit
```

---

# 5. Detailed Milestones

## MILESTONE 0 — Documentation Alignment

**Status:** `PASS`

### Goal

Menyelaraskan semua dokumen proyek agar hanya menggunakan ruang lingkup resmi.

### Main Activities

- memeriksa `PRD.md`;
- memeriksa `TASK.md`;
- memeriksa `ROADMAP.md`;
- menghapus referensi aktif terhadap Kabupaten Maros;
- memastikan wilayah utama adalah Provinsi Sulawesi Selatan;
- memastikan dataset inti hanya Sentinel-2, ESA WorldCover, dan AOI;
- membuat aturan `.gitignore`.

### Required Outputs

- `logs/scope_audit.md`
- `.gitignore`

### Exit Criteria

- tidak ada konflik wilayah penelitian;
- tidak ada dataset tambahan yang dimasukkan tanpa persetujuan;
- data besar dan credential tidak akan masuk repository.

### Dependency

Tidak ada.

### Next Milestone

MILESTONE 1.

---

## MILESTONE 1 — Local Environment and Repository Setup

**Status:** `PASS`

### Goal

Menyiapkan struktur proyek dan environment lokal untuk coding, audit raster, dan dokumentasi.

### Main Activities

- membuat struktur folder;
- mencatat versi Python, Git, QGIS, dan sistem operasi;
- mencatat kapasitas RAM dan storage;
- membuat `requirements.txt`;
- membuat konfigurasi awal;
- memastikan training lokal tidak diwajibkan.

### Required Outputs

- struktur repository lengkap;
- `requirements.txt`;
- `logs/environment_audit.md`;
- `logs/project_tree.txt`.

### Exit Criteria

- folder proyek lengkap;
- dependency terdokumentasi;
- batasan perangkat lokal tercatat;
- tidak ada CUDA lokal yang diwajibkan.

### Dependency

MILESTONE 0 harus `PASS`.

### Next Milestone

MILESTONE 2.

---

## MILESTONE 2 — AOI Provinsi Sulawesi Selatan

**Status:** `PASS`

### Goal

Membuat dan memvalidasi Area of Interest Provinsi Sulawesi Selatan.

### Main Activities

- membuka Google Earth Engine Code Editor;
- membuat `gee/01_AOI.js`;
- menggunakan FAO GAUL Level 1 atau sumber AOI yang disetujui;
- memfilter Indonesia;
- memfilter Sulawesi Selatan;
- memeriksa jumlah fitur;
- menampilkan AOI pada peta;
- memvalidasi atribut dan geometri;
- menentukan metode reuse AOI.

### Required Outputs

- `gee/01_AOI.js`;
- catatan sumber AOI;
- bukti bahwa hanya satu fitur terpilih.

### Exit Criteria

- feature count sama dengan satu;
- wilayah yang tampil adalah Provinsi Sulawesi Selatan;
- tidak ada error pada GEE Console;
- AOI dapat dipanggil ulang pada script baru.

### Dependency

MILESTONE 0 harus `PASS`.  
MILESTONE 1 dapat berjalan paralel sebagian, tetapi AOI tidak bergantung pada training environment.

### Human Action

Pengguna menjalankan dan menyimpan script di GEE Code Editor.

### Next Milestone

MILESTONE 3.

---

## MILESTONE 3 — Sentinel-2 Sample Pipeline

**Status:** `PASS`

### Goal

Membuat pipeline Sentinel-2 yang valid pada AOI sebelum melakukan ekspor besar.

### Main Activities

- menentukan periode citra;
- menentukan batas cloud cover;
- memuat `COPERNICUS/S2_SR_HARMONIZED`;
- memeriksa jumlah citra;
- memeriksa band;
- menerapkan pixel-level cloud masking;
- membuat median composite;
- memilih band;
- clip terhadap AOI;
- menampilkan hasil pada peta.

### Required Outputs

- `configs/gee.yaml`;
- `gee/02_Sentinel2.js`;
- fungsi cloud masking pada `gee/utils.js`.

### Exit Criteria

- koleksi tidak kosong;
- band yang diperlukan tersedia;
- cloud masking berjalan;
- composite terbentuk;
- citra hanya mencakup AOI;
- tidak ada ekspor besar yang dimulai.

### Dependency

MILESTONE 2 harus `PASS`.

### Decision Gate

Periode citra dan proyeksi ekspor harus dikonfirmasi sebelum ekspor final.

### Next Milestone

MILESTONE 4.

---

## MILESTONE 4 — ESA WorldCover Label Pipeline

**Status:** `PASS`

### Goal

Menyiapkan label referensi yang sesuai dengan AOI dan kebutuhan training.

### Main Activities

- memuat `ESA/WorldCover/v200`;
- mengambil band kategorikal;
- clip terhadap AOI;
- memeriksa nilai kelas;
- menyusun remapping kelas;
- menetapkan `ignore_index`;
- membuat legenda kelas.

### Required Outputs

- `gee/03_WorldCover.js`;
- mapping kelas pada `configs/data.yaml`;
- dokumentasi kelas pada `docs/DATASET.md`.

### Exit Criteria

- label dapat dimuat;
- label tetap bertipe kategorikal integer;
- nilai kelas valid;
- remapping ke indeks kontinu tersedia;
- tidak menggunakan bilinear interpolation.

### Dependency

MILESTONE 2 harus `PASS`.  
Dapat dikerjakan setelah atau paralel dengan sebagian MILESTONE 3.

### Next Milestone

MILESTONE 5.

---

## MILESTONE 5 — Export Grid and Pilot Validation

**Status:** `PASS`

### Goal

Menentukan grid raster, menguji sample export, dan memvalidasi tiga raster pilot V2.

### Main Activities

- menentukan CRS berbasis meter;
- menetapkan resolusi 10 meter;
- menyamakan proyeksi dan grid;
- membuat export grid;
- memberi tile ID unik;
- memilih satu tile uji;
- mengekspor satu GeoTIFF Sentinel-2;
- mengekspor satu GeoTIFF WorldCover;
- membuka hasil di QGIS;
- mengaudit alignment.
- memilih tiga tile pilot representatif;
- mengekspor ulang pilot V2 dengan dimensi tepat `5000 × 5000`;
- menjalankan automated raster audit untuk ketiga pilot V2;
- melengkapi bukti manual QGIS label/alignment untuk pilot low-coverage `SULSEL_R005_C000`.

### Required Outputs

- `gee/05_Export_Grid.js`;
- satu sample image GeoTIFF;
- satu sample label GeoTIFF;
- konfigurasi grid final;
- laporan audit sample.
- `gee/06_Pilot_Export.js`;
- tiga raster pilot V2 yang diterima;
- evidence automated audit ketiga pilot dan manual QGIS low-coverage pilot.

### Exit Criteria

- image dan label mempunyai:
  - CRS sama;
  - transform sama;
  - bounds sama;
  - width dan height sama;
  - resolusi sama;
- label tetap kategorikal;
- kedua file dapat dibuka;
- sample export `PASS`.
- ketiga pilot V2 berukuran `5000 × 5000` dengan lima band yang benar;
- final validation dan automated raster audit ketiga pilot V2 `PASS`;
- manual QGIS label/alignment `SULSEL_R005_C000` `PASS`; screenshot manual khusus `SULSEL_R009_C004` tidak diklaim.

### Dependency

MILESTONE 3 dan MILESTONE 4 harus `PASS`.

### Rule

Full export tidak boleh dimulai jika sample export gagal.

### Next Milestone

MILESTONE 6.

---

## MILESTONE 6 — Full Dataset Export and Raster Audit

**Status:** `IN_PROGRESS`

### Goal

Mengekspor semua tile yang disetujui sebagai combined five-band GeoTIFF stack
dan memvalidasi seluruh raster produksi.

### Main Activities

- menyelesaikan TASK 6.1 automated raster auditor;
- menyiapkan script produksi aman-by-default;
- menyiapkan manifest expected/pending;
- menghasilkan export manifest;
- menjalankan ekspor bertile di GEE;
- memonitor task GEE;
- mengunduh hasil;
- mencocokkan file dengan manifest;
- memeriksa file hilang;
- memeriksa file duplikat;
- mengaudit semua raster produksi;
- mengarantina file invalid.

### Required Outputs

- `src/data/audit_raster.py`;
- `gee/07_Full_Export.js`;
- `data/raw/export_manifest.csv`;
- production GeoTIFF tiles setelah export terotorisasi;
- `logs/raw_raster_audit.csv`;
- `logs/raw_raster_audit_summary.md`.

### Exit Criteria

- semua expected production tile memiliki satu combined stack;
- tidak ada file corrupt;
- tidak ada tile ID ganda;
- semua raster stack konsisten secara internal;
- tile invalid tidak diteruskan ke patch builder.

### Dependency

MILESTONE 5 harus `PASS`.

### Human Action

Pengguna menjalankan dan memonitor Earth Engine Tasks.

### Next Milestone

MILESTONE 7.

---

## MILESTONE 7 — Patch Dataset and Spatial Split

**Status:** `BLOCKED`

### Goal

Membangun dataset patch yang valid dan membagi data tanpa kebocoran spasial.

### Main Activities

- membuat patch 256×256;
- menggunakan windowed reading;
- menyimpan pasangan image-label;
- menyimpan metadata sumber tile dan koordinat;
- menghapus patch all-NoData;
- memvalidasi nilai label;
- menghitung distribusi kelas;
- membuat train/validation/test split berbasis tile atau zona;
- memvisualisasikan pembagian spasial.

### Required Outputs

- `src/data/build_patches.py`;
- `src/data/create_spatial_split.py`;
- patch image;
- patch label;
- `data/splits/train.csv`;
- `data/splits/val.csv`;
- `data/splits/test.csv`;
- laporan distribusi kelas;
- peta split spasial.

### Exit Criteria

- jumlah patch image dan label sama;
- tidak ada patch corrupt;
- label hanya berisi kelas valid;
- tidak ada ID ganda antar split;
- tidak ada kebocoran spasial;
- distribusi kelas terdokumentasi.

### Dependency

MILESTONE 6 harus `PASS`.

### Next Milestone

MILESTONE 8.

---

## MILESTONE 8 — SegFormer-B0 Preparation

**Status:** `BLOCKED`

### Goal

Menyiapkan DataLoader dan model baseline sebelum full training.

### Main Activities

- membuat PyTorch Dataset;
- menerapkan normalisasi;
- menerapkan augmentasi sinkron;
- menjaga nearest-neighbor untuk mask;
- menentukan input baseline RGB;
- memuat pretrained SegFormer-B0;
- menyesuaikan jumlah kelas;
- menjalankan forward-pass smoke test;
- mencatat jumlah parameter.

### Required Outputs

- `src/data/dataset.py`;
- `src/models/segformer.py`;
- unit test;
- laporan smoke test.

### Exit Criteria

- dataset menghasilkan tensor yang benar;
- mask tidak rusak;
- forward pass berhasil;
- logits mempunyai jumlah kelas yang benar;
- tidak ada NaN;
- strategi input channel terdokumentasi.

### Dependency

MILESTONE 7 harus `PASS`.

### Next Milestone

MILESTONE 9.

---

## MILESTONE 9 — Training

**Status:** `BLOCKED`

### Goal

Melatih SegFormer-B0 pada Google Colab dan menyimpan checkpoint terbaik.

### Main Activities

- membuat `training.yaml`;
- membuat training loop;
- menentukan loss;
- menentukan optimizer dan scheduler;
- menjalankan one-epoch smoke test;
- menjalankan full training;
- mencatat train loss;
- mencatat validation loss dan mIoU;
- menerapkan checkpointing;
- menyimpan konfigurasi eksperimen;
- melakukan early stopping jika digunakan.

### Required Outputs

- `configs/training.yaml`;
- `src/training/train.py`;
- `src/training/losses.py`;
- `models/best_model.pth`;
- `models/last_model.pth`;
- training log;
- kurva loss;
- kurva mIoU.

### Exit Criteria

- smoke test `PASS`;
- loss finite;
- backward pass berhasil;
- best checkpoint tersedia;
- validation mIoU dihitung;
- konfigurasi eksperimen tersimpan;
- tidak ada error NaN.

### Dependency

MILESTONE 8 harus `PASS`.

### Human Action

Pengguna menjalankan notebook atau script training pada Google Colab.

### Next Milestone

MILESTONE 10.

---

## MILESTONE 10 — Evaluation

**Status:** `BLOCKED`

### Goal

Mengukur performa model pada test split yang benar-benar terpisah.

### Main Activities

- membuat fungsi confusion matrix;
- menghitung Overall Accuracy;
- menghitung Precision per kelas;
- menghitung Recall per kelas;
- menghitung F1 per kelas;
- menghitung IoU per kelas;
- menghitung mIoU;
- menyimpan hasil;
- membuat visualisasi kualitatif;
- memeriksa kelas yang sulit.

### Required Outputs

- `src/evaluation/metrics.py`;
- `src/evaluation/evaluate.py`;
- `outputs/metrics/metrics_summary.csv`;
- `outputs/metrics/class_metrics.csv`;
- `outputs/figures/confusion_matrix.png`;
- visualisasi citra-label-prediksi.

### Exit Criteria

- hanya test split yang digunakan;
- semua metrik wajib tersedia;
- `ignore_index` ditangani;
- nama kelas sesuai;
- hasil dapat direproduksi;
- tidak ada data test yang dipakai selama training.

### Dependency

MILESTONE 9 harus `PASS`.

### Next Milestone

MILESTONE 11.

---

## MILESTONE 11 — Inference and Map Reconstruction

**Status:** `BLOCKED`

### Goal

Menghasilkan GeoTIFF prediksi dan peta tutupan lahan Sulawesi Selatan.

### Main Activities

- melakukan inference per tile;
- memastikan kelas prediksi valid;
- menyimpan georeferensi;
- menggabungkan tile;
- menangani overlap;
- menetapkan NoData;
- membuka hasil di QGIS;
- membuat legenda;
- membuat peta final.

### Required Outputs

- `src/inference/predict_tiles.py`;
- `src/inference/mosaic_predictions.py`;
- `outputs/predictions/sulsel_landcover_prediction.tif`;
- legenda kelas;
- peta PNG;
- contoh zoom area.

### Exit Criteria

- GeoTIFF mempunyai CRS dan transform valid;
- tile tersusun pada lokasi benar;
- NoData terdefinisi;
- nilai prediksi berada pada kelas valid;
- file dapat dibuka di QGIS;
- legenda sesuai mapping kelas.

### Dependency

MILESTONE 10 harus `PASS`.

### Next Milestone

MILESTONE 12.

---

## MILESTONE 12 — Reproducibility and Final Audit

**Status:** `BLOCKED`

### Goal

Memastikan seluruh proyek dapat direproduksi dan memenuhi PRD.

### Main Activities

- memperbarui README;
- memeriksa seluruh file konfigurasi;
- memeriksa struktur folder;
- memeriksa script GEE;
- memeriksa manifest dataset;
- memeriksa split;
- memeriksa checkpoint;
- memeriksa evaluasi;
- memeriksa prediction GeoTIFF;
- memeriksa credential dan secrets;
- menjalankan final audit;
- menandai seluruh task.

### Required Outputs

- `README.md`;
- final audit report;
- daftar deliverable;
- daftar keterbatasan;
- seluruh task berstatus final.

### Exit Criteria

- seluruh mandatory task `PASS`;
- workflow dapat dijalankan ulang;
- tidak ada credential dalam repository;
- tidak ada raw dataset besar dalam Git;
- model checkpoint valid;
- metrics lengkap;
- GeoTIFF prediksi valid;
- tidak ada critical issue yang belum selesai.

### Dependency

MILESTONE 11 harus `PASS`.

### Completion Status

Proyek dinyatakan selesai hanya jika MILESTONE 12 `PASS`.

---

# 6. Decision Gates

## Gate A — AOI Validation

Tidak boleh mengambil dataset final sebelum AOI Sulawesi Selatan tervalidasi.

## Gate B — Date and CRS Approval

Tidak boleh mengekspor dataset final sebelum:

- periode citra diputuskan;
- CRS ekspor diputuskan;
- resolusi dan band diputuskan.

## Gate C — Sample Export Validation

Tidak boleh menjalankan full tiled export sebelum satu pasangan image-label lolos audit.

## Gate D — Raster Audit

Tidak boleh membuat patch dari raster yang gagal alignment.

## Gate E — Spatial Split Validation

Tidak boleh training sebelum split bebas kebocoran spasial.

## Gate F — Training Smoke Test

Tidak boleh full training sebelum one-epoch smoke test berhasil.

## Gate G — Test Isolation

Tidak boleh menghitung hasil final jika test split digunakan selama training atau tuning.

## Gate H — GeoTIFF Validation

Tidak boleh menyatakan peta selesai sebelum GeoTIFF prediksi lolos pemeriksaan QGIS dan metadata.

---

# 7. Recommended Execution Sequence

```text
Step 1  Update and align documentation
Step 2  Create local repository structure
Step 3  Execute AOI task in GEE
Step 4  Confirm research date range
Step 5  Build Sentinel-2 sample pipeline
Step 6  Build WorldCover label pipeline
Step 7  Decide export CRS and grid
Step 8  Export one sample pair
Step 9  Audit sample pair
Step 10 Run full tiled export
Step 11 Audit all exported tiles
Step 12 Build patch dataset
Step 13 Create spatial split
Step 14 Prepare DataLoader and SegFormer
Step 15 Run training smoke test
Step 16 Run full training
Step 17 Evaluate test split
Step 18 Run tiled inference
Step 19 Mosaic predictions
Step 20 Complete final audit
```

---

# 8. Current Progress

| Milestone | Status | Notes |
|---|---|---|
| M0 Documentation Alignment | PASS | scope audit and gitignore validated |
| M1 Local Environment | PASS | repository layout, environment audit, and requirements recorded |
| M2 AOI South Sulawesi | PASS | one South Sulawesi feature validated in GEE |
| M3 Sentinel-2 Pipeline | PASS | 2021 composite and cloud masking validated |
| M4 WorldCover Pipeline | PASS | categorical remapping and label handling validated |
| M5 Export Grid and Pilot Validation | PASS | 55-tile grid plus three accepted V2 pilots; all pilot audits PASS |
| M6 Full Export and Raster Audit | IN_PROGRESS | TASK 6.1 auditor PASS; batch_04 production export and local raster audit PASS; 5 of 55 production tiles passed; 50 remain |
| M7 Patch Dataset | BLOCKED | waiting for raster audit |
| M8 Model Preparation | BLOCKED | waiting for dataset split |
| M9 Training | BLOCKED | waiting for model smoke test |
| M10 Evaluation | BLOCKED | waiting for trained model |
| M11 Inference | BLOCKED | waiting for evaluation |
| M12 Final Audit | BLOCKED | waiting for all prior milestones |

---

# 9. Antigravity IDE Instructions

Before executing a milestone:

1. Read `PRD.md`.
2. Read the relevant section of `TASK.md`.
3. Read the active milestone in `ROADMAP.md`.
4. Confirm all dependencies are `PASS`.
5. Execute only tasks belonging to the active milestone.
6. Run the validation prompt for every task.
7. Update task status.
8. Update milestone status.
9. Stop if a decision gate is not satisfied.
10. Ask for user action when browser interaction, GEE export, Google Drive download, QGIS inspection, or Colab runtime is required.

After completing a milestone, produce:

```text
MILESTONE:
STATUS:
TASKS COMPLETED:
FILES CREATED:
FILES MODIFIED:
VALIDATION RESULTS:
UNRESOLVED ISSUES:
HUMAN ACTION REQUIRED:
NEXT MILESTONE:
```

---

# 10. Change Control

Any change to the following requires explicit approval:

- study area;
- primary dataset;
- label source;
- model family;
- input band strategy;
- class mapping;
- date range;
- export CRS;
- patch size;
- spatial split strategy;
- mandatory evaluation metrics.

Approved changes must be reflected in:

1. `PRD.md`
2. `TASK.md`
3. `ROADMAP.md`
4. related configuration files
5. execution log

---

# 11. Project Completion Definition

The roadmap is complete when:

- MILESTONE 0 through MILESTONE 12 are `PASS`;
- every required deliverable exists;
- the final prediction GeoTIFF is georeferenced and readable;
- evaluation results are available;
- the project can be reproduced from documented instructions;
- no critical validation failure remains unresolved.
