# TASK.md

## Project Task Orchestration

**Project:** Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform GEE  
**Version:** 3.0  
**Primary Reference:** `docs/PRD.md`  
**Execution Mode:** Sequential task execution with validation gates  
**Primary AI Agent:** Antigravity IDE  
**Current Project Stage:** AOI preparation in Google Earth Engine  

---

# 1. Global Execution Rules

These rules apply to every task.

1. Read `PRD.md`, `TASK.md`, and `ROADMAP.md` before starting.
2. Work on **only one active task at a time**.
3. Do not start the next task until the current task status is `PASS`.
4. Do not change the research area from **Provinsi Sulawesi Selatan** to Kabupaten Maros or another region.
5. Do not add new datasets without explicit user approval.
6. Do not delete raw data, model checkpoints, credentials, environments, or project files without explicit confirmation.
7. Do not hard-code personal paths, access tokens, or credentials.
8. Every script must contain:
   - purpose;
   - input;
   - output;
   - configuration;
   - validation;
   - error handling where relevant.
9. Every task must end with:
   - changed files;
   - commands or actions performed;
   - validation result;
   - status `PASS` or `FAIL`;
   - next recommended action.
10. If validation fails:
    - stop execution;
    - explain the cause;
    - propose a correction;
    - repair the same task;
    - rerun validation.
11. Never mark a task as `PASS` based only on code inspection when runtime validation is possible.
12. Browser-only tasks in Google Earth Engine must be marked `HUMAN_ACTION_REQUIRED` when the IDE cannot perform the browser interaction directly.
13. Large GEE exports must not be started before a sample export has passed validation.
14. Local processing must use windowed or batch reading and must not load province-scale rasters fully into 8 GB RAM.
15. Keep an execution log in `logs/task_execution.log`.

---

# 2. Task Status Definitions

| Status | Meaning |
|---|---|
| `TODO` | Not started |
| `IN_PROGRESS` | Currently being executed |
| `HUMAN_ACTION_REQUIRED` | Requires user interaction outside Antigravity IDE |
| `BLOCKED` | Cannot continue due to unmet dependency |
| `FAIL` | Validation failed |
| `PASS` | Task completed and validated |
| `SKIPPED` | Intentionally omitted with documented approval |

---

# 3. Required Project Structure

```text
SegFormer-LandCover/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── TASK.md
│   ├── ROADMAP.md
│   ├── DATASET.md
│   └── VALIDATION.md
├── configs/
│   ├── data.yaml
│   ├── gee.yaml
│   └── training.yaml
├── gee/
│   ├── 01_AOI.js
│   ├── 02_Sentinel2.js
│   ├── 03_WorldCover.js
│   ├── 04_Export_Grid.js
│   └── utils.js
├── src/
│   ├── data/
│   │   ├── audit_raster.py
│   │   ├── build_patches.py
│   │   ├── create_spatial_split.py
│   │   └── dataset.py
│   ├── models/
│   │   └── segformer.py
│   ├── training/
│   │   ├── train.py
│   │   └── losses.py
│   ├── evaluation/
│   │   ├── metrics.py
│   │   └── evaluate.py
│   └── inference/
│       ├── predict_tiles.py
│       └── mosaic_predictions.py
├── notebooks/
├── data/
│   ├── raw/
│   ├── interim/
│   ├── processed/
│   ├── patches/
│   └── splits/
├── models/
├── outputs/
│   ├── metrics/
│   ├── figures/
│   ├── predictions/
│   └── maps/
├── logs/
└── tests/
```

---

# PHASE 0 — Documentation and Safety Baseline

## TASK 0.1 — Verify Project Scope

**Status:** `PASS`

### Objective
Confirm that all active documents use the same project scope.

### Inputs
- `docs/PRD.md`
- `docs/TASK.md`
- `docs/ROADMAP.md`
- approved research title

### AI Actions
1. Search all project documentation for:
   - `Maros`
   - `Kabupaten Maros`
   - `Pulau Sulawesi`
   - `seluruh Indonesia`
2. Confirm the official scope is:
   - Provinsi Sulawesi Selatan;
   - Sentinel-2;
   - ESA WorldCover v200;
   - SegFormer-B0;
   - GEE preprocessing;
   - Google Colab training.
3. Create `logs/scope_audit.md`.

### Output
- `logs/scope_audit.md`

