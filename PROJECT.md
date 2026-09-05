# Project: StubbleConnect Fixes & Advanced Logistics Enhancement

## Architecture
StubbleConnect is a full-stack platform consisting of:
- **Backend**: FastAPI with SQLAlchemy, GeoAlchemy2 (PostGIS), Scikit-Learn (DBSCAN), and WebSocket live tracking.
- **Frontend**: React (Vite, Tailwind CSS, Lucide icons, Leaflet / React-Leaflet).
- **Data Flow**:
  - Farmers register fields through the Farmer Portal or Admin Quick Actions -> saved to PostGIS `fields` table.
  - ML Engine groups active fields into regional clusters via DBSCAN ($eps=8\text{km}, min\_samples=3$) and creates ConvexHull bounding polygons. Completed fields are strictly excluded.
  - Offtaker Buyers (Biogas Plants) and Private Association Hubs (FPO aggregation depots) serve as logistics dispatch origins.
  - WebSocket Simulation Service runs dynamic truck cycles (`Origin -> Field -> Origin`), dynamically marks fields as `Completed` upon collection, and broadcasts real-time GPS telemetry and collection events.
  - Dynamic Risk Scoring computes burning risk $R(\Delta) \in [5, 100]$ based solely on days elapsed relative to `harvest_date`, with $R = 0$ for completed fields.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1: Farmer Name Input in Field Registration | Add Farmer Name and Phone input fields to QuickActionModal; prefill from logged-in user if available; prevent fallback to hardcoded "Farmer". | M1 | Survey 1 |
