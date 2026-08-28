// ============================================================================
// 1. SCRIPT IDENTITY AND SAFETY
// ============================================================================
//
// Project : SegFormer Land-Cover South Sulawesi
// Script  : gee/06_Pilot_Export.js
// Purpose : Three-tile pilot export only
//
// IMPORTANT:
//
// - This is NOT the full South Sulawesi export.
// - Exactly three pilot tiles are prepared.
// - Export tasks are disabled by default.
// - Tile output is forced to exactly 5000 x 5000 pixels.
// - No scale or crsTransform is used together with dimensions.
//
// ============================================================================


// ============================================================================
// 2. SAFETY SWITCH
// ============================================================================

// Keep FALSE during precheck.
//
// Change to TRUE only when ready to create the three pilot tasks.
var ENABLE_PILOT_EXPORT_TASKS = false;


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

// Exact requested raster dimensions.
//
// 50,000 meters / 10 meters = 5,000 pixels.
var EXPORT_DIMENSIONS = '5000x5000';

var NODATA_VALUE = -9999;

var DRIVE_FOLDER =
  'SegFormer_LandCover_Sulsel_Export_Pilot_Batch_00_Fix1';

var PILOT_TILE_IDS = [
  'SULSEL_R005_C004',
  'SULSEL_R009_C004',
  'SULSEL_R005_C000'
];

var PILOT_ROLE_MAPPING = {
  SULSEL_R005_C004: 'urban/coastal',
  SULSEL_R009_C004: 'vegetated/mountainous',
  SULSEL_R005_C000: 'low-coverage coastal/island'
};


// ============================================================================
// 4. OUTPUT NAMES
// ============================================================================
//
// V2 is used so the corrected raster does not overwrite or become confused
// with the previous 5001 x 5001 pilot file.

var URBAN_DESCRIPTION =
  'PILOT_FIX_SULSEL_R005_C004';

var URBAN_PREFIX =
  'SULSEL_2021_SULSEL_R005_C004_S2WC_V2';

var MOUNTAIN_DESCRIPTION =
  'PILOT_FIX_SULSEL_R009_C004';

var MOUNTAIN_PREFIX =
  'SULSEL_2021_SULSEL_R009_C004_S2WC_V2';

var LOW_COVERAGE_DESCRIPTION =
  'PILOT_FIX_SULSEL_R005_C000';

var LOW_COVERAGE_PREFIX =
  'SULSEL_2021_SULSEL_R005_C000_S2WC_V2';


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

print(
  'Expected AOI Feature Count',
  1
);

print(
  'Actual AOI Feature Count',
  aoiFeatureCount
);

print(
  'Province',
  PROVINCE_NAME
);

print(
  'Country',
  COUNTRY_NAME
);


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

print(
  'Sentinel-2 Source Image Count',
  sentinel2Source.size()
);

print(
  'Cloud Probability Image Count',
  cloudProbabilitySource.size()
);


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

print(
  'Joined Collection Count',
  joinedCollection.size()
);


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

  // Apply bilinear treatment only to Sentinel-2 reflectance bands,
  // before median compositing.
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

print(
  'Masked Collection Count',
  maskedSentinel2.size()
);


// ============================================================================
// 9. CREATE SENTINEL-2 MEDIAN COMPOSITE
// ============================================================================

var sentinel2Composite = maskedSentinel2
  .median()
  .select(['B2', 'B3', 'B4', 'B8'])
  .clip(southSulawesiAoi)
  .toFloat();

print(
  'Sentinel-2 Composite Bands',
  sentinel2Composite.bandNames()
);


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

// Nearest neighbour is Earth Engine's default categorical behavior.
//
// Do not call bilinear or bicubic resampling on this label image.
worldCoverLabel = worldCoverLabel.toUint8();

print(
  'WorldCover Label Band',
  worldCoverLabel.bandNames()
);


