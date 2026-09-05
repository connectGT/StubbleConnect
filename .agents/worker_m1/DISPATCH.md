# Dispatch to worker_m1

## Objective
Implement Milestone 1: **Core Data Models, Field States & Data Sync (R1 & R2)**.

## Mandatory Reading
- Original User Request: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
- Architecture & Plan: `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
- Explorer 1 Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_1\handoff.md`
- Explorer 2 Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_2\handoff.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Tasks & Files Owned
1. **`backend/app/db/models.py`**:
   - Add `status = Column(String, default="Pending")` to `class Field`.
2. **`backend/app/schemas/schemas.py`**:
   - Add `status: Optional[str] = "Pending"` to `FieldRegisterRequest` and verify `FarmerFieldResponse`.
3. **`backend/app/api/v1/endpoints/fields.py`**:
   - Update `get_all_fields` to return `"farmer_name"`, `"farmer"`, `"status"`, `"is_clustered"`.
   - Update `register_field` to normalize phone numbers and save `status="Pending"`.
4. **`backend/app/api/v1/endpoints/seed.py`**:
   - Explicitly seed `past_field` with `status="Completed"`.
   - Seed 2 of the initial 10 fields with `status="Completed"`, and the rest `status="Pending"`.
5. **`frontend/src/components/modals/QuickActionModal.jsx`**:
   - Add input fields for Farmer Name and Phone number under `register_field`.
   - Prepopulate from logged-in user if available.
   - Send `farmer_name` and normalized `phone` in registration payload.
6. **`frontend/src/components/modals/ListViewModal.jsx`**:
   - Render actual `f.farmer_name || f.farmer || 'Farmer'`.
   - When `f.status === 'Completed'`, apply greyed-out styling (`opacity-60 bg-gray-100/70 border-gray-200`) and a grey `"Completed"` badge.
7. **`frontend/src/components/FarmerDashboard.jsx`**:
   - Wire `RegisterHarvestModal` (or trigger registration) to submit field to `POST http://localhost:8000/api/v1/fields/register` using logged-in farmer credentials.
   - Emit `refresh-dashboard-data` event and reload farmer fields.
   - Fix line 564 to use `{field.harvest_date || field.harvestDate || 'Not set'}`.
8. **`frontend/src/App.jsx`**:
   - Add listener for `refresh-dashboard-data` to reload `farmerUser` profile and fields.
9. **`frontend/src/components/BiomassMap.jsx`**:
   - Support `createFieldIcon(status)` where `status === 'Completed'` renders a grey pin (`#94a3b8` / `#6b7280`).
   - Display correct farmer name in tooltip.

## Verification Requirements
- Execute backend tests: `python -m unittest discover -s backend/tests`
- Run frontend linter: `npm run lint` in `frontend` directory.
- Verify that both pass completely with zero errors.
- Document commands and results in `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1\handoff.md`.

## 2026-09-06T00:57:36Z
You are worker_m1.
Working directory: c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1
Workspace root: c:\Users\gurut\OneDrive\Desktop\sih
Original User Request: c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md
Project plan: c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md
Your dispatch instructions are in: c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1\DISPATCH.md

Implement Milestone 1 (Core Data Models, Field States & Data Sync for R1 & R2).
Run tests (python -m unittest discover -s backend/tests) and frontend lint (npm run lint in frontend).
Write your completion report in c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1\handoff.md. Send a message when complete.
