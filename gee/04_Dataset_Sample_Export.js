// ============================================================
// FILE       : 04_Dataset_Sample_Export.js
// PROJECT    : SegFormer Land Cover - Sulawesi Selatan
// VERSION    : SAMPLE EXPORT 003
//
// PURPOSE:
// 1. Membuat AOI Provinsi Sulawesi Selatan.
// 2. Memuat Sentinel-2 SR Harmonized tahun 2021.
// 3. Memasangkan Sentinel-2 dengan Cloud Probability.
// 4. Melakukan edge masking, cloud masking, dan scaling.
// 5. Menerapkan bilinear pada setiap citra sebelum composite.
// 6. Membuat median composite.
// 7. Memuat dan meremap ESA WorldCover.
// 8. Membuat dataset stack lima band.
// 9. Membuat sample region Makassar–Maros.
// 10. Mengekspor sample GeoTIFF ke Google Drive.
//
// CORRECTION:
// - SAMPLE 001 gagal karena CRS EPSG:6933.
// - SAMPLE 002 berhasil diekspor, tetapi detail RGB tidak benar
//   karena resample diterapkan langsung pada composite.
// - SAMPLE 003 menerapkan bilinear pada setiap image input
//   sebelum median composite.
// - Tidak ada resample pada hasil composite.
//
/// STATUS:
// AOI                         : PASS
// Sentinel-2                  : PASS
// WorldCover                  : PASS
// Dataset stack               : PASS
// Sample region               : PASS
// SAMPLE 002 metadata         : PASS
// SAMPLE 002 visual RGB       : FAIL
// SAMPLE 003 export           : PASS
// QGIS audit SAMPLE 003       : PASS
// Dataset sample configuration: PASS
// Full export                 : NOT STARTED    
//
// IMPORTANT:
// Script ini hanya membuat sample export.
// Belum melakukan full export seluruh Sulawesi Selatan.
// ============================================================


// ============================================================
// 1. KONFIGURASI SENTINEL-2
// ============================================================

// Periode citra sesuai tahun WorldCover 2021.
//
// START_DATE termasuk.
// END_DATE tidak termasuk.
var START_DATE = '2021-01-01';
var END_DATE = '2022-01-01';

// Batas awan pada metadata scene.
var MAX_SCENE_CLOUD_PERCENT = 40;

// Batas Cloud Probability pada tingkat piksel.
var MAX_CLOUD_PROBABILITY = 50;

// Band input model.
var INPUT_BANDS = [
  'B2', // Blue
  'B3', // Green
  'B4', // Red
  'B8'  // Near Infrared
];


// ============================================================
// 2. KONFIGURASI ESA WORLDCOVER
// ============================================================

// Nilai kelas asli WorldCover.
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

// Indeks kelas untuk training SegFormer.
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

// Piksel yang tidak termasuk mapping kelas.
var LABEL_IGNORE_INDEX = 255;

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

// Palet warna WorldCover.
var WORLDCOVER_PALETTE = [
  '006400', // 0 Tree cover
  'FFBB22', // 1 Shrubland
  'FFFF4C', // 2 Grassland
  'F096FF', // 3 Cropland
  'FA0000', // 4 Built-up
  'B4B4B4', // 5 Bare / sparse vegetation
  'F0F0F0', // 6 Snow and ice
  '0064C8', // 7 Permanent water bodies
  '0096A0', // 8 Herbaceous wetland
  '00CF75', // 9 Mangroves
  'FAE6A0'  // 10 Moss and lichen
];


// ============================================================
// 3. KONFIGURASI GRID DAN EXPORT
// ============================================================

// CRS output sample.
var EXPORT_CRS = 'EPSG:3857';

// Transformasi affine grid.
//
// Format:
//
// [
//   pixelWidth,
//   xShear,
//   xOrigin,
//   yShear,
//   pixelHeight,
//   yOrigin
// ]
//
// Resolusi nominal:
// 10 × 10 meter.
var EXPORT_TRANSFORM = [
  10, 0, 0,
  0, -10, 0
];

// Nilai NoData untuk GeoTIFF gabungan.
var EXPORT_NODATA = -9999;

// Folder Google Drive.
var DRIVE_FOLDER = 'SegFormer_LandCover_Sulsel';

