// ============================================================================
// 1. SCRIPT IDENTITY, PURPOSE, AND SAFETY
// ============================================================================
//
// Project : SegFormer Land-Cover South Sulawesi
// Script  : gee/07_Full_Export.js
// Purpose : Prepare deterministic full-tile production exports for M6.
// Input   : FAO GAUL South Sulawesi AOI, Sentinel-2 SR Harmonized 2021,
//           Sentinel-2 Cloud Probability, ESA WorldCover v200.
// Output  : One combined five-band GeoTIFF per selected approved tile when,
//           and only when, both independent safety switches are enabled.
//
// IMPORTANT:
//
// - This script is safe by default.
// - Opening or running this script with the default configuration does NOT
//   create Earth Engine export tasks.
// - Do not enable exports until the user authorizes a production batch.
// - Do not queue all 55 tiles at once.
// - The export contract matches the accepted V2 pilot raster contract.
//
// ============================================================================


// ============================================================================
// 2. SAFETY SWITCH AND BATCH SELECTION
// ============================================================================

// Keep FALSE for all preflight and code review work.
// Change to TRUE only after explicit user authorization for one batch.
var ENABLE_PRODUCTION_EXPORT_TASKS = false;

// Keep FALSE during preflight. Change to TRUE only after the user has inspected
// the Earth Engine Console preflight evidence and explicitly confirms it.
var PREFLIGHT_CONFIRMED_BY_HUMAN = false;

// Conservative production batch size: 5 tiles.
var ACTIVE_BATCH_ID = 'batch_05';

// Optional targeted rerun mechanism.
// Leave empty for normal batch execution.
// Example after a failed tile:
//
// var RERUN_TILE_IDS = ['SULSEL_R009_C004'];
var RERUN_TILE_IDS = [];


// ============================================================================
// 3. PROJECT CONFIGURATION
// ============================================================================

var COUNTRY_NAME = 'Indonesia';
var PROVINCE_NAME = 'Sulawesi Selatan';

var AOI_SOURCE = 'FAO/GAUL/2015/level1';

var START_DATE = '2021-01-01';
var END_DATE = '2022-01-01';

var SCENE_CLOUD_THRESHOLD = 40;
var CLOUD_PROBABILITY_THRESHOLD = 50;

var SENTINEL2_SOURCE = 'COPERNICUS/S2_SR_HARMONIZED';
var CLOUD_PROBABILITY_SOURCE =
  'COPERNICUS/S2_CLOUD_PROBABILITY';

var WORLDCOVER_SOURCE = 'ESA/WorldCover/v200';

var EXPORT_CRS = 'EPSG:3857';
var EXPORT_RESOLUTION_M = 10;
var TILE_SIZE_METERS = 50000;
var EXPORT_DIMENSIONS = '5000x5000';
var EXPECTED_WIDTH = 5000;
var EXPECTED_HEIGHT = 5000;
var EXPECTED_BAND_COUNT = 5;
var NODATA_VALUE = -9999;
var EXPECTED_RETAINED_TILE_COUNT = 55;

var OUTPUT_PREFIX_PREFIX = 'SULSEL_2021_';
var OUTPUT_PREFIX_SUFFIX = '_S2WC_V1';
var DRIVE_FOLDER_ROOT = 'SegFormer_LandCover_Sulsel_Export';
var DRIVE_FOLDER_RERUN = DRIVE_FOLDER_ROOT + '_rerun';


// ============================================================================
// 4. APPROVED PRODUCTION TILE SET
// ============================================================================
//
// The list below is the expected/pending 55-tile production set recorded in:
//
// data/raw/export_manifest.csv
//
// It is filtered back against the generated retained grid before any export
// task can be created. The console preflight prints missing and unexpected IDs.

