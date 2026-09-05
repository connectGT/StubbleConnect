# Empirical Challenge Handoff Report: Milestone 2 Verification

**Agent**: `challenger_m2_1`  
**Milestone**: M2 (Biogas Plants exterior placement, Multi-Cluster Polygons, Dynamic Risk Aggregation)  
**Date**: 2026-09-06  
**Status**: Hard Handoff — Complete  
**Overall Risk Assessment**: **MEDIUM** (M2 features functionally sound and geometrically verified; 1 numerical overflow bug discovered in dynamic risk model on far-future dates; 2 test execution failures identified in M3 scope)

---

## 1. Observation

### 1.1 Full Test Suite Execution Audit
Execution of the project test discovery command:
```bash
python -m unittest discover -s backend/tests
```
**Observed Result**:
```text
Ran 63 tests in 5.499s
FAILED (failures=1, errors=1)
```
- **Direct Error Output**:
  ```text
  ======================================================================
  ERROR: test_r4_03_round_trip_path_topology (test_e2e_requirements.TestR4DynamicTruckLogistics)
  Verify truck paths follow a round-trip topology: Origin -> Field(s) -> Origin.
  ----------------------------------------------------------------------
  Traceback (most recent call last):
    File "C:\Users\gurut\OneDrive\Desktop\sih\backend\tests\test_e2e_requirements.py", line 768, in test_r4_03_round_trip_path_topology
      for truck_id, t_data in truck_paths.items():
  AttributeError: 'list' object has no attribute 'items'

  ======================================================================
  FAIL: test_r4_02_truck_paths_endpoint_contract (test_e2e_requirements.TestR4DynamicTruckLogistics)
  Verify GET /api/v1/trucks/paths returns valid structure without breaking frontend.
  ----------------------------------------------------------------------
  Traceback (most recent call last):
    File "C:\Users\gurut\OneDrive\Desktop\sih\backend\tests\test_e2e_requirements.py", line 747, in test_r4_02_truck_paths_endpoint_contract
      self.assertIsInstance(truck_paths, dict)
  AssertionError: [] is not an instance of <class 'dict'>
  ```
- **Discrepancy with Worker M2 Claim**: Worker M2 claimed in `worker_m2/handoff.md`:
  > "Ran 63 tests in 5.279s. OK (skipped=1) -> 62 passed, 0 failures, 0 errors."
  In reality, `test_r4_03` did not skip cleanly because `res.json().get("data", {})` evaluated to `[]` (since `data` exists as an empty list), causing `truck_paths.items()` to fail with `AttributeError` before reaching `self.skipTest`.

### 1.2 Ray-Casting Point-in-Polygon Oracle Audit
Ray-casting testing was executed across all 36 (Buyer, Cluster) pairs in the PostGIS database and all 36 pairs in `frontend/src/data/mockData.js`:
- **Database Pairs Checked**: 6 buyers $\times$ 6 clusters = 36 spatial relationships.
  - Violations inside polygons: **0**
  - Minimum buffer clearance: **6.77 km** (between `GreenFuel Bio-CNG Plant (Bathinda)` at `[30.275, 74.880]` and `Cluster #05` bounding polygon).
  - Clearance to cluster centroids:
    - GreenFuel Plant (Bathinda): 8.28 km to Cluster #05, 11.38 km to Cluster #01
    - Malwa Green Power (Mansa): 8.75 km to Cluster #04, 26.99 km to Cluster #03
    - Satluj Bio-Pellet (Kotkapura): 25.52 km to Cluster #05, 42.84 km to Cluster #01
    - AgriPower Solutions (Moga): 59.70 km to Cluster #05, 69.48 km to Cluster #01
    - Verka Bio-Thermal (Sangrur): 48.49 km to Cluster #04, 80.76 km to Cluster #01
    - Punjab Bio-Energy (Ludhiana): 94.75 km to Cluster #02, 109.67 km to Cluster #01
- **Frontend Mock Data**: 6 buyers $\times$ 6 clusters = 36 checks.
  - Violations inside polygons: **0**

### 1.3 Polygon Geometric Non-Degeneracy & Convexity Audit
All 6 clusters in the PostGIS database were audited for vertex count, boundary closure, area, and convexity:
```json
[
  { "cluster_name": "Cluster #01", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.37, "is_convex": true, "member_farms": 4 },
  { "cluster_name": "Cluster #02", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.36, "is_convex": true, "member_farms": 4 },
  { "cluster_name": "Cluster #03", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.38, "is_convex": true, "member_farms": 4 },
  { "cluster_name": "Cluster #04", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.38, "is_convex": true, "member_farms": 4 },
  { "cluster_name": "Cluster #05", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.36, "is_convex": true, "member_farms": 4 },
  { "cluster_name": "Cluster #06", "vertices_count": 5, "is_closed": true, "shoelace_deg2": 0.000692, "approx_km2": 7.37, "is_convex": true, "member_farms": 4 }
]
```
- Each polygon has 5 coordinate points (4 vertices + closing point identical to vertex 1).
- Every polygon is strictly convex with positive area ($\approx 7.37\text{ km}^2$, bounding box span $\Delta\text{lat} = 0.03^\circ, \Delta\text{lng} = 0.03^\circ$).