// Nama task dan file terbaru.
var SAMPLE_EXPORT_ID = 'SULSEL_DATASET_SAMPLE_003';

// Nama internal sample region.
var SAMPLE_REGION_NAME = 'Makassar_Maros_Sample_003';


// ============================================================
// 4. AREA OF INTEREST — SULAWESI SELATAN
// ============================================================

// Memuat batas administratif tingkat provinsi.
var adminLevel1 = ee.FeatureCollection(
  'FAO/GAUL/2015/level1'
);

// Memilih seluruh provinsi Indonesia.
var indonesia = adminLevel1.filter(
  ee.Filter.eq('ADM0_NAME', 'Indonesia')
);

// Memilih Provinsi Sulawesi Selatan.
var aoi = indonesia.filter(
  ee.Filter.eq('ADM1_NAME', 'Sulawesi Selatan')
);

// Geometri AOI.
var aoiGeometry = aoi.geometry();

// Tampilan garis batas AOI.
var styledAOI = aoi.style({
  color: 'FFFF00',
  fillColor: '00000000',
  width: 2
});

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

Map.centerObject(aoi, 8);


// ============================================================
// 5. MEMUAT SENTINEL-2 SURFACE REFLECTANCE
// ============================================================

var sentinel2SR = ee.ImageCollection(
  'COPERNICUS/S2_SR_HARMONIZED'
)
  .filterBounds(aoiGeometry)
  .filterDate(
    START_DATE,
    END_DATE
  )
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      MAX_SCENE_CLOUD_PERCENT
    )
  );


// ============================================================
// 6. MEMUAT SENTINEL-2 CLOUD PROBABILITY
// ============================================================

var sentinel2CloudProbability = ee.ImageCollection(
  'COPERNICUS/S2_CLOUD_PROBABILITY'
)
  .filterBounds(aoiGeometry)
  .filterDate(
    START_DATE,
    END_DATE
  );


// ============================================================
// 7. MASKING TEPI SCENE
// ============================================================

// Mengurangi piksel tidak valid pada tepi granule
// menggunakan mask B8A dan B9.
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
// 8. JOIN SENTINEL-2 DAN CLOUD PROBABILITY
// ============================================================

// Memasangkan citra menggunakan system:index.
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

// Hapus image yang tidak mendapat pasangan.
var sentinel2Joined = ee.ImageCollection(
  joinedCollection
).filter(
  ee.Filter.notNull([
    'cloud_probability_image'
  ])
);


// ============================================================
// 9. CLOUD MASKING DAN RESAMPLING PER IMAGE
// ============================================================

function maskSentinel2(image) {

  // Mengambil pasangan Cloud Probability.
  var cloudProbabilityImage = ee.Image(
    image.get('cloud_probability_image')
  );

  var cloudProbability = cloudProbabilityImage.select(
    'probability'
  );

  // Pertahankan piksel dengan probability di bawah threshold.
  var probabilityMask = cloudProbability.lt(
    MAX_CLOUD_PROBABILITY
  );

  // Scene Classification Layer.
  var scl = image.select('SCL');

  // Kelas yang dikeluarkan:
  //
  // 0  = No data
  // 1  = Saturated / defective
  // 3  = Cloud shadow
  // 8  = Cloud medium probability
  // 9  = Cloud high probability
  // 10 = Thin cirrus
  // 11 = Snow / ice
  var sclMask = scl.neq(0)
    .and(scl.neq(1))
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  // Gabungkan dua mask.
  var combinedMask = probabilityMask.and(
    sclMask
  );

  // PENTING:
  //
  // Bilinear diterapkan pada setiap image input,
  // bukan pada hasil composite.
  //
  // Setiap citra Sentinel-2 masih memiliki proyeksi
  // sumber yang bermakna pada tahap ini.
  return image
    .updateMask(combinedMask)
    .select(INPUT_BANDS)
    .divide(10000)
    .toFloat()
    .resample('bilinear')
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
// 10. MENERAPKAN CLOUD MASKING
// ============================================================

var sentinel2Clean = sentinel2Joined.map(
  maskSentinel2
);


// ============================================================
// 11. MEMBUAT MEDIAN COMPOSITE
// ============================================================

// Tidak menggunakan .resample() setelah median.
var sentinel2Composite = sentinel2Clean
  .median()
  .select(INPUT_BANDS)
  .clip(aoiGeometry)
  .toFloat();


// ============================================================
// 12. VALIDASI SENTINEL-2
// ============================================================

print('======================================');
print('VALIDASI SENTINEL-2');
print('======================================');

print(
  'Tanggal awal:',
  START_DATE
);

print(
  'Tanggal akhir:',
  END_DATE
);

print(
  'Batas cloud metadata:',
  MAX_SCENE_CLOUD_PERCENT
);

print(
  'Batas cloud probability:',
  MAX_CLOUD_PROBABILITY
);

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
  'Band composite:',
  sentinel2Composite.bandNames()
);

