# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1. Identitas Proyek

**Nama proyek:** SegFormer Land Cover Mapping – Sulawesi Selatan  
**Judul penelitian:**  
**Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform GEE**

**Versi dokumen:** 3.0  
**Status:** Aktif  
**Wilayah penelitian:** Provinsi Sulawesi Selatan, Indonesia  
**Platform utama:** Google Earth Engine (GEE) dan Google Colab  
**Model utama:** SegFormer-B0  
**Jenis tugas:** Semantic segmentation tutupan lahan  

---

## 2. Tujuan Dokumen

Dokumen ini menjadi **sumber kebenaran utama** (*single source of truth*) untuk seluruh pengembangan proyek.

Seluruh kode, task, konfigurasi, struktur folder, dataset, dan eksperimen harus mengikuti PRD ini.

Jika terdapat perbedaan antara dokumen:

1. Judul dan arahan terbaru dari dosen pembimbing
2. `PRD.md`
3. `TASK.md`
4. `ROADMAP.md`
5. Kode dan notebook

maka dokumen dengan urutan lebih tinggi harus dijadikan acuan.

---

## 3. Latar Belakang Proyek

Pemetaan tutupan lahan merupakan proses mengidentifikasi objek fisik yang menutupi permukaan bumi, seperti vegetasi, lahan pertanian, permukiman, badan air, semak, lahan terbuka, dan lahan basah.

Provinsi Sulawesi Selatan memiliki variasi tutupan lahan yang beragam. Pemetaan secara manual membutuhkan waktu, tenaga, dan interpretasi citra yang besar. Oleh karena itu, proyek ini menerapkan model deep learning SegFormer untuk melakukan segmentasi tutupan lahan secara otomatis menggunakan citra Sentinel-2.

Google Earth Engine digunakan untuk:

- mengakses dataset satelit;
- menentukan area penelitian;
- memfilter citra berdasarkan waktu dan tutupan awan;
- melakukan cloud masking;
- membuat komposit citra;
- memotong citra berdasarkan batas Provinsi Sulawesi Selatan;
- mengekspor hasil praproses ke GeoTIFF.

Pelatihan SegFormer dilakukan di Google Colab karena laptop lokal tidak memiliki GPU NVIDIA yang mendukung CUDA.

---

## 4. Tujuan Proyek

### 4.1 Tujuan utama

Mengimplementasikan model SegFormer berbasis deep learning untuk menghasilkan peta tutupan lahan Provinsi Sulawesi Selatan menggunakan citra Sentinel-2 yang diproses melalui Google Earth Engine.

### 4.2 Tujuan khusus

1. Menyiapkan batas administrasi Provinsi Sulawesi Selatan sebagai Area of Interest (AOI).
2. Mengambil dan memproses citra Sentinel-2 Surface Reflectance Harmonized.
3. Mengambil ESA WorldCover v200 sebagai label referensi.
4. Menyamakan extent, resolusi, proyeksi, dan grid antara citra input dan label.
5. Membentuk dataset patch untuk training, validation, dan test.
6. Melatih SegFormer-B0 untuk semantic segmentation.
7. Mengevaluasi hasil menggunakan metrik klasifikasi dan segmentasi.
8. Menghasilkan GeoTIFF prediksi dan visualisasi peta tutupan lahan.
9. Menyusun pipeline yang terdokumentasi dan dapat dijalankan ulang.

---

## 5. Pertanyaan Proyek

1. Bagaimana mengimplementasikan SegFormer untuk pemetaan tutupan lahan Provinsi Sulawesi Selatan?
2. Bagaimana menyiapkan citra Sentinel-2 dan ESA WorldCover agar dapat digunakan sebagai pasangan citra-label?
3. Bagaimana performa SegFormer-B0 dalam mengklasifikasikan setiap kelas tutupan lahan?
4. Kelas tutupan lahan apa yang paling mudah dan paling sulit dipetakan oleh model?

---

## 6. Ruang Lingkup

### 6.1 Termasuk dalam proyek

