// ============================================================================
// 1. SCRIPT IDENTITY AND SAFETY STATUS
// ============================================================================
//
// Project     : SegFormer Land-Cover Classification - South Sulawesi
// Script      : gee/05_Export_Grid.js
// Task ID     : TASK 5.2 - Create Export Grid
// Mode        : GRID GENERATION, DIAGNOSTIC, AND VISUALIZATION ONLY
//
// IMPORTANT:
//
// - This script does NOT export raster data.
// - This script does NOT export vector data.
// - This script contains no Export.image.* calls.
// - This script contains no Export.table.* calls.
// - This script does not start TASK 5.4.
// - TILE_SIZE_METERS remains provisional.
// - The original rectangular tile geometry is preserved.
//
// Inspector support:
//
// - A styled image layer is provided for clean visualization.
// - The original FeatureCollection is also added to the map.
// - Use "Export Grid Features - Inspector" to inspect tile properties.
//
// ============================================================================


// ============================================================================
// 2. PROJECT CONSTANTS
// ============================================================================

var STUDY_AREA_COUNTRY = 'Indonesia';
var STUDY_AREA_PROVINCE = 'Sulawesi Selatan';

var AOI_SOURCE = 'FAO/GAUL/2015/level1';

var EXPORT_CRS = 'EPSG:3857';
var EXPORT_RESOLUTION_M = 10;

// PROVISIONAL.
//
// 50,000 meters = 50 km.
//
// At 10-meter resolution:
//
// 50,000 / 10 = 5,000 pixels per tile side.
//
// This value is approved only for:
//
// - grid visualization;
// - technical validation;
// - pilot planning.
//
// It is not yet approved as the final production-export tile size.
var TILE_SIZE_METERS = 50000;

var EXPECTED_AOI_FEATURE_COUNT = 1;

var ACCEPTED_SAMPLE_REFERENCE = 'SULSEL_DATASET_SAMPLE_003.tif';


// ============================================================================
// 3. LOAD AREA OF INTEREST
// ============================================================================

var gaulLevel1 = ee.FeatureCollection(AOI_SOURCE);

var southSulawesiCollection = gaulLevel1
  .filter(
    ee.Filter.eq(
      'ADM0_NAME',
      STUDY_AREA_COUNTRY
    )
  )
  .filter(
    ee.Filter.eq(
      'ADM1_NAME',
      STUDY_AREA_PROVINCE
    )
  );

var actualAoiFeatureCount = southSulawesiCollection.size();

var southSulawesiAoi = southSulawesiCollection.geometry();


// ============================================================================
// 4. AOI VALIDATION DIAGNOSTICS
// ============================================================================

var aoiFeatureCountValid = actualAoiFeatureCount.eq(
  EXPECTED_AOI_FEATURE_COUNT
);

print('=== 4. AOI VALIDATION DIAGNOSTICS ===');

print(
  'Expected AOI Feature Count',
  EXPECTED_AOI_FEATURE_COUNT
);

print(
  'Actual AOI Feature Count',
  actualAoiFeatureCount
);

print(
  'AOI Feature Count Valid',
  aoiFeatureCountValid
);

print(
  'Selected Province Name',
  STUDY_AREA_PROVINCE
);

print(
  'Selected Country Name',
  STUDY_AREA_COUNTRY
);


// ============================================================================
// 5. PROJECTED AOI GEOMETRY
// ============================================================================

var projection3857 = ee.Projection(EXPORT_CRS);

// Transform AOI into meter-based EPSG:3857.
var projectedAoi = southSulawesiAoi.transform(
  projection3857,
  1
);

// Create the AOI bounding rectangle in EPSG:3857.
var projectedAoiBounds = projectedAoi.bounds(
  1,
  projection3857
);

var aoiAreaSquareMeters = projectedAoi.area(
  1,
  projection3857
);

var aoiAreaSquareKilometers = aoiAreaSquareMeters.divide(
  1000000
);

print('=== 5. PROJECTED AOI GEOMETRY ===');

print(
  'AOI Projection for Grid',
  EXPORT_CRS
);

print(
  'AOI Total Area (km2)',
  aoiAreaSquareKilometers
);

print(
  'AOI Bounding Box (4326)',
  southSulawesiAoi.bounds(1)
);

print(
  'AOI Bounding Box (3857)',
  projectedAoiBounds
);


// ============================================================================
// 6. EXPORT-GRID PARAMETER CONFIGURATION
// ============================================================================