print(
  'Tipe data composite:',
  sentinel2Composite.bandTypes()
);


// ============================================================
// 13. VISUALISASI SENTINEL-2
// ============================================================

var rgbVisualization = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.00,
  max: 0.22,
  gamma: 1.25
};

var falseColorVisualization = {
  bands: ['B8', 'B4', 'B3'],
  min: 0.00,
  max: 0.30,
  gamma: 1.20
};

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
// 14. MEMUAT ESA WORLDCOVER V200
// ============================================================

var worldCoverCollection = ee.ImageCollection(
  'ESA/WorldCover/v200'
);

var worldCoverOriginal = ee.Image(
  worldCoverCollection.first()
)
  .select('Map')
  .clip(aoiGeometry);


// ============================================================
// 15. REMAPPING LABEL WORLDCOVER
// ============================================================

// Nilai asli:
// 10, 20, 30, 40, ...
//
// Indeks training:
// 0, 1, 2, 3, ...
var worldCoverLabel = worldCoverOriginal
  .remap(
    ORIGINAL_CLASSES,
    TRAINING_CLASSES,
    LABEL_IGNORE_INDEX
  )
  .rename('label')
  .toUint8();


// ============================================================
// 16. VALIDASI WORLDCOVER
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
  'Nilai kelas asli:',
  ORIGINAL_CLASSES
);

print(
  'Indeks kelas training:',
  TRAINING_CLASSES
);

print(
  'Nama kelas:',
  CLASS_NAMES
);

print(
  'Ignore index:',
  LABEL_IGNORE_INDEX
);


// ============================================================
// 17. HISTOGRAM WORLDCOVER
// ============================================================

// Scale 100 hanya untuk diagnostik.
var originalHistogram = worldCoverOriginal.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

var trainingHistogram = worldCoverLabel.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: aoiGeometry,
  scale: 100,
  bestEffort: true,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Histogram WorldCover asli:',
  originalHistogram
);

print(
  'Histogram label training:',
  trainingHistogram
);


// ============================================================
// 18. VISUALISASI WORLDCOVER
// ============================================================

// Remap menjadi 0–10 untuk visualisasi kategori.
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
  '03 - ESA WorldCover 2021',
  false
);

// Hilangkan ignore index dari tampilan.
var worldCoverLabelDisplay = worldCoverLabel.updateMask(
  worldCoverLabel.neq(LABEL_IGNORE_INDEX)
);

Map.addLayer(
  worldCoverLabelDisplay,
  {
    min: 0,
    max: 10,
    palette: WORLDCOVER_PALETTE
  },
  '04 - WorldCover Training Labels',
  false
);


// ============================================================
// 19. MENAMPILKAN BATAS AOI
// ============================================================

Map.addLayer(
  styledAOI,
  {},
  '05 - Batas Sulawesi Selatan',
  true
);


// ============================================================
// 20. MENYIAPKAN SENTINEL-2 UNTUK STACK
// ============================================================

// Tidak ada resample pada composite.
//
// Resampling bilinear sudah diterapkan pada setiap image
// sebelum median composite.
var exportSentinel = sentinel2Composite
  .select([
    'B2',
    'B3',
    'B4',
    'B8'
  ])
  .toFloat();


// ============================================================
// 21. MENYIAPKAN LABEL UNTUK STACK
// ============================================================

// Label kategorikal tidak menggunakan bilinear atau bicubic.
//
// Saat diproyeksikan ke grid ekspor, label menggunakan
// nearest-neighbor default.
var exportLabel = worldCoverLabel
  .rename('label')
  .toFloat();


// ============================================================
// 22. MEMBUAT DATASET STACK
// ============================================================

