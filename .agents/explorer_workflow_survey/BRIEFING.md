# BRIEFING — 2026-09-05T12:18:10Z

## Mission
Investigate the end-to-end user workflow across the project (Farmer Registration & Login -> Stubble Listing & Geo-tagging -> Aggregation/Marketplace/Admin -> Logistics/Transporter assignment & Dispatch -> Status transitions & order completion). Identify crashing bugs, missing routes/controllers, schema mismatches, unhandled errors, or broken transitions.

## 🔒 My Identity
- Archetype: explorer
- Roles: Workflow & Backend Explorer
- Working directory: c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_workflow_survey\
- Original parent: 75689b5b-ec5f-4ded-bb03-59272ae7a5d5
- Milestone: Explorer Phase - Workflow & Backend Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement changes to project source code
- Files for content delivery, Messages for coordination
- Self-contained 5-component handoff report (handoff.md)
- Write only to .agents/explorer_workflow_survey/

## Current Parent
- Conversation ID: 75689b5b-ec5f-4ded-bb03-59272ae7a5d5
- Updated: 2026-09-05T12:18:10Z

## Investigation State
- **Explored paths**: `backend/app/main.py`, `models.py`, `database.py`, `config.py`, all endpoints (`farmers.py`, `fields.py`, `clusters.py`, `buyers.py`, `routes.py`, `trucks.py`, `analytics.py`, `websockets.py`, `seed.py`), ML engine (`vrp_solver.py`, `dbscan_cluster.py`, `burning_risk.py`), frontend core (`App.jsx`, `FarmerLoginPage.jsx`, `FarmerDashboard.jsx`, `BiomassMap.jsx`, `MapSection.jsx`, `ClusterDetailsPanel.jsx`, modals `ClusterModal.jsx`, `QuickActionModal.jsx`, `ListViewModal.jsx`, `RegisterOnBehalfModal.jsx`), `buyer_panel/*`, `driver_panel/*`.
- **Key findings**:
  1. CRITICAL RUNTIME CRASH: `ListViewModal.jsx` references `<Cpu />` without importing it from `lucide-react` (lines 74, 218). Clicking 'AI Config' in Sidebar crashes the UI with `ReferenceError: Cpu is not defined`.
  2. CRITICAL BACKEND CRASH: `ortools` is not installed in Python environment, causing `POST /api/v1/routes/optimize` to fail with `ModuleNotFoundError: No module named 'ortools'`.
  3. CRITICAL GEOMETRY CRASH: In `clusters.py:get_all_clusters`, if a cluster has null polygon geometry, `poly_dict["coordinates"][0]` is `[[]]`, raising `IndexError: list index out of range` and 500 error.
  4. CRITICAL CONVEX HULL CRASH: In `clusters.py:recompute_clusters`, if farms in a cluster are collinear, `scipy.spatial.ConvexHull` raises unhandled `QhullError` and crashes with 500 error.
  5. CRITICAL WEBSOCKET CRASH: In `websockets.py:broadcast()`, dropped client connections raise exceptions that are not caught in `simulate_truck_movement()`, terminating the background GPS simulation task permanently.
  6. CRITICAL FRONTEND CRASH: In `QuickActionModal.jsx`, selecting "+ Add New Field Location" (value `"new"`) accesses `PUNJAB_LOCATIONS["new"].lat`, crashing with `TypeError: Cannot read properties of undefined (reading 'lat')`.
  7. BROKEN WORKFLOW - REGISTRATION TO FIELDS DISCONNECT: `seed.py` creates fields with `+919876543210` but inserts 0 `Farmer` rows. When a user registers with 10 digits (`9876543210`), exact match `Field.phone == farmer.phone` fails, yielding 0 fields on their dashboard.
  8. BROKEN WORKFLOW - DUMMY FIELD REGISTRATION: In `FarmerDashboard.jsx`, `RegisterHarvestModal` uses a fake `setTimeout` and never issues a `fetch` request to `POST /api/v1/fields/register`.
  9. SCHEMA MISMATCHES: In `ListViewModal.jsx`, `fields` directory looks for `f.farmer_name`, `f.area_acres`, `f.is_clustered` (backend sends `farmer`, `acres`, `cluster`), rendering empty text and false "Pending" badges. Clusters directory looks for `c.farms_count`, `c.total_biomass` (backend sends camelCase `farmsCount`, `totalBiomass`), displaying `undefined`.
  10. ORPHANED PANELS & DEAD BUTTONS: Neither `BuyerPanelApp` nor `DriverPanelApp` is accessible from the UI (no switcher buttons in Sidebar/Header). Sidebar accordion in Farmer mode does not update `FarmerDashboard`'s internal tab state. Map hover cards for routes lack click actions.
- **Unexplored areas**: None, full codebase traversed and verified.

## Key Decisions Made
- Fully documented exact file paths, line numbers, error traces, and concrete remediation code for each crashing bug and workflow break in `handoff.md`.

## Artifact Index
- DISPATCH.md — Task assignment and instructions
- BRIEFING.md — Situational awareness and state
- progress.md — Liveness heartbeat and step tracking
- handoff.md — Final investigation report