| 2 | R1: Farmer Registration Backend Endpoint Fixes | Ensure `POST /api/v1/fields/register` normalizes phone numbers and correctly saves provided `farmer_name` and `phone`. | M1 | Survey 1 |
| 3 | R1: Admin Panel Fields List Farmer Name Display | `ListViewModal.jsx` and `BiomassMap.jsx` display actual `farmer_name` rather than "Farmer". | M1 | Survey 1 |
| 4 | R1: Farmer Dashboard "My Fields" Auto-Sync | Wire `RegisterHarvestModal` to call backend registration API, emit `refresh-dashboard-data`, and reload farmer profile so new fields immediately appear in "My Fields". | M1 | Survey 1 |
| 5 | R1: Farmer Dashboard Harvest Date Display Fix | Fix field attribute reference in `FarmerDashboard.jsx` (`field.harvest_date || field.harvestDate`) so valid harvest dates render instead of "Not set". | M1 | Survey 1 |
| 6 | R2: Field Status Schema Addition | Add `status = Column(String, default="Pending")` to `Field` model in `models.py` and schemas in `schemas.py`. | M1 | Survey 1 & 2 |
| 7 | R2: Seed Completed Fields at Startup | Seed 2-3 fields with `status="Completed"` at startup in `seed.py` (including Gurmit Singh's past field and regional fields). | M1 | Survey 1 & 2 |
| 8 | R2: Admin Panel Greyed-out Rendering | Render completed fields as greyed-out (`opacity-60`, grey badge, grey circular pin `#94a3b8`) in `ListViewModal.jsx` and `BiomassMap.jsx`. | M1 | Survey 1 & 2 |
| 9 | R5: Mathematical Dynamic Risk Scoring Formula | Implement calibrated sigmoidal logistic growth formula $R(\Delta) = \min(100, \max(5, \text{round}(100 / (1 + e^{-0.35 \cdot \Delta}))))$ based solely on days since `harvest_date` (and 0 for Completed fields) in `burning_risk.py`. | M2 | Survey 3 |
| 10 | R5: Field & Cluster Dynamic Risk Integration | Include dynamic risk score in `GET /api/v1/fields/` and aggregate average active risk score in `clusters.py`. | M2 | Survey 3 |
| 11 | R3: Increase Biogas Plants (Buyers) Count | Expand Biogas Plants / Offtakers to 6 facilities across Punjab in backend `seed.py` and frontend `mockData.js`. | M2 | Survey 2 |
| 12 | R3: Place Plants Outside Farm Cluster Polygons | Adjust plant coordinates to industrial zones/bypasses located strictly outside the cluster convex hull bounding polygons. | M2 | Survey 2 |
| 13 | R3: Generate 4-5 More Farm Cluster Polygons | Seed 5-6 geographically separated farm groups across Punjab (>15 km apart) so DBSCAN forms 5-6 distinct clusters and ConvexHull polygons. | M2 | Survey 2 |
| 14 | R2: Exclude Completed Fields from ML Clustering | Update `clusters.py:recompute_clusters` to query only active fields (`Field.status != "Completed"`), leaving completed fields unclustered. | M2 | Survey 1 & 2 |
| 15 | R4: Mixed Logistics Hub Model | Establish fleet origins: 50% from Biogas Plants and 50% from Private Association Hubs (FPO depots). | M3 | Survey 3 |
| 16 | R4: Dynamic Full-Cycle Waypoint Generation | Generate outbound and inbound waypoints for trucks: `Origin (Hub/Plant) -> Target Field -> Origin (Hub/Plant)`. | M3 | Survey 3 |
| 17 | R4: Collection Trigger & State Transition | When a truck reaches a field, transition field `status` to `"Completed"` in DB, update truck load, and broadcast `FIELD_COLLECTED` WebSocket event. | M3 | Survey 3 |
| 18 | R4: Map Animation & WebSocket Ingestion | Fix `truckPaths` parsing bug in `BiomassMap.jsx`, handle `FIELD_COLLECTED` in real time, apply smooth CSS glide transitions, and render distinct icons for Hubs vs Plants. | M3 | Survey 3 |
| 19 | R1-R5: Full Integration & Verification | Run end-to-end regression tests, API checks, and UI acceptance criteria verification. | M3 | Survey 1, 2, 3 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Data Models, Field States & Data Sync | Features 1, 2, 3, 4, 5, 6, 7, 8 (R1 & R2) | None | IN_PROGRESS |
| M2 | Biogas Plants, Multi-Cluster Polygons & Dynamic Risk | Features 9, 10, 11, 12, 13, 14 (R3, R2 exclusion, R5) | M1 | PLANNED |
| M3 | Dynamic Truck Logistics & Mixed Hub Simulation | Features 15, 16, 17, 18, 19 (R4, integration & verification) | M1, M2 | PLANNED |

---

## Interface Contracts

### M1 ↔ M2 Contract
- `Field.status`: string column with possible values `"Pending"`, `"Clustered"`, `"Completed"`.
- `GET /api/v1/fields/`: returns list of dicts with keys: `id`, `farmer_name`, `farmer`, `village`, `acres`, `biomass`, `coords: [lat, lng]`, `cluster`, `harvest_date`, `status`, `risk_score`.
- `POST /api/v1/fields/register`: accepts `farmer_name`, `phone`, `village`, `district`, `state`, `acres`, `crop_type`, `latitude`, `longitude`, `harvest_date`, `status` (optional, default `"Pending"`).

### M2 ↔ M3 Contract
- `clusters.py:recompute_clusters`: only clusters active fields (`status != "Completed"`).
- `buyers` table & `mockData.js`: contains both facility types:
  - `"Biogas Plant"` / `"Bio-CNG Facility"` (Commercial offtakers)
  - `"Private Association Hub"` / `"FPO Aggregation Hub"` (Farmer producer organizations)
- All plant/hub coordinates are outside farm cluster polygons.

### M3 WebSocket Contract
- `ws://localhost:8000/api/v1/ws/tracking` broadcasts:
  - `type: "TRUCK_UPDATE"`: `{ truck_id, current_coords: [lat, lng], status, tonnage, origin, origin_type, destination, progress }`
  - `type: "FIELD_COLLECTED"`: `{ field_id, truck_id, timestamp, new_status: "Completed" }`
- Endpoint `POST /api/v1/fields/{field_id}/complete` updates database status to `"Completed"`.

---

## Code Layout
- `backend/app/db/models.py`: Database models (`Field`, `Buyer`, `Cluster`, etc.)
- `backend/app/schemas/schemas.py`: Pydantic request/response validation
- `backend/app/api/v1/endpoints/fields.py`: Field registration and retrieval endpoints
- `backend/app/api/v1/endpoints/farmers.py`: Farmer profile and owned fields
- `backend/app/api/v1/endpoints/seed.py`: Startup database seeding (fields, buyers, clusters)
- `backend/app/api/v1/endpoints/clusters.py`: DBSCAN clustering and convex hull polygons
- `backend/app/ml_engine/risk_model/burning_risk.py`: Dynamic mathematical risk formula
- `backend/app/api/v1/endpoints/websockets.py`: Background truck simulation & WebSocket broadcasting
- `backend/app/api/v1/endpoints/trucks.py`: Truck path REST API
- `frontend/src/components/modals/QuickActionModal.jsx`: Registration modal with farmer name inputs
- `frontend/src/components/modals/ListViewModal.jsx`: Admin list view with greyed-out completed fields
- `frontend/src/components/FarmerDashboard.jsx`: Farmer portal with "My Fields" and real harvest reporting
- `frontend/src/components/BiomassMap.jsx`: Leaflet map with animated trucks, distinct hubs/plants, grey pins
- `frontend/src/data/mockData.js`: Frontend fallback and coordinate configurations
- `backend/tests/`: Automated unit and integration test suite