- Area penelitian Provinsi Sulawesi Selatan.
- Citra Sentinel-2 Surface Reflectance Harmonized.
- Label ESA WorldCover v200.
- Batas administrasi Provinsi Sulawesi Selatan.
- Preprocessing pada Google Earth Engine.
- Ekspor raster secara bertahap atau bertile.
- Pembuatan dataset patch.
- Training SegFormer-B0.
- Evaluasi model.
- Inferensi pada data uji.
- Penyimpanan output dalam format GeoTIFF, PNG, CSV, JSON, dan checkpoint model.

### 6.2 Tidak termasuk dalam proyek

- Observasi atau survei lapangan.
- Pengumpulan data primer.
- Pemetaan seluruh Indonesia.
- Pemrosesan seluruh Pulau Sulawesi.
- Pembuatan arsitektur deep learning baru.
- Deployment aplikasi web atau mobile.
- Sistem monitoring real-time.
- Penggunaan dataset Landsat, DEM, atau Dynamic World sebagai dataset utama.
- Klaim bahwa ESA WorldCover merupakan ground truth lapangan yang sempurna.

---

## 7. Area of Interest

### 7.1 Wilayah

**Provinsi Sulawesi Selatan, Indonesia**

### 7.2 Persyaratan AOI

AOI harus:

- hanya berisi satu fitur provinsi;
- memiliki geometri yang valid;
- menggunakan CRS `EPSG:4326` saat disimpan sebagai data vektor;
- dapat digunakan untuk filter dan clipping di GEE;
- tidak menggunakan Kabupaten Maros sebagai wilayah utama;
- memiliki nama atribut yang dapat diverifikasi sebagai Sulawesi Selatan.

### 7.3 Sumber AOI

Sumber yang dapat digunakan:

- FAO GAUL Level 1 pada Google Earth Engine;
- GADM Level 1;
- batas administrasi dari BIG, jika tersedia dan penggunaannya diizinkan.

Sumber AOI yang dipilih harus dicatat dalam metadata proyek.

---

## 8. Dataset

### 8.1 Sentinel-2 Surface Reflectance Harmonized

**Dataset ID GEE:** `COPERNICUS/S2_SR_HARMONIZED`  
**Fungsi:** citra input model  
**Tipe:** ImageCollection  
**Resolusi utama:** 10 meter  
**Produk:** Level-2A Surface Reflectance  

#### Band inti

| Band | Nama | Resolusi |
|---|---|---:|
| B2 | Blue | 10 m |
| B3 | Green | 10 m |
| B4 | Red | 10 m |
| B8 | Near Infrared | 10 m |

#### Band opsional

| Band | Nama | Resolusi awal |
|---|---|---:|
| B11 | SWIR 1 | 20 m |
| B12 | SWIR 2 | 20 m |

Band 20 meter tidak boleh langsung digabungkan dengan band 10 meter tanpa strategi resampling yang terdokumentasi.

### 8.2 ESA WorldCover v200

**Dataset ID GEE:** `ESA/WorldCover/v200`  
**Fungsi:** label referensi tutupan lahan  
**Resolusi:** 10 meter  
**Tipe:** categorical raster  

Kelas asli ESA WorldCover harus dipetakan ke indeks kelas kontinu sebelum training.

Contoh:

| Nilai asli | Kelas | Indeks training |
|---:|---|---:|
| 10 | Tree cover | 0 |
| 20 | Shrubland | 1 |
| 30 | Grassland | 2 |
| 40 | Cropland | 3 |
| 50 | Built-up | 4 |
| 60 | Bare / sparse vegetation | 5 |
| 70 | Snow and ice | 6 |
| 80 | Permanent water bodies | 7 |
| 90 | Herbaceous wetland | 8 |
| 95 | Mangroves | 9 |
| 100 | Moss and lichen | 10 |

Kelas yang tidak terdapat pada AOI boleh tetap didefinisikan pada metadata, tetapi tidak dipaksakan masuk ke evaluasi jika jumlah pikselnya nol.

### 8.3 Metadata wajib

Setiap ekspor dataset harus memiliki catatan:

- nama dataset;
- dataset ID;
- tanggal akses;
- periode citra;
- batas cloud cover;
- metode cloud masking;
- metode compositing;
- band yang digunakan;
- resolusi ekspor;
- CRS;
- ukuran tile;
- nama AOI;
- versi script GEE.

---

## 9. Konfigurasi Data

Parameter berikut harus diletakkan pada bagian konfigurasi script, bukan ditulis berulang di banyak tempat.

