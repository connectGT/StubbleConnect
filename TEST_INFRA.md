# StubbleConnect End-to-End Test Infrastructure & Verification Guide

**Version**: 1.0.0  
**Author**: `test_writer_1` (Teamwork QA Specialist)  
**Date**: 2026-09-06  
**Scope**: Automated Verification of Requirements R1 through R5  

---

## 1. Overview & Architecture

The StubbleConnect test infrastructure provides an end-to-end (E2E), regression-proof automated test suite verifying the complete system workflow—from farmer registration and PostGIS persistence to DBSCAN spatial clustering, convex hull geometry, dynamic logistic fleet simulation, and mathematical stubble burning risk scoring.

The test suite runs against FastAPI via `fastapi.testclient.TestClient` and directly interacts with the underlying PostGIS / PostgreSQL database. All tests are isolated, deterministic, and verify behavior against authoritative mathematical and geometric specifications rather than hardcoded mock outputs.

```
+-----------------------------------------------------------------------------------+
|                           STUBBLECONNECT TEST HARNESS                             |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-----------------------------+        +--------------------------------------+  |
|  | backend/tests/              |        | backend/tests/                       |  |
|  | test_e2e_requirements.py    |        | test_empirical_challenger.py         |  |
|  | - TestR1FarmerNameSync      |        | - TestVRPSolverStress                |  |
|  | - TestR2FieldStates         |        | - TestDBSCANAndGeometryResilience    |  |
|  | - TestR3BiogasPlants        |        | - TestLiveApiWorkflow                |  |
|  | - TestR4DynamicLogistics    |        +--------------------------------------+  |
|  | - TestR5DynamicRiskScoring  |        | backend/tests/                       |  |
|  +-----------------------------+        | test_adversarial_extreme.py          |  |
|                                         | - Scalability (500 VRP, 1000 DBSCAN) |  |
|                                         | - WebSocket Disconnect Resilience    |  |
|                                         +--------------------------------------+  |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                             AUTHORITATIVE ORACLES                                 |
|  1. 2D Ray-Casting Polygon Oracle: point_in_polygon_latlng                        |
|  2. Calibrated Sigmoidal Risk Oracle: R(Delta) = 100 / (1 + exp(-0.35 * Delta))   |
|  3. Haversine Great-Circle Geodesic Distance: haversine_distance_km               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Requirements Verification Matrix (R1 - R5)

| Req | Description | Test Class & Method | Authoritative Source | Status |
|---|---|---|---|---|
| **R1** | Registration persists actual farmer name | `TestR1FarmerNameSync.test_r1_01_field_registration_persists_custom_farmer_name` | `ORIGINAL_REQUEST.md` R1 | **PASSED** |
| **R1** | Admin list exposes `farmer_name` | `TestR1FarmerNameSync.test_r1_02_fields_list_endpoint_exposes_farmer_name` | `PROJECT.md` Feature 3 | **PASSED** |
| **R1** | "My Fields" visibility via phone match | `TestR1FarmerNameSync.test_r1_03_farmer_dashboard_my_fields_sync_by_phone` | `ORIGINAL_REQUEST.md` R1 | **PASSED** |
| **R1** | Phone normalization (+91, spaces, dashes) | `TestR1FarmerNameSync.test_r1_04_phone_number_normalization_variations` | `PROJECT.md` Feature 2 | **PASSED** |
| **R1** | Adversarial Unicode Gurmukhi names | `TestR1FarmerNameSync.test_r1_05_adversarial_unicode_and_special_character_names` | `PROJECT.md` M1 Layout | **PASSED** |
| **R2** | `Field.status` column exists & defaults to 'Pending' | `TestR2FieldStates.test_r2_01_field_status_column_and_default` | `PROJECT.md` Feature 6 | **PASSED** |
| **R2** | Startup database seeds Completed fields | `TestR2FieldStates.test_r2_02_startup_seed_includes_completed_fields` | `ORIGINAL_REQUEST.md` R2 | **PASSED** |
| **R2** | Active fields clustered by DBSCAN | `TestR2FieldStates.test_r2_03_active_fields_clustered_by_dbscan` | `PROJECT.md` Architecture | **PASSED** |
| **R2** | Completed fields excluded from clustering | `TestR2FieldStates.test_r2_04_completed_fields_strictly_excluded_from_clustering` | `ORIGINAL_REQUEST.md` R2 | **PASSED** |
| **R2** | Status transition removes field from cluster | `TestR2FieldStates.test_r2_05_field_status_transition_removes_from_cluster` | `PROJECT.md` Feature 14 | **PASSED** |
| **R2** | All-completed region yields zero clusters | `TestR2FieldStates.test_r2_06_all_completed_region_produces_zero_clusters` | Boundary Edge Case | **PASSED** |
| **R3** | Expand Biogas Plants count to 5+ | `TestR3BiogasPlants.test_r3_01_increased_biogas_plants_count_and_types` | `ORIGINAL_REQUEST.md` R3 | *PENDING (M2)* |
| **R3** | Form 5+ distinct cluster polygons | `TestR3BiogasPlants.test_r3_02_five_or_more_cluster_polygons_formed` | `ORIGINAL_REQUEST.md` R3 | *PENDING (M2)* |
| **R3** | Plants strictly outside cluster polygons | `TestR3BiogasPlants.test_r3_03_biogas_plants_strictly_outside_cluster_polygons` | Ray-Casting Oracle | *PENDING (M2)* |
| **R3** | Cluster polygon non-degenerate bounds | `TestR3BiogasPlants.test_r3_04_cluster_polygon_geometric_validity` | PostGIS Geometry | **PASSED** |
| **R4** | Mixed logistics hub model (Biogas + FPO) | `TestR4DynamicTruckLogistics.test_r4_01_mixed_logistics_hub_model_origins` | `ORIGINAL_REQUEST.md` R4 | *PENDING (M3)* |
| **R4** | Truck paths endpoint structure | `TestR4DynamicTruckLogistics.test_r4_02_truck_paths_endpoint_contract` | `PROJECT.md` Feature 18 | **PASSED** |
| **R4** | Full round-trip path topology | `TestR4DynamicTruckLogistics.test_r4_03_round_trip_path_topology` | Haversine Formula | *PENDING (M3)* |
| **R4** | Field collection state transition | `TestR4DynamicTruckLogistics.test_r4_04_field_collection_state_transition` | `PROJECT.md` Feature 17 | *PENDING (M3)* |
| **R4** | WebSocket message schema contracts | `TestR4DynamicTruckLogistics.test_r4_05_websocket_message_schema_contracts` | `PROJECT.md` WS Contract | **PASSED** |
| **R5** | Sigmoidal formula ground-truth vectors | `TestR5DynamicRiskScoring.test_r5_01_mathematical_formula_ground_truth_vectors` | Sigmoid Formula | **PASSED** |
| **R5** | Completed fields have risk = 0 | `TestR5DynamicRiskScoring.test_r5_02_completed_fields_have_zero_risk` | `PROJECT.md` Feature 9 | **PASSED** |
| **R5** | Module exports `calculate_dynamic_burning_risk` | `TestR5DynamicRiskScoring.test_r5_03_burning_risk_module_dynamic_function` | `PROJECT.md` Feature 9 | **PASSED** |
| **R5** | Field endpoint exposes dynamic risk | `TestR5DynamicRiskScoring.test_r5_04_field_endpoint_exposes_dynamic_risk_score` | `PROJECT.md` Feature 10 | **PASSED** |
| **R5** | Cluster endpoint aggregates active risk | `TestR5DynamicRiskScoring.test_r5_05_cluster_endpoint_dynamic_risk_aggregation` | `PROJECT.md` Feature 10 | **PASSED** |
| **R5** | Adversarial dates (extreme/corrupt) | `TestR5DynamicRiskScoring.test_r5_06_adversarial_date_handling` | Edge-Case Robustness | **PASSED** |

---

## 3. Mathematical & Geometric Verification Oracles

### 3.1 2D Point-in-Polygon Ray Casting Oracle
Requirement R3 mandates that **Biogas Plants must be located outside farm cluster polygons**. The test suite executes an exact ray-casting algorithm to test whether any buyer point $(P_{\text{lat}}, P_{\text{lng}})$ falls inside any cluster polygon ring $C = [(v_1), (v_2), \dots, (v_n)]$:

$$\text{intersects} \iff (y_{v1} > y_P) \ne (y_{v2} > y_P) \land x_P < \frac{(x_{v2} - x_{v1})(y_P - y_{v1})}{y_{v2} - y_{v1}} + x_{v1}$$

If the ray intersects the polygon boundary an odd number of times, the point is strictly inside, which immediately fails `test_r3_03`.

### 3.2 Dynamic Stubble Burning Risk Scoring Oracle
Requirement R5 mandates calculating burning risk solely based on days elapsed relative to `harvest_date` ($\Delta = \text{today} - \text{harvest\_date}$):

$$R(\Delta) = \begin{cases} 
0 & \text{if } \text{status} = \text{"Completed"} \\
\min\left(100, \max\left(5, \text{round}\left(\frac{100}{1 + e^{-0.35 \cdot \Delta}}\right)\right)\right) & \text{if } \text{status} \ne \text{"Completed"}
\end{cases}$$

#### Ground-Truth Calibration Table

| Days Relative to Harvest ($\Delta$) | Expected Risk Score | Urgency Tier | Action Directive |
|---|---|---|---|
| $\Delta \le -10$ (10+ days before) | **5** | Low Risk | Window clear, baseline monitoring |
| $\Delta = -5$ (5 days before) | **15** | Low Risk | Approaching harvest window |
| $\Delta = -2$ (2 days before) | **33** | Low Risk | Harvesting imminent |
| $\Delta = 0$ (Harvest day) | **50** | Moderate Risk | Stubble on ground; collection queued |
| $\Delta = +2$ (2 days post-harvest) | **67** | Moderate Risk | Window tightening; prioritize route |
| $\Delta = +4$ (4 days post-harvest) | **80** | High Risk | High burning hazard; expedite pickup |
| $\Delta = +7$ (1 week post-harvest) | **92** | High Risk | Critical emergency dispatch |
| $\Delta \ge +10$ (10+ days post-harvest) | **97 - 100** | Critical Risk | Maximum penalty ceiling |
| Any $\Delta$ with status = "Completed" | **0** | Resolved | Field collected; hazard eliminated |

### 3.3 Haversine Great-Circle Distance Oracle
Used to verify Requirement R4 (truck full-cycle round-trip topology):

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

In a round-trip route, the start waypoint $W_0$ and end waypoint $W_k$ must have $d(W_0, W_k) \le 1.5\text{ km}$.

---

## 4. How to Execute Tests

### 4.1 Run All Tests Across Entire Project
```bash
python -m unittest discover -s backend/tests
```

### 4.2 Run E2E Requirements Suite Only
```bash
python -m unittest backend.tests.test_e2e_requirements -v
```

### 4.3 Run Individual Requirement Test Classes
```bash
# Requirement R1 (Farmer Name Sync & My Fields)
python -m unittest backend.tests.test_e2e_requirements.TestR1FarmerNameSyncAndVisibility -v