// ============================================================================
// 11. CREATE FINAL FIVE-BAND STACK
// ============================================================================
//
// The label remains categorical before conversion into the final Float32
// combined stack.

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

print(
  'Stack Band Order',
  finalStack.bandNames()
);

print(
  'Expected Band Count',
  5
);


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


// ============================================================================
// 13. FILTER THE THREE PILOT TILES
// ============================================================================

var pilotTiles = retainedGrid.filter(
  ee.Filter.inList(
    'tile_id',
    PILOT_TILE_IDS
  )
);

var matchedPilotIds = pilotTiles.aggregate_array(
  'tile_id'
);

var unmatchedPilotIds = ee.List(
  PILOT_TILE_IDS
).removeAll(
  matchedPilotIds
);

print('=== 13. PILOT TILE FILTERING ===');

print(
  'Requested Pilot Tile Count',
  PILOT_TILE_IDS.length
);

print(
  'Matched Pilot Tile Count',
  pilotTiles.size()
);

print(
  'Requested Pilot Tile IDs',
  PILOT_TILE_IDS
);

print(
  'Matched Pilot Tile IDs',
  matchedPilotIds
);

print(
  'Unmatched Pilot Tile IDs',
  unmatchedPilotIds
);

print(
  'Pilot Tile Role Mapping',
  PILOT_ROLE_MAPPING
);


// ============================================================================
// 14. RETRIEVE INDIVIDUAL TILE FEATURES
// ============================================================================

var urbanTile = ee.Feature(
  retainedGrid
    .filter(
      ee.Filter.eq(
        'tile_id',
        'SULSEL_R005_C004'
      )
    )
    .first()
);

var mountainTile = ee.Feature(
  retainedGrid
    .filter(
      ee.Filter.eq(
        'tile_id',
        'SULSEL_R009_C004'
      )
    )
    .first()
);

var lowCoverageTile = ee.Feature(
  retainedGrid
    .filter(
      ee.Filter.eq(
        'tile_id',
        'SULSEL_R005_C000'
      )
    )
    .first()
);

print(
  'Urban Tile',
  urbanTile
);

print(
  'Mountain Tile',
  mountainTile
);

print(
  'Low-Coverage Tile',
  lowCoverageTile
);


// ============================================================================
// 15. EXPORT PARAMETER DIAGNOSTICS
// ============================================================================

print('=== 15. EXPORT PARAMETER DIAGNOSTICS ===');

print(
  'Export Safety Switch',
  ENABLE_PILOT_EXPORT_TASKS
);

print(
  'Drive Folder',
  DRIVE_FOLDER
);

print(
  'Output Prefix Urban',
  URBAN_PREFIX
);

print(
  'Output Prefix Mountain',
  MOUNTAIN_PREFIX
);

print(
  'Output Prefix Low Coverage',
  LOW_COVERAGE_PREFIX
);

print(
  'Export CRS',
  EXPORT_CRS
);

print(
  'Export Dimensions',
  EXPORT_DIMENSIONS
);

print(
  'Expected Pixel Width',
  5000
);

print(
  'Expected Pixel Height',
  5000
);

print(
  'Expected Pixel Size',
  '10 x -10 meters'
);

print(
  'IMPORTANT',
  'dimensions is used; scale and crsTransform are intentionally absent'
);


// ============================================================================
// 16. PILOT EXPORT TASKS
// ============================================================================
//
// IMPORTANT:
//
// Exactly three export calls exist.
//
// They are created only when:
//
// ENABLE_PILOT_EXPORT_TASKS === true
//
// The use of:
//
// dimensions: '5000x5000'
//
// forces the raster dimensions to exactly 5000 x 5000 pixels.
//
// Do not add scale.
// Do not add crsTransform.