// Urutan band:
//
// Band 1 = B2
// Band 2 = B3
// Band 3 = B4
// Band 4 = B8
// Band 5 = label
var datasetStack = exportSentinel
  .addBands(exportLabel)
  .select([
    'B2',
    'B3',
    'B4',
    'B8',
    'label'
  ]);


// ============================================================
// 23. VALIDASI DATASET STACK
// ============================================================

print('======================================');
print('VALIDASI DATASET STACK');
print('======================================');

print(
  'Band dataset stack:',
  datasetStack.bandNames()
);

print(
  'Jumlah band dataset stack:',
  datasetStack.bandNames().size()
);

print(
  'Tipe data dataset stack:',
  datasetStack.bandTypes()
);

// Minimum dan maksimum label pada seluruh AOI.
var stackLabelMinMax = datasetStack
  .select('label')
  .reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: aoiGeometry,
    scale: 100,
    bestEffort: true,
    maxPixels: 1e9,
    tileScale: 4
  });

print(
  'Minimum dan maksimum label pada stack:',
  stackLabelMinMax
);

print(
  'Kriteria label:',
  'label_min >= 0 dan label_max <= 10'
);


// ============================================================
// 24. VALIDASI KONFIGURASI GRID
// ============================================================

print('======================================');
print('KONFIGURASI GRID EXPORT');
print('======================================');

print(
  'Export CRS:',
  EXPORT_CRS
);

print(
  'Export transform:',
  EXPORT_TRANSFORM
);

print(
  'Resolusi nominal:',
  '10 x 10 meter'
);

print(
  'Export NoData:',
  EXPORT_NODATA
);

print(
  'Folder Google Drive:',
  DRIVE_FOLDER
);

print(
  'Nama sample export:',
  SAMPLE_EXPORT_ID
);


// ============================================================
// 25. LABEL DARI DATASET STACK
// ============================================================

Map.addLayer(
  datasetStack
    .select('label')
    .updateMask(
      datasetStack
        .select('label')
        .neq(LABEL_IGNORE_INDEX)
    ),
  {
    min: 0,
    max: 10,
    palette: WORLDCOVER_PALETTE
  },
  '06 - Label dari Dataset Stack',
  false
);


// ============================================================
// 26. KONFIGURASI SAMPLE REGION
// ============================================================

// Rectangle Makassar–Maros.
//
// Urutan:
// longitude minimum,
// latitude minimum,
// longitude maksimum,
// latitude maksimum.
var SAMPLE_BOUNDS = [
  119.50,
  -5.20,
  119.65,
  -5.05
];

var sampleRectangle = ee.Geometry.Rectangle(
  SAMPLE_BOUNDS,
  null,
  false
);

// Potong rectangle berdasarkan AOI administratif.
var sampleRegion = sampleRectangle.intersection(
  aoiGeometry,
  ee.ErrorMargin(1)
);


// ============================================================
// 27. VALIDASI SAMPLE REGION
// ============================================================

print('======================================');
print('VALIDASI SAMPLE REGION');
print('======================================');

print(
  'Nama sample region:',
  SAMPLE_REGION_NAME
);

print(
  'Koordinat sample:',
  SAMPLE_BOUNDS
);

print(
  'Geometri rectangle awal:',
  sampleRectangle
);

print(
  'Geometri setelah intersection AOI:',
  sampleRegion
);

// Luas sample.
var sampleAreaSquareMeters = sampleRegion.area({
  maxError: 1
});

var sampleAreaSquareKilometers = sampleAreaSquareMeters
  .divide(1000000);

var sampleHasArea = sampleAreaSquareMeters.gt(0);

print(
  'Luas sample dalam meter persegi:',
  sampleAreaSquareMeters
);

print(
  'Luas sample dalam kilometer persegi:',
  sampleAreaSquareKilometers
);

print(
  'Sample memiliki luas valid:',
  sampleHasArea
);


// ============================================================
// 28. VISUALISASI SAMPLE REGION
// ============================================================

var sampleRegionFeature = ee.FeatureCollection([
  ee.Feature(sampleRegion, {
    sample_id: SAMPLE_REGION_NAME
  })
]);

var styledSampleRegion = sampleRegionFeature.style({
  color: '00FFFF',
  fillColor: '00FFFF20',
  width: 3
});

