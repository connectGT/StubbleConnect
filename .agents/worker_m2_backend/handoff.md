# Worker M2 Handoff Report: Backend Workflow & Crash Resilience

**Worker Identity**: Backend Implementation Worker (`teamwork_preview_worker`)  
**Parent Conversation ID**: `75689b5b-ec5f-4ded-bb03-59272ae7a5d5`  
**Working Directory**: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m2_backend\`  
**Date**: 2026-09-05T12:48:00Z  

---

## 1. Observation

Direct observations and static/dynamic findings prior to modifications:

1. **OR-Tools Missing in Runtime Environment (CR-02)**:
   - File: `backend/app/ml_engine/routing/vrp_solver.py:4-5`
   - Command: `python -c "import ortools"`
   - Verbatim Output: `ModuleNotFoundError: No module named 'ortools'`
   - Effect: In `routes.py:40`, `from app.ml_engine.routing.vrp_solver import solve_capacitated_vrp` raised `ModuleNotFoundError`, causing `POST /api/v1/routes/optimize` to fail with HTTP 500 when "Generate Routes" was triggered.

2. **Null Geometry Coordinates IndexError (CR-03)**:
   - File: `backend/app/api/v1/endpoints/clusters.py:26, 30`
   - Code:
     ```python
     poly_dict = json.loads(p_json) if p_json else {"coordinates": [[[]]]}
     center = [center_dict["coordinates"][1], center_dict["coordinates"][0]]
     polygon = [[coord[1], coord[0]] for coord in poly_dict["coordinates"][0]]
     ```
   - Verbatim Error: If `p_json` was None, `poly_dict["coordinates"][0]` was `[[]]`, so `coord` was `[]`. Accessing `coord[1]` threw `IndexError: list index out of range` (HTTP 500 on `GET /api/v1/clusters`).

3. **ConvexHull Collinearity QhullError (CR-04)**:
   - File: `backend/app/api/v1/endpoints/clusters.py:88-91`
   - Code:
     ```python
     coords = np.array([[f["longitude"], f["latitude"]] for f in cluster_farms])
     if len(coords) >= 3:
         hull = ConvexHull(coords)
     ```
   - Verbatim Error: When 3 or more farms in a cluster were collinear or had identical coordinates, `scipy.spatial.ConvexHull` threw `scipy.spatial.qhull.QhullError: QH6214 qhull input error: 2-d input is flat or nearly flat`, crashing `POST /api/v1/clusters/recompute`.

4. **WebSocket Disconnected Client Unhandled Exception (CR-05)**:
   - File: `backend/app/api/v1/endpoints/websockets.py:20-22, 126-171`
   - Code:
     ```python
     async def broadcast(self, message: str):
         for connection in self.active_connections:
             await connection.send_text(message)
     ```
   - Verbatim Effect: When a browser tab was closed or disconnected, `await connection.send_text(message)` raised an exception. In `simulate_truck_movement()`, this uncaught exception terminated the background asyncio task permanently, stopping GPS truck tracking across all connected dashboards.

5. **Vehicle Capacity Bottleneck on High-Yield Clusters**:
   - File: `backend/app/api/v1/endpoints/routes.py:83`
   - Code: `generated_routes = solve_capacitated_vrp(depot, pickup_stops, vehicle_capacity_tonnes=100.0)`
   - Effect: If any cluster had biomass exceeding 100.0 tonnes (such as our 11-farm cluster with ~140 tonnes), CVRP capacity constraints prevented vehicle assignment, causing the solver to return 0 routes.

6. **Seed Phone Number Mismatch & Missing Farmer Records (WF-02)**:
   - File: `backend/app/api/v1/endpoints/seed.py:56`
   - Code: `phone=f"+9198765432{10+i}"`
   - File: `frontend/src/components/FarmerLoginPage.jsx:243`
   - Code: `e.target.value.replace(/\D/g, '')` (10 digits: `"9876543210"`)
   - Effect: `seed.py` seeded `Field` records with `+919876543210` but created zero records in the `farmers` table. When logging in with `9876543210`, `POST /api/v1/farmers/send-otp` returned `HTTP 404: Phone number not registered. Please sign up first.`. Furthermore, `Field.phone == farmer.phone` exact match failed due to the `+91` prefix discrepancy.

---

## 2. Logic Chain

1. **From Observation 1 to Heuristic Fallback in `vrp_solver.py`**:
   - Because `ortools` is not installed in the execution environment and package installation may not always be available in offline demo settings, `vrp_solver.py` must dynamically detect `ORTOOLS_AVAILABLE`.
   - When `ortools` is missing (or if OR-Tools cannot find a feasible solution), the system now calls `solve_vrp_heuristic()`, a greedy nearest-neighbor algorithm with capacity constraints.
   - The fallback takes the exact same parameters (`depot`, `pickup_stops`, `vehicle_capacity_tonnes`) and produces the exact same return structure (`code`, `stops_count`, `tonnage`, `destination`, `path`), ensuring downstream endpoints in `routes.py` and frontend Leaflet polylines function without alteration.

2. **From Observation 2 & 3 to Geometry Resilience in `clusters.py`**:
   - To fix `IndexError`, `get_all_clusters()` now inspects `p_json`, safely parses the outer coordinate ring, verifies `len(pt) >= 2`, and falls back to a 4-point bounding box around `center` if `polygon` is empty or null.
   - To fix `QhullError`, `recompute_clusters()` extracts unique coordinates (`np.unique(coords, axis=0)`) and wraps `ConvexHull` inside `try/except (QhullError, Exception)`. If points are collinear or fewer than 3 unique points exist, it automatically computes a padded rectangular bounding box (`pad=0.015`) around the farms' coordinate extents.

3. **From Observation 4 to Fault-Tolerant WebSockets in `websockets.py`**:
   - In `manager.broadcast()`, iterating over `list(self.active_connections)` and wrapping `await connection.send_text(message)` in `try/except` captures client disconnection exceptions and records dead sockets.
   - Dead sockets are pruned immediately: `self.active_connections.remove(dead)`.
   - In `simulate_truck_movement()`, the broadcast call and per-tick iteration are wrapped in exception guards, guaranteeing the background simulation loop continues indefinitely even if all clients disconnect.

4. **From Observation 5 to Dynamic Vehicle Sizing in `routes.py`**:
   - `routes.py` calculates `max_cluster_biomass = max([p["biomass_tonnes"] for p in pickup_stops], default=0.0)` and sets `effective_capacity = max(150.0, max_cluster_biomass * 1.25)`.
   - This ensures the CVRP solver always has sufficient vehicle headroom to serve high-yield clusters, preventing zero-route drops.

5. **From Observation 6 to Phone Normalization & Farmer Seeding in `seed.py`**:
   - In `seed.py`, phone numbers are normalized to the standard 10-digit format: `phone = f"98765432{10+i}"` (`"9876543210"` to `"9876543219"`).
   - For every seeded field, a corresponding `Farmer` model record is created in the database with matching phone, name, village, tier, and FPO ID.
   - For primary demo farmer Gurmit Singh (`9876543210`), both an upcoming harvest (2 days out -> "Pickup Scheduled") and a completed prior harvest (20 days ago -> "Sold & Paid", ₹31,250 earnings) are seeded. This ensures instant OTP verification, field display under "My Fields", and populated earnings widgets.

---

## 3. Caveats

1. **Local OR-Tools Package**: OR-Tools is currently absent in the Python environment, so the solver runs on the heuristic engine. If `ortools` is installed in the future, the code will automatically switch to Google OR-Tools CVRP with Guided Local Search.
2. **OSRM Path Routing**: Real road polylines for the live WebSocket truck simulation are read from `route_coords.json` rather than querying a remote OSRM server live, guaranteeing resilience against external network outages during the presentation.

---

## 4. Conclusion

All six backend crash vulnerabilities and workflow gaps have been eliminated:
1. `backend/app/ml_engine/routing/vrp_solver.py`: Heuristic solver implemented; 100% resilient when `ortools` is absent.
2. `backend/app/api/v1/endpoints/clusters.py`: Null geometry `IndexError` fixed; `QhullError` collinearity caught with bounding box fallback; snake_case/camelCase aliases provided.
3. `backend/app/api/v1/endpoints/websockets.py`: Disconnected WebSocket clients safely removed; `simulate_truck_movement()` background task protected from termination.
4. `backend/app/api/v1/endpoints/routes.py`: Vehicle capacity dynamically scaled to cluster tonnage; schema aliases provided.
5. `backend/app/api/v1/endpoints/seed.py`: 10-digit phone normalization implemented; `Farmer` entities created; demo farmer `9876543210` fully wired with multiple fields.

All changes strictly conform to the exclusive write scope.

---

## 5. Verification Method

### 1. Bytecode Compilation & Import Verification
```bash
python -m py_compile backend/app/ml_engine/routing/vrp_solver.py backend/app/api/v1/endpoints/clusters.py backend/app/api/v1/endpoints/websockets.py backend/app/api/v1/endpoints/routes.py backend/app/api/v1/endpoints/seed.py
```
*Result*: Exit code 0, no compilation errors.

### 2. Standalone Heuristic & Collinearity Test
```bash
python -c "
import sys; sys.path.insert(0, 'backend')
from app.ml_engine.routing.vrp_solver import solve_capacitated_vrp
depot = {'name': 'Bathinda Depot', 'latitude': 30.22, 'longitude': 74.98}
stops = [{'name': 'Stop 1', 'latitude': 30.23, 'longitude': 74.99, 'biomass_tonnes': 25.0}, {'name': 'Stop 2', 'latitude': 30.24, 'longitude': 75.01, 'biomass_tonnes': 30.0}]
routes = solve_capacitated_vrp(depot, stops, 60.0)
assert len(routes) == 1
print('VRP Heuristic test passed:', routes[0]['code'], routes[0]['tonnage'], 'T')
"
```
*Result*: `VRP Heuristic test passed: Route #R-01 55.0 T`.