var configuredTileWidthPixels = ee.Number(
  TILE_SIZE_METERS
).divide(
  EXPORT_RESOLUTION_M
);

var configuredTileHeightPixels = configuredTileWidthPixels;

print('=== 6. EXPORT-GRID PARAMETER CONFIGURATION ===');

print(
  'Configured Tile Size (m)',
  TILE_SIZE_METERS
);

print(
  'Configured Tile Width (px)',
  configuredTileWidthPixels
);

print(
  'Configured Tile Height (px)',
  configuredTileHeightPixels
);

print(
  'Tile Size Status',
  'PROVISIONAL - requires pilot validation before production export'
);

print(
  'Accepted Sample Reference',
  ACCEPTED_SAMPLE_REFERENCE
);


// ============================================================================
// 7. EXTRACT PROJECTED BOUNDING-BOX COORDINATES
// ============================================================================
//
// The rectangular bounds coordinate sequence is:
//
// 0 = lower-left
// 1 = lower-right
// 2 = upper-right
// 3 = upper-left
// 4 = repeated lower-left
//
// Coordinates are expressed in EPSG:3857 projected meters.

var projectedBoundsCoordinates = ee.List(
  projectedAoiBounds
    .coordinates()
    .get(0)
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

var projectedBoundsWidthMeters = maximumX.subtract(
  minimumX
);

var projectedBoundsHeightMeters = maximumY.subtract(
  minimumY
);

var numberOfColumns = projectedBoundsWidthMeters
  .divide(TILE_SIZE_METERS)
  .ceil()
  .toInt();

var numberOfRows = projectedBoundsHeightMeters
  .divide(TILE_SIZE_METERS)
  .ceil()
  .toInt();

print('=== 7. PROJECTED BOUNDS DIAGNOSTICS ===');

print(
  'Projected Minimum X',
  minimumX
);

print(
  'Projected Minimum Y',
  minimumY
);

print(
  'Projected Maximum X',
  maximumX
);

print(
  'Projected Maximum Y',
  maximumY
);

print(
  'Projected Bounds Width (m)',
  projectedBoundsWidthMeters
);

print(
  'Projected Bounds Height (m)',
  projectedBoundsHeightMeters
);


// ============================================================================
// 8. GENERATE RECTANGULAR CANDIDATE GRID
// ============================================================================
//
// This implementation uses Earth Engine server-side operations.
//
// No getInfo() is used.
// No random tile identifier is used.
// No tile geometry is clipped permanently to the AOI.
//
// The nested mapping produces:
//
// List<List<Feature>>
//
// It is flattened into:
//
// List<Feature>
//
// before being passed into ee.FeatureCollection.

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

    // Calculate the projected tile coordinates.
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

    // Preserve the complete rectangular tile geometry.
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

    // Calculate only the AOI intersection for metadata and filtering.
    var tileAoiIntersection = rectangularTile.intersection(
      projectedAoi,
      1
    );

    var intersectionAreaSquareMeters = tileAoiIntersection.area(
      1,
      projection3857
    );

    // Nominal tile area:
    //
    // 50,000 m × 50,000 m
    // = 2,500,000,000 m².
    var tileAreaSquareMeters = ee.Number(
      TILE_SIZE_METERS
    ).multiply(
      TILE_SIZE_METERS
    );

    var rawCoverageRatio = intersectionAreaSquareMeters.divide(
      tileAreaSquareMeters
    );

    // Limit floating-point artifacts to the valid range 0–1.
    //
    // For example:
    //
    // 1.0000000000000007
    //
    // becomes:
    //
    // 1
    var boundedCoverageRatio = rawCoverageRatio
      .max(0)
      .min(1);

    // Stable and deterministic tile identifier.
    var deterministicTileId = ee.String('SULSEL_R')
      .cat(
        rowValue.format('%03d')
      )
      .cat('_C')
      .cat(
        columnValue.format('%03d')
      );

    var tileIntersectsAoi = intersectionAreaSquareMeters.gt(0);

    return ee.Feature(
      rectangularTile,
      {
        tile_id: deterministicTileId,
        row: rowValue,
        col: columnValue,
        tile_size_m: TILE_SIZE_METERS,
        crs: EXPORT_CRS,
        intersects_aoi: tileIntersectsAoi,
        intersection_area_m2: intersectionAreaSquareMeters,
        tile_area_m2: tileAreaSquareMeters,
        aoi_coverage_ratio: boundedCoverageRatio
      }
    );
  });
});


