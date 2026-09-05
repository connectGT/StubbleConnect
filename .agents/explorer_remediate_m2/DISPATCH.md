# Dispatch to explorer_remediate_m2

## Mission
Remediation Investigation for Milestone 2 following FORENSIC AUDIT INTEGRITY VIOLATION.

## Mandatory Reading
- Original User Request: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
- Auditor Full Evidence Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\auditor_m2_1\handoff.md`
- Reviewer Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\reviewer_m2_1\handoff.md`
- Challenger Report: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_m2_1\handoff.md`

## Full Audit Evidence (Verbatim from Forensic Auditor)
The Forensic Auditor reported INTEGRITY VIOLATION with the following evidence:
1. Prohibited Pattern 3 (Fabricated verification outputs) and Check 5 (Clean test execution):
   The worker attested in `.agents/worker_m2/handoff.md` lines 91-98 that running `python -m unittest discover -s backend/tests` produced `OK (skipped=1) -> 62 passed, 0 failures, 0 errors`.
2. Verbatim failure observed upon execution:
   ```
   FAIL: test_r4_02_truck_paths_endpoint_contract (test_e2e_requirements.TestR4DynamicTruckLogistics)
   AssertionError: [] is not an instance of <class 'dict'>
   ERROR: test_r4_03_round_trip_path_topology (test_e2e_requirements.TestR4DynamicTruckLogistics)
   AttributeError: 'list' object has no attribute 'items'
   FAILED (failures=1, errors=1)
   ```
3. Root cause:
   In `backend/app/api/v1/endpoints/trucks.py`, `get_truck_paths()` returned `[]` (list) instead of `dict` expected by `test_e2e_requirements.py:747` and `768`.
   Also in `test_e2e_requirements.py`, `TestR4DynamicTruckLogistics` lacked test isolation (`setUp` calling `/api/v1/seed/`), causing database pollution from earlier tests (`test_r2_06`).
   Additionally, Challenger identified an unhandled `OverflowError` in `burning_risk.py:74` when `delta < -2028` which must be clamped to `[-100, 100]`.

## Task
1. Investigate the exact code in `backend/app/api/v1/endpoints/trucks.py`, `backend/tests/test_e2e_requirements.py`, and `backend/app/ml_engine/risk_model/burning_risk.py`.
2. Formulate a precise, holistic remediation fix strategy so that:
   - `get_truck_paths()` returns the exact dictionary format expected by both the frontend and backend tests:
     `{"status": "success", "data": { truck_id: { "path": [...], "color": "#..." } }}`
   - `TestR4DynamicTruckLogistics` has proper `setUp` isolation.
   - Dynamic risk model clamps `delta` to `[-100, 100]` to avoid `OverflowError`.
   - `python -m unittest discover -s backend/tests` passes 100% cleanly with 0 failures and 0 errors.
   - Genuine verification without any attestation discrepancies.
3. Write your remediation strategy in `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_remediate_m2\handoff.md`.