### Acceptance Criteria
- No active requirement incorrectly uses Kabupaten Maros.
- No unapproved primary dataset is included.
- Scope matches the approved title.

### Validation Command
```bash
grep -RniE "Kabupaten Maros|Pulau Sulawesi|seluruh Indonesia" docs/ gee/ src/ configs/ || true
```

### Validation Prompt for Antigravity
```text
Review TASK 0.1. Compare PRD.md, TASK.md, ROADMAP.md, and the approved title.
Report every scope inconsistency. The official study area must be Provinsi
Sulawesi Selatan. Return PASS only if no conflicting active requirement remains.
Do not silently edit the project scope.
```

---

## TASK 0.2 — Create Safe Ignore Rules

**Status:** `PASS`

### Objective
Prevent large data, secrets, and temporary files from being committed.

### AI Actions
Create `.gitignore` containing rules for:
- `data/raw/`
- `data/interim/`
- `data/processed/`
- `data/patches/`
- `models/`
- `outputs/`
- `.env`
- credentials and tokens;
- Python cache;
- Jupyter checkpoints;
- temporary raster files.

### Output
- `.gitignore`

### Acceptance Criteria
- Data and credential folders are ignored.
- Source code and documentation remain trackable.

### Validation Prompt
```text
Review .gitignore for this geospatial deep-learning project.
Confirm that large raster datasets, model checkpoints, secrets, temporary files,
Python cache, and notebook checkpoints are excluded without excluding source code,
configuration templates, or documentation. Return PASS or FAIL.
```

---

# PHASE 1 — Local Project Environment

## TASK 1.1 — Create Project Folder Structure

**Status:** `PASS`

### Objective
Create the repository layout defined in this document.

### AI Actions
1. Create all required folders.
2. Create placeholder `.gitkeep` files where needed.
3. Do not create large data files.
4. Record the final tree.

### Output
- complete project folder structure;
- `logs/project_tree.txt`.

### Acceptance Criteria
- Every required folder exists.
- No unexpected duplicate folder exists.
- `docs/PRD.md`, `docs/TASK.md`, and `docs/ROADMAP.md` are present.

### Validation Command
```bash
python - <<'PY'
from pathlib import Path

required = [
    "docs", "configs", "gee", "src/data", "src/models",
    "src/training", "src/evaluation", "src/inference",
    "notebooks", "data/raw", "data/interim", "data/processed",
    "data/patches", "data/splits", "models", "outputs/metrics",
    "outputs/figures", "outputs/predictions", "outputs/maps",
    "logs", "tests"
]

missing = [p for p in required if not Path(p).exists()]
print("MISSING:", missing)
raise SystemExit(1 if missing else 0)
PY
```

### Validation Prompt
```text
Validate TASK 1.1 by checking the required project tree.
List missing, duplicated, or incorrectly named folders.
Return PASS only if the exact required structure exists.
```

---

## TASK 1.2 — Audit Local Software

**Status:** `TODO`

### Objective
Record the local development environment without installing heavy GPU packages unnecessarily.

### Required Checks
- Python version;
- Git;
- VS Code or Antigravity IDE;
- QGIS;
- available disk space;
- RAM;
- operating system.

### AI Actions
1. Detect installed software where possible.
2. Create `logs/environment_audit.md`.
3. Do not install CUDA locally.
4. Do not attempt local SegFormer training.

### Acceptance Criteria
- Python is available.
- Disk and RAM constraints are documented.
- Missing optional tools are clearly identified.

### Validation Prompt
```text
Review the local environment audit.
Confirm that the machine is treated as a development and lightweight preprocessing
device only. Confirm that CUDA training is not required locally.
Return PASS if all relevant versions and limitations are recorded.
```

---

## TASK 1.3 — Create Python Environment Specification

**Status:** `TODO`

### Objective
Define dependencies reproducibly.

### Output
- `requirements.txt`
- optional `environment.yml`
- `configs/environment_notes.md`

### Minimum Packages
- numpy
- pandas
- rasterio
- geopandas
- shapely
- pyproj
- scikit-learn
- matplotlib
- pyyaml
- tqdm
- pillow
- torch
- torchvision
- transformers
- evaluate or equivalent metric utilities

### Rules
- Pin major versions when compatibility matters.
- Do not install GPU-specific CUDA wheels locally unless explicitly requested.
- Training dependencies may be installed in Colab.

