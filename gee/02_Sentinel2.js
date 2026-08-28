// ============================================================
// FILE       : 02_Sentinel2.js
// PROJECT    : SegFormer Land Cover - Sulawesi Selatan
// PURPOSE    :
// 1. Membuat AOI Provinsi Sulawesi Selatan
// 2. Mengambil Sentinel-2 SR Harmonized tahun 2021
// 3. Menggabungkan Sentinel-2 dengan Cloud Probability
// 4. Melakukan cloud, cirrus, dan cloud-shadow masking
// 5. Membuat median composite
// 6. Menampilkan hasil RGB, false color, dan diagnostik
//
// STATUS     : pass
// ============================================================
// ============================================================
// VALIDATION STATUS
// ============================================================
//
// AOI validation              : PASS
// Sentinel-2 SR loading       : PASS
// Cloud Probability loading   : PASS
// SR and Cloud join           : PASS
// Pixel-level cloud masking   : PASS
// Median composite            : PASS
// Visual validation Makassar  : PASS
// Visual validation Maros     : PASS
// Visual validation Palopo    : PASS
// Export status               : NOT STARTED
//
// Configuration:
// Period                      : 2021-01-01 to 2022-01-01
// Scene cloud threshold       : 40 percent
// Cloud probability threshold : 50
// Input bands                 : B2, B3, B4, B8
//
// ============================================================

// ============================================================
// 1. KONFIGURASI UTAMA
// ============================================================

// Rentang waktu sesuai tahun ESA WorldCover 2021.
// START_DATE termasuk.
// END_DATE tidak termasuk.
var START_DATE = '2021-01-01';
var END_DATE = '2022-01-01';

// Filter awal berdasarkan metadata scene.
// Scene dengan metadata awan >= 40% tidak diambil.
//
// Nilai 40 digunakan agar koleksi masih cukup banyak,
// sedangkan masking awan utama dilakukan pada tingkat piksel.
var MAX_SCENE_CLOUD_PERCENT = 40;

// Probabilitas awan maksimum.
// Nilai cloud probability:
// 0   = sangat mungkin jernih
// 100 = sangat mungkin awan
//
// Piksel dengan probability < 50 akan dipertahankan.
var MAX_CLOUD_PROBABILITY = 50;

// Band citra yang akan digunakan.
var INPUT_BANDS = [
  'B2', // Blue, 10 m
  'B3', // Green, 10 m
  'B4', // Red, 10 m
  'B8'  // Near Infrared, 10 m
];


// ============================================================
// 2. AREA OF INTEREST — SULAWESI SELATAN
// ============================================================

// Memuat batas administrasi tingkat pertama/provinsi.
var adminLevel1 = ee.FeatureCollection(
  'FAO/GAUL/2015/level1'
);

// Memilih seluruh provinsi Indonesia.
var indonesia = adminLevel1.filter(
  ee.Filter.eq('ADM0_NAME', 'Indonesia')
);

// Memilih Sulawesi Selatan.
var aoi = indonesia.filter(
  ee.Filter.eq('ADM1_NAME', 'Sulawesi Selatan')
);

// Mengubah FeatureCollection menjadi geometri.
var aoiGeometry = aoi.geometry();

// Validasi AOI.
print('======================================');
print('VALIDASI AOI');
print('======================================');
print('Jumlah fitur AOI:', aoi.size());
print('Properti AOI:', aoi.first());

// Pusatkan peta pada Sulawesi Selatan.
Map.centerObject(aoi, 8);


// ============================================================
// 3. MEMUAT SENTINEL-2 SURFACE REFLECTANCE
// ============================================================

var sentinel2SR = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
  .filterBounds(aoiGeometry)
  .filterDate(START_DATE, END_DATE)
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      MAX_SCENE_CLOUD_PERCENT
    )
  );


// ============================================================
// 4. MEMUAT SENTINEL-2 CLOUD PROBABILITY
// ============================================================

