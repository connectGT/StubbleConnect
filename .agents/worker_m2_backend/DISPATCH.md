# Dispatch for Worker M2: Backend Workflow & Crash Resilience

## Working Directory
`c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\`

## Identity
Backend Implementation Worker (`teamwork_preview_worker`)

## Mandatory First Step
Read the following authoritative files in order:
1. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
3. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_workflow_survey\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership (EXCLUSIVELY OWNED FILES)
You own the following backend files. Do NOT touch frontend files (owned by Worker M1):
- `backend/app/ml_engine/routing/vrp_solver.py`
- `backend/app/api/v1/endpoints/clusters.py`
- `backend/app/api/v1/endpoints/websockets.py`
- `backend/app/api/v1/endpoints/routes.py`
- `backend/app/api/v1/endpoints/seed.py`

## Task Requirements
Implement the backend resilience and workflow fixes cataloged in `explorer_workflow_survey/handoff.md`:
1. `vrp_solver.py`: Add a graceful fallback heuristic solver if `ortools` is not installed, preserving exact parameter and return dictionary contracts. If `ortools` is installed, use OR-Tools CVRP; if missing, use the greedy savings/nearest neighbor VRP heuristic so calling `POST /api/v1/routes/optimize` never crashes with HTTP 500.
2. `clusters.py`:
   - Fix null geometry `IndexError`: in `poly_dict = json.loads(p_json) if p_json else ...`, ensure when coordinates are empty or None, polygon is set to `[]` safely without doing `coord[1]` on empty lists.
   - Fix ConvexHull collinearity crash: wrap `ConvexHull(coords)` in `try/except QhullError` and fall back to a bounding box polygon if farms are collinear.
3. `websockets.py`: Wrap `connection.send_text(message)` in `manager.broadcast()` in a `try/except` block, safely discarding dead connections so disconnected clients do NOT crash `simulate_truck_movement()`.
4. `routes.py`: Ensure vehicle capacity default is sufficiently sized (e.g. 150-200T or dynamically matching total cluster biomass) so CVRP does not fail with 0 routes on high-yield clusters.
5. `seed.py`: Normalize seeded phone numbers (support standard 10-digit format `9876543210`) and create matching `Farmer` records in the database so logging in with seeded test numbers immediately finds fields and profile.

## Verification Requirement
Run python syntax checks and test API endpoints or route optimization scripts. Document commands and outputs.
Write your completion report to `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\handoff.md`.

## 2026-09-05T12:40:22Z
Received dispatch request:
Your working directory is: c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\
Your identity: Backend Implementation Worker
Your parent conversation ID: 75689b5b-ec5f-4ded-bb03-59272ae7a5d5
Write Scope (EXCLUSIVELY OWNED FILES):
- backend/app/ml_engine/routing/vrp_solver.py
- backend/app/api/v1/endpoints/clusters.py
- backend/app/api/v1/endpoints/websockets.py
- backend/app/api/v1/endpoints/routes.py
- backend/app/api/v1/endpoints/seed.py