var APPROVED_TILE_IDS = [
  'SULSEL_R000_C006',
  'SULSEL_R000_C007',
  'SULSEL_R000_C009',
  'SULSEL_R001_C006',
  'SULSEL_R001_C007',
  'SULSEL_R001_C010',
  'SULSEL_R002_C006',
  'SULSEL_R002_C007',
  'SULSEL_R003_C006',
  'SULSEL_R004_C000',
  'SULSEL_R004_C001',
  'SULSEL_R004_C002',
  'SULSEL_R004_C003',
  'SULSEL_R004_C004',
  'SULSEL_R004_C005',
  'SULSEL_R004_C006',
  'SULSEL_R005_C000',
  'SULSEL_R005_C001',
  'SULSEL_R005_C003',
  'SULSEL_R005_C004',
  'SULSEL_R005_C005',
  'SULSEL_R005_C006',
  'SULSEL_R006_C002',
  'SULSEL_R006_C003',
  'SULSEL_R006_C004',
  'SULSEL_R006_C005',
  'SULSEL_R006_C006',
  'SULSEL_R007_C004',
  'SULSEL_R007_C005',
  'SULSEL_R007_C006',
  'SULSEL_R008_C003',
  'SULSEL_R008_C004',
  'SULSEL_R008_C005',
  'SULSEL_R008_C006',
  'SULSEL_R009_C003',
  'SULSEL_R009_C004',
  'SULSEL_R009_C005',
  'SULSEL_R009_C006',
  'SULSEL_R009_C007',
  'SULSEL_R009_C008',
  'SULSEL_R010_C004',
  'SULSEL_R010_C005',
  'SULSEL_R010_C006',
  'SULSEL_R010_C007',
  'SULSEL_R010_C008',
  'SULSEL_R010_C009',
  'SULSEL_R011_C004',
  'SULSEL_R011_C005',
  'SULSEL_R011_C006',
  'SULSEL_R011_C007',
  'SULSEL_R011_C008',
  'SULSEL_R011_C009',
  'SULSEL_R012_C004',
  'SULSEL_R012_C005',
  'SULSEL_R012_C006'
];

var BATCHES = {
  batch_01: [
    'SULSEL_R000_C006',
    'SULSEL_R000_C007',
    'SULSEL_R000_C009',
    'SULSEL_R001_C006',
    'SULSEL_R001_C007'
  ],
  batch_02: [
    'SULSEL_R001_C010',
    'SULSEL_R002_C006',
    'SULSEL_R002_C007',
    'SULSEL_R003_C006',
    'SULSEL_R004_C000'
  ],
  batch_03: [
    'SULSEL_R004_C001',
    'SULSEL_R004_C002',
    'SULSEL_R004_C003',
    'SULSEL_R004_C004',
    'SULSEL_R004_C005'
  ],
  batch_04: [
    'SULSEL_R004_C006',
    'SULSEL_R005_C000',
    'SULSEL_R005_C001',
    'SULSEL_R005_C003',
    'SULSEL_R005_C004'
  ],
  batch_05: [
    'SULSEL_R005_C005',
    'SULSEL_R005_C006',
    'SULSEL_R006_C002',
    'SULSEL_R006_C003',
    'SULSEL_R006_C004'
  ],
  batch_06: [
    'SULSEL_R006_C005',
    'SULSEL_R006_C006',
    'SULSEL_R007_C004',
    'SULSEL_R007_C005',
    'SULSEL_R007_C006'
  ],
  batch_07: [
    'SULSEL_R008_C003',
    'SULSEL_R008_C004',
    'SULSEL_R008_C005',
    'SULSEL_R008_C006',
    'SULSEL_R009_C003'
  ],
  batch_08: [
    'SULSEL_R009_C004',
    'SULSEL_R009_C005',
    'SULSEL_R009_C006',
    'SULSEL_R009_C007',
    'SULSEL_R009_C008'
  ],
  batch_09: [
    'SULSEL_R010_C004',
    'SULSEL_R010_C005',
    'SULSEL_R010_C006',
    'SULSEL_R010_C007',
    'SULSEL_R010_C008'
  ],
  batch_10: [
    'SULSEL_R010_C009',
    'SULSEL_R011_C004',
    'SULSEL_R011_C005',
    'SULSEL_R011_C006',
    'SULSEL_R011_C007'
  ],
  batch_11: [
    'SULSEL_R011_C008',
    'SULSEL_R011_C009',
    'SULSEL_R012_C004',
    'SULSEL_R012_C005',
    'SULSEL_R012_C006'
  ]
};