```javascript
var CONFIG = {
  regionName: 'South Sulawesi',
  startDate: 'TBD',
  endDate: 'TBD',
  cloudPercentage: 20,
  exportScale: 10,
  patchSize: 256,
  exportCRS: 'TBD'
};
```

### 9.1 Periode citra

Tahun atau rentang tanggal penelitian harus dikonfirmasi dengan dosen pembimbing sebelum ekspor final.

Sebelum tanggal tersebut ditetapkan, kode menggunakan status `TBD` dan tidak boleh dianggap sebagai konfigurasi final.

### 9.2 Proyeksi ekspor

`EPSG:4326` dapat digunakan untuk data vektor AOI, tetapi bukan otomatis pilihan terbaik untuk raster beresolusi 10 meter.

Untuk raster training, proyeksi ekspor harus:

- menggunakan satuan meter;
- konsisten antara citra dan label;
- sesuai dengan wilayah Sulawesi Selatan;
- dicatat dalam metadata.

Pemilihan EPSG final harus divalidasi sebelum ekspor dataset besar.

---

## 10. Preprocessing pada Google Earth Engine

Pipeline minimum:

1. Memuat AOI Sulawesi Selatan.
2. Memuat Sentinel-2 SR Harmonized.
3. Filter berdasarkan AOI.
4. Filter berdasarkan tanggal.
5. Filter metadata tutupan awan.
6. Melakukan cloud masking.
7. Memilih band.
8. Melakukan compositing.
9. Melakukan clipping terhadap AOI.
10. Memuat ESA WorldCover.
11. Melakukan clipping label terhadap AOI.
12. Menyamakan grid, resolusi, proyeksi, dan extent.
13. Mengekspor citra dan label.

### 10.1 Cloud masking

Cloud masking harus dijelaskan dan diuji.

Pilihan implementasi:

- Scene Classification Layer (SCL);
- Cloud Score+;
- metode lain yang terdokumentasi.

Filter metadata `CLOUDY_PIXEL_PERCENTAGE` saja tidak dianggap cukup sebagai cloud masking piksel.

### 10.2 Composite

Metode awal:

- median composite.

Metode lain boleh diuji, tetapi harus didokumentasikan dan dibandingkan secara terkontrol.

### 10.3 Indeks spektral

NDVI, NDWI, dan NDBI berstatus **opsional**, bukan input wajib.

Indeks hanya digunakan jika dibuat eksperimen terpisah, misalnya:

- Eksperimen A: RGB;
- Eksperimen B: RGB + NIR;
- Eksperimen C: multispektral atau indeks tambahan.

Penambahan jumlah kanal mengharuskan modifikasi input model SegFormer dan harus dijelaskan pada kode serta laporan eksperimen.

---

## 11. Strategi Ekspor

Sulawesi Selatan tidak diekspor sebagai satu file besar tanpa pengujian.

Ekspor harus dilakukan:

- per tile;
- per grid;
- per wilayah administratif;
- atau menggunakan strategi lain yang menjaga ukuran file tetap terkendali.

Setiap tile citra harus memiliki tile label yang:

- memiliki nama pasangan;
- extent sama;
- tinggi dan lebar sama;
- resolusi sama;
- CRS sama;
- transformasi affine sama.

Contoh penamaan:

```text
S2_SULSEL_TILE_0001.tif
WC_SULSEL_TILE_0001.tif
```

---

## 12. Pembuatan Dataset Patch

### 12.1 Ukuran patch awal

`256 × 256` piksel.

Ukuran patch dapat diubah melalui konfigurasi, tetapi perubahan harus dicatat.

### 12.2 Pasangan data

Setiap patch harus memiliki:

```text
images/image_000001.tif
labels/label_000001.tif
```

### 12.3 Filter patch

Patch dapat dikeluarkan jika:

- seluruhnya NoData;
- seluruhnya berada di luar AOI;
- citra rusak;
- label rusak;
- alignment citra-label tidak sesuai.

Patch kelas tunggal tidak boleh otomatis dihapus karena dapat mewakili area tutupan lahan yang valid.

### 12.4 Pembagian dataset

Pembagian train, validation, dan test harus dilakukan secara **spasial**, bukan hanya acak per patch, untuk mengurangi kebocoran data akibat patch yang berdekatan.