### Validation Prompt
```text
Review dependency files for reproducibility and compatibility.
Confirm geospatial packages, PyTorch, Transformers, configuration tools, and
evaluation libraries are covered. Flag incompatible or unnecessary packages.
Return PASS only if the dependency specification is coherent.
```

---

# PHASE 2 — Google Earth Engine AOI

## TASK 2.1 — Create AOI Script for South Sulawesi

**Status:** `NEXT`

### Objective
Create and validate the official AOI for Provinsi Sulawesi Selatan.

### Execution Location
Google Earth Engine Code Editor.

### Input Dataset
Preferred initial source:
```text
FAO/GAUL/2015/level1
```

### Required File
- `gee/01_AOI.js`

### Required Script Behavior
1. Load GAUL level 1.
2. Inspect available province-name attributes.
3. Filter Indonesia.
4. Filter South Sulawesi using the actual attribute value.
5. Print feature count.
6. Print selected feature properties.
7. center the map on the AOI;
8. display the AOI boundary;
9. display the AOI fill with transparent styling;
10. stop with a meaningful warning if feature count is not exactly one.

### Starter Script
```javascript
// ============================================================
// File: gee/01_AOI.js
// Purpose: Select and validate South Sulawesi Province AOI
// Source: FAO GAUL 2015 Level 1
// ============================================================

var admin1 = ee.FeatureCollection('FAO/GAUL/2015/level1');

// Inspect available data for Indonesia first.
var indonesia = admin1.filter(ee.Filter.eq('ADM0_NAME', 'Indonesia'));
print('Indonesia level-1 features:', indonesia.size());
print('Sample Indonesia feature:', indonesia.first());

// IMPORTANT:
// After checking the Console, verify the exact ADM1_NAME value.
// Common values may be in English, but do not assume before inspection.
var aoi = indonesia.filter(
  ee.Filter.eq('ADM1_NAME', 'Sulawesi Selatan')
);

print('Selected AOI feature count:', aoi.size());
print('Selected AOI:', aoi);
print('Selected AOI properties:', aoi.first());

Map.centerObject(aoi, 7);

var boundaryStyle = {
  color: 'red',
  fillColor: '00000000',
  width: 2
};

Map.addLayer(aoi.style(boundaryStyle), {}, 'South Sulawesi AOI');
```

### Human Actions
1. Open GEE Code Editor.
2. Create a new script named `01_AOI`.
3. Paste the script.
4. Run it.
5. Inspect Console output.
6. If count is `0`, inspect province names and update `ADM1_NAME`.
7. Save the working script.
8. Copy the final script into local `gee/01_AOI.js`.

### Acceptance Criteria
- Console reports exactly one selected feature.
- The displayed boundary is South Sulawesi.
- No unrelated province is selected.
- Script runs without error.
- The final filter value is based on inspected properties, not guesswork.

### Validation Prompt
```text
Review the runtime result of gee/01_AOI.js.

Validate:
1. The source is FAO GAUL Level 1.
2. ADM0_NAME is Indonesia.
3. Exactly one ADM1 feature is selected.
4. The selected feature corresponds to Provinsi Sulawesi Selatan.
5. The geometry is displayed correctly on the map.
6. No Sentinel-2 or WorldCover processing is added yet.

Return PASS only when all six conditions are satisfied.
If feature count is zero or greater than one, return FAIL and explain how to
inspect the correct ADM1_NAME value.
```

### Failure Handling
- `count = 0`: print all `ADM1_NAME` values for Indonesia and choose the exact stored name.
- `count > 1`: add a stricter filter.
- map empty: inspect geometry and map zoom.
- permission error: verify active Earth Engine project.

---

## TASK 2.2 — Export or Save AOI Reference

**Status:** `TODO`

### Objective
Make the validated AOI reusable.

### Options
- Keep AOI generated from GAUL in every GEE script; or
- export/upload it as an Earth Engine Asset.

### Rule
Do not create an Asset unless reuse benefits justify it. The source and version must remain documented.

### Output
- reusable AOI code or asset ID;
- `docs/DATASET.md` AOI entry.

### Acceptance Criteria
- AOI can be loaded in a fresh script.
- Feature count remains one.
- source and version are documented.

### Validation Prompt
```text
Open a fresh Earth Engine script and load the AOI using the selected reuse method.
Validate that exactly one South Sulawesi feature loads without relying on variables
from another script. Return PASS or FAIL.
```

