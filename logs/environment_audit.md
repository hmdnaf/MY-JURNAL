# Local Environment Audit

## 1. Audit Identity
- **Task ID:** TASK 1.2
- **Task name:** Audit Local Software
- **Audit date and time:** 3 August 2026, 03:39:27 WITA
- **Project root:** H:\segFormer
- **Operating system:** Microsoft Windows 11 Home Single Language (Version 10.0.26200, Build 26200, 64-bit architecture)

## 2. Hardware
- **CPU:** AMD Ryzen 3 5300U with Radeon Graphics
- **Processor count:** 8 logical processors
- **RAM:** 7,711,292 KB (~7.35 GB total visible RAM; ~655 MB free physical RAM at audit time)
- **GPU:** AMD Radeon(TM) Graphics (Driver Version 27.20.14016.13)
- **CUDA availability:** Absent (No NVIDIA CUDA-capable GPU detected)
- **Suitability assessment:** Suitable for local code development, documentation, QGIS sample auditing, and lightweight/windowed raster processing. Absence of NVIDIA CUDA is expected and compliant with project rules, as heavy training will be offloaded to Google Colab.

## 3. Storage
| Drive | Total Space (GB) | Used Space (GB) | Free Space (GB) | Status |
|:---|:---:|:---:|:---:|:---|
| **C:** | 203.42 | 188.57 | 14.84 | `PASS` (Sufficient for system and tool operations) |
| **H:** | 50.00 | 37.56 | 12.44 | `PASS` (Project drive `H:\segFormer`; sufficient for sample rasters and tiled data) |

## 4. Python
- **Version:** Python 3.14.5
- **Executable:** `C:\Python314\python.exe`
- **Pip version:** pip 26.1.1
- **Pip path:** `C:\Python314\Scripts\pip.exe`
- **Multiple-installation findings:** Detected 5 Python executables across system paths (`C:\Python314\python.exe`, `C:\Program Files\Python310\python.exe`, `C:\msys64\ucrt64\bin\python.exe`, `C:\Users\ACER\AppData\Local\Programs\Python\Python313\python.exe`, and WindowsApps alias). `C:\Python314\python.exe` is active in `PATH`.
- **Status:** `PASS`

## 5. Git
- **Version:** git version 2.43.0.windows.1
- **Executable:** `C:\Program Files\Git\cmd\git.exe`
- **Status:** `PASS`

## 6. Development Tools
| Tool | Version | Path | Status |
|:---|:---|:---|:---|
| **VS Code** | Detected | `C:\Users\ACER\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd` | `PASS` |
| **Antigravity IDE** | Detected | `C:\Users\ACER\AppData\Local\Programs\Antigravity IDE\Antigravity IDE.exe` | `PASS` |
| **QGIS Desktop** | QGIS 3.44.12 | `C:\Program Files\QGIS 3.44.12` | `PASS` (Desktop confirmed installed) |

## 7. Project Artifact Presence
- **`H:\segFormer`:** Confirmed present (Project Root).
- **`gee/`:** Confirmed present (`gee/01_AOI.js`, `gee/02_Sentinel2.js`, `gee/03_WorldCover.js`, `gee/04_Dataset_Sample_Export.js`).
- **`configs/`:** Confirmed present (`configs/data.yaml`).
- **`docs/`:** Confirmed present (`PRD.md`, `TASK.md`, `ROADMAP.md`, `DATASET.md`, `evidence/`).
- **`data/raw/sample/SULSEL_DATASET_SAMPLE_003.tif`:** Confirmed present (71,601,337 bytes).
- **`qgis/dataset_sample_audit.qgz`:** Confirmed present (8,612 bytes).
*(Note: All artifacts were inspected read-only without opening, modifying, or executing them).*

## 8. Workload Suitability
- **Development:** `PASS` — Fully suitable for script writing, configuration, and version control.
- **Documentation:** `PASS` — Fully suitable for markdown maintenance and logging.
- **QGIS auditing:** `PASS` — Fully suitable for auditing sample rasters (`SAMPLE_003.tif`) in QGIS Desktop 3.44.12.
- **Lightweight preprocessing:** `PASS` — Suitable when using windowed/chunked I/O (`rasterio` block-by-block reading) to operate within ~655 MB available physical memory.
- **Full province processing:** `WARNING` — Not recommended locally without tiling or windowing due to 8 GB RAM constraint (~46,000 km² province area).
- **Local SegFormer training:** `WARNING` — Not recommended locally due to absence of an NVIDIA CUDA GPU and limited RAM.
- **GEE processing:** `PASS` — Cloud-based Google Earth Engine is suitable for all province-scale geospatial processing and export tiling.
- **Colab training:** `PASS` — Google Colab is the designated platform for SegFormer-B0 model training with cloud GPU acceleration.

## 9. Warnings and Limitations
1. **Multiple Python Installations:** Five Python installations exist on the system. Scripts and virtual environments must explicitly reference the desired interpreter (`C:\Python314\python.exe` or target environment) to avoid package conflicts.
2. **Available Physical RAM Constraint:** Total visible RAM is ~7.35 GB, with ~655 MB available at audit time. Local raster processing scripts must use windowed reading/writing rather than loading full-province rasters into memory.
3. **Absence of NVIDIA CUDA GPU:** The local machine uses an integrated AMD Radeon GPU. Model training must be executed in Google Colab rather than locally.

## 10. Final Validation Checklist
| Audit Item | Status | Notes |
|:---|:---:|:---|
| Operating System | `PASS` | Windows 11 Home Single Language (64-bit) |
| CPU & Logical Processors | `PASS` | AMD Ryzen 3 5300U (8 logical processors) |
| Total Installed RAM | `PASS` | ~7.35 GB visible RAM (sufficient for development/sample audit) |
| Available RAM | `WARNING` | ~655 MB free physical RAM; requires windowed raster I/O |
| GPU / CUDA Availability | `WARNING` | Integrated AMD Radeon; training offloaded to Colab as per rules |
| Drive C: Storage | `PASS` | 14.84 GB free space |
| Drive H: Storage | `PASS` | 12.44 GB free space on project drive `H:\segFormer` |
| Python & Pip | `PASS` | Python 3.14.5 and pip 26.1.1 available in PATH |
| Git | `PASS` | Git 2.43.0 installed |
| VS Code & Antigravity IDE | `PASS` | Both editors installed and accessible |
| QGIS Desktop | `PASS` | QGIS Desktop 3.44.12 installed in Program Files |
| Project Artifacts Presence | `PASS` | All required project folders and sample artifacts present |

## 11. Final Result
TASK 1.2 STATUS: PASS
