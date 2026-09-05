# Handoff Report: R3 (Biogas Plants & ML Clustering) and R2 (Exclusion of Completed Fields from Clustering)

**Author**: `explorer_survey_2`  
**Date**: 2026-09-06  
**Status**: Hard Survey Complete  
**Target Scope**: Requirement R3 (Biogas Plants, Exterior Placement, 4-5 New Cluster Polygons) & Requirement R2 (Field Completed State & ML Clustering Exclusion)

---

## 1. Observation

### 1.1 ML Clustering & Polygon Generation
- **DBSCAN Algorithm** (`backend/app/ml_engine/clustering/dbscan_cluster.py:5-58`):
  - Uses Scikit-Learn `DBSCAN(eps=eps_radians, min_samples=min_samples, metric='haversine')` with `eps_km = 8.0` and `min_samples = 3`.
  - Farms within $8\text{ km}$ distance are grouped into clusters. Farms with label `-1` are discarded as noise.
  - Returns cluster objects containing `cluster_id`, `farms_count`, `total_biomass_tonnes`, `center: [lat, lng]`, and `farms: List[Dict]`.
- **Polygon Hull Construction** (`backend/app/api/v1/endpoints/clusters.py:128-159`):
  - Queries all fields from database: `fields = db.query(Field, func.ST_Y(Field.geom), func.ST_X(Field.geom)).all()` (**line 102**).
  - Extracts unique coordinates: `coords = np.array([[f["longitude"], f["latitude"]] for f in cluster_farms])`.
  - When `len(unique_coords) >= 3`, calculates `ConvexHull(unique_coords)`:
    ```python
    hull = ConvexHull(unique_coords)
    polygon_coords = unique_coords[hull.vertices].tolist()
    polygon_coords.append(polygon_coords[0])
    poly_str = ", ".join([f"{lon} {lat}" for lon, lat in polygon_coords])
    wkt_poly = f"SRID=4326;POLYGON(({poly_str}))"
    ```
  - Falls back to bounding box padding (`pad = 0.015`) on `QhullError` or $<3$ points.
- **Why Only 1 Cluster Exists in Database**:
  - In `backend/app/api/v1/endpoints/seed.py:44-74`, exactly 10 fields are seeded. All 10 fields are seeded with `base_lat = 30.22, base_lng = 74.98` with random jitter `random.uniform(-0.04, 0.04)`.
  - Since all 10 fields are within $\approx 5\text{ km}$ radius of Bathinda, DBSCAN (`eps=8km, min_samples=3`) lumps all 10 fields into a **single cluster** (`Cluster #01`).
  - Furthermore, `seed.py` does NOT invoke `recompute_clusters(db)` during seed, so `clusters` table is actually empty after seed until `POST /api/v1/clusters/recompute` is triggered! When empty, `GET /api/v1/clusters` returns 1 fallback cluster (`c-fallback` at Bathinda, lines 79-96).

### 1.2 Biogas Plants (Buyers) Overlap with Cluster Polygons
- **Database Model** (`backend/app/db/models.py:53-65`):
  - `Buyer` table has `id`, `plant_name`, `facility_type`, `daily_capacity_tonnes`, `current_stored_tonnes`, `location`, `contact`, and `geom = Column(Geometry("POINT", srid=4326))`.
- **Current Seeded Plant Coordinates** (`backend/app/api/v1/endpoints/seed.py:30-38`):
  - Only **1 buyer** is seeded: `"EcoPower Punjab (Demo Depot)"` with `geom="SRID=4326;POINT(74.98 30.22)"` (latitude `30.22`, longitude `74.98`).
  - Notice: `(30.22, 74.98)` is the **exact centroid** of the 10 seeded farm fields (`base_lat = 30.22, base_lng = 74.98`).
- **Frontend Mock Buyer Data** (`frontend/src/data/mockData.js:235-272`):
  - Only 3 buyers are defined:
    1. `GreenFuel Plant` (Bathinda) at `[30.232, 75.015]`
    2. `EcoHeat Industries` (Mansa) at `[30.125, 75.445]`
    3. `Punjab Biomass Ltd.` (Sangrur) at `[30.250, 75.620]`