---

# PHASE 3 — Sentinel-2 Sample Pipeline

## TASK 3.1 — Define Data Configuration

**Status:** `TODO`

### Objective
Create central configuration for date range, cloud threshold, bands, scale, and CRS.

### Inputs Requiring User/Dosen Confirmation
- start date;
- end date;
- target year;
- final export CRS.

### Outputs
- `configs/gee.yaml`
- configuration block in `gee/02_Sentinel2.js`

### Required Fields
```yaml
region_name: South Sulawesi
start_date: TBD
end_date: TBD
cloud_percentage: 20
bands:
  - B2
  - B3
  - B4
  - B8
export_scale: 10
export_crs: TBD
```

### Acceptance Criteria
- Unknown decisions remain `TBD`.
- No arbitrary final dates are silently chosen.
- all parameters exist in one configuration location.

### Validation Prompt
```text
Review the GEE data configuration.
Confirm that study area, date range, cloud threshold, selected bands, export scale,
and CRS are explicit. Return FAIL if unresolved parameters are silently replaced
with assumptions.
```

---

## TASK 3.2 — Load and Inspect Sentinel-2 Collection

**Status:** `TODO`

### Objective
Load Sentinel-2 SR Harmonized and inspect collection availability.

### Dataset
```text
COPERNICUS/S2_SR_HARMONIZED
```

### Required Behavior
- filter AOI;
- filter date;
- filter metadata cloud percentage;
- print image count;
- print first image band names;
- display one sample image.

### Output
- `gee/02_Sentinel2.js`

### Acceptance Criteria
- collection size is greater than zero;
- required bands exist;
- sample image displays;
- no export is started.

### Validation Prompt
```text
Validate the Sentinel-2 collection runtime result.
Confirm collection size is greater than zero, required bands exist, the AOI is
South Sulawesi, and a sample image is displayed. Do not accept a script that
starts a large export at this stage.
```

---

## TASK 3.3 — Implement Pixel-Level Cloud Masking

**Status:** `TODO`

### Objective
Mask clouds and cloud shadows at pixel level.

### Allowed Initial Approaches
- Sentinel-2 SCL-based masking;
- Cloud Score+ integration.

### Required Documentation
- classes or thresholds removed;
- reason for the method;
- known limitations.

### Output
- cloud mask function in `gee/utils.js`;
- update to `gee/02_Sentinel2.js`.

### Acceptance Criteria
- masked and unmasked layers can be compared;
- cloud and shadow reduction is visually evident;
- valid land pixels are not excessively removed;
- metadata cloud filter is not presented as the only mask.

### Validation Prompt
```text
Compare the unmasked and masked Sentinel-2 layers.
Confirm that cloud and cloud-shadow pixels are reduced, valid land pixels remain,
and the method is explicitly documented. Return PASS only after visual and
code-level validation.
```

---

## TASK 3.4 — Create Median Composite

**Status:** `TODO`

### Objective
Create a representative cloud-reduced composite.

### Required Behavior
- apply cloud mask first;
- select approved bands;
- compute median;
- clip to AOI;
- print projection information;
- display RGB composite.

### Acceptance Criteria
- composite exists;
- AOI is correctly clipped;
- no obvious unmasked cloud dominates;
- band list is correct.

### Validation Prompt
```text
Review the median composite result.
Validate processing order: filter → cloud mask → band selection → median → clip.
Confirm AOI boundary, band count, and visual plausibility. Return PASS or FAIL.
```

---

# PHASE 4 — ESA WorldCover Label Pipeline

## TASK 4.1 — Load and Inspect ESA WorldCover

**Status:** `TODO`

### Objective
Load the reference land-cover label.

### Dataset
```text
ESA/WorldCover/v200
```

### Required Behavior
- load map band;
- clip to AOI;
- print band names;
- print projection;
- display categorical palette;
- inspect unique class values in the AOI.

### Output
- `gee/03_WorldCover.js`

### Acceptance Criteria
- raster loads without error;
- label remains integer categorical data;
- unique values match defined WorldCover classes;
- AOI is correctly clipped.

### Validation Prompt
```text
Validate ESA WorldCover for South Sulawesi.
Confirm the label is categorical integer data, clipped to the AOI, and contains
only documented WorldCover values. Return FAIL if bilinear interpolation is used.
```

---

