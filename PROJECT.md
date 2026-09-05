# Project: StubbleConnect — SIH 2026 Biomass Command Center

## Architecture
- **Frontend**: React (Vite, Tailwind CSS, Leaflet/React-Leaflet, Lucide-react)
  - Portals: Operations Admin (`App.jsx`), Farmer Portal (`FarmerDashboard.jsx`, `FarmerLoginPage.jsx`), Buyer Portal (`BuyerPanelApp.jsx`), Driver Portal (`DriverPanelApp.jsx`)
  - Navigation: `Sidebar.jsx`, `Header.jsx`, `BottomRow.jsx`, `StatsRow.jsx`
  - Map & Geo-Visuals: `BiomassMap.jsx`, `MapSection.jsx`, `ClusterDetailsPanel.jsx`
  - Modals: `ListViewModal.jsx`, `QuickActionModal.jsx`, `ClusterModal.jsx`, `FieldDetailModal.jsx`, `RegisterOnBehalfModal.jsx`
- **Backend**: FastAPI (Python 3.10+, SQLAlchemy, PostGIS / PostgreSQL, GeoAlchemy2)
  - Core API endpoints: `/api/v1/farmers`, `/api/v1/fields`, `/api/v1/clusters`, `/api/v1/routes`, `/api/v1/ws`
  - ML & Optimization Engine:
    - DBSCAN Spatial Clustering: `backend/app/ml_engine/clustering/dbscan_cluster.py` (Scikit-Learn DBSCAN, Haversine metric, eps=8km, min_samples=3, ConvexHull boundary generation)
    - Google OR-Tools CVRP Solver: `backend/app/ml_engine/routing/vrp_solver.py` (Capacitated Vehicle Routing Problem, PATH_CHEAPEST_ARC, Guided Local Search, with robust heuristic fallback if ortools is absent)
    - Multifactored Stubble Burning Risk Model: `backend/app/ml_engine/risk_model/burning_risk.py`
    - Live WebSocket Fleet Tracking: `backend/app/api/v1/endpoints/websockets.py`

---

## Feature Inventory
Every feature identified during the Survey phase is mapped below:

| # | Feature | Description | Milestone | Status | Source |
|---|---|---|---|---|---|
| 1 | Fix `Cpu` icon import crash | Import `Cpu` from `lucide-react` in `ListViewModal.jsx` to prevent crash on "AI Config" click | M1 | DONE | explorer_ui / explorer_workflow |
| 2 | Wire Route Polyline Map Clicks | Add `eventHandlers` with `onClick` to `BiomassMap.jsx` routes so clicking a route line inspects logistics details | M1 | DONE | explorer_ui |
| 3 | Populate Map Hover Cards | Ensure hover cards on fields, clusters, and routes render complete data and actions | M1 | DONE | explorer_ui / ORIGINAL_REQUEST |
| 4 | Cluster Details Empty State | Render formatted placeholder prompt card in `ClusterDetailsPanel.jsx` when `selectedCluster === null` | M1 | DONE | explorer_ui |
| 5 | Cluster Details Live Data Fallbacks | Fall back missing backend fields (`harvestWindow`, `avgDistance`, `status`) to sensible defaults | M1 | DONE | explorer_ui |
| 6 | Wire Dead KPI Cards in StatsRow | Wire all 6 cards (`total_fields`, `total_biomass`, `active_clusters`, `routes_planned`, `high_risk`, `daily_capacity`) to their respective `ListViewModal` types | M1 | DONE | explorer_ui |
| 7 | Wire Farmer Sidebar Subitems | Pass `activeTab` and tab change handler to `FarmerDashboard` so sidebar subtabs switch tabs or open modals | M1 | DONE | explorer_ui |
| 8 | Wire Farmer Dashboard Dead Buttons | Connect `onRegisterClick`, `onLogout`, `My Tier` benefits popup, and remove crude `alert()` | M1 | DONE | explorer_ui |
| 9 | Farmer Login Trap Resolution | Add "Return to Command Center" exit button on `FarmerLoginPage` calling `setUserRole('admin')` | M1 | DONE | explorer_ui |
| 10 | Connect Header Global Search | Pass `searchTerm` into `MapSection` and `BottomRow` to filter cards, clusters, and tables | M1 | DONE | explorer_ui |
| 11 | Fix `QuickActionModal` "+ Add New Field" | Fix `coords.lat` crash when `village === 'new'` by providing default coordinates and custom name input | M1 | DONE | explorer_ui / explorer_workflow |
| 12 | Wire ListViewModal "Plan Route" & "Inspect Map" | Add functional `onClick` handlers to buttons inside the clusters view of `ListViewModal` | M1 | DONE | explorer_ui |
| 13 | Resolve Schema Mismatches in ListViewModal | Support both `farmsCount`/`farms_count`, `totalBiomass`/`total_biomass`, `farmer`/`farmer_name` | M1 | DONE | explorer_ui / explorer_workflow |
| 14 | Add Table & Panel Empty States | Add empty state cards to `RecentActivity`, `PlannedRoutes`, `TopBuyers`, and `ListViewModal` tables | M1 | DONE | explorer_ui |
| 15 | Portal Navigation Switcher | Add switcher or menu links in Header/Sidebar to access Buyer and Driver portals | M1 | DONE | explorer_ui / explorer_workflow |
| 16 | OR-Tools VRP Graceful Fallback | Add robust heuristic fallback in `vrp_solver.py` when `ortools` package is not present in environment | M2 | DONE | explorer_workflow |
| 17 | Fix Cluster Geometry Null IndexError | Fix `coord[1]` on `[]` in `clusters.py` when cluster polygon geometry is null | M2 | DONE | explorer_workflow |
| 18 | Fix ConvexHull Collinearity Crash | Catch `QhullError` in `clusters.py` when points are collinear and fall back to bounding box | M2 | DONE | explorer_workflow |
| 19 | Fix WebSocket Truck Sim Async Crash | Add `try/except` in `manager.broadcast()` to prevent disconnected client from crashing GPS tracking | M2 | DONE | explorer_workflow |
| 20 | Connect Farmer Harvest Declaration to API | Replace mock `setTimeout` in `FarmerDashboard.jsx` with actual `fetch` to `/api/v1/fields/register` | M2 | DONE | explorer_workflow |
| 21 | Normalize Seed Phone & Farmer Record | Ensure seeded test fields match the 10-digit login format and seed a matching Farmer record | M2 | DONE | explorer_workflow |
| 22 | Google OR-Tools Vehicle Capacity Fix | Ensure vehicle capacity parameter accommodates cluster biomass volume so CVRP routes generate | M2 | DONE | explorer_algo_pitch |
| 23 | SIH Pitch Guide Creation | Create `SIH_PITCH_GUIDE.md` in root with step-by-step click actions, talking points, and fail-safe demo | M3 | DONE | explorer_algo_pitch / ORIGINAL_REQUEST |
| 24 | DBSCAN Clustering Presentation Steps | Detail exact parameters (eps=8km, min_samples=3), click triggers, and visual validation points | M3 | DONE | explorer_algo_pitch / ORIGINAL_REQUEST |
| 25 | Google OR-Tools Presentation Steps | Detail exact VRP inputs, optimization trigger, fleet assignment, and route visualization steps | M3 | DONE | explorer_algo_pitch / ORIGINAL_REQUEST |
| 26 | Live Insertion Fail-Safe Demo | Detail exact steps to register a new field near Bathinda and demonstrate dynamic cluster absorption | M3 | DONE | explorer_algo_pitch / ORIGINAL_REQUEST |
| 27 | End-to-End Acceptance & Forensic Audit | Verify all acceptance criteria with Reviewers, Challengers, and Forensic Auditor | M4 | DONE | All / ORIGINAL_REQUEST |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Wire Dead UI Panels & Components | Features #1 to #15 (Sidebar, Map, Hover cards, Dashboards, Headers, Modals, Empty States) | Phase 0 Survey | DONE |
| M2 | Backend Workflow & Crash Resilience | Features #16 to #22 (VRP solver fallback, cluster geometry fixes, websocket resilience, harvest API connection, seed normalization) | Phase 0 Survey | DONE |
| M3 | SIH Pitch Guide (`SIH_PITCH_GUIDE.md`) | Features #23 to #26 (Comprehensive guide with DBSCAN, OR-Tools, and fail-safe demo) | Phase 0 Survey | DONE |
| M4 | Final E2E Verification & Forensic Audit | Feature #27 (Dual-track testing, Reviewers, Challengers, Forensic Auditor) | M1, M2, M3 | DONE |

---

## Interface Contracts

### Frontend ↔ Backend Endpoints
- `GET /api/v1/clusters`: Returns cluster array. Expected fields: `{ id, number, name, risk_level, riskScore, farmsCount, totalBiomass, center, polygon, status, harvestWindow, nearestBuyer }`.
- `POST /api/v1/clusters/recompute`: Recomputes DBSCAN clusters.
- `POST /api/v1/routes/optimize`: Runs VRP optimization. Input: `{ cluster_id, depot_lat, depot_lng, vehicle_capacity }`. Output: array of route objects with `id, code, buyer, buyerLocation, stops, tonnage, path`.
- `POST /api/v1/fields/register`: Registers a new field. Input: `{ farmer_name, phone, village, district, state, acres, crop_type, harvest_date, biomass, latitude, longitude }`.

---

## Code Layout
- Frontend: `c:\Users\gurut\OneDrive\Desktop\sih\frontend\`
  - Source: `frontend/src/`
  - Components: `frontend/src/components/`
  - Modals: `frontend/src/components/modals/`
  - Portals: `frontend/src/buyer_panel/`, `frontend/src/driver_panel/`
- Backend: `c:\Users\gurut\OneDrive\Desktop\sih\backend\`
  - App: `backend/app/`
  - API Routes: `backend/app/api/v1/endpoints/`
  - ML Engine: `backend/app/ml_engine/`
  - Database Models: `backend/app/db/`
- Documentation / Pitch:
  - `c:\Users\gurut\OneDrive\Desktop\sih\SIH_PITCH_GUIDE.md`
