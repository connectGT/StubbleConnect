# Dispatch for Worker M1: Frontend UI Wiring & Dead Element Fixes

## Working Directory
`c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1_ui\`

## Identity
Frontend Implementation Worker (`teamwork_preview_worker`)

## Mandatory First Step
Read the following authoritative files in order:
1. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\gurut\OneDrive\Desktop\sih\PROJECT.md`
3. `c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_ui_survey\handoff.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership (EXCLUSIVELY OWNED FILES)
You own the following frontend files. Do NOT touch any files outside this scope:
- `frontend/src/components/modals/ListViewModal.jsx`
- `frontend/src/components/BiomassMap.jsx`
- `frontend/src/components/ClusterDetailsPanel.jsx`
- `frontend/src/components/StatsRow.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/FarmerLoginPage.jsx`
- `frontend/src/components/modals/QuickActionModal.jsx`
- `frontend/src/components/RecentActivity.jsx`
- `frontend/src/components/PlannedRoutes.jsx`
- `frontend/src/components/TopBuyers.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/FarmerDashboard.jsx`

## Task Requirements
Fix and wire up all dead UI panels, buttons, hover cards, and empty states based on the catalog in `explorer_ui_survey/handoff.md`:
1. `ListViewModal.jsx`: Import `Cpu` from `lucide-react` (lines 74, 218). Wire "Plan Route" and "Inspect Map" buttons (lines 203-208) with functional `onClick` handlers. Support both `farmsCount`/`farms_count` and `totalBiomass`/`total_biomass`.
2. `BiomassMap.jsx`: Wire route polylines with `eventHandlers={{ click: ... }}` so clicking any planned route line on the map opens or displays logistics inspection. Ensure hover cards on fields, clusters, and routes render data and active controls.
3. `ClusterDetailsPanel.jsx`: Render a formatted empty state card when `selectedCluster === null` instead of returning `null`. Add fallbacks for `harvestWindow`, `avgDistance`, `nearestBuyer`, `status` when not returned by backend.
4. `StatsRow.jsx` & `App.jsx`: Wire all 6 KPI cards (`total_fields`, `total_biomass`, `active_clusters`, `routes_planned`, `high_risk`, `daily_capacity`) to open the corresponding `ListViewModal` type (`fields`, `fields`, `clusters`, `routes`, `risk`, `buyers`).
5. `Sidebar.jsx` & `FarmerDashboard.jsx`: Pass `activeTab` to `FarmerDashboard` and ensure all farmer sidebar subitems switch views or trigger modals (`report_harvest`, `payments`, `receipts`, etc.).
6. `FarmerDashboard.jsx`: Connect `onRegisterClick`, add logout button in header with `onLogout`, wire `My Tier` button to show tier benefits popover, and replace crude `alert()` calls.
7. `FarmerLoginPage.jsx`: Add "Return to Command Center" exit button calling `setUserRole('admin')`.
8. `Header.jsx`: Forward `searchTerm` to `MapSection` and `BottomRow` to filter active views.
9. `QuickActionModal.jsx`: Prevent `coords.lat` crash on `village === 'new'`. Provide default coordinates and custom village name input.
10. Empty states: Add clean empty state cards for `RecentActivity`, `PlannedRoutes`, and `TopBuyers`.
11. Portals: Ensure Buyer and Driver portal switcher or navigation is accessible in `Sidebar.jsx` or `Header.jsx`.

## Verification Requirement
Run `npm run build` in `c:\Users\gurut\OneDrive\Desktop\sih\frontend` and verify the build passes with exit code 0.
Write your completion report to `c:\Users\gurut\OneDrive\Desktop\sih\.agents\worker_m1_ui\handoff.md`.

## 2026-09-05T12:40:16Z
Invocation message received from parent `75689b5b-ec5f-4ded-bb03-59272ae7a5d5`.
Task: Implement all frontend UI wiring, dead button fixes, map click events, hover cards, and empty states.
Exclusively owned files:
- frontend/src/components/modals/ListViewModal.jsx
- frontend/src/components/BiomassMap.jsx
- frontend/src/components/ClusterDetailsPanel.jsx
- frontend/src/components/StatsRow.jsx
- frontend/src/components/Header.jsx
- frontend/src/components/Sidebar.jsx
- frontend/src/components/FarmerLoginPage.jsx
- frontend/src/components/modals/QuickActionModal.jsx
- frontend/src/components/RecentActivity.jsx
- frontend/src/components/PlannedRoutes.jsx
- frontend/src/components/TopBuyers.jsx
- frontend/src/App.jsx
- frontend/src/components/FarmerDashboard.jsx