- **Overlap Verification with Farm Cluster Polygons**:
  - `Cluster #12` (Bathinda) in `mockData.js:84-90` has polygon vertices:
    `[[30.26, 74.93], [30.29, 74.99], [30.26, 75.05], [30.19, 75.04], [30.17, 74.96]]`.
  - Latitude bounding interval: `[30.17, 30.29]`. Longitude bounding interval: `[74.93, 75.05]`.
  - The seeded buyer at `(30.22, 74.98)` and the mock buyer `GreenFuel Plant` at `(30.232, 75.015)` are **strictly inside** the cluster polygon!
  - In `frontend/src/components/BiomassMap.jsx:612-633`, the buyer marker (red factory icon) renders right inside the shaded green cluster polygon.

### 1.3 Field Model & Lack of "Completed" State
- **Database Model** (`backend/app/db/models.py:10-28`):
  - `Field` table defines: `id`, `farmer_name`, `phone`, `village`, `district`, `state`, `acres`, `crop_type`, `harvest_date`, `biomass`, `cluster_id`, `geom`.
  - **Notice**: There is **no `status` column** in `models.py` for `Field`!
- **Field API Endpoints** (`backend/app/api/v1/endpoints/fields.py:21-31`):
  - `GET /api/v1/fields` does not return `status`:
    ```python
    data.append({
        "id": f.id,
        "name": f"Farm {f.id[:4]}",
        "farmer": f.farmer_name,
        "village": f.village,
        "acres": f.acres,
        "biomass": f"{f.biomass} T",
        "coords": [lat, lng],
        "cluster": f.cluster.name if f.cluster else "Unassigned"
    })
    ```
- **Clustering Endpoint** (`backend/app/api/v1/endpoints/clusters.py:102-106`):
  - `recompute_clusters` does:
    ```python
    fields = db.query(
        Field,
        func.ST_Y(Field.geom).label('lat'),
        func.ST_X(Field.geom).label('lng')
    ).all()
    ```
  - It pulls **all fields** indiscriminately, with no status filtering.
- **Frontend Field Rendering**:
  - `frontend/src/components/BiomassMap.jsx:163-185 & 588-609`: Field markers use a single hardcoded green icon `createFieldIcon()` with `background-color: #10b981`. No condition checks whether a field is completed or active.
  - `frontend/src/components/modals/ListViewModal.jsx:190-212`: Fields table only checks `f.is_clustered` (rendering either "Clustered" or "Pending"), with no handling for `"Completed"`.

---

## 2. Logic Chain

1. **R3 Plant Count & Location Problem**:
   - *Premise 1*: The database currently seeds only 1 plant (`EcoPower Punjab`, Bathinda), and `mockData.js` has only 3 plants.
   - *Premise 2*: Both the DB seeded plant at `(30.22, 74.98)` and the mock plant at `(30.232, 75.015)` are positioned directly inside the Bathinda cluster polygon (`lat: 30.17 - 30.29`, `lng: 74.93 - 75.05`).
   - *Deduction*: To satisfy R3, we must increase the number of Biogas Plants (to 5–6 plants) across major Punjab agricultural zones and place each plant strictly outside the farm cluster polygons (e.g. on industrial bypasses/estates).

2. **R3 Multi-Cluster Polygons Generation Problem**:
   - *Premise 1*: DBSCAN requires at least `min_samples = 3` within `eps_km = 8.0` to form a cluster.
   - *Premise 2*: The database currently only seeds 10 farms in a single location (Bathinda).
   - *Deduction*: DBSCAN can only ever produce 1 cluster from the current database. To dynamically generate 4-5 additional cluster polygons, the seed dataset must register groups of 4–5 farms across 5–6 geographically distinct regions in Punjab (Bathinda Core, Rampura Phul, Talwandi Sabo, Mansa, Goniana/Jaitu, Malout). Each group must be spaced $>15\text{ km}$ apart (exceeding `eps_km = 8.0`), with farms within each group $<6\text{ km}$ apart.
   - *Deduction*: Calling `recompute_clusters(db)` at the end of `seed.py` ensures that all 5–6 clusters with their ConvexHull polygons are immediately written to PostGIS upon system startup.

