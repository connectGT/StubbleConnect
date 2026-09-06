# Project: StubbleConnect Dynamic UI & Admin Detailed Views

## Architecture
StubbleConnect is a full-stack stubble management & logistics platform consisting of:
- **Backend**: FastAPI with SQLAlchemy, GeoAlchemy2, Scikit-Learn (DBSCAN), and WebSocket live tracking.
- **Frontend**: React (Vite, Tailwind CSS, Lucide icons, Leaflet / React-Leaflet).
- **Data Flow & Dynamic Features**:
  - **Farmer Panel**: Dynamic computation of completed fields and payment totals (Biomass * Rate) from the farmer's registered fields; dynamic alert generation reflecting real field lifecycle states.
  - **Admin Live Activity**: Push-based live activity feed using WebSockets (`ws://localhost:8000/api/v1/ws/tracking`) with polling fallback, streaming `FIELD_REGISTERED`, `FARMER_REGISTERED`, and `FIELD_COLLECTED` events in real time.
  - **Admin Detailed Views**:
    - Farmer Detail Modal displaying individual farmer profile, tier, FPO ID, and owned fields matching the Farmer Portal fidelity.
    - Cluster Detail Modal & side panel displaying constituent fields, member harvest dates, biomass, and dynamic risk scores.
  - **Dynamic Cluster Metrics**: Cluster Harvest Window dynamically calculated from the date range/average of constituent fields' `harvest_date`; Cluster Risk Score dynamically calculated from active fields' dynamic risk scores.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1: Farmer Payments Dynamic Payouts | Calculate payouts for fields where `status == 'Completed'` (or `'Sold & Paid'`) using `Biomass * Rate` (default ₹2,500/T); render dynamic table and footer totals. | M1 | Survey Farmer |
| 2 | R1: Dynamic Alerts Generation | Generate contextual notifications based on real field statuses (`Completed`, `Pickup Scheduled`, `Registered`, harvest window warnings), and dynamic badge count. | M1 | Survey Farmer |
| 3 | R1: Farmer Dashboard Props Synchronization | Synchronize `activeTab`, `onTabChange`, and `fields` props with `FarmerDashboard.jsx` state and sidebar navigation. | M1 | Survey Farmer |
| 4 | R1: Backend Farmer Profile Field Status | Preserve `f.status == 'Completed'` in `build_farmer_profile` in `farmers.py`. | M1 | Survey Farmer |
| 5 | R2: Backend WebSocket Registration Broadcast | Broadcast `FIELD_REGISTERED` and `FARMER_REGISTERED` events over `manager.broadcast` in `fields.py` and `farmers.py`. | M2 | Survey Activity |
| 6 | R2: Backend Activity Feed Chronological Sorting | Ensure `GET /api/v1/analytics/activity-feed` returns genuine chronological latest events instead of UUID string sorting. | M2 | Survey Activity |
| 7 | R2: Frontend Real-time Live Activity Feed | Wire `RecentActivity.jsx` to WebSocket with fallback polling; preserve empty-state strings (`activities.length === 0` and `No recent activities logged yet.`). | M2 | Survey Activity |
| 8 | R4: Dynamic Cluster Harvest Window & Risk Metrics | Calculate Harvest Window dynamically from range of constituent fields' `harvest_date`s; calculate Cluster Risk Score from active constituent fields in `clusters.py`. | M3 | Survey Views |
| 9 | R3: Cluster Detailed View with Constituent Fields | Wire cluster polygon and row clicks to open detailed view modal and panel showing list of constituent fields with statuses and risk scores. | M3 | Survey Views |
| 10 | R3: Admin Farmer Detailed View Modal | Implement `FarmerDetailModal.jsx` matching Farmer Portal fidelity; wire Farmer rows in `ListViewModal.jsx` to open modal. | M3 | Survey Views |
| 11 | R1-R4: Full E2E Verification & Integration | Comprehensive automated tests and acceptance criteria verification across Farmer and Admin panels. | M4 | Survey 1, 2, 3 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Dynamic Farmer Panel Tabs | Features 1, 2, 3, 4 (R1) | None | IN_PROGRESS |
| M2 | Live Activity Feed in Admin Panel | Features 5, 6, 7 (R2) | None | PLANNED |
| M3 | Admin Detailed Views & Dynamic Cluster Metrics | Features 8, 9, 10 (R3, R4) | M1, M2 | PLANNED |
| M4 | E2E Integration, Challenge & Forensic Audit | Feature 11 (Full System Verification) | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### M1: Farmer Dashboard Contract
- `farmerUser.fields`: Array of field objects containing `{ id, name, location, acres, crop_type, harvest_date, biomass_est, status, status_color }`.
- Completed criteria: `field.status === 'Completed' || field.status === 'Sold & Paid'`.
- Payout formula: `(Number(field.biomass_est || field.biomass || (field.acres * 2.5)) || 0) * (Number(field.rate) || 2500)`.
- Dynamic Alerts: Generated array of alerts with `{ id, icon, text, time, type }`.

