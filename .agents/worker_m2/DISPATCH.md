# Dispatch to worker_m2

## Objective
Implement Milestone 2: **Biogas Plants, Multi-Cluster Polygons & Dynamic Risk (R3, R2 exclusion, R5)**.

## Mandatory Reading
- Original User Request: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
- Test Infrastructure: `c:\Users\gurut\OneDrive\Desktop\sih\TEST_INFRA.md`
- Explorer 2 Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_2\handoff.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks & Files Owned
1. **`backend/app/api/v1/endpoints/seed.py`**:
   - Expand seeded buyers from 1 to 6 Biogas Plants / Offtakers across Punjab:
     1. `"GreenFuel Bio-CNG Plant (Bathinda)"` at `(30.275, 74.880)`
     2. `"Punjab Bio-Energy Refinery (Ludhiana)"` at `(30.880, 75.830)`
     3. `"Malwa Green Power Off-Taker (Mansa)"` at `(29.930, 75.340)`
     4. `"Verka Bio-Thermal Co-gen (Sangrur)"` at `(30.230, 75.820)`
     5. `"AgriPower Solutions Depot (Moga)"` at `(30.820, 75.180)`
     6. `"Satluj Bio-Pellet Works (Kotkapura)"` at `(30.550, 74.750)`
   - Seed 5-6 geographically distinct farm clusters across Punjab (>15 km apart so DBSCAN with eps=8km separates them cleanly), with 4-5 farms per region:
     - Region 1: Bathinda Central Core (`[30.22, 74.98]`)
     - Region 2: Rampura Phul & Bhucho (`[30.27, 75.14]`)
     - Region 3: Talwandi Sabo & Maur (`[30.02, 75.08]`)
     - Region 4: Mansa & Budhlada (`[29.99, 75.40]`)
     - Region 5: Goniana & Jaitu (`[30.35, 74.88]`)
     - Region 6: Malout & Gidderbaha (`[30.18, 74.60]`)
   - Seed varied `harvest_date` dates (some today, some 2-5 days ago, some in future) to exercise dynamic risk scoring.
   - Seed 2-3 completed fields across different regions with `status="Completed"`.
   - At end of `seed_database`, automatically trigger `recompute_clusters(db)` so that the `clusters` table and convex hull polygons are populated immediately on startup.
   - Verify coordinates so each of the 6 plants is strictly outside the convex hull polygons!
2. **`backend/app/api/v1/endpoints/clusters.py`**:
   - Ensure `recompute_clusters` excludes completed fields (`Field.status != "Completed"`).
   - Calculate cluster `risk_score` as the rounded average of its active member fields' dynamic risk scores (`calculate_dynamic_burning_risk`).
3. **`frontend/src/data/mockData.js`**:
   - Update buyers and clusters mock arrays to reflect the 6 plants and 5-6 regional clusters.
4. **`frontend/src/components/BiomassMap.jsx`**:
   - Ensure all 6 buyers and 5-6 cluster polygons render properly.
5. **`backend/tests/test_e2e_requirements.py`**:
   - Unskip `TestR3BiogasPlants` tests (`test_r3_01`, `test_r3_02`, `test_r3_03`) so they execute and pass.

## Verification
- Run: `python -m unittest discover -s backend/tests`
- Run: `cd frontend && npm run lint`
- Confirm all R1, R2, R3, and R5 tests pass with 0 failures and 0 errors.
- Document results in `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2\handoff.md`.

## 2026-09-05T19:50:33Z
You are worker_m2.
Working directory: c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2
Workspace root: c:\Users\gurut\OneDrive\Desktop\sih
Original User Request: c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md
Project plan: c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md
Test infra: c:\Users\gurut\OneDrive\Desktop\sih\TEST_INFRA.md
Your dispatch instructions are in: c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 2 (Biogas Plants count/location outside polygons, 5-6 regional cluster polygons, ML clustering exclusion of completed fields, dynamic risk score integration).
Run backend tests (python -m unittest discover -s backend/tests) and frontend lint (npm run lint in frontend).
Unskip TestR3BiogasPlants in backend/tests/test_e2e_requirements.py and ensure all tests pass.
Write your completion report in c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2\handoff.md. Send a message when complete.