Konfigurasi awal:

- train: 70%;
- validation: 15%;
- test: 15%.

Persentase dapat berubah berdasarkan desain eksperimen, tetapi tile atau zona yang sama tidak boleh tersebar secara tidak terkendali ke beberapa split.

---

## 13. Model Deep Learning

### 13.1 Model utama

**SegFormer-B0**

### 13.2 Alasan pemilihan

- dirancang untuk semantic segmentation;
- memiliki encoder berbasis Mix Transformer;
- relatif ringan dibanding varian SegFormer yang lebih besar;
- sesuai untuk eksperimen menggunakan GPU cloud terbatas;
- tersedia implementasi pada PyTorch dan Hugging Face Transformers.

### 13.3 Input model

Baseline yang direkomendasikan:

- RGB: B4, B3, B2.

Eksperimen lanjutan dapat menggunakan:

- B2, B3, B4, B8;
- multispektral;
- indeks spektral.

Penggunaan pretrained weight tiga kanal harus disesuaikan jika input melebihi tiga kanal.

### 13.4 Output model

Tensor segmentasi dengan dimensi:

```text
batch_size × jumlah_kelas × tinggi × lebar
```

Prediksi akhir adalah indeks kelas per piksel.

---

## 14. Training

Training dilakukan pada Google Colab atau lingkungan GPU cloud lain yang disetujui.

Parameter minimum yang harus dapat dikonfigurasi:

- random seed;
- batch size;
- learning rate;
- jumlah epoch;
- optimizer;
- loss function;
- weight decay;
- scheduler;
- jumlah kelas;
- ukuran patch;
- input channels;
- checkpoint directory.

### 14.1 Loss function

Baseline:

- Cross Entropy Loss.

Jika terdapat ketidakseimbangan kelas, opsi yang dapat diuji:

- weighted cross entropy;
- focal loss;
- kombinasi cross entropy dan Dice loss.

### 14.2 Checkpoint

Simpan:

- checkpoint terakhir;
- checkpoint dengan validation mIoU terbaik;
- optimizer state;
- scheduler state;
- epoch;
- konfigurasi eksperimen.

---

## 15. Evaluasi

Metrik wajib:

- Overall Accuracy;
- Precision per kelas;
- Recall per kelas;
- F1-score per kelas;
- Intersection over Union per kelas;
- mean Intersection over Union;
- confusion matrix.

Metrik tambahan:

- waktu training;
- waktu inferensi;
- jumlah parameter;
- ukuran checkpoint.

Evaluasi harus mengabaikan nilai NoData atau `ignore_index` secara konsisten.

---

## 16. Output Proyek

### 16.1 Output data

- GeoTIFF Sentinel-2 hasil preprocessing;
- GeoTIFF label ESA WorldCover;
- patch citra;
- patch label;
- metadata dataset;
- file split train, validation, dan test.

### 16.2 Output model

- `best_model.pth` atau format checkpoint yang setara;
- konfigurasi training;
- log training;
- kurva loss;
- kurva metrik.

### 16.3 Output evaluasi

- `metrics_summary.csv`;
- `class_metrics.csv`;
- `confusion_matrix.png`;
- contoh visualisasi citra-label-prediksi.

### 16.4 Output spasial

- GeoTIFF hasil prediksi;
- legenda kelas;
- peta visualisasi;
- metadata proyeksi dan resolusi.

---

## 17. Struktur Folder

```text
SegFormer-LandCover/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── TASK.md
│   ├── ROADMAP.md
│   ├── DATASET.md
│   └── VALIDATION.md
├── configs/
│   ├── data.yaml
│   └── training.yaml
├── gee/
│   ├── 01_AOI.js
│   ├── 02_Sentinel2.js
│   ├── 03_WorldCover.js
│   ├── 04_Export.js
│   └── utils.js
├── src/
│   ├── data/
│   ├── models/
│   ├── training/
│   ├── evaluation/
│   └── inference/
├── notebooks/
├── data/
│   ├── raw/
│   ├── interim/
│   ├── processed/
│   ├── patches/
│   └── splits/
├── models/
├── outputs/
│   ├── metrics/
│   ├── figures/
│   ├── predictions/
│   └── maps/
├── logs/
└── tests/
```