var sentinel2CloudProbability = ee.ImageCollection(
  'COPERNICUS/S2_CLOUD_PROBABILITY'
)
  .filterBounds(aoiGeometry)
  .filterDate(START_DATE, END_DATE);


// ============================================================
// 5. FUNGSI MASKING TEPI CITRA
// ============================================================

// Beberapa scene Sentinel-2 memiliki piksel tidak valid
// pada tepi granule.
//
// Mask B8A dan B9 digunakan untuk mengurangi artefak tepi.
function maskSceneEdges(image) {
  var edgeMask = image
    .select('B8A')
    .mask()
    .updateMask(
      image.select('B9').mask()
    );

  return image.updateMask(edgeMask);
}

// Terapkan edge masking sebelum join.
var sentinel2SREdgeMasked = sentinel2SR.map(
  maskSceneEdges
);


// ============================================================
// 6. JOIN SENTINEL-2 DENGAN CLOUD PROBABILITY
// ============================================================

// Sentinel-2 SR dan Cloud Probability dipasangkan
// berdasarkan system:index.
var joinedCollection = ee.Join.saveFirst(
  'cloud_probability_image'
).apply({
  primary: sentinel2SREdgeMasked,
  secondary: sentinel2CloudProbability,

  condition: ee.Filter.equals({
    leftField: 'system:index',
    rightField: 'system:index'
  })
});

// Ubah hasil join menjadi ImageCollection.
var sentinel2Joined = ee.ImageCollection(
  joinedCollection
);


// ============================================================
// 7. FUNGSI CLOUD MASKING GABUNGAN
// ============================================================

function maskSentinel2(image) {

  // ----------------------------------------------------------
  // A. Cloud Probability Mask
  // ----------------------------------------------------------

  var cloudProbabilityImage = ee.Image(
    image.get('cloud_probability_image')
  );

  var cloudProbability = cloudProbabilityImage.select(
    'probability'
  );

  var probabilityMask = cloudProbability.lt(
    MAX_CLOUD_PROBABILITY
  );


  // ----------------------------------------------------------
  // B. Scene Classification Layer Mask
  // ----------------------------------------------------------

  var scl = image.select('SCL');

  // SCL 0  = No data
  // SCL 1  = Saturated / defective
  // SCL 2  = Dark area pixels
  // SCL 3  = Cloud shadows
  // SCL 4  = Vegetation
  // SCL 5  = Bare soils
  // SCL 6  = Water
  // SCL 7  = Unclassified
  // SCL 8  = Cloud medium probability
  // SCL 9  = Cloud high probability
  // SCL 10 = Thin cirrus
  // SCL 11 = Snow / ice

  var sclMask = scl.neq(0)
    .and(scl.neq(1))
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));


  // ----------------------------------------------------------
  // C. Menggabungkan kedua mask
  // ----------------------------------------------------------

  var combinedMask = probabilityMask.and(
    sclMask
  );


  // ----------------------------------------------------------
  // D. Memilih band dan menskalakan reflektansi
  // ----------------------------------------------------------

  return image
    .updateMask(combinedMask)
    .select(INPUT_BANDS)
    .divide(10000)
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
// 8. MENERAPKAN CLOUD MASKING
// ============================================================

var sentinel2Clean = sentinel2Joined.map(
  maskSentinel2
);


// ============================================================
// 9. VALIDASI KOLEKSI
// ============================================================

print('======================================');
print('VALIDASI SENTINEL-2');
print('======================================');

print('Tanggal awal:', START_DATE);
print('Tanggal akhir:', END_DATE);

print(
  'Batas cloud metadata:',
  MAX_SCENE_CLOUD_PERCENT
);

print(
  'Batas cloud probability:',
  MAX_CLOUD_PROBABILITY
);

print('Band input:', INPUT_BANDS);

print(
  'Jumlah Sentinel-2 SR:',
  sentinel2SR.size()
);

print(
  'Jumlah Cloud Probability:',
  sentinel2CloudProbability.size()
);

print(
  'Jumlah koleksi setelah join:',
  sentinel2Joined.size()
);

