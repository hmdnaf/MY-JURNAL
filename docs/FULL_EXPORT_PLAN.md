# Full Tiled Export Plan

## 1. Document Status
- **Document Title:** Full Tiled Export Plan
- **Target Task:** `TASK 5.4 — Run Full Tiled Export` (Preparation Only)
- **Document Date:** 3 August 2026
- **Authoritative Reference:** [docs/TASK.md](file:///h:/segFormer/docs/TASK.md)
- **Execution Authority:** **PLANNING ONLY — NOT AUTHORIZED FOR EXPORT EXECUTION**
- **Purpose:** Define the comprehensive, non-executable technical strategy for a safe, auditable, batched full tiled export of the 5-band Sentinel-2 and ESA WorldCover dataset over Provinsi Sulawesi Selatan.

## 2. Current Verified Dataset State
| Parameter | Authoritative Value | Source / Evidence |
|:---|:---|:---|
| **Study Area** | Provinsi Sulawesi Selatan, Indonesia | `FAO/GAUL/2015/level1` |
| **Export CRS** | `EPSG:3857` (Web Mercator) | [configs/data.yaml](file:///h:/segFormer/configs/data.yaml), [docs/DATASET.md](file:///h:/segFormer/docs/DATASET.md) |
| **Pixel Resolution** | `10 meters` | `[10, 0, 0, 0, -10, 0]` affine transform |
| **Accepted Raster Stack** | `B2`, `B3`, `B4`, `B8`, `label` | 5 bands ordered (reflectance + WorldCover integer label) |
| **Export Data Type** | `Float32` | 4 bytes per pixel per band (20 bytes/pixel uncompressed) |
| **NoData Value** | `-9999` | All bands padded with `-9999` for out-of-bounds pixels |
| **Accepted Reference Sample** | `SULSEL_DATASET_SAMPLE_003.tif` | Audited benchmark from `TASK 5.3` |
| **Local Drive `H:` Free Space** | `~12.44 GB` (`13,353,820,160 bytes`) | Verified in [logs/environment_audit.md](file:///h:/segFormer/logs/environment_audit.md) |
| **Local RAM Capacity** | `~7.35 GB` total visible (`~655 MB` free physical) | CPU-only development machine; requires windowed I/O |
| **Local GPU Capacity** | Integrated AMD Radeon (No CUDA) | Training offloaded to Google Colab GPU |

## 3. Current Grid Summary
- **Grid Script:** [gee/05_Export_Grid.js](file:///h:/segFormer/gee/05_Export_Grid.js)
- **Provisional Tile Size:** `50000 meters` (`50 km × 50 km`)
- **Tile Pixel Dimensions:** `5000 × 5000 pixels` at 10-meter resolution
- **Number of Rows:** `13 rows` (0-indexed `000` to `012`)
- **Number of Columns:** `11 columns` (0-indexed `000` to `010`)
- **Candidate Grid Cells Total:** `143`
- **Retained Intersecting Tiles:** `55 tiles` (where `intersection_area_m2 > 0`)
- **Tile ID Pattern:** `SULSEL_R000_C000` (deterministic zero-padded row and column)
- **Minimum AOI Coverage Ratio:** `~0.000046` (`0.0046%` of tile area)
- **Maximum AOI Coverage Ratio:** `~1.0000000000000007` *(floating-point precision artifact)*

## 4. Tile-Size Strategy Comparison

### Mathematical and Operational Comparison Table
| Tile-Size Strategy | Tile Pixel Dimensions | Total Pixels per Tile | Uncompressed Bytes (5 Bands Float32) | Raw Reference Size per Complete Tile | Approx. Intersecting Tile Count | Relative Tile Count | Patch Division Analysis (`256 × 256` window) |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **1. 50,000 meters (`50 km`)** | `5000 × 5000` | `25,000,000` | `500,000,000 bytes` | `~476.84 MiB` | **`55`** *(validated)* | `1.0×` | `19 × 19` full patches (`4864 × 4864`), remainder `136 px` right & bottom |
| **2. 25,000 meters (`25 km`)** | `2500 × 2500` | `6,250,000` | `125,000,000 bytes` | `~119.21 MiB` | **`~220`** *(approx.)* | `~4.0×` | `9 × 9` full patches (`2304 × 2304`), remainder `196 px` right & bottom |
| **3. 20,000 meters (`20 km`)** | `2000 × 2000` | `4,000,000` | `80,000,000 bytes` | `~76.29 MiB` | **`~340`** *(approx.)* | `~6.2×` | `7 × 7` full patches (`1792 × 1792`), remainder `208 px` right & bottom |
*(Note: Tile-count estimates for alternate sizes `25 km` and `20 km` are approximate only; exact counts require separately generated and validated grids. Do not treat area-ratio estimates as final counts).*

### Detailed Strategy Analysis
1. **Strategy 1: `50,000 meters` (`50 km × 50 km`, 55 tiles)**
   - **Expected Advantages:** Minimal number of Google Earth Engine export tasks (`55`); low administrative task-monitoring overhead; clean organization in Google Drive; high spatial continuity.
   - **Expected Disadvantages:** Larger uncompressed memory size per tile (`~477 MiB`), which requires strict use of windowed/chunked I/O (`rasterio`) locally so it does not exceed the `~655 MB` available physical RAM; slightly higher risk of GEE server computation timeouts if cloud-masked composite complexity is high.
   - **Earth Engine Export Risk:** Low-to-Medium (`25M pixels` is well within GEE export limits, but 50 km composites may require 5–15 minutes of computation per task).
   - **Google Drive Management Impact:** Minimal (`55 files` fits cleanly into simple numbered batch folders).
   - **Local Storage Impact:** Compressed size is unknown until pilot export; use approximately `476.84 MiB` per complete tile as a raw-size planning reference. `55 complete raw tiles` would be approximately `26.2 GiB` before format overhead.
   - **Audit Burden:** Low (`55 QGIS inspections`).
   - **Suitability for Patch Extraction:** A `5,000 × 5,000` pixel tile is **not evenly divisible by 256**. Floor division yields `19 × 19 full patches`, covering a dimension of `4,864 × 4,864 pixels`, leaving a remainder of `136 pixels on the right and 136 pixels on the bottom`. Future patch extraction must use padding, cropping, overlap, or boundary-window handling. The final patch-boundary strategy is not chosen yet.

2. **Strategy 2: `25,000 meters` (`25 km × 25 km`, ~220 tiles approx.)**
   - **Expected Advantages:** Highly resilient against GEE server timeouts; very small memory footprint (`~119 MiB` uncompressed), making local raster reading extremely safe even in constrained RAM; faster per-tile downloads.
   - **Expected Disadvantages:** High task-management overhead (`~220 tasks` to submit, track, and download); increased risk of human error during batch tracking; cluttered Google Drive directory.
   - **Earth Engine Export Risk:** Very Low (fast execution per task).
   - **Google Drive Management Impact:** Moderate-to-High (requires systematic multi-level folder structuring).
   - **Local Storage Impact:** Similar total raw data volume reference (`~26.2 GiB` total raw across `~220 files`).
   - **Audit Burden:** High (`~220 QGIS inspections`).
   - **Suitability for Patch Extraction:** A `2,500 × 2,500` pixel tile is **not evenly divisible by 256**. Floor division yields `9 × 9 full patches`, covering `2,304 × 2,304 pixels`, leaving a remainder of `196 pixels on the right and 196 pixels on the bottom`. Future patch extraction must use padding, cropping, overlap, or boundary-window handling.

3. **Strategy 3: `20,000 meters` (`20 km × 20 km`, ~340 tiles approx.)**
   - **Expected Advantages:** Negligible per-task memory usage (`~76 MiB` uncompressed); zero GEE timeout risk.
   - **Expected Disadvantages:** Excessive task-management burden (`~340 tasks`); severe queue congestion risk in Earth Engine (3000 task user quota limit); heavy QGIS audit workload.
   - **Earth Engine Export Risk:** Very Low computation risk, but High queue/quota management risk.
   - **Google Drive Management Impact:** High (`~340 files`).
   - **Local Storage Impact:** High file/inode count.
   - **Audit Burden:** High (`~340 QGIS inspections`).
   - **Suitability for Patch Extraction:** A `2,000 × 2,000` pixel tile is **not evenly divisible by 256**. Floor division yields `7 × 7 full patches`, covering `1,792 × 1,792 pixels`, leaving a remainder of `208 pixels on the right and 208 pixels on the bottom`. Future patch extraction must use padding, cropping, overlap, or boundary-window handling.

### Storage & Compression Assumptions
- **Compressed Size Uncertainty:** Compressed size is **unknown until pilot export**. LZW compression ratio depends on pixel distribution, NoData padding, Float32 behavior, predictor settings, and GeoTIFF implementation.
- **Raw Reference Size:** Use approximately `476.84 MiB` per complete tile as a raw-size planning reference (`5000 × 5000 × 5 bands × 4 bytes = 500,000,000 bytes`).
- **Total Raw Reference:** `55 complete raw tiles` would be approximately `26.2 GiB` before format overhead. Edge tiles may be smaller only if export dimensions or empty regions differ. Actual pilot files must be measured before production approval.

## 5. AOI Coverage Strategy
- **Current Observation:** Minimum AOI coverage ratio is `~0.000046` (`0.0046%`, representing a tiny sliver of land or island boundary intersecting a 50 km tile).
- **Exact Area & Pixel Threshold Calculations (`50,000 m × 50,000 m` tile):**
  - Tile area = `2,500,000,000 m²`
  - Pixel size = `10 m × 10 m = 100 m²`
  - Total pixels = `25,000,000 pixels`
  - **1% coverage (`0.01` ratio):** `25,000,000 m²`, `2,500 hectares`, `250,000 pixels`
  - **0.1% coverage (`0.001` ratio):** `2,500,000 m²`, `250 hectares`, `25,000 pixels`
  - **0.01% coverage (`0.0001` ratio):** `250,000 m²`, `25 hectares`, `2,500 pixels`
- **Analysis of Options:**
  1. *Keep every tile with `intersection_area_m2 > 0`:* Guarantees zero loss of coastal or island land-cover, but exports tiles that may contain >99.9% sea/NoData.
  2. *Apply an automatic minimum coverage threshold:* Highly risky; automatically deleting low-coverage tiles could silently erase inhabited offshore islands (e.g., Kepulauan Selayar or Spermonde islands).
  3. *Keep small-coverage tiles only when they contain valid island or coastal AOI geometry:* Rigorous, but requires complex spatial intersection geometry checks.
  4. *Use a manual review list for low-coverage tiles:* **Recommended Best Practice.** All intersecting tiles are retained by default, but tiles below a threshold are flagged for manual QA review.
- **Proposed Review Threshold:**
  - **`aoi_coverage_ratio < 0.01` (`1% coverage` = `25,000,000 m²` = `2,500 hectares` = `250,000 pixels`).**
  - **Rule:** Keep the threshold as a **provisional manual-review flag only.** Do **not** authorize automatic tile exclusion. Any decision to exclude a flagged tile must be documented explicitly in the export manifest after manual review.

## 6. Pilot Export Design
- **RECOMMENDATION FOR PILOT ONLY — NOT FINAL PRODUCTION APPROVAL**
- **Objective:** The pilot will determine:
  - actual compressed file size;
  - peak local storage requirement;
  - export runtime;
  - failure behavior;
  - final production tile-size suitability;
  - final batch-size suitability.
- **Pilot Scope:** Propose a tile size of `50,000 meters` and a pilot tile count of **exactly three (3) representative tiles**:
  1. **One urban/coastal tile;**
  2. **One vegetated or mountainous tile;**
  3. **One low-coverage coastal or island tile.**
- **Selection Rule:** Do not invent exact IDs unless supported by existing grid evidence; specific IDs must be selected manually from the validated grid in GEE prior to pilot authorization.
- **Validation Criteria for Pilot PASS:**
  - Task completes without timeout or memory error.
  - Downloaded GeoTIFF is exactly `5000 × 5000 pixels` at `10m` pixel size.
  - Contains exactly 5 bands in order: `B2, B3, B4, B8, label`.
  - Band 5 contains exact integer categorical values (`0, 1, 2, 3, 4, 5, 7, 8`), with zero fractional numbers and zero NoData (`-9999`) across valid land pixels.
  - RGB composite (`B4, B3, B2`) displays sharp spatial detail without resampling blur.

## 7. Batch Export Strategy
- **Comparison of Production Batch Sizes (for 55 tiles):**
  - **5 tiles per batch (`11 batches`):** Maximum failure isolation and minimal Google Drive usage per batch (`~2.33 GiB raw reference`), but high operational overhead (`11 cycles` of submission, download, audit, and cleanup).
  - **10 tiles per batch (`6 batches` — 5 × 10 + 1 × 5):** **Provisional Comparison Option.** Balanced operational rhythm.
  - **15 tiles per batch (`4 batches` — 3 × 15 + 1 × 10):** Fast total progression, but auditing 15 large GeoTIFFs at once increases fatigue and creates a higher peak storage spike (`~7.0 GiB raw reference`).
- **Batch Storage & Risk Analysis:**
  - `10 tiles per batch` remains a provisional comparison option.
  - Worst-case raw reference for 10 complete tiles is approximately **`4.66 GiB`** (`10 × 476.84 MiB`).
  - Temporary download files and duplicate copies may increase the peak storage requirement.
  - The production batch size **cannot be approved until pilot file sizes are measured**.
  - **No batch size guarantees zero storage risk.**

## 8. File and Folder Naming
- **Proposed File Naming Convention:**
  ```text
  SULSEL_2021_<TILE_ID>_S2WC_V1.tif
  ```
  - `SULSEL`: Study area identifier.
  - `2021`: Reference year (Sentinel-2 2021 composite + ESA WorldCover 2021 v200).
  - `<TILE_ID>`: Deterministic tile ID from grid (e.g., `SULSEL_R008_C003`).
  - `S2WC`: Dataset indicator (Sentinel-2 + WorldCover).
  - `V1`: Export dataset version.
  - *Example:* `SULSEL_2021_SULSEL_R008_C003_S2WC_V1.tif`
- **Google Drive Cloud Directory Structure:**
  ```text
  SegFormer_LandCover_Sulsel_Export/
  ├── Pilot_Batch_00/
  ├── Batch_01/
  ├── Batch_02/
  ├── Batch_03/
  ├── Batch_04/
  ├── Batch_05/
  ├── Batch_06/
  └── Failed_Tasks/
  ```
- **Local Project Directory Structure (`H:\segFormer`):**
  ```text
  H:\segFormer\data\raw\tiles\
  ├── pilot\
  ├── batch_01\
  ├── batch_02\
  ├── batch_03\
  ├── batch_04\
  ├── batch_05\
  └── batch_06\
  ```

## 9. Export Manifest Design
- **Manifest File Path:** `docs/manifests/export_manifest.csv`
- **Schema & Column Definitions (22 Columns):**
  1. `tile_id`: Unique deterministic ID (`SULSEL_R000_C000`).
  2. `row`: Grid row index (`0–12`).
  3. `col`: Grid column index (`0–10`).
  4. `crs`: Export coordinate reference system (`EPSG:3857`).
  5. `tile_size_m`: Tile width/height in meters (`50000`).
  6. `pixel_width`: Raster pixel width (`5000`).
  7. `pixel_height`: Raster pixel height (`5000`).
  8. `intersection_area_m2`: Area of South Sulawesi AOI inside tile (m²).
  9. `aoi_coverage_ratio`: Ratio of land area (`0.0–1.0`).
  10. `export_filename`: Target GeoTIFF filename (`SULSEL_2021_..._V1.tif`).
  11. `batch_id`: Assigned batch (`pilot_00`, `batch_01`, etc.).
  12. `export_status`: Lifecycle status (see allowed values below).
  13. `task_id`: Earth Engine task ID (when submitted).
  14. `drive_folder`: Target Google Drive folder name.
  15. `submitted_at`: ISO timestamp of export task submission.
  16. `completed_at`: ISO timestamp of GEE task completion.
  17. `downloaded`: Boolean (`true` / `false`).
  18. `local_path`: Local filesystem path (`H:\segFormer\data\raw\tiles\...`).
  19. `file_size_bytes`: Compressed file size on local disk.
  20. `qgis_audit_status`: Visual quality audit status (`PENDING`, `PASS`, `FAIL`).
  21. `checksum`: SHA-256 hash of downloaded `.tif` file.
  22. `notes`: Text notes (e.g., "Low coverage flag reviewed; retained").
- **Allowed `export_status` Values:**
  - `planned`: In manifest, not yet submitted.
  - `submitted`: Export task initiated in GEE.
  - `running`: GEE server computation in progress.
  - `completed`: GEE task succeeded; file ready in Drive.
  - `failed`: GEE task failed (error logged in `notes`).
  - `downloaded`: File downloaded locally.
  - `audited`: Passed QGIS visual and structural verification.
  - `rejected`: Failed QA audit (requires re-export or exclusion).

## 10. Validation Gates

### Gate 1 — Before Pilot Export (Pre-Flight Safety Gate)
- **Checklist:**
  - `[ ]` Grid script `gee/05_Export_Grid.js` statically reviewed and validated.
  - `[ ]` 3 pilot tile IDs manually selected and recorded in manifest.
  - `[ ]` Zero duplicate tile IDs present.
  - `[ ]` Target file naming convention verified against schema.
  - `[ ]` Google Drive destination folder capacity confirmed (>10 GB free).
  - `[ ]` Zero production batch tiles authorized.

### Gate 2 — After Pilot Export (Pilot Quality Gate)
- **Checklist:**
  - `[ ]` All 3 pilot GEE tasks completed with status `COMPLETED`.
  - `[ ]` All 3 GeoTIFF files downloaded locally and verified non-empty.
  - `[ ]` Raster dimensions confirmed exactly `5000 × 5000` pixels.
  - `[ ]` CRS confirmed exactly `EPSG:3857`.
  - `[ ]` Band count confirmed exactly 5 (`B2, B3, B4, B8, label`).
  - `[ ]` Band 5 data type confirmed `Float32` containing only integer values (`0, 1, 2, 3, 4, 5, 7, 8`) or NoData (`-9999`).
  - `[ ]` Zero fractional numbers found in label band.
  - `[ ]` RGB composite spatial detail sharpness confirmed in QGIS Desktop.
  - `[ ]` Compressed file size recorded (`MB`) and verified acceptable for local storage.

### Gate 3 — Before Production Batch (Production Authorization Gate)
- **Checklist:**
  - `[ ]` Pilot export audit report formally approved by user (`PASS`).
  - `[ ]` Final production tile size (`50,000 meters`) formally approved.
  - `[ ]` Batch size (`10 tiles / batch`) formally approved.
  - `[ ]` Google Drive folder hierarchy approved.
  - `[ ]` Local storage management and cleanup strategy approved.
  - `[ ]` CSV manifest template (`docs/manifests/export_manifest.csv`) initialized.

### Gate 4 — After Each Production Batch (Batch Verification Gate)
- **Checklist:**
  - `[ ]` All GEE task IDs in current batch checked; failures isolated and re-queued.
  - `[ ]` Downloaded tile count matches batch manifest count.
  - `[ ]` Structural audit script run on all downloaded tiles (bands, dimensions, NoData).
  - `[ ]` Visual QGIS spot-check completed on at least 2 tiles per batch.
  - `[ ]` SHA-256 checksums computed and written to manifest.
  - `[ ]` Local drive `H:` free space audited (>3.0 GB buffer maintained).

### Gate 5 — Full Export Completion (Final Acceptance Gate)
- **Checklist:**
  - `[ ]` Total audited `PASS` tiles equal total planned tiles (`55`, or `55 minus approved exclusions`).
  - `[ ]` Zero duplicate tile IDs across entire dataset.
  - `[ ]` Zero missing approved tiles.
  - `[ ]` 100% of manifest rows have `export_status = audited` and `qgis_audit_status = PASS`.
  - `[ ]` Final dataset audit report completed and signed off.

## 11. Storage Management
- **Local Storage Constraint:** Project drive `H:\segFormer` has `~12.44 GB` free space. 55 complete raw tiles represent `~26.2 GiB` raw reference before compression or format overhead.
- **Storage Management Rules:**
  1. **Batch Download Buffer:** Download no more than 1 batch (`10 tiles` ≈ `4.66 GiB` worst-case raw reference) at a time from Google Drive.
  2. **No Temporary Duplication:** Immediately delete Google Drive `.zip` download archives or redundant copies after extracting and verifying the `.tif` files. Never retain both `.zip` and `.tif` simultaneously.
  3. **Low-Memory I/O:** Local Python verification scripts must read rasters in chunks or windowed blocks (`rasterio.open().read(window=...)`) to operate safely within the `~655 MB` available physical RAM.
  4. **Benchmark Preservation:** Never modify, overwrite, or move `data/raw/sample/SULSEL_DATASET_SAMPLE_003.tif`; keep it separate as the permanent reference sample.
  5. **Archival Overflow Plan:** If local drive `H:` free space drops below `2.5 GB` during production batching, pause downloads and request user guidance to either archive verified tiles to external storage or prune historical scratch logs.

## 12. Risk Register

| Risk Event | Likelihood | Impact | Prevention Strategy | Detection Method | Recovery Action |
|:---|:---:|:---:|:---:|:---:|:---:|
| **1. Export Timeout** | Medium | Medium | Use `50,000m` tiles; keep cloud masking efficient without unnecessary re-projections. | GEE Task tab shows `FAILED (Timeout)`. | Re-submit individual failed tile; if persistent, sub-divide tile to `25,000m`. |
| **2. File Too Large** | Low | High | Enforce `50,000m` bounds; use LZW compression and `Float32` (not `Float64`). | File size on Drive exceeds `500 MB`. | Verify LZW compression setting in GEE export call. |
| **3. Insufficient Drive Capacity** | Low | Medium | Audit Google Drive free space before starting Pilot and Production batches. | Drive upload fails or GEE task error `Quota exceeded`. | Delete temporary Drive files or change Drive output folder/user account. |
| **4. Insufficient Local Capacity** | Medium | High | Enforce 10-tile batch downloads; never duplicate `.zip` and `.tif` files. | PowerShell disk audit shows `H:` free space `< 2.5 GB`. | Clean up scratch files; move audited tiles to external storage. |
| **5. Duplicated Task** | Low | Low | Enforce deterministic `SULSEL_R000_C000` tile IDs and track via CSV manifest. | Manifest check detects duplicate ID or existing filename. | Abort duplicate GEE task; keep first validated copy. |
| **6. Missing Tile** | Low | Medium | Cross-reference completed Drive files against `143-cell` grid and `55-tile` retained list. | Manifest validation script reports missing `tile_id`. | Identify missing row/col from manifest and submit targeted GEE export. |
| **7. Corrupted Download** | Low | Medium | Compute and record SHA-256 checksums immediately upon download. | `rasterio.open()` throws `RasterioIOError` or checksum mismatch. | Re-download file from Drive; if Drive file corrupted, re-export in GEE. |
| **8. Wrong CRS** | Low | High | Hardcode `EXPORT_CRS = 'EPSG:3857'` in export script constants. | Automated metadata check detects non-3857 EPSG code. | Reject tile; fix CRS parameter in script and re-export batch. |
| **9. Wrong Band Order** | Low | High | Explicitly select `.select(['B2','B3','B4','B8','label'])` before export. | QGIS audit shows label in Band 1 or Band 4. | Reject batch; fix `.select()` order in GEE script and re-export. |
| **10. Fractional Label** | Low | High | Prevent bilinear/cubic resampling on Band 5; use nearest-neighbor or raw integers. | Python audit finds floating-point non-integers in Band 5. | Reject batch; fix remapping/resampling logic in GEE and re-export. |
| **11. RGB Blur** | Low | High | Perform bilinear resampling on Sentinel-2 *before* compositing at 10m resolution. | QGIS visual check reveals pixelated or smeared RGB detail. | Reject batch; verify `EXPORT_TRANSFORM = [10, 0, 0, 0, -10, 0]`. |
| **12. Grid Mismatch** | Low | Medium | Construct all export geometries directly from `gee/05_Export_Grid.js` tile boundaries. | Visual check shows gaps or overlaps between adjacent tiles. | Re-verify grid projection transform and regenerate export task list. |
| **13. Low AOI Coverage Tile** | Medium | Low | Flag tiles with `aoi_coverage_ratio < 0.01` in manifest for QA review. | Console diagnostic prints coverage `< 0.01`. | Inspect in QGIS; retain if containing island/coastal land; exclude if empty sea. |
| **14. Google Earth Engine Quota** | Low | Medium | Enforce 10-tile batches; do not submit >30 concurrent tasks to queue. | GEE API returns `Too many concurrent tasks` or `User memory limit`. | Pause task submission until queue drains; resume batch in 15 minutes. |
| **15. Manual Task-Management Errors** | Medium | Medium | Use CSV manifest `docs/manifests/export_manifest.csv` as single source of truth. | Discrepancy between Drive file list and local manifest rows. | Perform read-only reconciliation script to update manifest status. |

## 13. Proposed Pilot Recommendation
- **RECOMMENDATION FOR PILOT ONLY — NOT FINAL PRODUCTION APPROVAL**
- We recommend executing a **3-Tile Pilot Export (`Pilot Batch 00`)** using the provisional `50,000 meters` tile size.
- The 3 pilot tiles will represent:
  1. Coastal urban density (Makassar/Maros).
  2. Mountainous interior forest/cropland (Enrekang/Toraja).
  3. Low-coverage coastal/island boundary.
- All pilot GeoTIFFs will undergo Gate 2 validation (QGIS visual inspection + structural Python check) before any production batch is authorized.

## 14. Decisions Requiring User Approval
Before any executable export script (`gee/06_Full_Tiled_Export.js`) is created or `TASK 5.4` is started, the user must formally review and approve:
1. **Tile-Size Selection:** Approve testing `50,000 meters` (`50 km × 50 km`, 55 tiles) in the pilot phase.
2. **Pilot Tile IDs:** Approve the 3 specific tile IDs selected from the GEE Code Editor for `Pilot Batch 00`.
3. **Batch Strategy:** Approve the `10 tiles / batch` production rhythm.
4. **File Naming & Drive Hierarchy:** Approve the `SULSEL_2021_<TILE_ID>_S2WC_V1.tif` naming convention and Google Drive folder structure.
5. **Storage Management Plan:** Approve the local storage management rules for drive `H:` (`12.44 GB` limit).
6. **Low-Coverage QA Threshold:** Approve the provisional `aoi_coverage_ratio < 0.01` review threshold.

## 15. Prohibited Actions Before Approval
- **STRICT SAFETY ENFORCEMENT:**
  - Do **NOT** execute Google Earth Engine code.
  - Do **NOT** create or submit any `Export.image.toDrive`, `Export.image.toAsset`, or `Export.table` task.
  - Do **NOT** create `gee/06_Full_Tiled_Export.js` or modify `gee/05_Export_Grid.js`.
  - Do **NOT** modify any configuration file ([configs/data.yaml](file:///h:/segFormer/configs/data.yaml), [docs/DATASET.md](file:///h:/segFormer/docs/DATASET.md), [docs/TASK.md](file:///h:/segFormer/docs/TASK.md), [docs/ROADMAP.md](file:///h:/segFormer/docs/ROADMAP.md)).
  - Do **NOT** download, extract, split, or process any raster data.
  - Do **NOT** start `TASK 5.4` until explicit written user authorization is provided.

## 16. Final Planning Status
```text
FULL EXPORT PLANNING STATUS: COMPLETE WITH CORRECTIONS

PILOT EXPORT AUTHORIZATION STATUS: NOT APPROVED

TASK 5.4 EXECUTION STATUS: NOT STARTED
```