Folder data besar tidak boleh dimasukkan ke Git.

---

## 18. Persyaratan Fungsional

| ID | Requirement |
|---|---|
| FR-01 | Sistem dapat memuat AOI Provinsi Sulawesi Selatan. |
| FR-02 | Sistem dapat memuat Sentinel-2 berdasarkan tanggal dan AOI. |
| FR-03 | Sistem dapat melakukan cloud masking. |
| FR-04 | Sistem dapat membuat median composite. |
| FR-05 | Sistem dapat memuat dan memotong ESA WorldCover. |
| FR-06 | Sistem dapat mengekspor pasangan citra dan label yang sejajar. |
| FR-07 | Sistem dapat membuat patch citra-label. |
| FR-08 | Sistem dapat membagi dataset secara spasial. |
| FR-09 | Sistem dapat melatih SegFormer-B0. |
| FR-10 | Sistem dapat menyimpan checkpoint terbaik. |
| FR-11 | Sistem dapat menghitung seluruh metrik wajib. |
| FR-12 | Sistem dapat menghasilkan GeoTIFF prediksi. |
| FR-13 | Sistem dapat mereproduksi eksperimen dari konfigurasi tersimpan. |

---

## 19. Persyaratan Nonfungsional

| ID | Requirement |
|---|---|
| NFR-01 | Kode harus modular dan terdokumentasi. |
| NFR-02 | Semua parameter penting harus berada pada file konfigurasi. |
| NFR-03 | Pipeline harus dapat dijalankan ulang. |
| NFR-04 | Script tidak boleh memuat path pribadi secara hard-coded. |
| NFR-05 | Dataset besar harus diproses secara bertahap. |
| NFR-06 | Proses lokal tidak boleh mengharuskan seluruh raster dimuat ke RAM sekaligus. |
| NFR-07 | Semua output memiliki penamaan konsisten. |
| NFR-08 | Setiap task harus divalidasi sebelum task berikutnya. |
| NFR-09 | Tidak boleh menghapus data tanpa konfirmasi pengguna. |
| NFR-10 | Credential, token, dan data autentikasi tidak boleh masuk repository. |

---

## 20. Batasan Perangkat

Perangkat lokal:

- Acer Aspire 5 A515-45;
- AMD Ryzen 3 3500U;
- RAM 8 GB DDR4;
- AMD Radeon integrated GPU;
- penyimpanan lokal terbatas.

Implikasi:

- GEE digunakan untuk pengolahan geospasial berat;
- training dilakukan pada Google Colab;
- preprocessing lokal menggunakan windowed reading atau batch processing;
- dataset disimpan dan diproses bertile;
- model transformer tidak dilatih menggunakan GPU lokal.

---

## 21. Aturan untuk AI Agent Antigravity IDE

AI Agent wajib:

1. Membaca `PRD.md`, `TASK.md`, dan `ROADMAP.md` sebelum memulai pekerjaan.
2. Mengerjakan hanya satu task aktif.
3. Tidak mengubah wilayah penelitian menjadi Kabupaten Maros.
4. Tidak menambahkan dataset baru tanpa persetujuan pengguna.
5. Tidak melanjutkan task jika acceptance criteria belum terpenuhi.
6. Menampilkan file yang dibuat atau diubah.
7. Menjalankan validasi yang sesuai.
8. Memberikan status `PASS` atau `FAIL`.
9. Menjelaskan error tanpa menyembunyikannya.
10. Tidak menghapus dataset, environment, model, credential, atau file proyek tanpa konfirmasi eksplisit.
11. Tidak menjalankan ekspor GEE besar sebelum ekspor sampel berhasil.
12. Tidak menganggap konfigurasi `TBD` sebagai keputusan final.

---

## 22. Acceptance Criteria per Fase

### Fase AOI

- hanya satu fitur Sulawesi Selatan;
- geometri valid;
- nama wilayah benar;
- AOI tampil pada peta;
- tidak ada error di Console.

### Fase Sentinel-2

- koleksi tidak kosong;
- band tersedia;
- cloud masking berjalan;
- composite terbentuk;
- citra terpotong pada AOI.

### Fase label

- ESA WorldCover berhasil dimuat;
- kelas categorical tetap integer;
- label tidak diinterpolasi dengan bilinear;
- grid label sejajar dengan citra.

