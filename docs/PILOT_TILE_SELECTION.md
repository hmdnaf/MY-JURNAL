# Pilot Tile Selection

## 1. Document Status
```text
PILOT TILE SELECTION STATUS: PASS

PILOT EXPORT AUTHORIZATION STATUS: NOT APPROVED

TASK 5.4 EXECUTION STATUS: NOT STARTED
```

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
The manual Google Earth Engine pilot-tile selection is verified by three screenshot artifacts located in `docs/evidence/pilot_selection/`:
- [docs/evidence/pilot_selection/pilot_tile_urban_coastal.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_urban_coastal.png) (36,619 bytes)
- [docs/evidence/pilot_selection/pilot_tile_vegetated_mountainous.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_vegetated_mountainous.png) (33,536 bytes)
- [docs/evidence/pilot_selection/pilot_tile_low_coverage_island.png](file:///h:/segFormer/docs/evidence/pilot_selection/pilot_tile_low_coverage_island.png) (25,650 bytes)

## 6. Pilot Role Summary
- `SULSEL_R005_C004` is the urban/coastal pilot tile;
- `SULSEL_R009_C004` is the vegetated/mountainous pilot tile;
- `SULSEL_R005_C000` is the low-coverage coastal/island pilot tile.

## 7. Safety Status
- **Export script created:** NO
- **Export.image.toDrive added:** NO
- **GEE export tasks submitted:** NO
- **Pilot GeoTIFF exported:** NO
- **Full export started:** NO
- **TASK 5.4 started:** NO

## 8. Next Controlled Step
The next controlled step is to create a pilot-only GEE export script for exactly these three tile IDs (`SULSEL_R005_C004`, `SULSEL_R009_C004`, `SULSEL_R005_C000`).
Creating the pilot script still requires separate user approval.
Do not create the script during this task.

## 9. Final Result
```text
PILOT TILE SELECTION STATUS: PASS

PILOT EXPORT STATUS: NOT STARTED

FULL TILED EXPORT STATUS: NOT STARTED
```
