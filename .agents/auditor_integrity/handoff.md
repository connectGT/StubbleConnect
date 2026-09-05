# Forensic Integrity Audit Report & Handoff

**Work Product**: StubbleConnect Frontend UI Wiring, Backend Algorithmic Resilience & SIH Pitch Guide  
**Auditor**: Forensic Integrity Auditor (`teamwork_preview_auditor`)  
**Parent Conversation ID**: `75689b5b-ec5f-4ded-bb03-59272ae7a5d5`  
**Working Directory**: `c:\Users\gurut\OneDrive\Desktop\sih\.agents\auditor_integrity\`  
**Profile**: General Project  
**Integrity Mode**: Development (from `ORIGINAL_REQUEST.md:12`)  
**Verdict**: **CLEAN**

---

## 1. Observation

Direct observations from source inspection, prohibited pattern scanning, and empirical execution:

### 1.1 Backend Algorithmic Implementation
- **VRP Routing Engine** (`backend/app/ml_engine/routing/vrp_solver.py:11-96`):
  - `haversine_distance(lat1, lon1, lat2, lon2)` implements genuine great-circle spherical distance using Earth radius $R = 6371.0\text{ km}$, $\sin^2(\Delta\text{lat}/2) + \dots$.
  - `solve_vrp_heuristic(depot, pickup_stops, vehicle_capacity_tonnes)` implements an authentic greedy nearest-neighbor algorithm with capacity constraints:
    - Calculates `effective_capacity = max(vehicle_capacity_tonnes, max_demand * 1.05)` to prevent single-stop capacity deadlock.
    - Evaluates unvisited candidates against remaining vehicle capacity: `[s for s in unvisited if s['biomass_tonnes'] <= curr_capacity]`.
    - Greedily selects candidate with minimum Haversine distance: `min(feasible_candidates, key=lambda s: haversine_distance(curr_lat, curr_lng, s['latitude'], s['longitude']))`.
    - Appends depot departure and return legs: `curr_path = [[depot_lat, depot_lng], ..., [depot_lat, depot_lng]]`.
  - `solve_capacitated_vrp(...)` (`lines 137-238`) utilizes Google OR-Tools CVRP solver (`PATH_CHEAPEST_ARC`, `GUIDED_LOCAL_SEARCH`, integer distance matrix scaled by 1000m) when `ortools` is installed, falling back cleanly to `solve_vrp_heuristic(...)` when OR-Tools is absent or non-converging.
- **DBSCAN Clustering Engine** (`backend/app/ml_engine/clustering/dbscan_cluster.py:5-58`):
  - Genuinely invokes `sklearn.cluster.DBSCAN(eps=eps_radians, min_samples=min_samples, metric='haversine')`.
  - Converts coordinates to radians: `coords = np.array([[np.radians(f['latitude']), np.radians(f['longitude'])] for f in farms])`.
  - Filters noise points (`label == -1`) and computes cluster center by taking coordinate means.
- **ConvexHull & Geometry Fallback** (`backend/app/api/v1/endpoints/clusters.py:130-160`):
  - Computes spatial boundary via `scipy.spatial.ConvexHull(unique_coords)` on unique farm coordinates.
  - Catches `(QhullError, Exception)` to handle collinear points or $< 3$ unique points without crashing, generating a padded bounding box loop (`pad = 0.015`).
  - Reads PostGIS geometries safely in `get_all_clusters()` without `IndexError` on empty outer coordinate rings.
- **WebSocket Resilience** (`backend/app/api/v1/endpoints/websockets.py:21-31, 134-185`):
  - `manager.broadcast()` iterates over `list(self.active_connections)` and traps `Exception`, actively pruning disconnected WebSockets.
  - `simulate_truck_movement()` background asyncio loop is guarded against client disconnection exceptions.
- **Data Normalization & Seeding** (`backend/app/api/v1/endpoints/seed.py:49-107`):
  - Normalizes test phone numbers to 10 digits (`"9876543210"` to `"9876543219"`).
  - Populates both `fields` and matching `Farmer` records for all 10 seed farms.

### 1.2 Frontend UI Wiring & Interactivity
- **Sidebar & Portal Switcher** (`frontend/src/components/Sidebar.jsx:132-295`):
  - Nav item buttons execute `setActiveTab(item.id)` and toggle accordion state.
  - Quick action buttons execute `onQuickAction(action.id)`.
  - 4-portal switcher buttons (`Admin`, `Farmer`, `Buyer Plant`, `Truck Driver`) invoke `setUserRole(...)`.
- **Interactive Biomass Map** (`frontend/src/components/BiomassMap.jsx:465-622`):
  - Route `<Polyline>` elements contain `eventHandlers={{ click: () => { if (onOpenLogistics) onOpenLogistics(rt); } }}` and display hover cards with route code, destination, tonnage, and action prompts.
  - Cluster `<Polygon>` and badge markers contain `eventHandlers={{ click: () => setSelectedCluster(cl) }}` and display rich hover cards with farms count, biomass, and risk scores.
  - Field markers contain `eventHandlers={{ click: () => window.dispatchEvent(new CustomEvent('open-fields-directory')) }}`.
  - Buyer markers contain `eventHandlers={{ click: () => onOpenBuyerDetails && onOpenBuyerDetails(b) }}`.
- **StatsRow KPI Cards** (`frontend/src/components/StatsRow.jsx:31-37`):
  - All 6 KPI cards delegate clicks to `onSelectRiskMap` or `onCardClick(item.id)`, routing directly into the corresponding list view modals in `App.jsx:247-258`.
- **Global Header Search** (`frontend/src/components/Header.jsx:57-65, 107-246`):
  - Search input supports `Enter` key execution to trigger `onSearchSubmit`.
  - Profile button triggers an interactive Profile Modal with role identity, portal switcher, and logout.
- **Farmer Dashboard & Modals** (`frontend/src/components/FarmerDashboard.jsx:261-279, 355-422`):
  - Synchronizes internal tab state with `externalActiveTab`.
  - "Register Your First Field" invokes `onRegisterClick` -> opens `QuickActionModal('register_field')`.
  - Connects "My Tier", "Active Pickup Tracker", and "Pickup OTP Modal" with OTP verification.
- **QuickActionModal** (`frontend/src/components/modals/QuickActionModal.jsx:53-128`):
  - Dynamically dispatches real HTTP POST requests to `/api/v1/fields/register`, `/api/v1/buyers/register`, `/api/v1/clusters/recompute`, and `/api/v1/routes/optimize`.

### 1.3 SIH Pitch Guide
- **File Location & Verification**:
  - `c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md` exists in project root (402 lines, 28,776 bytes).
  - Explicit string check:
    - Line 148: `## Phase 3: Triggering "DBSCAN clustering" (1.5 Minutes)`
    - Line 158: `### 2. Explicit Presentation Steps for Triggering "DBSCAN clustering"`
    - Line 216: `## Phase 4: Triggering "Google OR-Tools routing" (1.5 Minutes)`
    - Line 229: `### 2. Explicit Presentation Steps for Triggering "Google OR-Tools routing"`
  - Contains complete 6-phase walkthrough, Bathinda live fail-safe demo steps, and jury defense.