## TASK 4.2 — Define Label Remapping

**Status:** `TODO`

### Objective
Map original WorldCover codes to contiguous training indices.

### Output
- remapping table in `docs/DATASET.md`;
- remapping code in GEE or Python;
- `configs/data.yaml`.

### Acceptance Criteria
- every present original code maps to exactly one training index;
- NoData/ignore value is explicit;
- mapping is reversible for visualization.

### Validation Prompt
```text
Review the WorldCover class remapping.
Confirm that original class codes map to contiguous integer indices, ignore_index
is explicit, and a reverse mapping exists for map legends. Return PASS or FAIL.
```

---

# PHASE 5 — Grid Alignment and Sample Export

## TASK 5.1 — Decide Export Projection and Grid

**Status:** `TODO`

### Objective
Define a meter-based raster grid shared by image and label.

### Required Checks
- projection uses meter units;
- scale is 10 m;
- image and label share projection;
- nearest-neighbor behavior is used for labels;
- affine transform is consistent.

### Output
- final values in `configs/gee.yaml`;
- documentation in `docs/DATASET.md`.

### Acceptance Criteria
- CRS is not left `TBD`;
- selection is documented;
- label is not resampled with bilinear/cubic interpolation.

### Validation Prompt
```text
Review the proposed export CRS, scale, and grid.
Confirm meter units, 10 m target resolution, consistent alignment, and nearest
neighbor treatment for categorical labels. Return PASS or FAIL with technical reasons.
```

---

## TASK 5.2 — Create Export Grid

**Status:** `TODO`

### Objective
Divide South Sulawesi into manageable export tiles.

### Output
- `gee/04_Export_Grid.js`;
- grid layer with tile IDs;
- tile metadata export if needed.

### Required Fields per Tile
- `tile_id`;
- geometry;
- optional row and column;
- area.

### Acceptance Criteria
- grid covers the AOI;
- tile IDs are unique;
- tiles outside AOI are removed or clipped;
- tile dimensions are compatible with storage limits.

### Validation Prompt
```text
Validate the export grid.
Confirm full AOI coverage, unique tile IDs, no uncontrolled duplicate tiles, and
manageable tile dimensions. Return PASS or FAIL.
```

---

## TASK 5.3 — Export One Sample Image-Label Pair

**Status:** `TODO`

### Objective
Test the full export configuration before province-scale export.

### Output
- one Sentinel-2 sample GeoTIFF;
- one WorldCover sample GeoTIFF;
- matching tile ID.

### Required Naming
```text
S2_SULSEL_TILE_TEST.tif
WC_SULSEL_TILE_TEST.tif
```

### Acceptance Criteria
- both exports complete;
- same width and height;
- same CRS;
- same resolution;
- same transform;
- files open in QGIS or Rasterio;
- label values remain categorical.

### Local Validation Command
```bash
python src/data/audit_raster.py \
  --image data/raw/S2_SULSEL_TILE_TEST.tif \
  --label data/raw/WC_SULSEL_TILE_TEST.tif
```

### Validation Prompt
```text
Audit the sample image-label pair.
Compare CRS, transform, bounds, width, height, resolution, NoData, band count,
data type, and label unique values. Return PASS only if the pair is pixel-aligned.
Do not start the full export if this task fails.
```

---

## TASK 5.4 — Run Full Tiled Export

**Status:** `TODO`

### Objective
Export all approved tiles after sample validation.

### Human Action Required
The user starts and monitors GEE Tasks.

### AI Responsibilities
- generate export code;
- ensure deterministic naming;
- generate expected tile manifest;
- later compare completed files against manifest.

### Output
- raw Sentinel-2 tiles;
- raw WorldCover tiles;
- `data/raw/export_manifest.csv`.

### Acceptance Criteria
- every image tile has one label tile;
- failed exports are listed;
- no duplicated tile IDs;
- manifest matches downloaded files.

### Validation Prompt
```text
Compare the expected export manifest with downloaded files.
Report missing image tiles, missing label tiles, duplicate IDs, zero-byte files,
and unexpected names. Return PASS only when every expected pair is complete.
```

---

# PHASE 6 — Local Raster Audit

## TASK 6.1 — Implement Raster Pair Auditor

**Status:** `TODO`

### Objective
Build a reusable script that verifies exported image-label pairs.

### Output
- `src/data/audit_raster.py`
- tests in `tests/test_audit_raster.py`