### 1.4 Collinear Geometry Fallback Stress Test
When 4 active fields were seeded along an exact 1D horizontal line (`lat = 30.2200`, `lng = 74.95, 74.96, 74.97, 74.98`):
- `scipy.spatial.ConvexHull` raised `QhullError` as expected.
- `clusters.py:166-182` caught the exception and generated a fallback bounding box with `pad = 0.015` ($1.6\text{ km}$ buffer).
- Resulting polygon was closed with 5 vertices, $\Delta\text{lat} = 0.0300^\circ$, $\Delta\text{lng} = 0.0600^\circ$, area $> 0$, preventing server crash.

### 1.5 Discovery of Vulnerability V1: `OverflowError` in Dynamic Risk Scoring
In `backend/app/ml_engine/risk_model/burning_risk.py`, line 74:
```python
score = int(round(100.0 / (1.0 + math.exp(-0.35 * delta))))
```
- When `delta < -2028` (i.e., a harvest date $> 2028$ days / $\approx 5.5$ years in the future, or any future year typo such as `2033-10-01` or `2099-01-01`):
  $$-0.35 \times \Delta \ge 709.8 > \ln(1.79 \times 10^{308})$$
- Python's standard `math.exp` raises:
  ```text
  OverflowError: math range error
  ```
- **Empirical Confirmation**: Registering a field with `harvest_date: "2033-10-01"` followed by `GET /api/v1/fields/` or `POST /api/v1/clusters/recompute` crashes the entire backend endpoint with an unhandled 500 Internal Server Error:
  ```text
  File "backend/app/api/v1/endpoints/fields.py", line 42, in get_all_fields
    "risk_score": calculate_dynamic_burning_risk(f.harvest_date, f.status),
  File "backend/app/ml_engine/risk_model/burning_risk.py", line 74, in calculate_dynamic_burning_risk
    score = int(round(100.0 / (1.0 + math.exp(-0.35 * delta))))
  OverflowError: math range error
  ```

---

## 2. Logic Chain