// ---------------------------------------------------------------------------
// 8.1 Correctly flatten List<List<Feature>>
// ---------------------------------------------------------------------------
//
// IMPORTANT FIX:
//
// Incorrect:
//
// ee.FeatureCollection(candidateGridNested).flatten()
//
// That attempts to build a FeatureCollection from:
//
// List<List<Feature>>
//
// Earth Engine requires:
//
// List<Feature>
//
// Therefore, flatten the nested ee.List first.

var candidateGridFlatList = ee.List(
  candidateGridNested
).flatten();

var candidateGrid = ee.FeatureCollection(
  candidateGridFlatList
);


// ============================================================================
// 9. RETAIN ONLY INTERSECTING TILES
// ============================================================================
//
// Only tiles with positive AOI-intersection area are retained.
//
// The geometry stored in each retained feature remains the complete
// rectangular tile, not the irregular intersection polygon.

var retainedGrid = candidateGrid.filter(
  ee.Filter.gt(
    'intersection_area_m2',
    0
  )
);


// ============================================================================
// 10. TILE METADATA AND SAMPLE OUTPUTS
// ============================================================================

var totalCandidateGridCount = candidateGrid.size();

var retainedIntersectingTileCount = retainedGrid.size();

var firstFiveTileFeatures = retainedGrid.limit(5);

var firstFiveTileIds = ee.List(
  retainedGrid
    .aggregate_array('tile_id')
    .slice(0, 5)
);

var tilePropertyNames = ee.Feature(
  retainedGrid.first()
).propertyNames();

var minimumAoiCoverageRatio = retainedGrid.aggregate_min(
  'aoi_coverage_ratio'
);

var maximumAoiCoverageRatio = retainedGrid.aggregate_max(
  'aoi_coverage_ratio'
);

var distinctTileIdCount = retainedGrid.aggregate_count_distinct(
  'tile_id'
);

var tileIdsAreUnique = distinctTileIdCount.eq(
  retainedIntersectingTileCount
);


// ============================================================================
// 11. GRID DIAGNOSTICS
// ============================================================================

print('=== 11. GRID DIAGNOSTICS ===');

print(
  'Grid CRS',
  EXPORT_CRS
);

print(
  'Configured Tile Size (m)',
  TILE_SIZE_METERS
);

print(
  'Number of Rows',
  numberOfRows
);

print(
  'Number of Columns',
  numberOfColumns
);

print(
  'Candidate Grid Cells Total',
  totalCandidateGridCount
);

print(
  'Retained Intersecting Tiles',
  retainedIntersectingTileCount
);

print(
  'Distinct Tile ID Count',
  distinctTileIdCount
);

print(
  'Tile IDs Are Unique',
  tileIdsAreUnique
);

print(
  'First 5 Tile Features',
  firstFiveTileFeatures
);

print(
  'First 5 Tile IDs',
  firstFiveTileIds
);

print(
  'Tile Property Names',
  tilePropertyNames
);

print(
  'Minimum AOI Coverage Ratio',
  minimumAoiCoverageRatio
);

print(
  'Maximum AOI Coverage Ratio',
  maximumAoiCoverageRatio
);


// ============================================================================
// 12. MAP VISUALIZATION
// ============================================================================

Map.centerObject(
  southSulawesiCollection,
  7
);


// ---------------------------------------------------------------------------
// 12.1 AOI boundary
// ---------------------------------------------------------------------------

var aoiBoundaryImage = ee.Image()
  .byte()
  .paint({
    featureCollection: southSulawesiCollection,
    color: 1,
    width: 3
  });

Map.addLayer(
  aoiBoundaryImage,
  {
    palette: ['FF0000']
  },
  'South Sulawesi AOI',
  true
);


// ---------------------------------------------------------------------------
// 12.2 Styled grid visualization
// ---------------------------------------------------------------------------
//
// The styled layer is visually clean, but it is an Image.
// Inspector will therefore show image pixels rather than tile metadata.

var styledRetainedGrid = retainedGrid.style({
  color: '0066FF',
  fillColor: '00000000',
  width: 2
});

Map.addLayer(
  styledRetainedGrid,
  {},
  'Export Grid',
  true
);


