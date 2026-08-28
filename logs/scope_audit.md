# Scope Audit Report

- **Date:** 2026-08-02
- **Auditor:** Antigravity IDE
- **Project:** Implementasi Model SegFormer Berbasis Deep Learning untuk Pemetaan Tutupan Lahan Provinsi Sulawesi Selatan Menggunakan Citra Sentinel-2 pada Platform GEE

## 1. Search Results Summary

A repository-wide search was conducted for terms related to incorrect or deprecated study areas:
- `Maros` / `Kabupaten Maros`
- `Pulau Sulawesi`
- `seluruh Indonesia`

### Occurrences and Analysis:

| File | Line | Context / Line Content | Analysis |
|:---|:---:|:---|:---|
| `PRD.md` | 105 | `- Pemetaan seluruh Indonesia.` | Listed under **Out of Scope (Tidak termasuk dalam proyek)**. Correct. |
| `PRD.md` | 106 | `- Pemrosesan seluruh Pulau Sulawesi.` | Listed under **Out of Scope (Tidak termasuk dalam proyek)**. Correct. |
| `PRD.md` | 129 | `- tidak menggunakan Kabupaten Maros sebagai wilayah utama;` | Specified under **AOI Requirements**. Correct. |
| `PRD.md` | 632 | `3. Tidak mengubah wilayah penelitian menjadi Kabupaten Maros.` | Listed under **Rules for AI Agent**. Correct. |
| `PRD.md` | 764 | `1. Wilayah utama adalah **Provinsi Sulawesi Selatan**, bukan Kabupaten Maros.` | Listed under **Locked Project Decisions**. Correct. |
| `ROADMAP.md` | 124 | `- menghapus referensi aktif terhadap Kabupaten Maros;` | Listed under **Milestone 0 Activities**. Correct. |
| `TASK.md` | 21 | `4. Do not change the research area from **Provinsi Sulawesi Selatan** to Kabupaten Maros or another region.` | Listed under **Global Execution Rules**. Correct. |
| `TASK.md` | 141 | `- `Kabupaten Maros`` | Mentioned in **TASK 0.1 AI Actions**. Correct. |
| `TASK.md` | 142 | `- `Pulau Sulawesi`` | Mentioned in **TASK 0.1 AI Actions**. Correct. |
| `TASK.md` | 143 | `- `seluruh Indonesia`` | Mentioned in **TASK 0.1 AI Actions**. Correct. |
| `TASK.md` | 157 | `- No active requirement incorrectly uses Kabupaten Maros.` | Mentioned in **TASK 0.1 Acceptance Criteria**. Correct. |
| `TASK.md` | 163 | `grep -RniE "Kabupaten Maros...` | Mentioned in **TASK 0.1 Validation Command**. Correct. |

## 2. Official Scope Confirmation

The official project scope has been verified against the approved research title:
- **Study Area (AOI):** Provinsi Sulawesi Selatan, Indonesia (specifically filtered to a single level-1 administrative feature).
- **Primary Input Data:** Sentinel-2 Surface Reflectance Harmonized (`COPERNICUS/S2_SR_HARMONIZED`).
- **Primary Label Data:** ESA WorldCover v200 (`ESA/WorldCover/v200`).
- **Deep Learning Model:** SegFormer-B0.
- **Preprocessing Platform:** Google Earth Engine (GEE).
- **Training Platform:** Google Colab.

## 3. Scope Audit Conclusion

**Status:** `PASS`
No scope inconsistencies, conflicting requirements, or active incorrect study areas (such as Kabupaten Maros or entire Pulau Sulawesi) were found in the active project documentation. The files `PRD.md`, `ROADMAP.md`, and `TASK.md` are aligned with the official project scope.