3. **R2 Completed State & Exclusion from Clustering**:
   - *Premise 1*: `Field` model has no `status` column, and `recompute_clusters` does not filter out completed fields.
   - *Premise 2*: The requirement demands: "Seed a few completed fields at startup so they are immediately visible. Completed fields must render as greyed out in the Admin panel and be excluded from active ML clustering."
   - *Deduction*:
     1. Add `status = Column(String, default="Pending")` to `Field` in `backend/app/db/models.py`.
     2. In `seed.py`, explicitly mark 2–3 seeded fields with `status="Completed"`.
     3. In `clusters.py:recompute_clusters`, filter out completed fields: `.filter((Field.status != "Completed") | (Field.status.is_(None)))`.
     4. In `fields.py:get_all_fields`, include `"status": f.status or "Pending"` and `"is_clustered": bool(f.cluster_id)`.
     5. In `BiomassMap.jsx`, render completed fields with a grey marker (`#6b7280`), and in `ListViewModal.jsx` render them greyed out with a `"Completed"` badge.

---

## 3. Caveats

1. **PostGIS vs SQLite Runtime Environment**:
   - `backend/app/db/database.py` defaults to PostgreSQL/PostGIS (`postgresql://stubble_user:stubble_password@localhost:5432/stubble_db`).
   - If PostgreSQL Docker container is not running, the application or tests may fall back to SQLite. Any schema change (adding `status` column) should be handled via `create_all` or safe SQL column addition if the table already exists.
2. **Dependency on Dynamic Logistics (R4) & Risk Scoring (R5)**:
   - When dynamic trucks (R4) finish biomass collection, they will set `field.status = "Completed"`. The clustering pipeline designed here will immediately exclude those fields on subsequent clustering runs.
   - Dynamic risk scoring (R5) will compute risk scores based on `harvest_date`. The clustering endpoint in `clusters.py` should incorporate this score when calculating cluster-level risk.
3. **Collinearity in ConvexHull**:
   - If seeded points in any new cluster happen to be collinear, `ConvexHull` raises `QhullError`. The existing fallback in `clusters.py:147-159` handles this with a rectangular bounding box with padding, which is safe.

---

## 4. Conclusion & Actionable Implementation Plan

### 4.1 Implementation Plan for R3: Biogas Plants & Cluster Polygons

#### 1. Expand Biogas Plants (Buyers) to 6 Facilities Outside Polygons
Update `backend/app/api/v1/endpoints/seed.py` and `frontend/src/data/mockData.js`:
- **Plant 1 (Bathinda)**: `"GreenFuel Bio-CNG Plant"`  
  Location: Bathinda Industrial Growth Centre / North-West Bypass at `[30.275, 74.880]` (outside Bathinda farm polygon bounds `[30.17-30.26, 74.93-75.05]`).
- **Plant 2 (Ludhiana)**: `"Punjab Bio-Energy Refinery"`  
  Location: Ludhiana South Industrial Belt at `[30.880, 75.830]`.
- **Plant 3 (Mansa)**: `"Malwa Green Power Off-Taker"`  
  Location: Mansa Industrial Area at `[29.930, 75.340]` (outside Mansa farm polygon bounds `[29.96-30.08, 75.35-75.49]`).
- **Plant 4 (Sangrur)**: `"Verka Bio-Thermal Co-gen"`  
  Location: Sangrur Bypass at `[30.230, 75.820]`.
- **Plant 5 (Moga)**: `"AgriPower Solutions Depot"`  
  Location: Moga GT Road at `[30.820, 75.180]`.
- **Plant 6 (Firozpur / Kotkapura)**: `"Satluj Bio-Pellet Works"`  
  Location: Kotkapura Highway at `[30.550, 74.750]`.

#### 2. Seed 5–6 Distinct Farm Clusters across Punjab
In `backend/app/api/v1/endpoints/seed.py`:
Seed 4–5 fields in each of the following 6 regions (total ~26 fields):
1. **Region 1: Bathinda Central Core** (4 active fields + 1 completed field)  
   Center: `[30.22, 74.98]`. Radius: ~3–5 km.
2. **Region 2: Rampura Phul & Bhucho** (4 active fields)  
   Center: `[30.27, 75.14]`. Radius: ~3–5 km.
3. **Region 3: Talwandi Sabo & Maur** (4 active fields + 1 completed field)  
   Center: `[30.02, 75.08]`. Radius: ~3–5 km.
4. **Region 4: Mansa & Budhlada** (4 active fields)  
   Center: `[29.99, 75.40]`. Radius: ~3–5 km.
5. **Region 5: Goniana & Jaitu** (4 active fields + 1 completed field)  
   Center: `[30.35, 74.88]`. Radius: ~3–5 km.