### Fase ekspor

- sample export berhasil;
- citra dan label dapat dibuka;
- CRS, resolusi, transformasi, width, dan height sesuai;
- NoData terdefinisi;
- pasangan tile memiliki nama konsisten.

### Fase dataset

- patch citra dan label berjumlah sama;
- tidak ada file corrupt;
- label hanya berisi indeks kelas valid;
- split tidak bocor secara spasial.

### Fase training

- model dapat melakukan forward pass;
- loss bukan NaN;
- loss training tercatat;
- validation mIoU dihitung;
- checkpoint terbaik tersimpan.

### Fase evaluasi

- semua metrik wajib tersedia;
- confusion matrix tersedia;
- evaluasi dilakukan hanya pada test split;
- hasil dapat direproduksi.

### Fase inferensi

- output memiliki ukuran sesuai area input;
- kelas prediksi valid;
- GeoTIFF memiliki georeferensi;
- hasil dapat dibuka di QGIS.

---

## 23. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tutupan awan tinggi | Komposit tidak bersih | Perpanjang rentang waktu dan gunakan pixel-level cloud masking |
| Ekspor terlalu besar | Task gagal | Gunakan tile atau grid ekspor |
| RAM lokal habis | Preprocessing gagal | Windowed reading dan batch processing |
| Kelas tidak seimbang | Model bias | Class weighting atau sampling terkontrol |
| Label tidak sejajar | Training tidak valid | Validasi transformasi, grid, dan extent |
| Kebocoran data spasial | Metrik terlalu optimistis | Split berdasarkan zona atau tile |
| Input lebih dari 3 kanal | Pretrained model tidak kompatibel langsung | Modifikasi input layer dan dokumentasikan |
| Kuota GEE terbatas | Ekspor tertunda | Ekspor bertahap dan hapus task duplikat |
| Penyimpanan penuh | Proses terhenti | Simpan data bertile dan bersihkan file sementara secara aman |

---

## 24. Definition of Done

Proyek dinyatakan selesai jika:

- AOI Sulawesi Selatan tervalidasi;
- Sentinel-2 dan ESA WorldCover berhasil diproses;
- pasangan citra-label telah diekspor dan lolos validasi;
- dataset patch dan split spasial tersedia;
- SegFormer-B0 berhasil dilatih;
- checkpoint terbaik tersimpan;
- seluruh metrik wajib dihitung;
- GeoTIFF prediksi tersedia dan dapat dibuka di QGIS;
- kode, konfigurasi, metadata, dan dokumentasi dapat digunakan untuk menjalankan ulang pipeline;
- seluruh task dalam `TASK.md` berstatus `PASS`.

---

## 25. Status Saat Ini

| Tahap | Status |
|---|---|
| Registrasi Google Earth Engine | PASS |
| Google Cloud Project | PASS |
| Earth Engine API | PASS |
| Earth Engine Code Editor | PASS |
| Struktur repository lokal | BELUM DIVALIDASI |
| AOI Provinsi Sulawesi Selatan | NEXT TASK |
| Akuisisi Sentinel-2 | BELUM DIMULAI |
| ESA WorldCover | BELUM DIMULAI |
| Ekspor GeoTIFF | BELUM DIMULAI |
| Dataset patch | BELUM DIMULAI |
| Training SegFormer | BELUM DIMULAI |
| Evaluasi | BELUM DIMULAI |
| Inferensi dan peta | BELUM DIMULAI |

---

## 26. Keputusan Proyek yang Dikunci

1. Wilayah utama adalah **Provinsi Sulawesi Selatan**, bukan Kabupaten Maros.
2. Sentinel-2 adalah citra input utama.
3. ESA WorldCover v200 adalah label referensi awal.
4. Google Earth Engine digunakan untuk akuisisi dan preprocessing.
5. SegFormer-B0 adalah model utama.
6. Google Colab digunakan untuk training.
7. Ekspor raster dilakukan secara bertile jika satu ekspor provinsi terlalu besar.
8. NDVI, NDWI, dan NDBI merupakan eksperimen opsional.
9. Tidak ada observasi langsung dalam ruang lingkup proyek.
10. Tahap berikutnya adalah pembuatan dan validasi AOI Sulawesi Selatan.
