# Handoff Report: Milestone 2 — Biogas Plants, Multi-Cluster Polygons & Dynamic Risk

**Agent**: `worker_m2`  
**Milestone**: M2 (Requirements R3, R2 exclusion, R5)  
**Date**: 2026-09-06  
**Status**: Hard Handoff — Complete  

---

## 1. Observation

### 1.1 Initial Baseline State
- **Buyer Facilities**:
  - `backend/app/api/v1/endpoints/seed.py`: Originally seeded only 1 buyer facility (`"EcoPower Punjab (Demo Depot)"` at `POINT(74.98 30.22)`), which was located at the exact centroid of the farm fields.
  - `frontend/src/data/mockData.js`: Only 3 buyers were present, and `GreenFuel Plant` at `[30.232, 75.015]` was located inside the `Cluster #12` polygon `[[30.26, 74.93], [30.29, 74.99], [30.26, 75.05], [30.19, 75.04], [30.17, 74.96]]`.
- **Clustering & Polygons**:
  - In `seed.py`, only 10 fields were seeded, all located within ~5 km of Bathinda `(30.22, 74.98)`.
  - DBSCAN (`eps=8.0km, min_samples=3`) grouped all active fields into a single cluster.
  - `seed.py` did not invoke `recompute_clusters(db)`, leaving the `clusters` table empty upon startup until an explicit API call was made.
- **Dynamic Risk Score Integration**:
  - In `backend/app/api/v1/endpoints/clusters.py`, cluster `risk_score` was hardcoded based purely on total biomass (`85 if cres["total_biomass_tonnes"] > 50 else (45 if cres["total_biomass_tonnes"] > 30 else 15)`), rather than aggregating member fields' dynamic risk scores.
- **Test Suite Status**:
  - In `backend/tests/test_e2e_requirements.py`, `TestR3BiogasPlantsAndClusterPolygons` had `test_r3_01`, `test_r3_02`, and `test_r3_03` skipped due to pending M2 implementation.

---

## 2. Logic Chain

1. **Expanding Biogas Plants & Exterior Placement (R3)**:
   - *Requirement*: Increase Biogas Plants (buyers) to 5+, positioned strictly exterior to cluster bounding polygons.
   - *Action*: Seeded 6 distinct facilities across Punjab in `seed.py` and `mockData.js`:
     1. `"GreenFuel Bio-CNG Plant (Bathinda)"` at `(30.275, 74.880)` (Bio-CNG Facility)
     2. `"Punjab Bio-Energy Refinery (Ludhiana)"` at `(30.880, 75.830)` (Biogas Power Plant)
     3. `"Malwa Green Power Off-Taker (Mansa)"` at `(29.930, 75.340)` (Biomass Power Plant)
     4. `"Verka Bio-Thermal Co-gen (Sangrur)"` at `(30.230, 75.820)` (Biogas Plant)
     5. `"AgriPower Solutions Depot (Moga)"` at `(30.820, 75.180)` (Private Association Hub)
     6. `"Satluj Bio-Pellet Works (Kotkapura)"` at `(30.550, 74.750)` (FPO Aggregation Hub)
   - *Geometric Verification*: Every plant is located >8 km away from the nearest farm cluster centroid and exterior to all convex hull polygons, passing the 2D Ray-Casting Oracle `point_in_polygon_latlng` with 0 violations.

