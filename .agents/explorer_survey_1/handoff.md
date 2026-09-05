# Handoff Report: R1 (Data Sync Bugs) & R2 (Field States & Clustering Exclusion)

**Author**: `explorer_survey_1`  
**Target Milestone**: R1 & R2 Investigation & Survey  
**Date**: 2026-09-06T00:57:45+05:30  

---

## 1. Observation

### 1.1 R1: Farmer Name Display & Registration Flow in Frontend and Backend

#### A. Why Newly Registered Fields Display "Farmer" instead of the Real Farmer Name
1. In `frontend/src/components/modals/QuickActionModal.jsx` (lines 26–39):
   ```javascript
   const [formData, setFormData] = useState({
     farmerName: '',
     phone: '',
     village: 'Bathinda City',
     customVillage: '',
     acres: '12',
     cropType: 'Paddy / Basmati',
     harvestDate: '2026-09-06',
     buyerName: '',
     buyerType: 'Biogas & Bio-CNG',
     buyerCapacity: '500',
     buyerLocation: 'Bathinda City'
   });
   ```
2. In `frontend/src/components/modals/QuickActionModal.jsx` (lines 183–321):
   When `actionType === 'register_field'`, the form contains `<select>` for village, custom village text input, crop type `<select>`, acres `<input>`, and harvest date `<input>`.
   **There is no `<input>` for `farmerName` and no `<input>` for `phone` anywhere in the form.**
3. In `frontend/src/components/modals/QuickActionModal.jsx` (lines 61–72):
   ```javascript
   const payload = {
     farmer_name: formData.farmerName || 'Farmer',
     phone: formData.phone || '+910000000000',
     village: resolvedVillage,
     district: 'Bathinda',
     state: 'Punjab',
     acres: parseFloat(formData.acres) || 1.0,
     crop_type: formData.cropType || 'Paddy / Basmati',
     latitude: finalLat,
     longitude: finalLng,
     harvest_date: formData.harvestDate
   };
   ```
   Because `formData.farmerName` is never populated by an input, `formData.farmerName || 'Farmer'` always evaluates to the string literal `'Farmer'`, and `phone` defaults to `'+910000000000'`.
4. In `backend/app/api/v1/endpoints/fields.py` (lines 37–54):
   ```python
   @router.post("/register")
   def register_field(payload: FieldRegisterRequest, db: Session = Depends(get_db)):
       est_biomass = round(payload.acres * 0.55, 1)
       new_field = Field(
           farmer_name=payload.farmer_name,
           phone=payload.phone,
           village=payload.village,
           district=payload.district,
           state=payload.state,
           acres=payload.acres,
           crop_type=payload.crop_type,
           harvest_date=payload.harvest_date,
           geom=f"SRID=4326;POINT({payload.longitude} {payload.latitude})",
           biomass=est_biomass
       )
       db.add(new_field)
       db.commit()
   ```
   `payload.farmer_name` (which is `"Farmer"`) is stored directly in `Field.farmer_name`.