Map.addLayer(
  styledSampleRegion,
  {},
  '07 - Sample Region Makassar-Maros',
  true
);

Map.centerObject(
  sampleRegion,
  11
);


// ============================================================
// 29. HISTOGRAM KELAS DALAM SAMPLE
// ============================================================

var sampleLabelHistogram = worldCoverLabel.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: sampleRegion,
  scale: 10,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Histogram kelas label di sample:',
  sampleLabelHistogram
);


// ============================================================
// 30. JUMLAH KELAS UNIK DALAM SAMPLE
// ============================================================

// Pemeriksaan aman bila key label tidak ditemukan.
var sampleHistogramDictionary = ee.Dictionary(
  ee.Algorithms.If(
    sampleLabelHistogram.contains('label'),
    sampleLabelHistogram.get('label'),
    ee.Dictionary({})
  )
);

var sampleClassKeys = sampleHistogramDictionary.keys();

var sampleUniqueClassCount = sampleClassKeys.size();

print(
  'Daftar kelas yang muncul di sample:',
  sampleClassKeys
);

print(
  'Jumlah kelas unik di sample:',
  sampleUniqueClassCount
);


// ============================================================
// 31. MEMOTONG DATASET STACK KE SAMPLE
// ============================================================

var sampleDatasetStackMasked = datasetStack
  .clip(sampleRegion);

print(
  'Band sample dataset stack:',
  sampleDatasetStackMasked.bandNames()
);

print(
  'Jumlah band sample dataset stack:',
  sampleDatasetStackMasked.bandNames().size()
);


// ============================================================
// 32. STATISTIK SENTINEL-2 DALAM SAMPLE
// ============================================================

var sampleSentinelStatistics = sampleDatasetStackMasked
  .select([
    'B2',
    'B3',
    'B4',
    'B8'
  ])
  .reduceRegion({
    reducer: ee.Reducer.percentile([
      2,
      50,
      98
    ]),
    geometry: sampleRegion,
    scale: 20,
    bestEffort: true,
    maxPixels: 1e9,
    tileScale: 4
  });

print(
  'Statistik Sentinel-2 dalam sample:',
  sampleSentinelStatistics
);


// ============================================================
// 33. MINIMUM DAN MAKSIMUM LABEL SAMPLE
// ============================================================

var sampleLabelMinMax = sampleDatasetStackMasked
  .select('label')
  .reduceRegion({
    reducer: ee.Reducer.minMax(),
    geometry: sampleRegion,
    scale: 10,
    maxPixels: 1e9,
    tileScale: 4
  });

print(
  'Minimum dan maksimum label dalam sample:',
  sampleLabelMinMax
);


// ============================================================
// 34. VISUALISASI RGB KHUSUS SAMPLE
// ============================================================

Map.addLayer(
  sampleDatasetStackMasked.select([
    'B4',
    'B3',
    'B2'
  ]),
  {
    bands: ['B4', 'B3', 'B2'],
    min: 0.00,
    max: 0.22,
    gamma: 1.25
  },
  '08 - RGB Hanya Dalam Sample',
  true
);


// ============================================================
// 35. VISUALISASI LABEL KHUSUS SAMPLE
// ============================================================

var sampleLabelDisplay = sampleDatasetStackMasked
  .select('label')
  .updateMask(
    sampleDatasetStackMasked
      .select('label')
      .neq(LABEL_IGNORE_INDEX)
  );

Map.addLayer(
  sampleLabelDisplay,
  {
    min: 0,
    max: 10,
    palette: WORLDCOVER_PALETTE
  },
  '09 - Label Hanya Dalam Sample',
  false
);


// ============================================================
// 36. MENYIAPKAN SAMPLE UNTUK EXPORT
// ============================================================

// Piksel tanpa data diberi nilai -9999.
var sampleDatasetForExport = sampleDatasetStackMasked
  .unmask({
    value: EXPORT_NODATA,
    sameFootprint: false
  })
  .toFloat();


// ============================================================
// 37. VALIDASI SAMPLE SEBELUM EXPORT
// ============================================================

print('======================================');
print('VALIDASI SAMPLE SEBELUM EXPORT');
print('======================================');

print(
  'Band sample siap export:',
  sampleDatasetForExport.bandNames()
);