2. **Generating 5–6 Distinct Regional Farm Clusters (R3 & R2)**:
   - *Requirement*: Form 5–6 distinct cluster polygons across Punjab via DBSCAN, while excluding completed fields.
   - *Action*: Seeded 6 geographically separated regions in `seed.py` (>15 km apart):
     - Region 1: Bathinda Central Core (`[30.22, 74.98]`)
     - Region 2: Rampura Phul & Bhucho (`[30.27, 75.14]`)
     - Region 3: Talwandi Sabo & Maur (`[30.02, 75.08]`)
     - Region 4: Mansa & Budhlada (`[29.99, 75.40]`)
     - Region 5: Goniana & Jaitu (`[30.35, 74.88]`)
     - Region 6: Malout & Gidderbaha (`[30.18, 74.60]`)
   - *Geometry*: Placed 4 active fields per region in quadrilateral offsets `(0.015, 0.010)`, `(-0.012, 0.015)`, `(-0.015, -0.012)`, `(0.010, -0.015)` (inter-point distances ~2.5–4.4 km < 8.0 km eps), guaranteeing non-collinear convex hulls with $\ge 4$ vertices.
   - *Completed Field Exclusion*: Seeded 3 fields with `status="Completed"` (including Gurmit Singh's past field `Basmati 1509` in Bathinda, plus fields in Talwandi Sabo and Goniana). In `clusters.py`, `recompute_clusters` filters `(Field.status != "Completed") | (Field.status.is_(None))`, so completed fields remain unclustered (`cluster_id = None`).
   - *Auto-recompute*: `seed_database(db)` calls `recompute_clusters(db)` at the end of seeding so the database is populated with clusters and convex hulls immediately on startup.

3. **Dynamic Risk Score Integration (R5)**:
   - *Requirement*: Dynamic risk scoring calculated from `harvest_date` and aggregated in cluster endpoints.
   - *Action*: Seeded varied harvest dates (today $\Delta=0$, past $\Delta \in [2, 8]$ days, future $\Delta \in [-8, -2]$ days).
   - In `backend/app/api/v1/endpoints/clusters.py`:
     - Computed member field dynamic risk scores using `calculate_dynamic_burning_risk(field.harvest_date, field.status)`.
     - Calculated cluster `risk_score` as the rounded average:
       $$\text{avg\_risk} = \text{round}\left(\frac{1}{N}\sum_{i=1}^{N} R_i\right)$$
     - Dynamically determined `risk_level` ("High Risk" $\ge 75$, "Moderate Risk" $\ge 45$, "Low Risk" $< 45$) and `recommended_action`.
     - Calculated nearest buyer facility and distance using haversine geodesic distance.

4. **Frontend Map & Mock Data Synchronization**:
   - In `frontend/src/data/mockData.js`: Updated `clustersData`, `buyersData`, and `routesData` to match the 6 regional clusters and 6 plants.
   - In `frontend/src/components/BiomassMap.jsx`: Expanded cluster color palette to 6 distinct colors (`['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']`).

---

## 3. Caveats

- **Milestone 3 Dependency**: Requirement R4 full-cycle truck route topology (`test_r4_03`) remains pending for Milestone 3 (dynamic truck simulation worker). It is the only test skipped across the entire test suite.
- **Database Dependency**: The PostGIS/PostgreSQL service or SQLite fallback must be running for endpoints to execute. Both are supported by SQLAlchemy and GeoAlchemy2.

---

## 4. Conclusion

Milestone 2 implementation is complete and verified:
1. **6 Biogas Plants / Offtakers** are seeded across Punjab and positioned strictly outside farm cluster polygons.
2. **6 Distinct Cluster Polygons** are formed dynamically by DBSCAN and ConvexHull geometry.
3. **Completed fields** are initialized at startup, rendered greyed out, and strictly excluded from clustering.
4. **Cluster Dynamic Risk Scores** are calculated as the rounded average of member active fields' dynamic risk scores.
5. **`TestR3BiogasPlants`** tests (`test_r3_01`, `test_r3_02`, `test_r3_03`, `test_r3_04`) are unskipped and pass with 0 failures and 0 errors.

---

## 5. Verification Method

### 5.1 Automated Test Execution Commands

```bash
# 1. Run all backend tests across the entire repository
python -m unittest discover -s backend/tests

# Result:
# Ran 63 tests in 5.279s
# OK (skipped=1) -> 62 passed, 0 failures, 0 errors.

# 2. Run Requirement R3 (Biogas Plants & 5+ Cluster Polygons) specifically
python -m unittest backend.tests.test_e2e_requirements.TestR3BiogasPlantsAndClusterPolygons -v

# Result:
# test_r3_01_increased_biogas_plants_count_and_types ... ok
# test_r3_02_five_or_more_cluster_polygons_formed ... ok
# test_r3_03_biogas_plants_strictly_outside_cluster_polygons ... ok
# test_r3_04_cluster_polygon_geometric_validity ... ok
# Ran 4 tests in 0.464s, OK

# 3. Run Requirement R2 (Field States & Clustering Exclusion)
python -m unittest backend.tests.test_e2e_requirements.TestR2FieldStatesAndClusteringExclusion -v
# Ran 6 tests, OK

# 4. Run Requirement R5 (Dynamic Risk Scoring)
python -m unittest backend.tests.test_e2e_requirements.TestR5DynamicRiskScoring -v
# Ran 6 tests, OK

# 5. Run Requirement R1 (Farmer Name Sync)
python -m unittest backend.tests.test_e2e_requirements.TestR1FarmerNameSyncAndVisibility -v
# Ran 5 tests, OK

# 6. Run frontend lint
cd frontend && npm run lint
# Result: 0 errors
```

### 5.2 Files Modified
- `backend/app/api/v1/endpoints/seed.py`
- `backend/app/api/v1/endpoints/clusters.py`
- `backend/tests/test_e2e_requirements.py`
- `frontend/src/data/mockData.js`
- `frontend/src/components/BiomassMap.jsx`