### Required Checks
- readable file;
- CRS;
- transform;
- bounds;
- width and height;
- resolution;
- band count;
- data type;
- NoData;
- unique label values;
- image-label alignment.

### Acceptance Criteria
- script exits `0` for valid pairs;
- script exits non-zero for invalid pairs;
- produces a human-readable report.

### Validation Prompt
```text
Review and execute audit_raster.py against one valid pair and one deliberately
invalid test fixture. Return PASS only if it accepts the valid pair and rejects
the invalid pair with an informative message.
```

---

## TASK 6.2 — Audit All Raw Tiles

**Status:** `TODO`

### Objective
Validate all exported data before patch extraction.

### Output
- `logs/raw_raster_audit.csv`
- `logs/raw_raster_audit_summary.md`

### Acceptance Criteria
- all pairs checked;
- invalid pairs quarantined;
- no invalid pair proceeds to patch creation.

### Validation Prompt
```text
Review the complete raw-raster audit.
Return PASS only if every approved tile pair is readable, aligned, and contains
valid categorical labels. List quarantined tiles separately.
```

---

# PHASE 7 — Patch Dataset Construction

## TASK 7.1 — Implement Patch Builder

**Status:** `TODO`

### Objective
Create aligned 256×256 image-label patches using windowed reading.

### Output
- `src/data/build_patches.py`
- patch metadata CSV;
- tests.

### Functional Requirements
- windowed raster reading;
- configurable patch size;
- configurable stride;
- preserve image-label alignment;
- skip all-NoData patches;
- record source tile and coordinates;
- do not load full province raster into RAM.

### Acceptance Criteria
- image and label patch counts match;
- patch dimensions are correct;
- metadata includes source tile and spatial window;
- memory use remains bounded.

### Validation Prompt
```text
Run the patch builder on the sample tile.
Validate image-label count, shape, alignment, metadata, NoData handling, and
memory behavior. Return PASS or FAIL.
```

---

## TASK 7.2 — Validate Patch Labels

**Status:** `TODO`

### Objective
Ensure labels contain only valid contiguous class indices.

### Output
- `logs/patch_label_audit.csv`

### Acceptance Criteria
- no unexpected class index;
- ignore index handled consistently;
- no corrupted patch;
- class pixel distribution is reported.

### Validation Prompt
```text
Audit every generated label patch.
Confirm only configured class indices and ignore_index are present.
Report per-class pixel counts and corrupted files. Return PASS only if valid.
```

---

## TASK 7.3 — Create Spatial Train/Validation/Test Split

**Status:** `TODO`

### Objective
Prevent spatial leakage between splits.

### Output
- `src/data/create_spatial_split.py`
- `data/splits/train.csv`
- `data/splits/val.csv`
- `data/splits/test.csv`
- split map visualization.

### Rules
- split by tile or spatial zone;
- do not randomly distribute neighboring patches without control;
- target initial ratio 70/15/15;
- preserve class coverage where practical.

### Acceptance Criteria
- no patch ID appears in more than one split;
- no source spatial unit is unintentionally shared;
- split ratios are reported;
- class distribution is reported.

### Validation Prompt
```text
Validate spatial splitting.
Check duplicate IDs, spatial-unit overlap, split ratios, and class coverage.
Return PASS only when no leakage is detected.
```

---

# PHASE 8 — DataLoader and Model Preparation

## TASK 8.1 — Implement Dataset Class

**Status:** `TODO`

### Objective
Create a PyTorch dataset for image-label patches.

### Output
- `src/data/dataset.py`
- unit tests.

### Required Features
- load configured input bands;
- normalize image channels;
- load integer masks;
- apply synchronized augmentation;
- support ignore index;
- return tensor shapes expected by SegFormer.

### Acceptance Criteria
- image and label transformations stay synchronized;
- label interpolation uses nearest neighbor;
- output tensor types and shapes are correct.

### Validation Prompt
```text
Load several samples through the dataset class.
Validate tensor shape, dtype, value range, synchronized augmentation, and mask
integrity. Return PASS or FAIL.
```

---

## TASK 8.2 — Implement SegFormer-B0 Wrapper

**Status:** `TODO`

### Objective
Initialize the model with the configured number of classes and input channels.

### Output
- `src/models/segformer.py`

### Baseline
- RGB input: B4, B3, B2;
- pretrained SegFormer-B0;
- configured `num_labels`.