### 1.4 Prohibited Patterns Scan Results
- **Hardcoded test strings**: 0 found.
- **Facade return implementations** (`return constant` / `pass`): 0 found.
- **Pre-populated log or result files**: 0 found.
- **Crude `alert()` bypasses in modified core files**: 0 found.

---

## 2. Logic Chain

1. **Algorithmic Integrity Deduction**:
   - Inspection of `backend/app/ml_engine/routing/vrp_solver.py` confirms that `solve_vrp_heuristic` evaluates distance and capacity dynamically on each step. It does not return canned routes or static data.
   - When verified with 3 test stops (near, medium, far) under capacity constraints:
     - With vehicle capacity = 25T, each 20T stop required a separate vehicle -> exactly 3 routes produced.
     - With vehicle capacity = 50T, the nearest stops (A then B) were grouped together -> exactly 2 routes produced.
     - The first stop visited was Farm A (`[30.23, 74.99]`), mathematically confirming nearest-neighbor path selection.
   - Inspection of `backend/app/ml_engine/clustering/dbscan_cluster.py` confirms Scikit-Learn DBSCAN executes with spherical Haversine conversion, properly filtering outlier points as noise.
   - Collinear 3-point test triggered `QhullError`, proving that the `try/except` collinearity fallback to rectangular bounding box in `clusters.py` is essential, legitimate, and fully active.

2. **Frontend Wiring Deduction**:
   - Examination of `Sidebar.jsx`, `BiomassMap.jsx`, `StatsRow.jsx`, `Header.jsx`, `FarmerDashboard.jsx`, and modals proves all event handlers (`onClick`, `onKeyDown`, `eventHandlers={{ click }}`) are bound to active React state hooks, modal setters, custom window events, or API fetch calls.
   - Map polyline elements have functional click triggers opening logistics details, and all map hover cards render interactive prompts with connected live attributes.