// ---------------------------------------------------------------------------
// 12.3 Original FeatureCollection for Inspector
// ---------------------------------------------------------------------------
//
// This layer uses the retained FeatureCollection directly.
//
// To inspect tile metadata:
//
// 1. Open Layers.
// 2. Enable "Export Grid Features - Inspector".
// 3. Disable the styled "Export Grid" layer temporarily.
// 4. Open Inspector.
// 5. Click inside a tile.
// 6. Open:
//
//    Objects
//      Export Grid Features - Inspector
//        Feature
//          properties
//
// Expected properties:
//
// - tile_id
// - row
// - col
// - tile_size_m
// - crs
// - intersects_aoi
// - intersection_area_m2
// - tile_area_m2
// - aoi_coverage_ratio

Map.addLayer(
  retainedGrid,
  {
    color: 'FFFF00'
  },
  'Export Grid Features - Inspector',
  false
);


// ---------------------------------------------------------------------------
// 12.4 AOI-intersection diagnostic layer
// ---------------------------------------------------------------------------
//
// This optional layer shows the irregular part of each tile that overlaps
// the South Sulawesi AOI.
//
// It is hidden by default.

var intersectionDiagnostic = retainedGrid.map(function(tileFeature) {
  tileFeature = ee.Feature(tileFeature);

  var intersectionGeometry = tileFeature
    .geometry()
    .intersection(
      projectedAoi,
      1
    );

  return ee.Feature(
    intersectionGeometry,
    tileFeature.toDictionary()
  );
});

var styledIntersectionDiagnostic = intersectionDiagnostic.style({
  color: 'FF00FF',
  fillColor: 'FF00FF33',
  width: 1
});

Map.addLayer(
  styledIntersectionDiagnostic,
  {},
  'AOI Intersection Diagnostic',
  false
);


// ============================================================================
// 13. INSPECTOR USAGE INSTRUCTIONS
// ============================================================================
//
// Recommended layer configuration:
//
// [ON]  South Sulawesi AOI
// [OFF] Export Grid
// [ON]  Export Grid Features - Inspector
// [OFF] AOI Intersection Diagnostic
//
// Then:
//
// 1. Open the Inspector tab.
// 2. Click inside the yellow tile boundary.
// 3. Open the object named:
//
//    Export Grid Features - Inspector
//
// 4. Open the Feature and properties.
//
// If Inspector only displays:
//
// Image (1 band)
// constant
//
// the styled image layer was inspected instead of the original
// FeatureCollection.
//
// ============================================================================


// ============================================================================
// 14. MANUAL VALIDATION CHECKLIST
// ============================================================================
//
// [PASS] AOI source is FAO/GAUL/2015/level1.
// [PASS] Country filter is Indonesia.
// [PASS] Province filter is Sulawesi Selatan.
// [PASS] Expected AOI feature count is 1.
// [PASS] Actual AOI feature count is 1.
// [PASS] Grid CRS is EPSG:3857.
// [PASS] Tile size is 50,000 meters.
// [PASS] Tile size remains provisional.
// [PASS] Candidate grid is created server-side.
// [PASS] Nested feature lists are flattened before FeatureCollection.
// [PASS] Grid covers the projected AOI bounding extent.
// [PASS] Only intersecting tiles are retained.
// [PASS] Complete rectangular tile geometry is preserved.
// [PASS] Deterministic tile IDs are assigned.
// [PASS] Row and column properties are assigned.
// [PASS] Tile-ID uniqueness is checked.
// [PASS] AOI coverage ratio is constrained to 0–1.
// [PASS] FeatureCollection layer is available for Inspector.
// [PASS] No getInfo() call exists.
// [PASS] No Export.image.* call exists.
// [PASS] No Export.table.* call exists.
// [PASS] No pilot export has started.
// [PASS] No full export has started.
//
// ============================================================================


// ============================================================================
// 15. TASK STATUS
// ============================================================================
//
// TASK 5.2 SCRIPT CREATION       : COMPLETE
// TASK 5.2 GEE EXECUTION         : COMPLETE
// TASK 5.2 VISUAL VALIDATION     : PASS
// TASK 5.2 FINAL STATUS          : PASS
//
// TILE SIZE PRODUCTION APPROVAL  : NOT APPROVED
// PILOT TILE SELECTION           : IN PROGRESS
// PILOT EXPORT                   : NOT STARTED
// TASK 5.4 FULL TILED EXPORT     : NOT STARTED
//
// ============================================================================


// ============================================================================
// 16. EXPLICIT EXPORT PROHIBITION
// ============================================================================
//
// This script intentionally contains no:
//
// Export.image.toDrive(...)
// Export.image.toAsset(...)
// Export.table.toDrive(...)
// Export.table.toAsset(...)
//
// Running this script must not create a new export task.
//
// ============================================================================