if (ENABLE_PILOT_EXPORT_TASKS) {

  // --------------------------------------------------------------------------
  // 16.1 Urban/coastal pilot
  // --------------------------------------------------------------------------

  Export.image.toDrive({
    image: finalStack,
    description: URBAN_DESCRIPTION,
    folder: DRIVE_FOLDER,
    fileNamePrefix: URBAN_PREFIX,
    region: urbanTile.geometry(),
    dimensions: EXPORT_DIMENSIONS,
    crs: EXPORT_CRS,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    formatOptions: {
      cloudOptimized: true,
      noData: NODATA_VALUE
    }
  });


  // --------------------------------------------------------------------------
  // 16.2 Vegetated/mountainous pilot
  // --------------------------------------------------------------------------

  Export.image.toDrive({
    image: finalStack,
    description: MOUNTAIN_DESCRIPTION,
    folder: DRIVE_FOLDER,
    fileNamePrefix: MOUNTAIN_PREFIX,
    region: mountainTile.geometry(),
    dimensions: EXPORT_DIMENSIONS,
    crs: EXPORT_CRS,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    formatOptions: {
      cloudOptimized: true,
      noData: NODATA_VALUE
    }
  });


  // --------------------------------------------------------------------------
  // 16.3 Low-coverage coastal/island pilot
  // --------------------------------------------------------------------------

  Export.image.toDrive({
    image: finalStack,
    description: LOW_COVERAGE_DESCRIPTION,
    folder: DRIVE_FOLDER,
    fileNamePrefix: LOW_COVERAGE_PREFIX,
    region: lowCoverageTile.geometry(),
    dimensions: EXPORT_DIMENSIONS,
    crs: EXPORT_CRS,
    maxPixels: 1e13,
    fileFormat: 'GeoTIFF',
    formatOptions: {
      cloudOptimized: true,
      noData: NODATA_VALUE
    }
  });

  print(
    'PILOT EXPORT TASK CREATION',
    'ENABLED — exactly three pilot tasks should appear in Tasks'
  );

} else {

  print(
    'PILOT EXPORT TASK CREATION DISABLED',
    'Set ENABLE_PILOT_EXPORT_TASKS = true only after precheck approval.'
  );
}


// ============================================================================
// 17. MAP VISUALIZATION
// ============================================================================

Map.centerObject(
  pilotTiles,
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
  true
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
  'Export Grid',
  false
);

Map.addLayer(
  pilotTiles.style({
    color: 'FFFF00',
    fillColor: 'FFFF0033',
    width: 3
  }),
  {},
  'Pilot Tiles',
  true
);


// ============================================================================
// 18. FINAL DIAGNOSTICS
// ============================================================================

print('=== 18. FINAL SCRIPT STATUS ===');

print(
  'AOI Feature Count',
  aoiFeatureCount
);

print(
  'Sentinel-2 Source Count',
  sentinel2Source.size()
);

print(
  'Joined Collection Count',
  joinedCollection.size()
);

print(
  'Masked Collection Count',
  maskedSentinel2.size()
);

print(
  'Final Band Names',
  finalStack.bandNames()
);

print(
  'Projection',
  EXPORT_CRS
);

print(
  'Tile Size',
  TILE_SIZE_METERS
);

print(
  'Requested Output Dimensions',
  EXPORT_DIMENSIONS
);

print(
  'Safety Switch Enabled',
  ENABLE_PILOT_EXPORT_TASKS
);


// ============================================================================
// 19. STATUS
// ============================================================================
//
// PILOT EXPORT SCRIPT CREATION       : COMPLETE
// PILOT EXPORT DIMENSION FIX         : COMPLETE
// OUTPUT METHOD                      : dimensions = 5000x5000
// SCALE PARAMETER                    : NOT USED
// CRS TRANSFORM PARAMETER            : NOT USED
// PILOT EXPORT SAFETY SWITCH         : DISABLED BY DEFAULT
// PILOT EXPORT TASKS RUN             : NO
// CORRECTED PILOT GEOTIFF CREATED    : NO
// TASK 5.4 FULL TILED EXPORT         : NOT STARTED
//
// ============================================================================