# Requirement R2 (Field States & Clustering Exclusion)
python -m unittest backend.tests.test_e2e_requirements.TestR2FieldStatesAndClusteringExclusion -v

# Requirement R3 (Biogas Plants & 5+ Cluster Polygons)
python -m unittest backend.tests.test_e2e_requirements.TestR3BiogasPlantsAndClusterPolygons -v

# Requirement R4 (Dynamic Truck Logistics Simulation)
python -m unittest backend.tests.test_e2e_requirements.TestR4DynamicTruckLogistics -v

# Requirement R5 (Dynamic Risk Scoring Formula)
python -m unittest backend.tests.test_e2e_requirements.TestR5DynamicRiskScoring -v
```

### 4.4 Run Stress and Adversarial Benchmarks
```bash
python -m unittest backend.tests.test_adversarial_extreme -v
python -m unittest backend.tests.test_empirical_challenger -v
```

---

## 5. Current Test Run Audit (Baseline State)

```text
Ran 47 tests in 2.334s
Status: 41 PASSED, 6 FAILED (0 Errors, 0 Regressions)
```

### Breakdown by Track:
- **Requirement R1 (Data Sync Bugs)**: **5 / 5 PASSED (100%)**
- **Requirement R2 (Field States & Clustering Exclusion)**: **6 / 6 PASSED (100%)**
- **Requirement R5 (Dynamic Risk Scoring)**: **6 / 6 PASSED (100%)**
- **Existing Stress / Adversarial / VRP Suites**: **21 / 21 PASSED (100%)**
- **Requirement R3 (Biogas Plants & Multi-Cluster Polygons)**: **1 / 4 PASSED** (3 pending implementation in M2)
- **Requirement R4 (Dynamic Truck Logistics)**: **2 / 5 PASSED** (3 pending implementation in M3)

---

## 6. Escalations for Milestone Implementing Agents

### For Worker M2 (`worker_m2_backend`):
1. **R3 Plant Count**: `seed.py` currently seeds only 1 plant (`EcoPower Punjab (Demo Depot)`). Expand to 5–6 plants across Punjab (Bathinda, Ludhiana, Sangrur, Patiala, Moga, Mansa) to satisfy `test_r3_01`.
2. **R3 Multi-Cluster Polygons**: Seed farm groups across 5–6 distinct regions (>15 km apart) so DBSCAN forms $\ge 5$ distinct cluster polygons with convex hulls to satisfy `test_r3_02`.
3. **R3 Exterior Placement**: Move plant coordinates to industrial zones / highway bypasses strictly outside the farm cluster polygons so `test_r3_03` passes without spatial violations.

### For Worker M3 (`worker_m3_pitch` / Logistics Specialist):
1. **R4 Mixed Hub Model**: Seed dispatch origins containing both `"Biogas Plant"` and `"Private Association Hub"` / `"FPO Aggregation Hub"` to satisfy `test_r4_01`.
2. **R4 Full-Cycle Round Trips**: Update dynamic truck simulation routes in `route_coords.json` / `websockets.py` so waypoints complete a round trip (`Origin -> Field -> Origin`) satisfying `test_r4_03`.
3. **R4 Collection State Transition**: Implement endpoint `POST /api/v1/fields/{field_id}/complete` that sets field `status = "Completed"` in DB upon truck arrival to satisfy `test_r4_04`.