print(
  'Jumlah band siap export:',
  sampleDatasetForExport.bandNames().size()
);

print(
  'Tipe band siap export:',
  sampleDatasetForExport.bandTypes()
);

print(
  'Region export:',
  sampleRegion
);

print(
  'CRS export:',
  EXPORT_CRS
);

print(
  'Transform export:',
  EXPORT_TRANSFORM
);

print(
  'NoData export:',
  EXPORT_NODATA
);

print(
  'Folder export:',
  DRIVE_FOLDER
);

print(
  'Nama task export:',
  SAMPLE_EXPORT_ID
);


// ============================================================
// 38. SAMPLE EXPORT KE GOOGLE DRIVE
// ============================================================

// Jangan menambahkan parameter scale.
//
// crsTransform, scale, dan dimensions tidak digunakan
// secara bersamaan.
//
// Task akan muncul di tab Tasks setelah klik Run.
Export.image.toDrive({
  image: sampleDatasetForExport,

  description: SAMPLE_EXPORT_ID,

  folder: DRIVE_FOLDER,

  fileNamePrefix: SAMPLE_EXPORT_ID,

  region: sampleRegion,

  crs: EXPORT_CRS,

  crsTransform: EXPORT_TRANSFORM,

  maxPixels: 1e10,

  fileFormat: 'GeoTIFF',

  formatOptions: {
    cloudOptimized: true,
    noData: EXPORT_NODATA
  }
});


// ============================================================
// 39. KRITERIA VALIDASI SAMPLE 003
// ============================================================
//
// CONSOLE PASS JIKA:
//
// - Jumlah fitur AOI = 1.
// - Sentinel-2 SR lebih dari 0.
// - Join lebih dari 0.
// - Band composite = B2, B3, B4, B8.
// - WorldCover band = Map.
// - Label band = label.
// - Dataset stack memiliki lima band.
// - Jumlah kelas unik sample minimal 3.
// - Statistik Sentinel-2 tidak null.
// - label_min >= 0.
// - label_max <= 10.
// - CRS export = EPSG:3857.
// - Transform = [10, 0, 0, 0, -10, 0].
//
// GEE VISUAL PASS JIKA:
//
// - Layer 08 menampilkan detail kota, vegetasi,
//   sungai, tambak, dan pola lahan.
// - Layer 08 bukan gradasi halus.
// - Layer 09 menampilkan kelas kategori.
//
// EXPORT PASS JIKA:
//
// - Task SULSEL_DATASET_SAMPLE_003 muncul.
// - Task selesai dengan status COMPLETED.
// - File tersedia di Google Drive.
//
// QGIS PASS JIKA:
//
// - File dapat dibuka.
// - CRS = EPSG:3857.
// - Pixel size = 10,-10.
// - Band count = 5.
// - Band 1 = B2.
// - Band 2 = B3.
// - Band 3 = B4.
// - Band 4 = B8.
// - Band 5 = label.
// - RGB menampilkan detail spasial.
// - Band label hanya berisi nilai diskret.
// - Label dan RGB sejajar.
//
// ============================================================
// ============================================================
// 40. FINAL COMPLETION STATUS
// ============================================================
//
// SAMPLE EXPORT FINAL FILE:
// SULSEL_DATASET_SAMPLE_003.tif
//
// FINAL VALIDATION:
//
// - CRS EPSG:3857                       : PASS
// - Pixel size 10 x 10 meters           : PASS
// - Dimensions 1671 x 1677              : PASS
// - Band count 5                        : PASS
// - Band order B2, B3, B4, B8, label    : PASS
// - Float32 output                      : PASS
// - NoData -9999                        : PASS
// - RGB spatial detail                  : PASS
// - Label values integer                : PASS
// - Unique values 0,1,2,3,4,5,7,8       : PASS
// - Fractional labels absent            : PASS
// - Image-label alignment               : PASS
// - QGIS evidence complete              : PASS
//
// TAHAP 13 — AUDIT SAMPLE DI QGIS
// STATUS: PASS
//
// DATASET SAMPLE CONFIGURATION
// STATUS: PASS
//
// NEXT:
// - Synchronize completion reports in Antigravity.
// - Generate tiled export grid.
// - Perform full export for South Sulawesi.
//
// ============================================================