6. **Region 6: Malout & Gidderbaha** (4 active fields)  
   Center: `[30.18, 74.60]`. Radius: ~3–5 km.

#### 3. Automatic Cluster Execution on Seed
At the conclusion of `seed.py:seed_database`:
Invoke the internal clustering logic (or call `recompute_clusters(db)` directly) so that upon `POST /api/v1/seed/`, the database is populated with all 5–6 active clusters and their ConvexHull polygons.

---

### 4.2 Implementation Plan for R2: Field States (Pending vs. Completed)

#### 1. Schema & Database Model
In `backend/app/db/models.py`:
```python
class Field(Base):
    __tablename__ = "fields"
    # ... existing columns ...
    status = Column(String, default="Pending") # "Pending", "Clustered", "Completed"
```
In `backend/app/schemas/schemas.py`:
Add `status: Optional[str] = "Pending"` to `FieldRegisterRequest` and `FarmerFieldResponse`.

#### 2. Seed Completed Fields
In `backend/app/api/v1/endpoints/seed.py`:
- Mark `past_field` explicitly with `status="Completed"`.
- Seed 2 additional completed fields in Talwandi Sabo and Goniana with `status="Completed"`.
- Seed all other fields with `status="Pending"`.

#### 3. Exclusion of Completed Fields in Clustering Engine
In `backend/app/api/v1/endpoints/clusters.py` (`recompute_clusters`):
Filter fields query to exclude completed ones:
```python
fields = db.query(
    Field,
    func.ST_Y(Field.geom).label('lat'),
    func.ST_X(Field.geom).label('lng')
).filter(
    (Field.status != "Completed") | (Field.status.is_(None))
).all()
```

#### 4. API Endpoints Update
In `backend/app/api/v1/endpoints/fields.py` (`get_all_fields`):
Return `"status": f.status or "Pending"` and `"is_clustered": bool(f.cluster_id)`.

#### 5. Frontend UI Updates
- **`frontend/src/components/BiomassMap.jsx`**:
  - Add `createCompletedFieldIcon()`: DivIcon with grey circle (`#6b7280`, border `#d1d5db`).
  - In `localFields.map(f => ...)`: If `f.status === 'Completed'`, render `createCompletedFieldIcon()`, with tooltip displaying grey `[Completed]` tag.
  - Update legend in bottom left to include `Completed Field (Grey Pin)`.
- **`frontend/src/components/modals/ListViewModal.jsx`**:
  - In `type === 'fields'` table, if `f.status === 'Completed'`:
    Render row with `opacity-60 bg-gray-100/70 border-gray-200`, and badge `<span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px]">Completed</span>`.
- **`frontend/src/data/mockData.js`**:
  - Add `status: 'Completed'` to 2–3 mock fields in `registeredFields` so frontend mock fallback matches.

---

## 5. Verification Method

### 5.1 Verification Commands
1. **Re-seed Database**:
   ```powershell
   curl -X POST http://localhost:8000/api/v1/seed/
   ```
2. **Verify Buyers Are Outside Polygons**:
   ```powershell
   curl http://localhost:8000/api/v1/buyers
   ```
   Inspect buyer coordinates. Verify that each buyer coordinate `(lat, lng)` is strictly outside all returned cluster polygons from `http://localhost:8000/api/v1/clusters`.
3. **Verify Multiple Cluster Polygons (4–5 more)**:
   ```powershell
   curl http://localhost:8000/api/v1/clusters
   ```
   Verify `count >= 5` and each cluster has a valid multi-vertex `polygon` array.
4. **Verify Completed Fields Exclusion from DBSCAN**:
   ```powershell
   curl http://localhost:8000/api/v1/fields
   ```
   Verify response contains fields with `"status": "Completed"`.
   ```powershell
   curl -X POST http://localhost:8000/api/v1/clusters/recompute
   ```
   Verify that the total biomass and farm count in clusters match ONLY the active fields (`status != "Completed"`). Completed fields must retain `cluster_id = null`.
5. **Verify Frontend Display**:
   - Open `http://localhost:5173`.
   - On the Leaflet map:
     - 5–6 distinct dashed polygon clusters are rendered.
     - 5–6 red factory icons are positioned outside the polygons.
     - Completed fields appear as grey circular pins, while pending/active fields appear as emerald green pins.
   - Click "Registered Fields" in Quick Actions / Sidebar:
     - Completed fields render greyed out with `"Completed"` badge.