function makeCountMap(values, label) {
  var counts = {};

  values.forEach(function(value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(label + ' contains a non-string or empty tile ID.');
    }

    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
}

function findDuplicateIds(counts) {
  var duplicates = [];

  Object.keys(counts).forEach(function(tileId) {
    if (counts[tileId] > 1) {
      duplicates.push(tileId);
    }
  });

  return duplicates;
}

function validateClientSideExportConfiguration() {
  if (APPROVED_TILE_IDS.length !== EXPECTED_RETAINED_TILE_COUNT) {
    throw new Error(
      'APPROVED_TILE_IDS length must be '
      + EXPECTED_RETAINED_TILE_COUNT
      + '; found '
      + APPROVED_TILE_IDS.length
      + '.'
    );
  }

  var approvedCounts = makeCountMap(
    APPROVED_TILE_IDS,
    'APPROVED_TILE_IDS'
  );

  var duplicateApprovedIds = findDuplicateIds(approvedCounts);
  if (duplicateApprovedIds.length > 0) {
    throw new Error(
      'APPROVED_TILE_IDS contains duplicate tile IDs: '
      + duplicateApprovedIds.join(', ')
    );
  }

  if (!Object.prototype.hasOwnProperty.call(BATCHES, ACTIVE_BATCH_ID)) {
    throw new Error(
      'ACTIVE_BATCH_ID is not defined in BATCHES: '
      + ACTIVE_BATCH_ID
    );
  }

  var batchUnionCounts = {};
  var unknownBatchTiles = [];

  Object.keys(BATCHES).forEach(function(batchId) {
    var batchTileIds = BATCHES[batchId];

    if (!Array.isArray(batchTileIds)) {
      throw new Error('Batch ' + batchId + ' must be an array.');
    }

    batchTileIds.forEach(function(tileId) {
      if (!approvedCounts[tileId]) {
        unknownBatchTiles.push(batchId + ':' + tileId);
      }

      batchUnionCounts[tileId] = (batchUnionCounts[tileId] || 0) + 1;
    });
  });

  if (unknownBatchTiles.length > 0) {
    throw new Error(
      'BATCHES contains tile IDs that are not approved: '
      + unknownBatchTiles.join(', ')
    );
  }

  var missingBatchTiles = [];
  var duplicateBatchTiles = [];

  APPROVED_TILE_IDS.forEach(function(tileId) {
    var batchCount = batchUnionCounts[tileId] || 0;

    if (batchCount === 0) {
      missingBatchTiles.push(tileId);
    }

    if (batchCount > 1) {
      duplicateBatchTiles.push(tileId);
    }
  });

  if (missingBatchTiles.length > 0) {
    throw new Error(
      'Approved tile IDs missing from normal batches: '
      + missingBatchTiles.join(', ')
    );
  }

  if (duplicateBatchTiles.length > 0) {
    throw new Error(
      'Approved tile IDs assigned to more than one normal batch: '
      + duplicateBatchTiles.join(', ')
    );
  }

  var batchUnionTileIds = Object.keys(batchUnionCounts);
  if (batchUnionTileIds.length !== EXPECTED_RETAINED_TILE_COUNT) {
    throw new Error(
      'Normal batch union must contain '
      + EXPECTED_RETAINED_TILE_COUNT
      + ' unique tiles; found '
      + batchUnionTileIds.length
      + '.'
    );
  }

  var activeBatchTileIds = BATCHES[ACTIVE_BATCH_ID];
  if (activeBatchTileIds.length !== 5) {
    throw new Error(
      'ACTIVE_BATCH_ID '
      + ACTIVE_BATCH_ID
      + ' must contain exactly 5 normal batch tiles; found '
      + activeBatchTileIds.length
      + '.'
    );
  }

  var rerunCounts = makeCountMap(RERUN_TILE_IDS, 'RERUN_TILE_IDS');
  var duplicateRerunIds = findDuplicateIds(rerunCounts);
  if (duplicateRerunIds.length > 0) {
    throw new Error(
      'RERUN_TILE_IDS contains duplicate tile IDs: '
      + duplicateRerunIds.join(', ')
    );
  }

  var unknownRerunIds = [];
  RERUN_TILE_IDS.forEach(function(tileId) {
    if (!approvedCounts[tileId]) {
      unknownRerunIds.push(tileId);
    }
  });

  if (unknownRerunIds.length > 0) {
    throw new Error(
      'RERUN_TILE_IDS contains unapproved tile IDs: '
      + unknownRerunIds.join(', ')
    );
  }

  return {
    approved_count: APPROVED_TILE_IDS.length,
    duplicate_approved_ids: duplicateApprovedIds.length,
    batch_union_count: batchUnionTileIds.length,
    duplicate_batch_ids: duplicateBatchTiles.length,
    unknown_batch_tiles: unknownBatchTiles.length,
    active_batch_valid: true,
    normal_selected_batch_count: activeBatchTileIds.length,
    rerun_mode: RERUN_TILE_IDS.length > 0,
    rerun_tile_count: RERUN_TILE_IDS.length
  };
}

var CLIENT_SIDE_VALIDATION = validateClientSideExportConfiguration();
var ACTIVE_BATCH_TILE_IDS = BATCHES[ACTIVE_BATCH_ID];
var IS_RERUN_MODE = RERUN_TILE_IDS.length > 0;
var SELECTED_TILE_IDS = IS_RERUN_MODE
  ? RERUN_TILE_IDS
  : ACTIVE_BATCH_TILE_IDS;
var SELECTED_DRIVE_FOLDER = IS_RERUN_MODE
  ? DRIVE_FOLDER_RERUN
  : DRIVE_FOLDER_ROOT + '_' + ACTIVE_BATCH_ID;


// ============================================================================
// 5. LOAD AND VALIDATE AOI
// ============================================================================

var gaulLevel1 = ee.FeatureCollection(AOI_SOURCE);

var southSulawesiCollection = gaulLevel1
  .filter(ee.Filter.eq('ADM0_NAME', COUNTRY_NAME))
  .filter(ee.Filter.eq('ADM1_NAME', PROVINCE_NAME));

var aoiFeatureCount = southSulawesiCollection.size();
var southSulawesiAoi = southSulawesiCollection.geometry();

print('=== 5. AOI VALIDATION ===');
print('Expected AOI Feature Count', 1);
print('Actual AOI Feature Count', aoiFeatureCount);
print('Province', PROVINCE_NAME);
print('Country', COUNTRY_NAME);


// ============================================================================
// 6. LOAD SENTINEL-2 COLLECTIONS
// ============================================================================

var sentinel2Source = ee.ImageCollection(SENTINEL2_SOURCE)
  .filterBounds(southSulawesiAoi)
  .filterDate(START_DATE, END_DATE)
  .filter(
    ee.Filter.lt(
      'CLOUDY_PIXEL_PERCENTAGE',
      SCENE_CLOUD_THRESHOLD
    )
  );

var cloudProbabilitySource =
  ee.ImageCollection(CLOUD_PROBABILITY_SOURCE)
    .filterBounds(southSulawesiAoi)
    .filterDate(START_DATE, END_DATE);

print('=== 6. SENTINEL-2 SOURCE ===');
print('Sentinel-2 Source Image Count', sentinel2Source.size());
print('Cloud Probability Image Count', cloudProbabilitySource.size());


// ============================================================================
// 7. JOIN SENTINEL-2 AND CLOUD PROBABILITY
// ============================================================================

var joinedCollection = ee.ImageCollection(
  ee.Join.saveFirst('cloud_probability_image').apply({
    primary: sentinel2Source,
    secondary: cloudProbabilitySource,
    condition: ee.Filter.equals({
      leftField: 'system:index',
      rightField: 'system:index'
    })
  })
);

print('Joined Collection Count', joinedCollection.size());


// ============================================================================
// 8. CLOUD, SHADOW, INVALID-PIXEL, AND EDGE MASKING
// ============================================================================

function maskSentinel2(image) {
  image = ee.Image(image);

  var cloudProbabilityImage = ee.Image(
    image.get('cloud_probability_image')
  );

  var cloudProbability = cloudProbabilityImage.select(
    'probability'
  );

  var cloudMask = cloudProbability.lt(
    CLOUD_PROBABILITY_THRESHOLD
  );

  var scl = image.select('SCL');

  var validSclMask = scl.neq(0)
    .and(scl.neq(1))
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  var edgeMask = image.select('B8A')
    .mask()
    .updateMask(
      image.select('B9').mask()
    );

  var selectedReflectance = image
    .select(['B2', 'B3', 'B4', 'B8'])
    .updateMask(cloudMask)
    .updateMask(validSclMask)
    .updateMask(edgeMask)
    .divide(10000)
    .toFloat();

  // Match the accepted pilot workflow: bilinear treatment is applied only
  // to Sentinel-2 reflectance bands before median compositing.
  selectedReflectance = selectedReflectance.resample(
    'bilinear'
  );

  return selectedReflectance.copyProperties(
    image,
    image.propertyNames()
  );
}

var maskedSentinel2 = joinedCollection.map(
  maskSentinel2
);

print('Masked Collection Count', maskedSentinel2.size());


// ============================================================================
// 9. CREATE SENTINEL-2 MEDIAN COMPOSITE
// ============================================================================

var sentinel2Composite = maskedSentinel2
  .median()
  .select(['B2', 'B3', 'B4', 'B8'])
  .clip(southSulawesiAoi)
  .toFloat();

print('Sentinel-2 Composite Bands', sentinel2Composite.bandNames());


// ============================================================================
// 10. LOAD AND REMAP ESA WORLDCOVER
// ============================================================================

var originalWorldCoverClasses = [
  10,
  20,
  30,
  40,
  50,
  60,
  70,
  80,
  90,
  95,
  100
];

var trainingClasses = [
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

var worldCoverSource = ee.ImageCollection(
  WORLDCOVER_SOURCE
).first();

var worldCoverLabel = worldCoverSource
  .select('Map')
  .remap(
    originalWorldCoverClasses,
    trainingClasses,
    255
  )
  .rename('label')
  .clip(southSulawesiAoi);

// Earth Engine's default nearest-neighbour behavior is preserved for the
// categorical label. Do not call bilinear or bicubic resampling here.
worldCoverLabel = worldCoverLabel.toUint8();

print('WorldCover Label Band', worldCoverLabel.bandNames());


// ============================================================================
// 11. CREATE FINAL FIVE-BAND STACK
// ============================================================================

var finalStack = sentinel2Composite
  .addBands(
    worldCoverLabel.toFloat()
  )
  .select([
    'B2',
    'B3',
    'B4',
    'B8',
    'label'
  ])
  .toFloat()
  .unmask({
    value: NODATA_VALUE,
    sameFootprint: false
  });

print('=== 11. FINAL DATASET STACK ===');
print('Stack Band Order', finalStack.bandNames());
print('Expected Band Count', EXPECTED_BAND_COUNT);
print('Stack Type', 'Float32 expected after toFloat()');
print('NoData Value', NODATA_VALUE);


// ============================================================================
// 12. RECONSTRUCT THE VALIDATED 50-KM GRID
// ============================================================================

var projection3857 = ee.Projection(EXPORT_CRS);

var projectedAoi = southSulawesiAoi.transform(
  projection3857,
  1
);

var projectedAoiBounds = projectedAoi.bounds(
  1,
  projection3857
);

var projectedBoundsCoordinates = ee.List(
  projectedAoiBounds.coordinates().get(0)
);

var lowerLeftCoordinate = ee.List(
  projectedBoundsCoordinates.get(0)
);

var upperRightCoordinate = ee.List(
  projectedBoundsCoordinates.get(2)
);

var minimumX = ee.Number(
  lowerLeftCoordinate.get(0)
);

var minimumY = ee.Number(
  lowerLeftCoordinate.get(1)
);

var maximumX = ee.Number(
  upperRightCoordinate.get(0)
);

var maximumY = ee.Number(
  upperRightCoordinate.get(1)
);

var numberOfColumns = maximumX
  .subtract(minimumX)
  .divide(TILE_SIZE_METERS)
  .ceil()
  .toInt();

var numberOfRows = maximumY
  .subtract(minimumY)
  .divide(TILE_SIZE_METERS)
  .ceil()
  .toInt();

var rowSequence = ee.List.sequence(
  0,
  numberOfRows.subtract(1)
);

var columnSequence = ee.List.sequence(
  0,
  numberOfColumns.subtract(1)
);

var candidateGridNested = rowSequence.map(function(rowValue) {
  rowValue = ee.Number(rowValue).toInt();

  return columnSequence.map(function(columnValue) {
    columnValue = ee.Number(columnValue).toInt();

    var tileMinimumX = minimumX.add(
      columnValue.multiply(TILE_SIZE_METERS)
    );

    var tileMinimumY = minimumY.add(
      rowValue.multiply(TILE_SIZE_METERS)
    );

    var tileMaximumX = tileMinimumX.add(
      TILE_SIZE_METERS
    );

    var tileMaximumY = tileMinimumY.add(
      TILE_SIZE_METERS
    );

    var rectangularTile = ee.Geometry.Rectangle(
      [
        tileMinimumX,
        tileMinimumY,
        tileMaximumX,
        tileMaximumY
      ],
      projection3857,
      false
    );

    var tileIntersection = rectangularTile.intersection(
      projectedAoi,
      1
    );

    var intersectionAreaM2 = tileIntersection.area(
      1,
      projection3857
    );

    var tileAreaM2 = ee.Number(
      TILE_SIZE_METERS
    ).multiply(
      TILE_SIZE_METERS
    );

    var coverageRatio = intersectionAreaM2
      .divide(tileAreaM2)
      .max(0)
      .min(1);

    var tileId = ee.String('SULSEL_R')
      .cat(rowValue.format('%03d'))
      .cat('_C')
      .cat(columnValue.format('%03d'));

    return ee.Feature(
      rectangularTile,
      {
        tile_id: tileId,
        row: rowValue,
        col: columnValue,
        tile_size_m: TILE_SIZE_METERS,
        crs: EXPORT_CRS,
        intersects_aoi: intersectionAreaM2.gt(0),
        intersection_area_m2: intersectionAreaM2,
        tile_area_m2: tileAreaM2,
        aoi_coverage_ratio: coverageRatio
      }
    );
  });
});

var candidateGridFlatList = ee.List(
  candidateGridNested
).flatten();

var candidateGrid = ee.FeatureCollection(
  candidateGridFlatList
);

var retainedGrid = candidateGrid.filter(
  ee.Filter.gt('intersection_area_m2', 0)
);

var approvedTileIdList = ee.List(APPROVED_TILE_IDS);

var approvedTiles = retainedGrid
  .filter(ee.Filter.inList('tile_id', APPROVED_TILE_IDS))
  .sort('tile_id');

var retainedTileIds = ee.List(
  retainedGrid.aggregate_array('tile_id')
).sort();

var approvedTileIdsFromGrid = ee.List(
  approvedTiles.aggregate_array('tile_id')
).sort();

var missingApprovedTileIds = approvedTileIdList
  .removeAll(retainedTileIds);

var unexpectedRetainedTileIds = retainedTileIds
  .removeAll(approvedTileIdList);


// ============================================================================
// 13. PRODUCTION PREFLIGHT
// ============================================================================

print('=== 13. PRODUCTION PREFLIGHT ===');
print(
  'PRE-FLIGHT RUN',
  'Both switches must remain FALSE. Inspect Console evidence before enabling either switch.'
);
print('ENABLE_PRODUCTION_EXPORT_TASKS', ENABLE_PRODUCTION_EXPORT_TASKS);
print('PREFLIGHT_CONFIRMED_BY_HUMAN', PREFLIGHT_CONFIRMED_BY_HUMAN);
print('Task Creation Requires Both Switches', true);
print('Client-side Batch Validation', CLIENT_SIDE_VALIDATION);
print('Active Batch ID', ACTIVE_BATCH_ID);
print('Rerun Mode', IS_RERUN_MODE);
print('Rerun Tile IDs', RERUN_TILE_IDS);
print('Selected Tile IDs', SELECTED_TILE_IDS);
print('Batch Size', SELECTED_TILE_IDS.length);
print('Selected Drive Folder', SELECTED_DRIVE_FOLDER);
print('Expected Retained Tile Count', EXPECTED_RETAINED_TILE_COUNT);
print('Generated Retained Tile Count', retainedGrid.size());
print('Approved Manifest Tile Count', APPROVED_TILE_IDS.length);
print('Approved Tiles Matched in Generated Grid', approvedTiles.size());
print('Missing Approved Tile IDs', missingApprovedTileIds);
print('Unexpected Retained Tile IDs', unexpectedRetainedTileIds);
print('Approved Tile IDs From Generated Grid', approvedTileIdsFromGrid);
print('Export CRS', EXPORT_CRS);
print('Export Dimensions', EXPORT_DIMENSIONS);
print('Expected Width', EXPECTED_WIDTH);
print('Expected Height', EXPECTED_HEIGHT);
print('NoData Value', NODATA_VALUE);
print(
  'Dimensions Rule',
  'dimensions is used; scale and crsTransform are intentionally absent'
);


// ============================================================================
// 14. MAP VISUALIZATION
// ============================================================================

Map.centerObject(
  southSulawesiCollection,
  7
);

var aoiBoundary = ee.Image()
  .byte()
  .paint({
    featureCollection: southSulawesiCollection,
    color: 1,
    width: 2
  });

Map.addLayer(
  aoiBoundary,
  {
    palette: ['FF0000']
  },
  'South Sulawesi AOI',
  true
);

Map.addLayer(
  sentinel2Composite,
  {
    bands: ['B4', 'B3', 'B2'],
    min: 0.02,
    max: 0.30
  },
  'Sentinel-2 RGB',
  false
);

Map.addLayer(
  worldCoverLabel,
  {
    min: 0,
    max: 10,
    palette: [
      '006400',
      'FFBB22',
      'FFFF4C',
      'F096FF',
      'FA0000',
      'B4B4B4',
      'F0F0F0',
      '0064C8',
      '0096A0',
      '00CF75',
      'FAE6A0'
    ]
  },
  'WorldCover Labels',
  false
);

Map.addLayer(
  retainedGrid.style({
    color: '0066FF',
    fillColor: '00000000',
    width: 1
  }),
  {},
  'Retained 55-Tile Grid',
  true
);

Map.addLayer(
  approvedTiles.style({
    color: 'FFFF00',
    fillColor: 'FFFF0033',
    width: 2
  }),
  {},
  'Approved Manifest Tiles',
  false
);

var selectedTiles = approvedTiles.filter(
  ee.Filter.inList('tile_id', SELECTED_TILE_IDS)
);

Map.addLayer(
  selectedTiles.style({
    color: '00FFFF',
    fillColor: '00FFFF33',
    width: 3
  }),
  {},
  'Selected Batch Or Rerun Tiles',
  true
);


// ============================================================================
// 15. EXPORT TASK CREATION
// ============================================================================

function exportOneTile(tileId) {
  var tileFeature = ee.Feature(
    approvedTiles
      .filter(ee.Filter.eq('tile_id', tileId))
      .first()
  );

  var outputPrefix = OUTPUT_PREFIX_PREFIX
    + tileId
    + OUTPUT_PREFIX_SUFFIX;

  var description = 'FULL_EXPORT_'
    + tileId;

  Export.image.toDrive({
    image: finalStack,
    description: description,
    folder: SELECTED_DRIVE_FOLDER,
    fileNamePrefix: outputPrefix,
    region: tileFeature.geometry(),
    dimensions: EXPORT_DIMENSIONS,
    crs: EXPORT_CRS,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    // Same GeoTIFF formatOptions pattern as the accepted V2 pilot export.
    // Local pilot audits observed LZW compression where supported by this
    // cloudOptimized workflow.
    formatOptions: {
      cloudOptimized: true,
      noData: NODATA_VALUE
    }
  });
}

if (
  ENABLE_PRODUCTION_EXPORT_TASKS &&
  PREFLIGHT_CONFIRMED_BY_HUMAN
) {

  SELECTED_TILE_IDS.forEach(function(tileId) {
    exportOneTile(tileId);
  });

  print(
    'PRODUCTION EXPORT TASK CREATION',
    'ENABLED - both switches are TRUE; only selected batch or rerun tile IDs should appear in Tasks'
  );

} else {

  print(
    'PRODUCTION EXPORT TASK CREATION DISABLED',
    'No tasks were created. Both ENABLE_PRODUCTION_EXPORT_TASKS and PREFLIGHT_CONFIRMED_BY_HUMAN must be true.'
  );

  print(
    'AUTHORIZATION REQUIRED',
    'Keep both switches FALSE for preflight; enable only after user-reviewed Console evidence.'
  );
}


// ============================================================================
// 16. PRODUCTION AUDIT POLICY
// ============================================================================
//
// After download, each production raster must be audited locally with:
//
// python src/data/audit_raster.py path/to/tile.tif \
//   --expected-width 5000 \
//   --expected-height 5000 \
//   --fail-on-all-nodata
//
// A low-coverage tile that still contains valid label pixels is allowed.
// An all-NoData production tile must be quarantined/reviewed and must not
// proceed to patch creation.
//
// ============================================================================


// ============================================================================
// 17. FINAL SCRIPT STATUS
// ============================================================================
//
// FULL EXPORT SCRIPT CREATION        : COMPLETE
// EXPORT TASK SWITCH                 : DISABLED BY DEFAULT
// HUMAN PREFLIGHT CONFIRMATION       : DISABLED BY DEFAULT
// DEFAULT ACTIVE BATCH               : batch_01
// DEFAULT SELECTED TILE COUNT        : 5
// APPROVED PRODUCTION TILE COUNT     : 55
// EXPORT DIMENSIONS                  : 5000x5000
// EXPORT CRS                         : EPSG:3857
// STACK BAND ORDER                   : B2, B3, B4, B8, label
// STACK DTYPE                        : Float32
// NODATA                             : -9999
// EXPORT TASKS RUN BY THIS EDIT      : NO
// FULL EXPORT COMPLETION STATUS      : NOT STARTED
//
// ============================================================================