### M2: WebSocket & Activity Feed Contract
- `ws://localhost:8000/api/v1/ws/tracking` broadcasts:
  - `type: "FIELD_REGISTERED"`: `{ type: "FIELD_REGISTERED", data: { id, farmer_name, village, acres, biomass, title, subtitle, time } }`
  - `type: "FARMER_REGISTERED"`: `{ type: "FARMER_REGISTERED", data: { id, name, phone, village, district, title, subtitle, time } }`
  - `type: "FIELD_COLLECTED"`: `{ type: "FIELD_COLLECTED", data: { field_id, truck_id, timestamp, new_status: "Completed" } }`
- `GET /api/v1/analytics/activity-feed` returns newest 10 events formatted as:
  `{ id, type: "field_registered" | "farmer_registered" | "pickup_completed", title, subtitle, time }`.

### M3: Admin Detailed Views & Cluster Metrics Contract
- `GET /api/v1/clusters/` returns each cluster with:
  - `harvest_window`: Derived formatted string (e.g., `"01 Sep - 09 Sep 2026"`).
  - `harvestWindow`: Mirror of `harvest_window`.
  - `risk_score`: Integer average of active constituent fields' risk scores.
  - `riskScore`: Mirror of `risk_score`.
  - `fields`: Array of constituent field objects `{ id, farmer_name, phone, village, acres, biomass, harvest_date, status, risk_score }`.
- `FarmerDetailModal`: Accepts `farmer` or `phone`, fetches `/api/v1/farmers/me?phone=...` or uses passed profile, displaying tier, FPO ID, contact info, total earnings/biomass, and fields table.
- `ClusterModal` / `ClusterDetailsPanel`: Displays constituent `cluster.fields` table with clickable farmer rows.

---

## Code Layout
- `backend/app/api/v1/endpoints/farmers.py`: Farmer profile and fields status handling.
- `backend/app/api/v1/endpoints/fields.py`: Field registration and WebSocket event broadcast.
- `backend/app/api/v1/endpoints/analytics.py`: Real-time and historical activity feed endpoint.
- `backend/app/api/v1/endpoints/websockets.py`: ConnectionManager and WebSocket broadcasting.
- `backend/app/api/v1/endpoints/clusters.py`: Dynamic cluster metrics (Harvest Window, Risk Score) & constituent fields.
- `frontend/src/components/FarmerDashboard.jsx`: Dynamic Payments and Alerts tabs.
- `frontend/src/components/RecentActivity.jsx`: Live activity feed with WebSocket and polling fallback.
- `frontend/src/components/modals/ListViewModal.jsx`: Admin list views with clickable farmer rows.
- `frontend/src/components/modals/ClusterModal.jsx`: Cluster details modal with constituent fields table.
- `frontend/src/components/modals/FarmerDetailModal.jsx`: New individual farmer detailed view modal.
- `frontend/src/components/ClusterDetailsPanel.jsx`: Map side-panel for cluster inspection.
- `frontend/src/components/BiomassMap.jsx`: Leaflet map with cluster polygon click handling.
- `frontend/tests/`: Empirical challenge and unit test suite.