print(
  'Jumlah koleksi setelah masking:',
  sentinel2Clean.size()
);

print(
  'Contoh citra setelah join:',
  sentinel2Joined.first()
);


// ============================================================
// 10. MEMBUAT MEDIAN COMPOSITE
// ============================================================

var sentinel2Composite = sentinel2Clean
  .median()
  .clip(aoiGeometry);

print('======================================');
print('VALIDASI COMPOSITE');
print('======================================');

print(
  'Band composite:',
  sentinel2Composite.bandNames()
);

print(
  'Proyeksi band B2:',
  sentinel2Composite.select('B2').projection()
);


// ============================================================
// 11. PARAMETER VISUALISASI RGB
// ============================================================

// B4 = Red
// B3 = Green
// B2 = Blue
var rgbVisualization = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.00,
  max: 0.22,
  gamma: 1.25
};


// ============================================================
// 12. PARAMETER VISUALISASI FALSE COLOR
// ============================================================

// B8 = Near Infrared
// B4 = Red
// B3 = Green
//
// Vegetasi sehat biasanya terlihat merah.
var falseColorVisualization = {
  bands: ['B8', 'B4', 'B3'],
  min: 0.00,
  max: 0.30,
  gamma: 1.20
};


// ============================================================
// 13. MENAMPILKAN HASIL COMPOSITE
// ============================================================

Map.addLayer(
  sentinel2Composite,
  rgbVisualization,
  '01 - Sentinel-2 RGB Composite 2021',
  true
);

Map.addLayer(
  sentinel2Composite,
  falseColorVisualization,
  '02 - Sentinel-2 False Color 2021',
  false
);


// ============================================================
// 14. LAYER DIAGNOSTIK CLOUD PROBABILITY
// ============================================================

// Median cloud probability hanya digunakan untuk visualisasi,
// bukan sebagai input SegFormer.
var medianCloudProbability = sentinel2CloudProbability
  .median()
  .clip(aoiGeometry);

Map.addLayer(
  medianCloudProbability,
  {
    min: 0,
    max: 100,
    palette: [
      '006400',
      'FFFF00',
      'FFA500',
      'FF0000'
    ]
  },
  '03 - Median Cloud Probability',
  false
);


// ============================================================
// 15. LAYER DIAGNOSTIK PIKSEL VALID
// ============================================================

var validPixelMask = sentinel2Composite
  .select('B4')
  .mask()
  .selfMask();

Map.addLayer(
  validPixelMask,
  {
    palette: ['FFFFFF']
  },
  '04 - Valid Composite Pixels',
  false
);


// ============================================================
// 16. MENAMPILKAN BATAS AOI
// ============================================================

var styledAOI = aoi.style({
  color: 'FFFF00',
  fillColor: '00000000',
  width: 2
});

Map.addLayer(
  styledAOI,
  {},
  '05 - Batas Sulawesi Selatan',
  true
);


// ============================================================
// 17. STATISTIK NILAI COMPOSITE
// ============================================================

// Scale 100 digunakan hanya untuk statistik diagnostik agar
// proses lebih ringan, bukan untuk mengubah resolusi dataset.
var compositeStatistics = sentinel2Composite.reduceRegion({
  reducer: ee.Reducer.percentile([
    2,
    50,
    98
  ]),

  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Statistik percentile composite:',
  compositeStatistics
);


// ============================================================
// 18. STATISTIK CAKUPAN PIKSEL VALID
// ============================================================

// Nilai 1 berarti piksel memiliki data composite valid.
var validPixelStatistics = validPixelMask.reduceRegion({
  reducer: ee.Reducer.count(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Jumlah sampel piksel composite valid:',
  validPixelStatistics
);


// ============================================================
// 19. CATATAN
// ============================================================

// Script ini BELUM melakukan:
// - Export GeoTIFF
// - Pemrosesan ESA WorldCover
// - Patch extraction
// - Training SegFormer
//
// Setelah visualisasi dan Console dinyatakan PASS,
// tahap berikutnya adalah ESA WorldCover.