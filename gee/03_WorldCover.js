// ============================================================
// FILE       : 03_WorldCover.js
// PROJECT    : SegFormer Land Cover - Sulawesi Selatan
// PURPOSE    :
// 1. Membuat AOI Provinsi Sulawesi Selatan
// 2. Memuat ESA WorldCover v200 tahun 2021
// 3. Memotong label berdasarkan AOI
// 4. Memvalidasi band, tipe data, proyeksi, dan kelas
// 5. Meremap kelas asli WorldCover menjadi indeks 0–10
// 6. Menampilkan label asli dan label training
//
// STATUS     : PASS
// ============================================================


// ============================================================
// 1. KONFIGURASI UTAMA
// ============================================================

// Nilai kelas asli ESA WorldCover.
var ORIGINAL_CLASSES = [
  10,   // Tree cover
  20,   // Shrubland
  30,   // Grassland
  40,   // Cropland
  50,   // Built-up
  60,   // Bare / sparse vegetation
  70,   // Snow and ice
  80,   // Permanent water bodies
  90,   // Herbaceous wetland
  95,   // Mangroves
  100   // Moss and lichen
];

// Indeks kelas kontinu untuk training SegFormer.
var TRAINING_CLASSES = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10
];

// Nilai untuk piksel yang tidak memiliki mapping valid.
var IGNORE_INDEX = 255;

// Nama kelas.
var CLASS_NAMES = [
  'Tree cover',
  'Shrubland',
  'Grassland',
  'Cropland',
  'Built-up',
  'Bare or sparse vegetation',
  'Snow and ice',
  'Permanent water bodies',
  'Herbaceous wetland',
  'Mangroves',
  'Moss and lichen'
];

// Palet warna kelas.
var WORLDCOVER_PALETTE = [
  '006400', // Tree cover
  'FFBB22', // Shrubland
  'FFFF4C', // Grassland
  'F096FF', // Cropland
  'FA0000', // Built-up
  'B4B4B4', // Bare / sparse vegetation
  'F0F0F0', // Snow and ice
  '0064C8', // Permanent water bodies
  '0096A0', // Herbaceous wetland
  '00CF75', // Mangroves
  'FAE6A0'  // Moss and lichen
];


// ============================================================
// 2. AREA OF INTEREST — SULAWESI SELATAN
// ============================================================

// Memuat batas administrasi level provinsi.
var adminLevel1 = ee.FeatureCollection(
  'FAO/GAUL/2015/level1'
);

// Memilih seluruh provinsi di Indonesia.
var indonesia = adminLevel1.filter(
  ee.Filter.eq('ADM0_NAME', 'Indonesia')
);

// Memilih Provinsi Sulawesi Selatan.
var aoi = indonesia.filter(
  ee.Filter.eq('ADM1_NAME', 'Sulawesi Selatan')
);

// Mengubah FeatureCollection menjadi geometri.
var aoiGeometry = aoi.geometry();

// Validasi AOI.
print('======================================');
print('VALIDASI AOI');
print('======================================');

print(
  'Jumlah fitur AOI:',
  aoi.size()
);

print(
  'Properti AOI:',
  aoi.first()
);

// Pusatkan peta pada Sulawesi Selatan.
Map.centerObject(aoi, 8);

// Style batas AOI.
var styledAOI = aoi.style({
  color: 'FFFF00',
  fillColor: '00000000',
  width: 2
});


// ============================================================
// 3. MEMUAT ESA WORLDCOVER V200
// ============================================================

var worldCoverCollection = ee.ImageCollection(
  'ESA/WorldCover/v200'
);

// Mengambil image pertama,
// memilih band Map,
// dan clip ke AOI.
var worldCoverOriginal = ee.Image(
  worldCoverCollection.first()
)
  .select('Map')
  .clip(aoiGeometry);


// ============================================================
// 4. REMAPPING LABEL UNTUK TRAINING
// ============================================================

// Nilai asli WorldCover:
// 10, 20, 30, 40, ...
//
// Diubah menjadi:
// 0, 1, 2, 3, ...
//
// Nilai yang tidak terdaftar diberi IGNORE_INDEX = 255.
var worldCoverLabel = worldCoverOriginal
  .remap(
    ORIGINAL_CLASSES,
    TRAINING_CLASSES,
    IGNORE_INDEX
  )
  .rename('label')
  .toUint8();


// ============================================================
// 5. VALIDASI DASAR WORLDCOVER
// ============================================================

print('======================================');
print('VALIDASI ESA WORLDCOVER');
print('======================================');