### Acceptance Criteria
- forward pass succeeds;
- logits dimensions match expected class count and spatial behavior;
- parameter count is logged;
- input-channel strategy is documented.

### Validation Prompt
```text
Run a forward-pass smoke test using a small batch.
Confirm input shape, logits shape, class count, finite values, and parameter count.
Return PASS only if no NaN or shape error occurs.
```

---

# PHASE 9 — Training Pipeline

## TASK 9.1 — Create Training Configuration

**Status:** `TODO`

### Output
- `configs/training.yaml`

### Required Fields
- seed;
- epochs;
- batch size;
- learning rate;
- optimizer;
- weight decay;
- scheduler;
- loss function;
- number of classes;
- ignore index;
- input bands;
- checkpoint path;
- early stopping settings.

### Acceptance Criteria
- no important parameter is hard-coded only in Python;
- configuration can be logged and copied with checkpoint.

### Validation Prompt
```text
Review training.yaml for completeness and internal consistency.
Confirm class count, input channels, loss settings, paths, and reproducibility
parameters agree with PRD.md and data.yaml. Return PASS or FAIL.
```

---

## TASK 9.2 — Implement Training Script

**Status:** `TODO`

### Objective
Train SegFormer with logging and checkpointing.

### Output
- `src/training/train.py`
- `src/training/losses.py`

### Required Behavior
- deterministic seed;
- train and validation loops;
- mixed precision when available;
- gradient handling;
- logging;
- best checkpoint by validation mIoU;
- last checkpoint;
- resume support;
- clean failure messages.

### Acceptance Criteria
- one-epoch smoke test completes;
- loss is finite;
- checkpoint is written;
- validation metric is calculated.

### Validation Prompt
```text
Execute a one-epoch smoke test on a small subset.
Confirm finite loss, successful backward pass, metric calculation, checkpoint
creation, and absence of data leakage. Return PASS before full training.
```

---

## TASK 9.3 — Full Training in Google Colab

**Status:** `TODO`

### Objective
Train the approved experiment on GPU cloud.

### Human Action Required
The user may need to start the Colab runtime and mount storage.

### Output
- `models/best_model.pth`
- `models/last_model.pth`
- training log;
- saved configuration;
- training curves.

### Acceptance Criteria
- training completes or stops through documented early stopping;
- no NaN;
- best checkpoint exists;
- metrics and configuration are saved.

### Validation Prompt
```text
Review the complete training run.
Check loss curves, validation mIoU, checkpoint integrity, configuration snapshot,
runtime errors, and signs of severe overfitting. Return PASS or FAIL.
```

---

# PHASE 10 — Evaluation

## TASK 10.1 — Implement Metrics

**Status:** `TODO`

### Output
- `src/evaluation/metrics.py`
- unit tests.

### Metrics
- Overall Accuracy;
- per-class Precision;
- per-class Recall;
- per-class F1;
- per-class IoU;
- mIoU;
- confusion matrix.

### Acceptance Criteria
- ignore index is handled;
- absent classes are handled without misleading values;
- tests use known toy arrays.

### Validation Prompt
```text
Run metric tests on hand-computed toy examples.
Confirm every metric matches the expected value and ignore_index is handled.
Return PASS or FAIL.
```

---

## TASK 10.2 — Evaluate on Test Split

**Status:** `TODO`

### Objective
Evaluate only the held-out test data.

### Output
- `outputs/metrics/metrics_summary.csv`
- `outputs/metrics/class_metrics.csv`
- `outputs/figures/confusion_matrix.png`
- qualitative prediction figures.

### Acceptance Criteria
- no test sample used during training;
- all mandatory metrics produced;
- class names map correctly;
- results are reproducible from checkpoint and config.

### Validation Prompt
```text
Audit test evaluation.
Confirm only the test split is used, checkpoint and config match, all metrics are
present, class names are correct, and outputs can be reproduced. Return PASS or FAIL.
```

---

# PHASE 11 — Inference and Map Reconstruction

## TASK 11.1 — Predict Test Tiles

**Status:** `TODO`

### Output
- `src/inference/predict_tiles.py`
- tile prediction arrays or GeoTIFF files.

### Acceptance Criteria
- model loads correctly;
- predictions contain valid class indices;
- geospatial metadata is preserved or recoverable;
- inference is batched.