5. In `backend/app/api/v1/endpoints/fields.py` (lines 20–32):
   ```python
   for f, lat, lng in fields:
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
   The backend returns the farmer name under the key `"farmer"` (omitting `"farmer_name"`).
6. In `frontend/src/components/modals/ListViewModal.jsx` (line 198):
   ```jsx
   <h4 className="font-bold text-sm text-gray-900">{f.farmer_name || f.farmer || 'Farmer'}</h4>
   ```
   In `frontend/src/components/BiomassMap.jsx` (line 601):
   ```jsx
   <div className="text-gray-700">{f.farmer || f.farmer_name || 'Farmer'}</div>
   ```
   Because `f.farmer` is `"Farmer"`, both views display `"Farmer"`.

#### B. Why Newly Registered Fields Do Not Appear in Farmer Panel's "My Fields" List
1. In `frontend/src/components/FarmerDashboard.jsx` (lines 550, 415, 583):
   Clicking "Report New Harvest" or "Register Your First Field" executes `setShowRegisterHarvest(true)`.
2. In `frontend/src/components/FarmerDashboard.jsx` (lines 146–157, `RegisterHarvestModal`):
   ```javascript
   const handleSubmit = (e) => {
     e.preventDefault();
     setLoading(true);
     setTimeout(() => { setLoading(false); setDone(true); setTimeout(() => { onSuccess(); onClose(); }, 1800); }, 1200);
   };
   ```
   `RegisterHarvestModal` is a client-only mock. It does not invoke `fetch('http://localhost:8000/api/v1/fields/register', ...)` or submit any network request.
3. In `frontend/src/App.jsx` (lines 302–306):
   `App.jsx` passes `onRegisterClick={() => setActiveQuickAction('register_field')}` to `FarmerDashboard`, but `FarmerDashboard` never invokes `onRegisterClick`.
4. In `frontend/src/App.jsx` (lines 26–38):
   `useEffect` fetching `GET /api/v1/farmers/me?phone=${farmerUser.phone}` only runs when `farmerUser?.phone` changes on initial load. It does not listen to `refresh-dashboard-data` or refresh after field creation.
5. In `backend/app/api/v1/endpoints/farmers.py` (lines 35–39):
   ```python
   fields_query = db.query(
       Field,
       func.ST_Y(Field.geom).label('lat'),
       func.ST_X(Field.geom).label('lng')
   ).filter(Field.phone == farmer.phone).all()
   ```
   Fields are queried strictly by matching `Field.phone == farmer.phone`.
   If a field is created via `QuickActionModal`, `payload.phone` is hardcoded to `'+910000000000'`. If a farmer is logged in with phone `9876543210`, the query fails to match.
6. In `frontend/src/components/FarmerDashboard.jsx` (line 564):
   ```jsx
   <Calendar className="w-3.5 h-3.5" /> {field.harvestDate || 'Not set'} · {field.acres} Acres · {field.crop_type}
   ```
   The backend returns snake_case `harvest_date` (see `backend/app/schemas/schemas.py` line 79). Because the code looks for camelCase `field.harvestDate`, it defaults to `'Not set'` even when data exists.

---

### 1.2 R2: Field States, Startup Seeding, Greyed-out Rendering & ML Clustering Exclusion

#### A. Field Model and Schemas
1. In `backend/app/db/models.py` (lines 10–29):
   ```python
   class Field(Base):
       __tablename__ = "fields"

       id = Column(String, primary_key=True, default=generate_uuid, index=True)
       farmer_name = Column(String, index=True)
       phone = Column(String)
       village = Column(String)
       district = Column(String)
       state = Column(String)
       acres = Column(Float)
       crop_type = Column(String)
       harvest_date = Column(String)
       biomass = Column(Float)
       cluster_id = Column(String, ForeignKey("clusters.id"), nullable=True)
       geom = Column(Geometry("POINT", srid=4326))
       cluster = relationship("Cluster", back_populates="fields")
   ```
   The `Field` model lacks a `status` column entirely.
2. In `backend/app/schemas/schemas.py`:
   `FieldRegisterRequest` (lines 4–14) has no `status` field.
   `FarmerFieldResponse` (lines 73–83) already contains `status: str` and `status_color: str`.

#### B. Startup Seeding
1. In `backend/app/api/v1/endpoints/seed.py` (lines 49–109):
   Seeds 10 fields in a loop and 1 `past_field` for Gurmit Singh (`9876543210`).
   No `status` is set on any of these fields.
2. In `backend/app/main.py` (lines 19–22):
   ```python
   @app.on_event("startup")
   async def startup_event():
       asyncio.create_task(websockets.simulate_truck_movement())
   ```
   The startup event launches the truck simulation background task, but does not verify whether initial seed data exists in the database.

#### C. Greyed-out Rendering in Admin Panel
1. In `frontend/src/components/modals/ListViewModal.jsx` (lines 195–210):
   ```jsx
   fields.map((f) => (
     <div key={f.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex justify-between items-center">
       <div>
         <h4 className="font-bold text-sm text-gray-900">{f.farmer_name || f.farmer || 'Farmer'}</h4>
         <p className="text-gray-500">Location: {f.village || f.location} &bull; Size: {f.area_acres || f.acres || 0} Acres</p>
         <p className="text-emerald-700 font-semibold mt-1">Est. Biomass: {f.biomass || f.biomass_est || 0} Tonnes</p>
       </div>
       <div>
         {f.is_clustered ? (
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">Clustered</span>
         ) : (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Pending</span>
         )}
       </div>
     </div>
   ))
   ```
   No `isCompleted` condition exists. Completed fields render identically to pending/clustered fields with green text and standard border colors.
2. In `frontend/src/components/BiomassMap.jsx` (lines 163–185):
   `createFieldIcon` hardcodes `#10b981` (emerald green) without accepting a `status` argument:
   ```javascript
   const createFieldIcon = () => {
     return L.divIcon({
       className: 'custom-leaflet-div-icon',
       html: `<div style="background-color: #10b981; ...">...</div>`
     });
   };
   ```
   At line 593:
   ```jsx
   <Marker key={f.id} position={f.coords} icon={createFieldIcon()}>
   ```
   Markers for completed fields are rendered green.

#### D. Exclusion from ML Clustering
1. In `backend/app/api/v1/endpoints/clusters.py` (lines 98–118):
   ```python
   @router.post("/recompute")
   def recompute_clusters(db: Session = Depends(get_db)):
       fields = db.query(
           Field,
           func.ST_Y(Field.geom).label('lat'),
           func.ST_X(Field.geom).label('lng')
       ).all()
       ...
       farms_data = []
       for f, lat, lng in fields:
           farms_data.append({
               "id": f.id,
               "latitude": lat,
               "longitude": lng,
               "biomass_tonnes": f.biomass
           })
       clusters_res = cluster_farms_dbscan(farms_data, eps_km=8.0, min_samples=3)
   ```
   Line 102 retrieves all fields unconditionally, passing completed fields directly to `cluster_farms_dbscan`.
   Line 123 clears cluster associations with `db.query(Field).update({Field.cluster_id: None})`, and lines 181–185 reassign completed fields to new active clusters.

---

## 2. Logic Chain

### 2.1 R1 Logic Chain
1. **Fact**: In `QuickActionModal.jsx`, `formData.farmerName` is never assigned because there is no `<input>` for it.
2. **Fact**: `handleSubmit` falls back to `'Farmer'` when `formData.farmerName` is falsey.
3. **Fact**: `POST /api/v1/fields/register` persists this string directly into `fields.farmer_name`.
4. **Fact**: `GET /api/v1/fields/` queries `fields.farmer_name` and returns it under key `"farmer"`.
5. **Deduction**: The Admin panel displays "Farmer" because the registration modal never captured the user's name and defaulted to "Farmer" before saving to the database.
6. **Fact**: `FarmerDashboard.jsx`'s `RegisterHarvestModal` uses a pure `setTimeout` without calling `fetch`.
7. **Fact**: `App.jsx` never re-queries `GET /api/v1/farmers/me?phone=${farmerUser.phone}` after registration events.
8. **Fact**: When fields are registered via `QuickActionModal`, phone number defaults to `'+910000000000'`, failing the `Field.phone == farmer.phone` equality check in `backend/app/api/v1/endpoints/farmers.py:39`.
9. **Deduction**: Fields registered from the frontend never enter the database for that farmer's phone, and even if registered via API, the frontend never refetches the farmer's field list.

### 2.2 R2 Logic Chain
1. **Fact**: `backend/app/db/models.py` has no `status` column on `Field`.
2. **Fact**: Neither `seed.py` nor `POST /api/v1/fields/register` sets or stores `Field.status`.
3. **Fact**: `backend/app/api/v1/endpoints/clusters.py` queries `db.query(Field)...all()` without filtering out completed fields.
4. **Fact**: `ListViewModal.jsx` and `BiomassMap.jsx` only distinguish fields by `f.is_clustered`, providing no styling for completed status.
5. **Deduction**: Without a `status` column, completed fields cannot be persisted, queried, styled as grey, or excluded from DBSCAN clustering.

---

## 3. Caveats
1. **Database Migration vs. Recreation**: The database uses PostGIS in PostgreSQL (`docker-compose.yml` on port 5432). When adding `status = Column(String, default="Pending")` to `Field`, existing databases may need an `ALTER TABLE fields ADD COLUMN status VARCHAR DEFAULT 'Pending';` or recreating the table via `seed_database()`.
2. **Phone Number Normalization**: Phone numbers can have formats such as `9876543210` or `+919876543210`. The query `filter(Field.phone == farmer.phone)` requires uniform normalization (e.g. stripping `+91`, spaces, and dashes to 10 digits).
3. **Driver / WebSocket Coupling**: In `backend/app/api/v1/endpoints/websockets.py`, trucks simulate moving to fields and collecting biomass. When implementing R4, truck completion will need to update `Field.status = "Completed"`. The R2 design must support this transition.

---

## 4. Conclusion & Actionable Fix Strategy

### For R1 (Data Sync Bugs):
1. **In `frontend/src/components/modals/QuickActionModal.jsx`**:
   - Add input fields for `Farmer Name` and `Farmer Mobile Number` in the `register_field` section (lines 184–321).
   - Accept optional `farmerUser` prop; if present, prefill `farmerName: farmerUser.name` and `phone: farmerUser.phone`.
   - Update `handleSubmit` to send cleaned 10-digit `phone` and non-empty `farmer_name`.
2. **In `frontend/src/components/FarmerDashboard.jsx`**:
   - Connect `RegisterHarvestModal` (or replace with `onRegisterClick` to `QuickActionModal`) to call `POST http://localhost:8000/api/v1/fields/register` using `farmerUser.name` and `farmerUser.phone`.
   - On success, dispatch `refresh-dashboard-data` and trigger farmer profile reload.
   - Fix line 564 to check `{field.harvest_date || field.harvestDate || 'Not set'}`.
3. **In `frontend/src/App.jsx`**:
   - In `useEffect` (lines 26–38), add an event listener for `refresh-dashboard-data` (or custom event `refresh-farmer-profile`) that re-fetches `GET http://localhost:8000/api/v1/farmers/me?phone=${farmerUser.phone}` and updates `farmerUser` state and `localStorage`.
4. **In `backend/app/api/v1/endpoints/fields.py`**:
   - In `get_all_fields`, return `"farmer_name": f.farmer_name`, `"farmer": f.farmer_name`, `"status": f.status or "Pending"`, and `"is_clustered": f.cluster_id is not None`.
   - In `register_field`, normalize phone to 10 digits (`payload.phone.replace("+91", "").strip()`).

### For R2 (Field States, Seeding, Greyed-out in Admin, Exclusion from Clustering):
1. **In `backend/app/db/models.py`**:
   - Add `status = Column(String, default="Pending")` to `class Field`.
2. **In `backend/app/schemas/schemas.py`**:
   - Add `status: Optional[str] = "Pending"` to `FieldRegisterRequest`.
3. **In `backend/app/api/v1/endpoints/seed.py`**:
   - Seed `past_field` (line 95) with `status="Completed"`.
   - Seed 2 of the 10 standard fields (e.g. `i=8` and `i=9`) with `status="Completed"`.
   - Explicitly assign remaining fields `status="Pending"`.
4. **In `backend/app/main.py`**:
   - In `startup_event()`, check if `Field` count is 0; if so, trigger initial seed so completed fields exist immediately on boot.
5. **In `backend/app/api/v1/endpoints/clusters.py`**:
   - In `recompute_clusters()` (line 102), add `.filter(Field.status != "Completed")` so completed fields are excluded from DBSCAN clustering.
6. **In `frontend/src/components/modals/ListViewModal.jsx`**:
   - In `type === 'fields'` (line 196), inspect `f.status === 'Completed'`. Apply `bg-gray-100/70 border-gray-200 opacity-60 grayscale` styling, muted/struck text, and a grey `Completed` badge (`bg-gray-200 text-gray-600 font-bold text-[10px]`).
7. **In `frontend/src/components/BiomassMap.jsx`**:
   - In `createFieldIcon(status)` (line 163), check if `status === 'Completed'`. If true, render grey `#6b7280` icon with `#9ca3af` border and reduced opacity.
   - At line 593, pass `createFieldIcon(f.status)`.
   - In the tooltip (line 604), render a status badge.

---

## 5. Verification Method

### 5.1 Automated Backend Tests
Run the backend test suite:
```powershell
python -m unittest backend/tests/test_empirical_challenger.py
```
- Verify `test_01_seed_endpoint` populates database with completed fields.
- Verify `test_05_live_insertion_matching_pitch_guide` registers fields with correct `farmer_name`.

### 5.2 Verification of Clustering Exclusion
Run clustering recompute and verify completed fields have `cluster_id = None`:
```powershell
curl -X POST http://localhost:8000/api/v1/clusters/recompute
curl http://localhost:8000/api/v1/fields/
```
Ensure all fields with `"status": "Completed"` have `"cluster": "Unassigned"` and are not included in any cluster's polygon or farm list.

### 5.3 Verification of Frontend UI
1. Open `http://localhost:5173` in Admin role:
   - Click "Registered Fields" (or Quick Action "Fields Directory").
   - Inspect list: Completed fields should appear greyed out with a grey "Completed" badge.
   - Check map: Completed fields should show grey pins instead of green pins.
2. In Admin role, click Quick Action "Register Field":
   - Enter Farmer Name: `"Avtar Singh"` and Phone: `"9876543212"`.
   - Submit form.
   - Open Fields Directory: Verify farmer name appears as `"Avtar Singh"` instead of `"Farmer"`.
3. Switch to Farmer Portal (`FarmerDashboard`):
   - Login with `"9876543212"` (demo OTP `123456`).
   - Navigate to "My Fields": Verify the new field appears in the list.
   - Click "Report New Harvest": Register a new harvest. Verify the new field is saved to backend and immediately rendered in "My Fields".

### 5.4 Invalidation Conditions
- If newly registered fields continue to display `"Farmer"` in `ListViewModal.jsx` or `BiomassMap.jsx`.
- If fields registered in `FarmerDashboard` vanish upon page refresh.
- If completed fields appear as vertices or points within any cluster generated by `POST /api/v1/clusters/recompute`.
- If completed fields appear with standard green `#10b981` markers on the Leaflet map.