print(
  'Jumlah image WorldCover:',
  worldCoverCollection.size()
);

print(
  'Band asli WorldCover:',
  worldCoverOriginal.bandNames()
);

print(
  'Tipe data WorldCover asli:',
  worldCoverOriginal.bandTypes()
);

print(
  'Proyeksi WorldCover asli:',
  worldCoverOriginal.projection()
);

print(
  'Band label training:',
  worldCoverLabel.bandNames()
);

print(
  'Tipe data label training:',
  worldCoverLabel.bandTypes()
);

print(
  'Daftar nama kelas:',
  CLASS_NAMES
);

print(
  'Nilai kelas asli:',
  ORIGINAL_CLASSES
);

print(
  'Indeks kelas training:',
  TRAINING_CLASSES
);

print(
  'Ignore index:',
  IGNORE_INDEX
);


// ============================================================
// 6. HISTOGRAM KELAS ASLI
// ============================================================

// Scale 100 digunakan untuk diagnostik agar lebih ringan.
// Resolusi sumber tetap 10 meter.
var originalHistogram = worldCoverOriginal.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Histogram kelas WorldCover asli:',
  originalHistogram
);


// ============================================================
// 7. HISTOGRAM KELAS SETELAH REMAPPING
// ============================================================

var remappedHistogram = worldCoverLabel.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Histogram kelas label training:',
  remappedHistogram
);


// ============================================================
// 8. NILAI MINIMUM DAN MAKSIMUM LABEL
// ============================================================

var labelMinMax = worldCoverLabel.reduceRegion({
  reducer: ee.Reducer.minMax(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Minimum dan maksimum label:',
  labelMinMax
);


// ============================================================
// 9. VISUALISASI KELAS ASLI
// ============================================================

// Karena nilai kelas asli tidak berurutan,
// visualisasi diremap dahulu ke 0–10.
var worldCoverDisplay = worldCoverOriginal
  .remap(
    ORIGINAL_CLASSES,
    TRAINING_CLASSES
  )
  .rename('display');

Map.addLayer(
  worldCoverDisplay,
  {
    min: 0,
    max: 10,
    palette: WORLDCOVER_PALETTE
  },
  '01 - ESA WorldCover 2021',
  true
);


// ============================================================
// 10. VISUALISASI LABEL TRAINING
// ============================================================

// Mask nilai 255 agar tidak ikut tampil.
var worldCoverLabelDisplay = worldCoverLabel.updateMask(
  worldCoverLabel.neq(IGNORE_INDEX)
);

Map.addLayer(
  worldCoverLabelDisplay,
  {
    min: 0,
    max: 10,
    palette: WORLDCOVER_PALETTE
  },
  '02 - WorldCover Training Labels',
  false
);


// ============================================================
// 11. MENAMPILKAN BATAS AOI
// ============================================================

Map.addLayer(
  styledAOI,
  {},
  '03 - Batas Sulawesi Selatan',
  true
);


// ============================================================
// 12. VALIDASI LUAS KELAS AIR
// ============================================================

// Kelas WorldCover 80 adalah permanent water bodies.
var waterMask = worldCoverOriginal.eq(80);

var waterArea = waterMask
  .multiply(ee.Image.pixelArea())
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: aoiGeometry,
    scale: 100,
    bestEffort: true,
    maxPixels: 1e9,
    tileScale: 4
  });

print(
  'Perkiraan luas kelas air dalam AOI (m2):',
  waterArea
);


// ============================================================
// 13. VALIDASI NILAI YANG TIDAK TERPETAKAN
// ============================================================

// Menghitung jumlah piksel yang menjadi ignore index.
var ignoreMask = worldCoverLabel.eq(IGNORE_INDEX);

var ignoreHistogram = ignoreMask.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Histogram ignore index:',
  ignoreHistogram
);


// ============================================================
// 14. CATATAN
// ============================================================

// Script ini sudah melakukan:
// - AOI Sulawesi Selatan
// - Load ESA WorldCover v200
// - Clip berdasarkan AOI
// - Validasi band dan tipe data
// - Histogram kelas
// - Remapping kelas ke 0–10
// - Ignore index 255
// - Visualisasi label
//
// Script ini BELUM melakukan:
// - Export GeoTIFF
// - Alignment grid final
// - Sample export
// - Patch extraction
// - Training SegFormer
//
// Setelah seluruh validasi PASS,
// tahap berikutnya adalah membuat sample export
// citra Sentinel-2 dan label WorldCover.