### Validation Prompt
```text
Validate tile inference.
Confirm checkpoint loading, output class range, dimensions, geospatial metadata,
and bounded memory usage. Return PASS or FAIL.
```

---

## TASK 11.2 — Mosaic Predictions

**Status:** `TODO`

### Output
- `src/inference/mosaic_predictions.py`
- `outputs/predictions/sulsel_landcover_prediction.tif`

### Acceptance Criteria
- tile placement is correct;
- CRS and transform are valid;
- overlap strategy is documented;
- NoData is explicit;
- output opens in QGIS.

### Validation Prompt
```text
Audit the prediction mosaic.
Check CRS, transform, bounds, tile seams, overlap handling, NoData, valid class
range, and QGIS readability. Return PASS or FAIL.
```

---

## TASK 11.3 — Create Final Map Assets

**Status:** `TODO`

### Output
- class legend;
- map PNG;
- sample zooms;
- optional comparison with ESA WorldCover.

### Acceptance Criteria
- legend matches class mapping;
- colors are consistent across outputs;
- map includes only validated predictions;
- no unsupported accuracy claim is embedded in the map.

### Validation Prompt
```text
Review final map assets for correct class legend, spatial extent, visual
consistency, and agreement with the configured class mapping. Return PASS or FAIL.
```

---

# PHASE 12 — Reproducibility and Final Audit

## TASK 12.1 — Create README Execution Guide

**Status:** `TODO`

### Objective
Document how to reproduce the project from AOI to inference.

### Output
- `README.md`

### Required Sections
- project objective;
- prerequisites;
- folder structure;
- GEE steps;
- dataset preparation;
- Colab training;
- evaluation;
- inference;
- known limitations.

### Validation Prompt
```text
Follow README.md as a new user would.
Identify missing commands, hidden assumptions, undefined paths, or undocumented
manual actions. Return PASS only if the workflow is reproducible.
```

---

## TASK 12.2 — Final Project Audit

**Status:** `TODO`

### Objective
Verify all project deliverables and task gates.

### Audit Scope
- scope consistency;
- folder structure;
- scripts;
- configuration;
- datasets;
- raster alignment;
- patch dataset;
- split integrity;
- model checkpoint;
- metrics;
- prediction GeoTIFF;
- documentation;
- reproducibility;
- secret scanning.

### Final Validation Prompt
```text
Perform a full final audit against PRD.md and TASK.md.

Return a table with:
- requirement;
- evidence;
- status PASS/FAIL;
- corrective action.

Do not declare the project complete if any required item fails.
Confirm specifically:
1. Study area is Provinsi Sulawesi Selatan.
2. Sentinel-2 and ESA WorldCover are correctly aligned.
3. Spatial split leakage is absent.
4. SegFormer-B0 checkpoint is valid.
5. Mandatory metrics exist.
6. Prediction GeoTIFF opens with correct georeferencing.
7. No secret or large raw dataset is committed.
8. The workflow is reproducible.
```

### Definition of Done
The project is complete only when:
- every mandatory task is `PASS`;
- all required outputs exist;
- the final audit returns no unresolved critical failure.

---

# 4. Current Execution Queue

| Order | Task | Current Status |
|---:|---|---|
| 1 | TASK 0.1 — Verify Project Scope | PASS |
| 2 | TASK 0.2 — Create Safe Ignore Rules | PASS |
| 3 | TASK 1.1 — Create Project Folder Structure | PASS |
| 4 | TASK 1.2 — Audit Local Software | NEXT |
| 5 | TASK 1.3 — Create Python Environment Specification | TODO |
| 6 | TASK 2.1 — Create AOI Script for South Sulawesi | BLOCKED |
| 7 | TASK 2.2 — Export or Save AOI Reference | TODO |
| 8 | TASK 3.1 onward | BLOCKED until AOI is PASS |

---

# 5. Standard Per-Task Completion Report

Antigravity IDE must produce this report after every task:

```text
TASK ID:
TASK NAME:
STATUS: PASS / FAIL / HUMAN_ACTION_REQUIRED

FILES CREATED:
- ...

FILES MODIFIED:
- ...

ACTIONS PERFORMED:
- ...

VALIDATION EXECUTED:
- ...

VALIDATION RESULT:
- ...

ERRORS OR WARNINGS:
- ...

USER ACTION REQUIRED:
- ...

NEXT TASK:
- ...
```
