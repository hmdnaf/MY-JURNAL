# Full Tiled Export Plan

## 1. Document Status
- **Document Title:** Full Tiled Export Plan
- **Target Task:** `TASK 5.4 — Run Full Tiled Export` (Preparation Only)
- **Document Date:** 3 August 2026
- **Authoritative Reference:** [docs/TASK.md](file:///h:/segFormer/docs/TASK.md)
- **Execution Authority:** **BOOKKEEPING UPDATED AFTER AUTHORIZED BATCH_04 ONLY; NEXT BATCH NOT AUTHORIZED**
- **Purpose:** Define the comprehensive, non-executable technical strategy for a safe, auditable, batched full tiled export of the 5-band Sentinel-2 and ESA WorldCover dataset over Provinsi Sulawesi Selatan.
- **Current milestone state:** M5 `PASS`; TASK 6.1 `PASS`; M6 `IN_PROGRESS`; production export artifacts `PREPARED`; batch_04 production export, local raster audit, and Gate 4 are `PASS`; batch_04 manifest rows are `AUDITED_PASS`; 5 of 55 production tiles passed; 50 production tiles remain.

## 2. Current Verified Dataset State
| Parameter | Authoritative Value | Source / Evidence |
|:---|:---|:---|
| **Study Area** | Provinsi Sulawesi Selatan, Indonesia | `FAO/GAUL/2015/level1` |
| **Export CRS** | `EPSG:3857` (Web Mercator) | [configs/data.yaml](file:///h:/segFormer/configs/data.yaml), [docs/DATASET.md](file:///h:/segFormer/docs/DATASET.md) |
| **Pixel Resolution** | `10 meters` | affine pattern `[10, 0, x_origin, 0, -10, y_origin]`; fractional projected origins are allowed |
| **Accepted Raster Stack** | `B2`, `B3`, `B4`, `B8`, `label` | 5 bands ordered (reflectance + WorldCover integer label) |
| **Export Data Type** | `Float32` | 4 bytes per pixel per band (20 bytes/pixel uncompressed) |
| **NoData Value** | `-9999` | All bands padded with `-9999` for out-of-bounds pixels |
| **Accepted Reference Sample** | `SULSEL_DATASET_SAMPLE_003.tif` | Audited benchmark from `TASK 5.3` |
| **Accepted Urban/Coastal Pilot V2** | `SULSEL_2021_SULSEL_R005_C004_S2WC_V2.tif` | Local raster exists; final pilot status `PASS` |
| **Accepted Vegetated/Mountainous Pilot V2** | `SULSEL_2021_SULSEL_R009_C004_S2WC_V2.tif` | Local raster exists; final pilot status `PASS` |
| **Accepted Low-Coverage Pilot V2** | `SULSEL_2021_SULSEL_R005_C000_S2WC_V2.tif` | Manual QGIS audit `PASS` |
| **Accepted Production Batch_04** | `logs/batch_04_raster_audit.md` | 5/5 production GeoTIFFs exported, downloaded locally, and automated local raster audit `PASS` |
| **Local Drive `H:` Free Space** | `8.578407 GiB` (`9,210,994,688 bytes`) | Batch_04 Gate-4 check recorded in `logs/batch_04_raster_audit.md` |
| **Local RAM Capacity** | `~7.35 GB` total visible (`~655 MB` free physical) | CPU-only development machine; requires windowed I/O |
| **Local GPU Capacity** | Integrated AMD Radeon (No CUDA) | Training offloaded to Google Colab GPU |

## 3. Current Grid Summary
- **Grid Script:** [gee/05_Export_Grid.js](file:///h:/segFormer/gee/05_Export_Grid.js)
- **Approved Production Tile Size:** `50000 meters` (`50 km × 50 km`)
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
- **Compressed Size Status:** Pilot compressed sizes are now available locally, but
  production-wide compression remains uncertain because it depends on each tile's
  pixel distribution, NoData padding, Float32 behavior, and LZW implementation.
- **Raw Reference Size:** Use approximately `476.84 MiB` per complete tile as a raw-size planning reference (`5000 × 5000 × 5 bands × 4 bytes = 500,000,000 bytes`).
- **Total Raw Reference:** `55 complete raw tiles` would be approximately `26.2 GiB` before format overhead. Edge tiles may be smaller only if export dimensions or empty regions differ. Pilot sizes are now measured; production batch execution still requires review of recorded sizes and available storage.

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

## 6. Historical Pilot Export Design and Verified Outcome

The design notes below are retained as the historical basis for the completed M5
pilot. They are not a statement that pilot export is still pending.

- **HISTORICAL RECOMMENDATION FOR PILOT ONLY — NOT FINAL PRODUCTION APPROVAL**
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
- **Historical Selection Rule:** Exact IDs were selected manually from validated
  grid evidence. The accepted IDs are `SULSEL_R005_C004`, `SULSEL_R009_C004`,
  and `SULSEL_R005_C000`.
- **Validation Criteria for Pilot PASS:**
  - Task completes without timeout or memory error.
  - Downloaded GeoTIFF is exactly `5000 × 5000 pixels` at `10m` pixel size.
  - Contains exactly 5 bands in order: `B2, B3, B4, B8, label`.
  - Band 5 contains exact integer categorical values (`0, 1, 2, 3, 4, 5, 7, 8`), with zero fractional numbers and zero NoData (`-9999`) across valid land pixels.
  - RGB composite (`B4, B3, B2`) displays sharp spatial detail without resampling blur.

### Verified Pilot Outcome

- Three corrected V2 pilot rasters were exported and accepted: PASS.
- All three corrected V2 rasters have final pilot audit status: PASS.
- `SULSEL_R005_C000` manual QGIS audit, including integer labels and visual
  image-label alignment: PASS.
- Full 55-tile export: IN_PROGRESS; batch_04 passed and 50 production tiles remain.

## 7. Batch Export Strategy

Current prepared production strategy:

- **Batch size:** `5 tiles per batch`
- **Number of batches:** `11`
- **Coverage:** all 55 expected production tile IDs exactly once
- **Default script batch:** `batch_01`
- **Safety:** both export authorization switches default OFF in `gee/07_Full_Export.js`
- **Rerun support:** failed tiles can be listed explicitly in `RERUN_TILE_IDS` and are written to a dedicated rerun Drive folder.

Historical comparison notes for 10-tile and 15-tile batches remain useful for
storage planning, but the prepared M6 pre-production artifacts use the more
conservative 5-tile batch rhythm.

Batch storage and risk analysis:

- Worst-case raw reference for 5 complete tiles is approximately **`2.33 GiB`**
  (`5 × 476.84 MiB`).
- Temporary download files and duplicate copies may increase peak storage usage.
- Production export is still pending explicit user authorization for every next batch after batch_04.
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
- **Google Drive Folder Convention:** Production exports use one deterministic
  Drive folder per batch, with no parent/subfolder hierarchy created by the
  script: `SegFormer_LandCover_Sulsel_Export_<batch_id>` (for example,
  `SegFormer_LandCover_Sulsel_Export_batch_04`). Targeted reruns use
  `SegFormer_LandCover_Sulsel_Export_rerun`.
- **Local Project Directory Structure (`H:\segFormer`):**
  ```text
  H:\segFormer\data\raw\full\
  ├── batch_01\
  ├── ...
  └── batch_11\
  ```
  Batch_04 is currently stored at `data/raw/full/batch_04/`. Pilot rasters
  remain separate under `data/raw/pilot/`.

## 9. Export Manifest Design
- **Manifest File Path:** `data/raw/export_manifest.csv`
- **Manifest Purpose:** define the expected 55 production outputs and serve as
  the production lifecycle ledger through the single `status` column. A row's
  status records its export/local-audit lifecycle state; status claims require
  the corresponding repository audit evidence.
- **Tile-Set Derivation:** the 55 expected tile IDs were derived from the FAO
  GAUL 2015 Level 1 source used by the GEE scripts and cross-checked against the
  accepted V2 pilot raster grid origins and pilot AOI coverage ratios. No
  boundary dataset copy is stored in the repository.
- **Initial Status for Every Row:** `EXPECTED_PENDING`
- **Row Count:** `55`
- **Approved Status Values:**
  - `EXPECTED_PENDING`: expected production raster has not yet completed the production export + local-audit lifecycle.
  - `EXPORTED_PENDING_AUDIT`: production output exists, but local production audit has not yet passed.
  - `AUDITED_PASS`: production output exists locally and automated production raster audit passed.
  - `AUDITED_FAIL`: automated production raster audit failed.
  - `QUARANTINED`: failed production raster has been deliberately quarantined and must not proceed to patch extraction.
- **Schema:**
  1. `tile_id`: unique deterministic ID (`SULSEL_R000_C000`).
  2. `row`: grid row index (`0–12`).
  3. `col`: grid column index (`0–10`).
  4. `expected_filename`: expected GeoTIFF filename.
  5. `batch_id`: assigned production batch (`batch_01` to `batch_11`).
  6. `expected_width`: `5000`.
  7. `expected_height`: `5000`.
  8. `expected_crs`: `EPSG:3857`.
  9. `expected_pixel_size_x`: `10`.
  10. `expected_pixel_size_y`: `-10`.
  11. `expected_band_count`: `5`.
  12. `expected_band_order`: `B2,B3,B4,B8,label`.
  13. `expected_dtype`: `float32`.
  14. `expected_nodata`: `-9999`.
  15. `status`: one approved status value from the manifest lifecycle vocabulary above.

Batch_04 rows are the first production rows promoted to `AUDITED_PASS` after
local raster audit. Checksums, storage checks, and manual visual evidence are
kept in batch audit records without adding manifest columns.

## 10. Validation Gates

### Gate 1 — Before Pilot Export (Historical Pre-Flight Checklist)
- **Checklist:**
  - `[ ]` Grid script `gee/05_Export_Grid.js` statically reviewed and validated.
  - `[ ]` 3 pilot tile IDs manually selected and recorded in manifest.
  - `[ ]` Zero duplicate tile IDs present.
  - `[ ]` Target file naming convention verified against schema.
  - `[ ]` Google Drive destination folder capacity confirmed (>10 GB free).
  - `[ ]` Zero production batch tiles authorized.

### Gate 2 — After Pilot Export (PASS)
- **Checklist:**
  - `[x]` All 3 pilot GEE tasks completed with status `COMPLETED`.
  - `[x]` All 3 GeoTIFF files downloaded locally and verified non-empty.
  - `[x]` Raster dimensions confirmed exactly `5000 × 5000` pixels.
  - `[x]` CRS confirmed exactly `EPSG:3857`.
  - `[x]` Band count confirmed exactly 5 (`B2, B3, B4, B8, label`).
  - `[x]` Band 5 contains exact configured integer categories or NoData (`-9999`).
  - `[x]` Zero fractional numbers found in the audited label bands.
  - `[x]` Dedicated manual QGIS label/alignment evidence confirmed for `SULSEL_R005_C000`; no dedicated `SULSEL_R009_C004` manual screenshots are claimed.
  - `[x]` Compressed pilot file sizes recorded and accepted for M5.

### Gate 3 — Before Production Batch (Production Authorization Gate)
- **Checklist:**
  - `[x]` Pilot export audit report formally approved by user (`PASS`).
  - `[x]` TASK 6.1 automated raster auditor implemented and validated.
  - `[x]` Safe production script `gee/07_Full_Export.js` initialized with both export authorization switches OFF.
  - `[x]` Client-side batch/rerun configuration checks added before any export task creation.
  - `[x]` Expected manifest `data/raw/export_manifest.csv` initialized with status `EXPECTED_PENDING`.
  - `[x]` Conservative batch size (`5 tiles / batch`) prepared.
  - `[x]` User inspected Earth Engine Console preflight evidence for batch_04.
  - `[x]` User authorized enabling batch_04 in GEE.
  - `[x]` Deterministic per-batch Google Drive folder convention verified against the production script and batch_04 output.
  - `[ ]` Local storage management and cleanup strategy approved.

Batch_04 is closed for bookkeeping only. These checked items do not authorize
any next production batch.

### Gate 4 — After Each Production Batch (Batch Verification Gate)
- **Checklist:**
  - `[x]` All 5 batch_04 GEE tasks checked as `COMPLETED`; no failures require isolation or rerun.
  - `[x]` Downloaded tile count matches batch manifest count (5 of 5).
  - `[x]` Structural audit script passed all 5 downloaded tiles (bands, dimensions, NoData).
  - `[x]` Visual QGIS spot-check completed on 2 production tiles: `SULSEL_R005_C001` and `SULSEL_R005_C004`.
  - `[x]` SHA-256 checksums computed for all 5 rasters and written to the batch audit record.
  - `[x]` Local drive `H:` free space audited (`8.578407 GiB`; >3.0 GiB buffer maintained).

Batch_04 record:

- GEE preflight: PASS
- GEE production tasks: 5/5 COMPLETED
- Google Drive completeness: PASS
- Local download completeness: PASS
- Automated local raster audit: PASS
- Manifest status: AUDITED_PASS
- Invalid label pixels: 0
- Fractional labels: none
- All-NoData tiles: none
- Passed production tiles: 5 of 55
- Remaining production tiles: 50
- Audit record: `logs/batch_04_raster_audit.md`
- SHA-256 checksums: CAPTURED for 5 of 5 local rasters
- Local free-space gate: PASS (`9,210,994,688` bytes; `8.578407 GiB`)
- Production QGIS visual evidence: present under `docs/evidence/batch04_qgis_spotcheck/`
- Gate-4 visual status: PASS
- Human spot-check tiles: `SULSEL_R005_C001` and `SULSEL_R005_C004`
- Overall Gate 4: PASS for batch_04 only

### Gate 5 — Full Export Completion (Final Acceptance Gate)
- **Checklist:**
  - `[ ]` All required production rows are resolved under the approved `status` lifecycle.
  - `[ ]` Every valid production row has `status = AUDITED_PASS`.
  - `[ ]` Zero unexplained `EXPECTED_PENDING` rows remain.
  - `[ ]` Zero unhandled `AUDITED_FAIL` rows remain.
  - `[ ]` Every `QUARANTINED` row, if an exclusion is approved, is explicitly documented.
  - `[ ]` Zero duplicate or missing approved tile IDs across the entire dataset.
  - `[ ]` Final dataset audit report completed and signed off.

## 11. Storage Management
- **Local Storage Constraint:** Project drive `H:\segFormer` has `8.578407 GiB` free space at the batch_04 Gate-4 check. 55 complete raw tiles represent `~26.2 GiB` raw reference before compression or format overhead.
- **Storage Management Rules:**
  1. **Batch Download Buffer:** Download no more than 1 batch (`5 tiles` ≈ `2.33 GiB` worst-case raw reference) at a time from Google Drive.
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
| **4. Insufficient Local Capacity** | Medium | High | Enforce 5-tile batch downloads; never duplicate `.zip` and `.tif` files. | PowerShell disk audit shows `H:` free space `<= 3.0 GiB`. | Pause the next batch and request storage-management guidance. |
| **5. Duplicated Task** | Low | Low | Enforce deterministic `SULSEL_R000_C000` tile IDs and track via CSV manifest. | Manifest check detects duplicate ID or existing filename. | Abort duplicate GEE task; keep first validated copy. |
| **6. Missing Tile** | Low | Medium | Cross-reference completed Drive files against `143-cell` grid and `55-tile` retained list. | Manifest validation script reports missing `tile_id`. | Identify missing row/col from manifest and submit targeted GEE export. |
| **7. Corrupted Download** | Low | Medium | Compute and record SHA-256 checksums immediately upon download. | `rasterio.open()` throws `RasterioIOError` or checksum mismatch. | Re-download file from Drive; if Drive file corrupted, re-export in GEE. |
| **8. Wrong CRS** | Low | High | Hardcode `EXPORT_CRS = 'EPSG:3857'` in export script constants. | Automated metadata check detects non-3857 EPSG code. | Reject tile; fix CRS parameter in script and re-export batch. |
| **9. Wrong Band Order** | Low | High | Explicitly select `.select(['B2','B3','B4','B8','label'])` before export. | QGIS audit shows label in Band 1 or Band 4. | Reject batch; fix `.select()` order in GEE script and re-export. |
| **10. Fractional Label** | Low | High | Prevent bilinear/cubic resampling on Band 5; use nearest-neighbor or raw integers. | Python audit finds floating-point non-integers in Band 5. | Reject batch; fix remapping/resampling logic in GEE and re-export. |
| **11. RGB Blur** | Low | High | Perform bilinear resampling on Sentinel-2 *before* compositing at 10m resolution. | QGIS visual check reveals pixelated or smeared RGB detail. | Reject batch; verify the production `region + dimensions + CRS` export contract and preprocessing. Fractional projected origins are accepted; origin `0,0` is not required. |
| **12. Grid Mismatch** | Low | Medium | Construct all export geometries directly from `gee/05_Export_Grid.js` tile boundaries. | Visual check shows gaps or overlaps between adjacent tiles. | Re-verify grid projection transform and regenerate export task list. |
| **13. Low AOI Coverage Tile** | Medium | Low | Flag tiles with `aoi_coverage_ratio < 0.01` in manifest for QA review. | Console diagnostic prints coverage `< 0.01`. | Inspect in QGIS; retain if containing island/coastal land; exclude if empty sea. |
| **14. Google Earth Engine Quota** | Low | Medium | Enforce 5-tile batches; do not submit uncontrolled concurrent tasks to queue. | GEE API returns `Too many concurrent tasks` or `User memory limit`. | Pause task submission until queue drains; resume batch in 15 minutes. |
| **15. Manual Task-Management Errors** | Medium | Medium | Use CSV manifest `data/raw/export_manifest.csv` as the production lifecycle ledger. | Discrepancy between Drive file list and local manifest rows. | Perform read-only reconciliation before any reviewed lifecycle-status update. |

## 13. Historical Pilot Recommendation and Result

- **HISTORICAL RECOMMENDATION FOR PILOT ONLY — NOT FINAL PRODUCTION APPROVAL**
- The recommended **3-Tile Pilot Export (`Pilot Batch 00`)** used the provisional `50,000 meters` tile size and is now complete.
- The 3 pilot tiles represented:
  1. Coastal urban density (Makassar/Maros).
  2. Mountainous interior forest/cropland (Enrekang/Toraja).
  3. Low-coverage coastal/island boundary.
- All three accepted V2 pilot GeoTIFFs passed the M5 pilot validation gate.
  This does not authorize or complete a production batch.

## 14. Decisions Requiring User Approval
The pilot tile-size test and three pilot IDs are closed historical decisions for
M5. Before any production export batch is enabled in GEE, the user must still
formally review and approve the production decisions below:

1. **Batch Execution:** Approve the specific `ACTIVE_BATCH_ID` or `RERUN_TILE_IDS`.
2. **Human Preflight Confirmation:** Inspect Console evidence while both switches are `false`, then explicitly authorize both `ENABLE_PRODUCTION_EXPORT_TASKS` and `PREFLIGHT_CONFIRMED_BY_HUMAN` before task creation.
3. **File Naming & Drive Convention:** Approve the `SULSEL_2021_<TILE_ID>_S2WC_V1.tif` naming convention and deterministic per-batch Google Drive folder convention.
4. **Storage Management Plan:** Approve the local storage management rules for drive `H:` and recheck the >3.0 GiB buffer before every batch.
5. **Low-Coverage QA Threshold:** Approve the provisional `aoi_coverage_ratio < 0.01` review threshold.

## 15. Production All-NoData Audit Policy

For production M6 auditing:

- low valid coverage alone must not fail a tile;
- an all-NoData raw production tile must be classified for quarantine/review;
- an all-NoData raw production tile must not proceed to patch creation;
- production audit should call `src/data/audit_raster.py` with
  `--fail-on-all-nodata`.

## 16. Historical Pre-Approval Safety Scope

This section records the safety boundary used during planning. The current M5
documentation-closure request explicitly authorizes status-document edits only;
it did not authorize any full export or raster processing. The current M6
pre-production task authorizes creation of `gee/07_Full_Export.js` and
`data/raw/export_manifest.csv`, but still does not authorize enabling or running
GEE export tasks.

- **STRICT SAFETY ENFORCEMENT:**
  - Do **NOT** execute Google Earth Engine code.
  - Do **NOT** create or submit any `Export.image.toDrive`, `Export.image.toAsset`, or `Export.table` task.
  - Do **NOT** create export tasks from any full-export script.
  - Do **NOT** modify any configuration file ([configs/data.yaml](file:///h:/segFormer/configs/data.yaml), [docs/DATASET.md](file:///h:/segFormer/docs/DATASET.md), [docs/TASK.md](file:///h:/segFormer/docs/TASK.md), [docs/ROADMAP.md](file:///h:/segFormer/docs/ROADMAP.md)).
  - Do **NOT** download, extract, split, or process any raster data.
  - Do **NOT** start `TASK 5.4` until explicit written user authorization is provided.

## 17. Final Planning Status
```text
FULL EXPORT PLANNING STATUS: PRE-PRODUCTION ARTIFACTS PREPARED; BATCH_04 BOOKKEEPING CLOSED

THREE-PILOT V2 EXPORT STATUS: COMPLETED

FINAL THREE-PILOT V2 AUDIT STATUS: PASS

TASK 6.1 AUTOMATED RASTER AUDITOR STATUS: PASS

BATCH_04 PRODUCTION EXPORT STATUS: COMPLETED

BATCH_04 LOCAL RASTER AUDIT STATUS: PASS

BATCH_04 MANIFEST STATUS: AUDITED_PASS

BATCH_04 GATE-4 STATUS: PASS

PASSED PRODUCTION TILES: 5 OF 55

REMAINING PRODUCTION TILES: 50

PRODUCTION TILE SIZE STATUS: APPROVED_FOR_PRODUCTION

PRODUCTION EXPORT SCRIPT STATUS: PREPARED; BOTH SAFETY SWITCHES OFF

PRODUCTION MANIFEST STATUS: 5 AUDITED_PASS; 50 EXPECTED_PENDING

TASK 5.4 EXECUTION STATUS: IN_PROGRESS; BATCH_04 PASS; 50 PRODUCTION TILES REMAIN

M5 STATUS: PASS

M6 STATUS: IN_PROGRESS
```