1. **Exterior Placement of Biogas Plants (Requirement R3)**:
   - *Premise*: R3 mandates plants must be outside all farm cluster polygons.
   - *Observation*: 36 spatial ray-casting checks yielded 0 inside intersections. The nearest plant-to-polygon distance is 6.77 km (GreenFuel Plant to Cluster #05).
   - *Inference*: Exterior placement is mathematically verified for both backend PostGIS data and frontend mockData.

2. **Cluster Multi-Polygon Non-Degeneracy (Requirement R3)**:
   - *Premise*: DBSCAN must generate $\ge 5$ distinct cluster polygons with non-degenerate vertices and valid area.
   - *Observation*: Seeding created 6 distinct regional clusters (>15 km apart). Each cluster produces a 5-point closed polygon enclosing exactly 4 active fields with an area of $\sim 7.37\text{ km}^2$.
   - *Inference*: Requirement R3 multi-cluster polygon generation is fully satisfied.

3. **Completed Field Isolation (Requirement R2)**:
   - *Premise*: Completed fields must be excluded from active clustering.
   - *Observation*: 3 seeded completed fields retain `cluster_id = None`. Injecting a 1,000-tonne completed field directly into the centroid of Cluster #01 left `farms_count = 4` and `total_biomass = 51.5` completely uncontaminated.
   - *Inference*: Clustering query filter `(Field.status != "Completed") | (Field.status.is_(None))` strictly isolates completed fields.

4. **Dynamic Risk Aggregation (Requirement R5)**:
   - *Premise*: Risk must follow calibrated sigmoidal curve based on $\Delta$, return 0 for Completed fields, and aggregate member active fields' average risk in clusters.
   - *Observation*: Monotonicity confirmed over $\Delta \in [-500, +500]$. $R(0) = 50$, floor $= 5$, ceiling $= 100$. Completed status returns 0 unconditionally. Cluster scores in DB (57, 38, 56, 57, 64, 53) strictly equal the rounded average of their member active fields.
   - *Observation of Flaw*: In `burning_risk.py:74`, lack of input clamping or overflow handling raises `OverflowError` for $\Delta \le -2028$ days.

5. **Test Suite Integrity (Cross-Milestone)**:
   - *Premise*: The repository must maintain automated test suite health.
   - *Observation*: All 21 M1/M2 tests pass (`TestR1`: 5/5, `TestR2`: 6/6, `TestR3`: 4/4, `TestR5`: 6/6). However, `TestR4` has 1 failure and 1 error because M3 truck logistics endpoints are not yet implemented.

---

## 3. Caveats

- **Milestone 3 Dependency**: The failures in `test_r4_02` and `test_r4_03` are scoped to Milestone 3 (Requirement R4). They do not represent regressions in Milestone 2.
- **Floating-Point Domain**: The `OverflowError` only triggers on harvest dates $\ge 5.5$ years in the future ($\Delta \le -2028$). Standard harvesting schedules ($\Delta \in [-30, +30]$) operate safely within the sigmoidal curve.

---

## 4. Conclusion

Milestone 2 implementation is **EMPIRICALLY VERIFIED** with two findings for immediate remediation:
1. **R3 (Exterior Plants)**: **VERIFIED**. 6 Biogas Plants / Hubs are positioned strictly outside all 6 cluster polygons (minimum clearance 6.77 km).
2. **R3 (Multi-Cluster Polygons)**: **VERIFIED**. 6 distinct convex hull polygons formed with 5 closed vertices and non-zero area.
3. **R2 (Clustering Exclusion)**: **VERIFIED**. Completed fields are strictly excluded from clustering and do not corrupt cluster metrics.
4. **R5 (Dynamic Risk Aggregation)**: **VERIFIED** for standard operating ranges; **BUG FOUND** on far-future harvest dates ($\Delta \le -2028$) causing `OverflowError`.
5. **Test Suite Status**: 61 / 63 tests pass. The 2 failing tests belong to M3 (R4).

### Recommended Remediation for Implementing Workers:
1. **Fix `burning_risk.py` Overflow Bug**:
   In `backend/app/ml_engine/risk_model/burning_risk.py`, line 74:
   ```python
   # Clamp delta to prevent float overflow in math.exp(-0.35 * delta)
   clamped_delta = max(-100.0, min(100.0, float(delta)))
   score = int(round(100.0 / (1.0 + math.exp(-0.35 * clamped_delta))))
   ```
2. **Fix `test_e2e_requirements.py` M3 Guard**:
   In `backend/tests/test_e2e_requirements.py:766`:
   ```python
   truck_paths = res.json().get("data", {})
   if not isinstance(truck_paths, dict) or len(truck_paths) == 0:
       self.skipTest("Requirement R4 (Milestone 3): Truck paths pending M3 implementation")
   ```

---

## 5. Verification Method

### 5.1 Run Milestone 2 Specific Test Track
```bash
# Verify R3 (Biogas Plants & 5+ Cluster Polygons)
python -m unittest backend.tests.test_e2e_requirements.TestR3BiogasPlantsAndClusterPolygons -v

# Verify R2 (Field States & Clustering Exclusion)
python -m unittest backend.tests.test_e2e_requirements.TestR2FieldStatesAndClusteringExclusion -v

# Verify R5 (Dynamic Risk Scoring)
python -m unittest backend.tests.test_e2e_requirements.TestR5DynamicRiskScoring -v
```
**Expected Output**:
```text
Ran 16 tests in 1.450s
OK
```

### 5.2 Independent Ray-Casting Clearance Command
```bash
python -c "
import sys, json, math
sys.path.insert(0, 'backend')
from app.db.database import SessionLocal
from app.db.models import Buyer, Cluster
from app.api.v1.endpoints.seed import seed_database
from app.api.v1.endpoints.clusters import recompute_clusters
from sqlalchemy import func

def point_in_polygon(point, polygon):
    lat, lng = point[0], point[1]
    n = len(polygon)
    inside = False
    p1_lat, p1_lng = polygon[0]
    for i in range(1, n + 1):
        p2_lat, p2_lng = polygon[i % n]
        if min(p1_lat, p2_lat) < lat <= max(p1_lat, p2_lat):
            if lng <= max(p1_lng, p2_lng):
                if p1_lat != p2_lat:
                    lng_inters = (lat - p1_lat) * (p2_lng - p1_lng) / (p2_lat - p1_lat) + p1_lng
                if p1_lng == p2_lng or lng <= lng_inters:
                    inside = not inside
        p1_lat, p1_lng = p2_lat, p2_lng
    return inside

db = SessionLocal()
seed_database(db)
recompute_clusters(db)
buyers = db.query(Buyer, func.ST_Y(Buyer.geom).label('lat'), func.ST_X(Buyer.geom).label('lng')).all()
clusters = db.query(Cluster, func.ST_AsGeoJSON(Cluster.polygon_geom).label('poly')).all()

violations = [b.plant_name for b, blat, blng in buyers for c, p in clusters if point_in_polygon([blat, blng], [[pt[1], pt[0]] for pt in json.loads(p)['coordinates'][0]])]
print('Violations count:', len(violations))
assert len(violations) == 0, 'Found violations!'
print('SUCCESS: All 6 buyers are strictly outside all 6 cluster polygons.')
db.close()
"
```

### 5.3 Independent Overflow Bug Reproducer
```bash
python -c "
from backend.app.ml_engine.risk_model.burning_risk import calculate_dynamic_burning_risk
try:
    calculate_dynamic_burning_risk('2033-10-01', 'Pending')
    print('No bug')
except OverflowError as e:
    print('CONFIRMED BUG: calculate_dynamic_burning_risk raised OverflowError on future date:', e)
"
```
