# Dispatch for Challenger 2: Backend & Demo Stress Verification

## Working Directory
`c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_backend_demo\`

## Identity
Backend & Demo Challenger (`teamwork_preview_challenger`)

## Mandatory First Step
Read the following authoritative files in order:
1. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
3. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\handoff.md`
4. `c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md`

## Task Requirements
Empirically challenge backend endpoints, live demo procedures, and algorithmic steps:
1. Test VRP routing endpoint `POST /api/v1/routes/optimize` under edge conditions (zero stops, single stop, huge tonnage, missing ortools).
2. Test DBSCAN clustering `POST /api/v1/clusters/recompute` with collinear coordinates and null polygons.
3. Test farmer registration endpoint `POST /api/v1/fields/register` with live insertion parameters matching `SIH_PITCH_GUIDE.md`.
4. Validate that all presentation steps in `SIH_PITCH_GUIDE.md` (DBSCAN, Google OR-Tools, Live insertion demo) are technically accurate and executable.
5. Produce your verdict (`APPROVE` or `REJECT`) with verified empirical evidence in:
`c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_backend_demo\handoff.md`

## 2026-09-05T12:53:33Z
Your working directory is: c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_backend_demo\
Your identity: Backend & Demo Challenger
Your parent conversation ID: 75689b5b-ec5f-4ded-bb03-59272ae7a5d5

MANDATORY FIRST STEP: Read authoritative files in order:
1. c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md
2. c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md
3. c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_backend_demo\DISPATCH.md
4. c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\handoff.md
5. c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md

Empirically stress-test backend and pitch presentation steps:
- Challenge VRP solver endpoint POST /api/v1/routes/optimize with normal and edge cases (huge tonnage, 0 stops).
- Challenge DBSCAN clustering POST /api/v1/clusters/recompute with collinear farms and empty geometries.
- Verify live insertion field registration matching SIH_PITCH_GUIDE.md.
- Confirm that SIH_PITCH_GUIDE.md exists and contains technically accurate steps for DBSCAN clustering and Google OR-Tools routing.
- Write your complete findings and verdict (APPROVE or REJECT) to:
  c:\Users\gurut\OneDrive\Desktop\sih\.agents\challenger_backend_demo\handoff.md
Update your progress.md periodically.
When done, message your parent with your verdict and reference to handoff.md.