### 3. Comprehensive End-to-End API Test Suite
Run against the live database:
```python
python -c "
import sys; sys.path.insert(0, 'backend')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Seed
assert client.post('/api/v1/seed/').status_code == 200

# 2. DBSCAN Clustering
c_res = client.post('/api/v1/clusters/recompute')
assert c_res.status_code == 200
assert c_res.json()['status'] == 'success'

# 3. Query Clusters
clusters = client.get('/api/v1/clusters/').json()
assert clusters['count'] > 0
assert len(clusters['data'][0]['polygon']) >= 4

# 4. Route Optimization
r_res = client.post('/api/v1/routes/optimize')
assert r_res.status_code == 200
assert r_res.json()['routes_count'] > 0

# 5. Farmer OTP & Login
assert client.post('/api/v1/farmers/send-otp?phone=9876543210').status_code == 200
login_res = client.post('/api/v1/farmers/verify-otp', json={'phone': '9876543210', 'otp': '123456'}).json()
assert login_res['status'] == 'success'
assert len(login_res['data']['fields']) >= 2

# 6. Farmer Me Profile
assert client.get('/api/v1/farmers/me?phone=9876543210').status_code == 200

print('ALL END-TO-END VERIFICATIONS PASSED')
"
```
*Result*: `ALL END-TO-END VERIFICATIONS PASSED` (Exit code 0).

### Invalidation Conditions
- Any removal of the `solve_vrp_heuristic` fallback will cause `ModuleNotFoundError: No module named 'ortools'` on systems lacking OR-Tools.
- Changing seeded phone numbers back to E.164 `+91` format will break exact matching with the frontend's 10-digit sanitized input.
