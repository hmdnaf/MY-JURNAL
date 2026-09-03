# Pilot Tile Selection

## 1. Document Status

### Current M5 Closure Status

```text
PILOT TILE SELECTION STATUS: PASS

THREE-PILOT V2 EXPORT STATUS: COMPLETED

FINAL THREE-PILOT V2 AUDIT STATUS: PASS

FULL TILED EXPORT STATUS: NOT STARTED

M5 STATUS: PASS

M6 STATUS: IN_PROGRESS
```

### Historical Selection Snapshot

At the time this selection record was first approved, pilot export authorization
was `NOT APPROVED`, the pilot export script had not been created, and no pilot
GeoTIFF had been exported. Those statements are retained below only as historical
selection-stage context; they are not the current project status.

## 2. Selection Purpose
The three representative tiles documented in this specification were selected to test and validate:
- urban/coastal conditions;
- vegetated or mountainous conditions;
- low-AOI-coverage coastal or island conditions;
- export runtime;
- file size;
- raster metadata;
- CRS (`EPSG:3857`);
- band order (`B2, B3, B4, B8, label`);
- label integrity (exact categorical integer preservation without fractional numbers or NoData artifacts on land);
- RGB quality (spatial sharpness and alignment);
- image-label alignment.

> [!IMPORTANT]
> This is a pilot selection only and does **not** authorize full province export or execution of `TASK 5.4`.

## 3. Selected Pilot Tiles

| Role | `tile_id` | `row` | `col` | `tile_size_m` | CRS | AOI coverage ratio | Intersection area (`m²`) | Selection reason |
|:---|:---|:---:|:---:|:---:|:---:|:---|:---|:---|
| **Urban/coastal** | `SULSEL_R005_C004` | `5` | `4` | `50000` | `EPSG:3857` | `0.9376182964363281` | `2344045741.0908203` | representative urban and coastal tile around the Makassar–Maros region, with substantial AOI coverage. |
| **Vegetated/mountainous** | `SULSEL_R009_C004` | `9` | `4` | `50000` | `EPSG:3857` | `0.8809985808605468` | `2202496452.151367` | representative inland tile with substantial vegetated or mountainous terrain and high AOI coverage. |
| **Low-coverage coastal/island** | `SULSEL_R005_C000` | `5` | `0` | `50000` | `EPSG:3857` | `0.004467441280859375` | `11168603.202148438` | valid low-coverage coastal or island tile with AOI coverage below the provisional 0.01 manual-review threshold. |

## 4. Tile Validation

For every selected pilot tile (`SULSEL_R005_C004`, `SULSEL_R009_C004`, `SULSEL_R005_C000`), all required validation checks are confirmed:
- **Tile ID format valid:** `PASS` (deterministic `SULSEL_R000_C000` zero-padded 3-digit pattern).
- **Row and column valid:** `PASS` (within verified grid bounds `row: 0–12`, `col: 0–10`).
- **CRS EPSG:3857:** `PASS` (`EPSG:3857`).
- **Tile size 50000 meters:** `PASS` (`50000` projected meters).
- **Intersects AOI:** `PASS` (`intersects_aoi = true`).
- **Intersection area greater than zero:** `PASS` (`intersection_area_m2 > 0`).
- **AOI coverage ratio greater than zero:** `PASS` (`aoi_coverage_ratio > 0`).
- **Tile ID unique among the three selected tiles:** `PASS` (all 3 tile IDs are distinct).

## 5. Evidence

### 5.1 Historical Selection Evidence

The manual Google Earth Engine pilot-tile selection is verified by three screenshot artifacts located in `docs/evidence/pilot_selection/`:
- [docs/evidence/pilot_selection/pilot_tile_urban_coastal.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_urban_coastal.png) (36,619 bytes)
- [docs/evidence/pilot_selection/pilot_tile_vegetated_mountainous.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_vegetated_mountainous.png) (33,536 bytes)
- [docs/evidence/pilot_selection/pilot_tile_low_coverage_island.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_low_coverage_island.png) (25,650 bytes)

### 5.2 Completed Export and Final V2 Audit State

Accepted local V2 rasters:

- `data/raw/pilot/SULSEL_2021_SULSEL_R005_C004_S2WC_V2.tif`
- `data/raw/pilot/SULSEL_2021_SULSEL_R009_C004_S2WC_V2.tif`
- `data/raw/pilot/SULSEL_2021_SULSEL_R005_C000_S2WC_V2.tif`

Final status for the urban/coastal, vegetated/mountainous, and low-coverage
coastal/island V2 pilots is `PASS`.

The completed low-coverage `R005_C000` manual QGIS audit is evidenced by these
existing files under `docs/evidence/pilot_export_precheck/`:

- `pilot_low_coverage_raster_information_1.png`
- `pilot_low_coverage_raster_information_2.png`
- `pilot_low_coverage_raster_information_3.png`
- `pilot_low_coverage_rgb_visualization.png`
- `pilot_low_coverage_label_unique_values.png`
- `pilot_low_coverage_label_visualization.png`
- `pilot_low_coverage_identify_label.png`
- `pilot_low_coverage_label_alignment.png`

## 6. Pilot Role Summary
- `SULSEL_R005_C004` is the urban/coastal pilot tile;
- `SULSEL_R009_C004` is the vegetated/mountainous pilot tile;
- `SULSEL_R005_C000` is the low-coverage coastal/island pilot tile.

## 7. Historical Safety Status at Selection Time

The following snapshot describes the earlier selection-only task and is retained
for audit history. It is not the current status:

- **Export script created:** NO
- **Export.image.toDrive added:** NO
- **GEE export tasks submitted:** NO
- **Pilot GeoTIFF exported:** NO
- **Full export started:** NO
- **TASK 5.4 started:** NO

## 8. Historical Next Step and Current Next Step

Historical next step (now completed): create a pilot-only GEE export script for
exactly `SULSEL_R005_C004`, `SULSEL_R009_C004`, and `SULSEL_R005_C000`, then
export and audit their corrected V2 rasters.

Current next step: continue M6 by running the full 55-tile GEE export only after
separate user action and authorization, then audit every downloaded production
raster.

## 9. Final Result
```text
PILOT TILE SELECTION STATUS: PASS

THREE-PILOT V2 EXPORT STATUS: COMPLETED

FINAL THREE-PILOT V2 AUDIT STATUS: PASS

LOW-COVERAGE R005_C000 V2 MANUAL QGIS AUDIT: PASS

FULL TILED EXPORT STATUS: NOT STARTED

M5 STATUS: PASS

M6 STATUS: IN_PROGRESS
```