3. **End-to-End API Execution Deduction**:
   - Running FastAPI `TestClient` against live endpoints proved the full workflow:
     1. `POST /api/v1/seed/` seeded 1 buyer, 10 farmers, 11 fields.
     2. `POST /api/v1/clusters/recompute` executed DBSCAN clustering across 11 farms.
     3. `GET /api/v1/clusters/` verified Cluster #01 was formed with 144.1 T and valid boundary polygon ($N \ge 4$).
     4. `POST /api/v1/routes/optimize` executed VRP routing, producing Route #R-01.
     5. `POST /api/v1/farmers/verify-otp` authenticated Gurmit Singh with 2 fields and ₹31,250 earnings.
     6. `POST /api/v1/fields/register` ingested new field near Bathinda City.
     7. `POST /api/v1/clusters/recompute` re-clustered across 12 farms, confirming dynamic ingestion.

4. **Production Build Deduction**:
   - `npx oxlint` passed with 0 errors and 0 warnings across all 13 modified frontend files.
   - `npm run build` completed successfully in 400ms, transforming 1,904 modules without compilation or bundle errors.

---

## 3. Caveats

- **No Caveats**: All static checks, algorithmic verifications, UI audits, and end-to-end API integration tests completed successfully without discrepancies or bypasses.

---

## 4. Conclusion

- The implementation across frontend, backend, and documentation is **100% genuine and robust**.
- Zero prohibited cheating patterns (hardcoded test strings, facade mocks, pre-populated logs) exist in the codebase.
- The VRP solver heuristic legitimately computes nearest-neighbor paths with capacity constraints.
- DBSCAN clustering and ConvexHull geometries are authentic mathematical implementations with collinearity safety.
- All UI buttons, map hover cards, polyline routes, and dashboard controls are fully wired.
- `SIH_PITCH_GUIDE.md` meets all acceptance criteria.
- **FINAL VERDICT: CLEAN**.

---

## 5. Verification Method

To independently reproduce and verify this audit:

### 5.1 Algorithmic Verification Command
```powershell
python -c "
import sys; sys.path.insert(0, 'backend')
from app.ml_engine.routing.vrp_solver import haversine_distance, solve_vrp_heuristic
from app.ml_engine.clustering.dbscan_cluster import cluster_farms_dbscan

# 1. Haversine distance
assert 40.0 < haversine_distance(30.211, 74.945, 29.989, 75.399) < 65.0

# 2. VRP Heuristic with capacity
depot = {'name': 'Hub', 'latitude': 30.22, 'longitude': 74.98}
stops = [
    {'id': 'B', 'latitude': 30.30, 'longitude': 75.05, 'biomass_tonnes': 20.0},
    {'id': 'A', 'latitude': 30.23, 'longitude': 74.99, 'biomass_tonnes': 20.0}
]
routes = solve_vrp_heuristic(depot, stops, vehicle_capacity_tonnes=50.0)
assert len(routes) == 1 and routes[0]['path'][1] == [30.23, 74.99]

# 3. DBSCAN clustering
farms = [
    {'id': 1, 'latitude': 30.221, 'longitude': 74.981, 'biomass_tonnes': 10.0},
    {'id': 2, 'latitude': 30.225, 'longitude': 74.985, 'biomass_tonnes': 12.0},
    {'id': 3, 'latitude': 30.219, 'longitude': 74.979, 'biomass_tonnes': 8.0}
]
assert len(cluster_farms_dbscan(farms, 8.0, 3)) == 1
print('ALGORITHMIC VERIFICATION: 100% PASS')
"
```
*Expected Output*: `ALGORITHMIC VERIFICATION: 100% PASS`

### 5.2 Pitch Guide Explicit String Check
```powershell
powershell -Command "Select-String -Path 'c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md' -Pattern 'Triggering \"DBSCAN clustering\"', 'Triggering \"Google OR-Tools routing\"'"
```
*Expected Output*: Matches found for both exact phrases on lines 148, 158, 216, and 229.

### 5.3 Frontend Static Lint & Build Check
```powershell
cd frontend
npx oxlint src/App.jsx src/components/BiomassMap.jsx src/components/ClusterDetailsPanel.jsx src/components/FarmerDashboard.jsx src/components/FarmerLoginPage.jsx src/components/Header.jsx src/components/PlannedRoutes.jsx src/components/RecentActivity.jsx src/components/Sidebar.jsx src/components/StatsRow.jsx src/components/TopBuyers.jsx src/components/modals/ListViewModal.jsx src/components/modals/QuickActionModal.jsx
npm run build
```
*Expected Output*: `Found 0 warnings and 0 errors.`, `✓ 1904 modules transformed.`, `✓ built in ~400ms`.

### Invalidation Conditions
- Any introduction of hardcoded return strings in `vrp_solver.py` or `dbscan_cluster.py` invalidates algorithmic integrity.
- Removing `eventHandlers` from Leaflet polylines in `BiomassMap.jsx` violates R1 UI wiring.
- Deleting or altering the explicit DBSCAN or OR-Tools trigger sections in `SIH_PITCH_GUIDE.md` violates R3.
