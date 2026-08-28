// ============================================================
// FILE    : 02_Sentinel2.js
// TUJUAN  :
// 1. Membuat AOI Provinsi Sulawesi Selatan
// 2. Mengambil Sentinel-2 tahun 2021
// 3. Melakukan filter awan metadata
// 4. Melakukan cloud masking menggunakan SCL
// 5. Membuat median composite
// 6. Menampilkan hasil RGB dan false color
// ============================================================


// ============================================================
// BAGIAN 1 — AOI PROVINSI SULAWESI SELATAN
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

// Validasi AOI.
print('Jumlah fitur AOI:', aoi.size());
print('AOI terpilih:', aoi);
print('Properti AOI:', aoi.first());

// Menampilkan AOI.
Map.centerObject(aoi, 7);

Map.addLayer(
  aoi.style({
    color: 'FF0000',
    fillColor: '00000000',
    width: 2
  }),
  {},
  'AOI Sulawesi Selatan',
  true
);


// ============================================================
// BAGIAN 2 — KONFIGURASI SENTINEL-2
// ============================================================

// Periode citra.
// START_DATE termasuk.
// END_DATE tidak termasuk.
var START_DATE = '2021-01-01';
var END_DATE = '2022-01-01';

// Filter metadata awan.
var MAX_CLOUD_PERCENT = 20;

// Band utama.
var INPUT_BANDS = [
  'B2', // Blue
  'B3', // Green
  'B4', // Red
  'B8'  // Near Infrared
];


// ============================================================
// BAGIAN 3 — FUNGSI CLOUD MASKING MENGGUNAKAN SCL
// ============================================================

function maskSentinel2SCL(image) {

  var scl = image.select('SCL');

  // Masking kelas yang tidak diinginkan.
  var clearMask = scl.neq(0)   // No data
    .and(scl.neq(1))           // Saturated / defective
    .and(scl.neq(3))           // Cloud shadow
    .and(scl.neq(8))           // Cloud medium probability
    .and(scl.neq(9))           // Cloud high probability
    .and(scl.neq(10))          // Thin cirrus
    .and(scl.neq(11));         // Snow / ice

  return image
    .updateMask(clearMask)
    .select(INPUT_BANDS)

    // Skala reflektansi Sentinel-2.
    .divide(10000)

    // Mempertahankan metadata.
    .copyProperties(
      image,
      [
        'system:time_start',
        'system:index',
        'CLOUDY_PIXEL_PERCENTAGE'
      ]
    );
}


// ============================================================
// BAGIAN 4 — MEMUAT KOLEKSI SENTINEL-2
// ============================================================

var sentinel2Raw = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
  .filterBounds(aoi.geometry())
  .filterDate(START_DATE, END_DATE)
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      MAX_CLOUD_PERCENT
    )
  );


// ============================================================
// BAGIAN 5 — VALIDASI KOLEKSI
// ============================================================

print('Tanggal awal:', START_DATE);
print('Tanggal akhir:', END_DATE);
print('Cloud metadata maksimum:', MAX_CLOUD_PERCENT);
print('Band input:', INPUT_BANDS);

print(
  'Jumlah citra Sentinel-2 sebelum masking:',
  sentinel2Raw.size()
);

print(
  'Contoh citra Sentinel-2 pertama:',
  sentinel2Raw.first()
);


// ============================================================
// BAGIAN 6 — CLOUD MASKING
// ============================================================

var sentinel2Clean = sentinel2Raw.map(
  maskSentinel2SCL
);

print(
  'Jumlah citra Sentinel-2 setelah masking:',
  sentinel2Clean.size()
);


// ============================================================
// BAGIAN 7 — MEDIAN COMPOSITE
// ============================================================

var sentinel2Composite = sentinel2Clean
  .median()
  .clip(aoi.geometry());

print(
  'Band composite:',
  sentinel2Composite.bandNames()
);


// ============================================================
// BAGIAN 8 — VISUALISASI RGB
// ============================================================

var rgbVisualization = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.02,
  max: 0.30,
  gamma: 1.2
};

Map.addLayer(
  sentinel2Composite,
  rgbVisualization,
  'Sentinel-2 RGB Composite 2021',
  true
);


// ============================================================
// BAGIAN 9 — VISUALISASI FALSE COLOR
// ============================================================

var falseColorVisualization = {
  bands: ['B8', 'B4', 'B3'],
  min: 0.02,
  max: 0.40,
  gamma: 1.1
};

Map.addLayer(
  sentinel2Composite,
  falseColorVisualization,
  'Sentinel-2 False Color 2021',
  false
);


// ============================================================
// BAGIAN 10 — MENAMPILKAN KEMBALI BATAS AOI
// ============================================================

Map.addLayer(
  aoi.style({
    color: 'FFFF00',
    fillColor: '00000000',
    width: 2
  }),
  {},
  'Batas Sulawesi Selatan',
  true
);