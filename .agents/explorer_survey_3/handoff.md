# Handoff Report: R4 (Dynamic Truck Logistics) & R5 (Dynamic Risk Scoring) Survey

**Agent**: `explorer_survey_3`  
**Milestone**: Architecture Survey & Synthesis  
**Scope**: 
- **R4**: Dynamic Truck Logistics Simulation (Mixed hub model: private associations vs biogas plants; dynamic map animation: Hub/Plant -> Field -> Hub/Plant; marking field as "Completed" upon collection)
- **R5**: Dynamic Risk Scoring (Mathematical formula strictly based on days relative to `harvest_date`)

---

## 1. Observation

### 1.1 Logistics, Fleet Tracking, and Routing Logic

1. **Static and Disconnected Simulation Loop in WebSocket Service**:
   - In `backend/app/api/v1/endpoints/websockets.py` (lines 47–132), 6 trucks are hardcoded with static paths read from `route_coords.json`:
     ```python
     # Line 47:
     TRUCKS = [
         {
             "id": "TRK-201",
             "status": "En route to Collection",
             "color": "#eab308", 
             "tonnage": "0.0 (Empty)",
             "destination": "Cluster #12 Fields",
             "path": real_routes["TRK-201"]["path"],
             "total_duration_sec": real_routes["TRK-201"]["duration"],
             "current_segment": 0,
             "progress": 0.0,
             "speed": 0.05,
             "delay_mins": 0,
             "delay_status": "On Time"
         },
         ...
     ```
   - In `backend/app/api/v1/endpoints/websockets.py` (lines 134–186), `simulate_truck_movement()` continuously iterates along these static route segments in an infinite loop. When a truck reaches the end of its path (`if idx >= len(path) - 1: t["current_segment"] = 0`), it immediately wraps to index 0 without state transitions, without visiting registered farm fields, without picking up biomass, and without updating any database models.
   - In `backend/app/main.py` (lines 20–21), this simulation loop is launched as a background task during startup:
     ```python
     @app.on_event("startup")
     async def startup_event():
         asyncio.create_task(websockets.simulate_truck_movement())
     ```

2. **Frontend WebSocket Ingestion & Contract Discrepancy in `BiomassMap.jsx`**:
   - In `frontend/src/components/BiomassMap.jsx` (lines 81–94), truck path data is fetched from `GET /api/v1/trucks/paths`:
     ```javascript
     // Lines 86-93:
     const pathMap = {};
     data.data.forEach(t => {
       if (t.path && t.path.length > 0) {
         pathMap[t.id] = t.path;
       }
     });
     setTruckPaths(pathMap);
     ```
   - However, in `backend/app/api/v1/endpoints/trucks.py` (lines 23–31), `get_truck_paths()` returns a dictionary (`dict`), not a list/array:
     ```python
     data = {}
     for truck_id, route in _real_routes.items():
         data[truck_id] = {
             "path": route["path"],
             "color": TRUCK_COLORS.get(truck_id, "#94a3b8")
         }
     return {"status": "success", "data": data}
     ```
     Calling `.forEach()` on `data.data` (an object) throws a `TypeError: data.data.forEach is not a function` in browser console, silently failing to load `truckPaths`.
   - In `frontend/src/components/BiomassMap.jsx` (lines 101–110), live tracking listens to `ws://localhost:8000/api/v1/ws/tracking`:
     ```javascript
     const ws = new WebSocket('ws://localhost:8000/api/v1/ws/tracking');
     ws.onmessage = (event) => {
       const message = JSON.parse(event.data);
       if (message.type === 'TRUCK_UPDATE') {
         setLiveTrucks(prev => ({
           ...prev,
           [message.data.truck_id]: message.data
         }));
       }
     };
     ```
   - In `frontend/src/components/BiomassMap.jsx` (lines 650–722), `Marker` elements render `liveTrucks` using DivIcon `🚚`. There is currently no CSS transition or client-side interpolation, causing marker hops every 500ms.

3. **Field Database Schema Lacks `status` Column**:
   - In `backend/app/db/models.py` (lines 10–29):
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
     ```
     Notice that `Field` does **not** have a `status` column (such as `"Pending"` or `"Completed"`).
   - In `backend/app/api/v1/endpoints/fields.py` (lines 20–34), `get_all_fields()` returns only:
     `id`, `name`, `farmer`, `village`, `acres`, `biomass`, `coords`, `cluster`.
     It completely omits `harvest_date`, `status`, and `risk_score`.

4. **Biogas Plants vs Private Association Hubs Representation**:
   - In `backend/app/db/models.py` (lines 53–65), `Buyer` represents offtakers:
     ```python
     class Buyer(Base):
         __tablename__ = "buyers"
         id = Column(String, primary_key=True, default=generate_uuid, index=True)
         plant_name = Column(String)
         facility_type = Column(String)
         daily_capacity_tonnes = Column(Float)
         current_stored_tonnes = Column(Float, default=0.0)
         location = Column(String)
         contact = Column(String)
         geom = Column(Geometry("POINT", srid=4326))
     ```
   - In `backend/app/api/v1/endpoints/seed.py` (lines 29–39), only 1 buyer is seeded: `"EcoPower Punjab (Demo Depot)"` in Bathinda (`30.22, 74.98`).
   - In `frontend/src/components/BiomassMap.jsx` (lines 188–214 and 612–633), all buyers are styled identically as red factories (`#dc2626`) using `createBuyerIcon()`. There is no visual distinction between industrial biogas plants and private association/FPO aggregation hubs.

5. **Field Icon Styling on Map**:
   - In `frontend/src/components/BiomassMap.jsx` (lines 163–185), `createFieldIcon` hardcodes an emerald circle:
     `background-color: #10b981;`
     There is no handling of `status === 'Completed'` to render completed fields as greyed out.

---

### 1.2 Risk Scoring Implementations and Heuristics

1. **Unintegrated Multi-Factor Model in `burning_risk.py`**:
   - In `backend/app/ml_engine/risk_model/burning_risk.py` (and root `ml_engine/risk_model/burning_risk.py`), `calculate_burning_risk_score` is defined:
     ```python
     def calculate_burning_risk_score(
         hours_to_wheat_sowing_deadline: float,
         current_temperature_c: float,
         wind_speed_kmh: float,
         buyer_distance_km: float,
         is_route_assigned: bool
     ) -> dict:
     ```
     This function requires 5 environmental and logistics parameters. It is **not** called by any API endpoint (`grep_search` confirmed zero imports across backend routers).
   - Furthermore, requirement R5 mandates:
     *"Implement a mathematical formula to calculate a field's risk score dynamically based solely on the days since its `harvest_date` (closer to/past harvest = higher risk)."*

2. **Crude Biomass-Based Risk Score in Clusters Endpoint**:
   - In `backend/app/api/v1/endpoints/clusters.py` (lines 165–166), cluster risk scores are assigned purely based on total biomass tonnage:
     ```python
     risk_level="High Risk" if cres["total_biomass_tonnes"] > 50 else ("Moderate Risk" if cres["total_biomass_tonnes"] > 30 else "Low Risk"),
     risk_score=85 if cres["total_biomass_tonnes"] > 50 else (45 if cres["total_biomass_tonnes"] > 30 else 15),
     ```
     This completely ignores `harvest_date` and farm urgency.

3. **Analytics Endpoint Mocking**:
   - In `backend/app/api/v1/endpoints/analytics.py` (line 23):
     ```python
     high_risk_areas = max(0, active_clusters // 3) 
     ```
     Line 74 checks `Cluster.risk_score >= 65`. Because cluster risk scores are static multiples of biomass, the alert count does not reflect actual agricultural burning risks.

4. **Test Suite Baseline**:
   - Executed `python -m unittest discover -s backend/tests`:
     `Ran 21 tests in 1.011s — OK`.
     All 21 unit tests in `test_empirical_challenger.py` and `test_adversarial_extreme.py` pass.
   - Executed `npm run lint` in `frontend`:
     `0 errors, 68 warnings`.

---

## 2. Logic Chain

### 2.1 Dynamic Truck Logistics Architecture (R4)

```
[Observation 1.1.1] Static TRUCKS in websockets.py loop forever without visiting fields or changing states
       +
[Observation 1.1.3] Field table lacks status column and get_all_fields ignores status
       +
[Observation 1.1.4] Seed only creates 1 buyer; no distinction between Biogas Plants and Private Hubs
       +
[Observation 1.1.5] BiomassMap always renders fields in green (#10b981)
       ↓
[Inference 1] To fulfill R4 ("mixed logistics hub model: some trucks start from private associations (hubs), while others are dispatched directly by the biogas plants"):
       - Define two distinct origin types in seed data / buyers table:
         * Type A: "Biogas Plant" (e.g., GreenFuel Plant Bathinda, EverEnviro CBG Facility, Mahindra Bio-CNG Hub)
         * Type B: "Private Association Hub" (e.g., Kisan FPO Logistics Hub, Bathinda Agri Aggregation Hub)
       - Assign trucks so that 50% originate from Biogas Plants and 50% from Private Association Hubs.
       ↓
[Inference 2] To fulfill R4 ("Trucks must dynamically animate on the map moving from their start location, to the fields to collect the biomass, marking the field as 'Completed' upon collection, and then returning to their origin"):
       - Construct full-cycle routes: `Origin (Hub/Plant) -> Target Field -> Origin (Hub/Plant)`.
       - For each truck, compute smooth waypoint paths connecting Origin coords to Field coords and back.
       - Manage 4 explicit operational stages in simulation:
         1. `OUTBOUND`: Moving from Origin to Field, tonnage = "0.0 (Empty)", status = "En route to Field".
         2. `AT_FIELD`: Truck arrives at field coordinates. Action triggered:
            * Update Field `status = "Completed"` in DB.
            * Broadcast WebSocket event `FIELD_COLLECTED` with `field_id` and `truck_id`.
            * Update truck tonnage = `f"{field.biomass} Tonnes"`, status = "Loading Biomass".
         3. `INBOUND`: Moving from Field to Origin, tonnage = Loaded, status = "Returning to Base".
         4. `AT_ORIGIN`: Truck arrives at origin, unloads biomass, and resets or awaits next cycle.
       ↓
[Inference 3] To fulfill R4 & R2 on Frontend:
       - Fix `BiomassMap.jsx` bug where `data.data.forEach` fails on object response.
       - Update `createFieldIcon(status)`: render greyed-out (`#94a3b8`) marker when `status === 'Completed'`.
       - Update `createBuyerIcon(type)`: render distinct icons for Biogas Plant (red factory) vs Private Association Hub (blue/purple aggregation warehouse).
       - Add CSS transition `transition: transform 0.4s linear` to `.custom-truck-icon` for smooth glide animation between WebSocket updates.
```

### 2.2 Dynamic Risk Scoring Formula Architecture (R5)

```
[Observation 1.2.1] calculate_burning_risk_score requires 5 unused weather/logistics inputs
       +
[Observation 1.2.2] clusters.py sets risk score based purely on biomass (85 / 45 / 15)
       +
[Observation 1.1.3] fields.py does not calculate or return risk scores for fields
       ↓
[Inference 4] The user requirement strictly specifies:
       "calculate a field's risk score dynamically based solely on the days since its harvest_date (closer to/past harvest = higher risk)."
       Let Δ = (today - harvest_date).days:
       * If harvest is far in the future (Δ << 0): low risk of burning.
       * As harvest approaches (Δ → 0): risk escalates as harvest preparations begin.
       * On harvest day (Δ = 0): stubble is on the field, risk reaches moderate threshold.
       * After harvest (Δ > 0): each day past harvest increases urgency before wheat sowing deadline.
       * If field is "Completed" (collected): risk becomes 0 (hazard eliminated).
       ↓
[Inference 5] Formulate the mathematical model using a calibrated logistic growth (sigmoid) curve:
       Score(Δ) = 0 if status == 'Completed' else clamp(round(100 / (1 + exp(-k * Δ))), 5, 100)
       With growth steepness k = 0.35:
       - Δ = -10 days (harvest in 10 days): Score = 5 (Low Risk)
       - Δ = -5 days (harvest in 5 days): Score = 15 (Low Risk)
       - Δ = -2 days (harvest in 2 days): Score = 33 (Low Risk)
       - Δ = 0 days (harvest today): Score = 50 (Moderate Risk)
       - Δ = +2 days (2 days post-harvest): Score = 67 (Moderate Risk)
       - Δ = +4 days (4 days post-harvest): Score = 80 (High Risk)
       - Δ = +7 days (1 week post-harvest): Score = 92 (High Risk)
       - Δ ≥ +10 days (10+ days post-harvest): Score = 97-100 (Critical High Risk)
       ↓
[Inference 6] Cluster Aggregation:
       When clusters are formed via DBSCAN, cluster risk score is the rounded average of risk scores of its active (non-completed) member fields.
```

---

## 3. Detailed Component Survey & Implementation Plan

### 3.1 Data Model Changes (`backend/app/db/models.py`)

Add `status` column to `Field`:
```python
class Field(Base):
    __tablename__ = "fields"
    # existing columns...
    status = Column(String, default="Pending")  # "Pending" | "Completed"
```

### 3.2 Dynamic Risk Scoring Formula (`backend/app/ml_engine/risk_model/burning_risk.py`)

Replace legacy multi-factor function with the dynamic formula:
```python
import math
from datetime import date, datetime

def calculate_field_risk_score(harvest_date_str: str, as_of: date = None, status: str = "Pending") -> dict:
    """
    Computes a field's dynamic stubble burning risk score (0 - 100)
    based solely on the days relative to its harvest_date.
    Closer to / past harvest_date = strictly higher risk.
    If status == 'Completed', risk score is 0.
    """
    if status == "Completed":
        return {
            "risk_score": 0,
            "risk_level": "Resolved",
            "recommended_action": "Biomass collected. Stubble burning risk eliminated.",
            "days_since_harvest": 0
        }

    if not as_of:
        as_of = date.today()

    try:
        clean_date = harvest_date_str.strip()[:10]
        hd = datetime.strptime(clean_date, "%Y-%m-%d").date()
    except Exception:
        # Fallback if invalid or empty harvest date
        return {
            "risk_score": 50,
            "risk_level": "Moderate Risk",
            "recommended_action": "Harvest date unconfirmed. Field inspection advised.",
            "days_since_harvest": 0
        }

    days_since_harvest = (as_of - hd).days

    # Calibrated Sigmoidal Logistic Growth Model: R(Δ) = 100 / (1 + e^(-0.35 * Δ))
    k = 0.35
    raw = 100.0 / (1.0 + math.exp(-k * days_since_harvest))
    score = int(round(max(5.0, min(100.0, raw))))

    if score >= 75:
        level = "High Risk"
        action = "Immediate biomass pickup required to prevent open-field stubble burning."
    elif score >= 45:
        level = "Moderate Risk"
        action = "Harvest approaching or active. Route assignment scheduled."
    else:
        level = "Low Risk"
        action = "Harvest window clear. Normal queue dispatch."

    return {
        "risk_score": score,
        "risk_level": level,
        "recommended_action": action,
        "days_since_harvest": days_since_harvest
    }
```

### 3.3 Endpoint Integration for Fields (`backend/app/api/v1/endpoints/fields.py`)

1. In `GET /fields/`, calculate and return dynamic risk score, harvest date, and status for each field:
   ```python
   risk_info = calculate_field_risk_score(f.harvest_date or "", status=f.status or "Pending")
   data.append({
       "id": f.id,
       "name": f"Farm {f.id[:4]}",
       "farmer": f.farmer_name,
       "farmer_name": f.farmer_name,
       "village": f.village,
       "acres": f.acres,
       "biomass": f.biomass,
       "biomass_str": f"{f.biomass} T",
       "coords": [lat, lng],
       "cluster": f.cluster.name if f.cluster else "Unassigned",
       "harvest_date": f.harvest_date or "",
       "status": f.status or "Pending",
       "risk_score": risk_info["risk_score"],
       "risk_level": risk_info["risk_level"],
       "days_since_harvest": risk_info["days_since_harvest"]
   })
   ```
2. Add a `POST /fields/{field_id}/complete` or `PATCH /fields/{field_id}/status` endpoint so that collection events immediately persist to the database.

### 3.4 Mixed Hub Model & Simulation in WebSocket Service (`backend/app/api/v1/endpoints/websockets.py`)

1. **Origins Configuration**:
   - Biogas Plant 1: `GreenFuel Biogas Plant Bathinda` (`30.245, 75.025`)
   - Biogas Plant 2: `EverEnviro CBG Facility Mansa` (`30.155, 75.465`)
   - Private Association Hub 1: `Malwa Kisan FPO Logistics Hub` (`30.205, 74.925`)
   - Private Association Hub 2: `Punjab Agri Aggregation Hub Rampura` (`30.275, 75.220`)
2. **Truck Fleet Assignment**:
   - `TRK-201` (Biogas Plant: GreenFuel) -> collects Field A -> returns to GreenFuel
   - `TRK-305` (Private Hub: Malwa Kisan FPO) -> collects Field B -> returns to FPO Hub
   - `TRK-405` (Biogas Plant: EverEnviro CBG) -> collects Field C -> returns to EverEnviro
   - `TRK-708` (Private Hub: Punjab Agri Hub) -> collects Field D -> returns to Agri Hub
3. **Full-Cycle Movement & Collection Trigger**:
   - For each truck, dynamically generate outbound waypoints (Origin -> Field) and inbound waypoints (Field -> Origin).
   - Advance progress along the path.
   - At waypoint index corresponding to field arrival:
     - Mark field as `status = "Completed"` in DB.
     - Broadcast `FIELD_COLLECTED` message over WebSocket.
     - Change truck status to `"Loaded with Biomass"`, updating load from `0.0 (Empty)` to e.g. `16.5 Tonnes`.
   - At end of inbound path:
     - Unload biomass at origin.
     - Loop or dispatch to next pending field.

### 3.5 Frontend Map Rendering Updates (`frontend/src/components/BiomassMap.jsx`)

1. **Bug Fix**: Fix `truckPaths` parsing on line 86:
   ```javascript
   // Change from:
   // data.data.forEach(t => ...
   // To:
   const pathMap = {};
   if (data.data) {
     const entries = Array.isArray(data.data) ? data.data : Object.entries(data.data).map(([id, val]) => ({ id, ...val }));
     entries.forEach(t => {
       if (t.path && t.path.length > 0) pathMap[t.id] = t.path;
     });
   }
   setTruckPaths(pathMap);
   ```
2. **Dynamic Field Icon (`createFieldIcon`)**:
   ```javascript
   const createFieldIcon = (status) => {
     const isCompleted = status === 'Completed';
     const bg = isCompleted ? '#94a3b8' : '#10b981'; // Grey vs Emerald
     const border = isCompleted ? '#64748b' : '#ffffff';
     return L.divIcon({
       className: 'custom-leaflet-div-icon',
       html: `
         <div style="
           background-color: ${bg};
           width: 18px;
           height: 18px;
           border-radius: 50%;
           border: 2px solid ${border};
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 2px 5px rgba(0,0,0,0.5);
           cursor: pointer;
         ">
           <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
         </div>
       `,
       iconSize: [18, 18],
       iconAnchor: [9, 9]
     });
   };
   ```
3. **Field Collection Real-Time Update via WebSocket**:
   ```javascript
   ws.onmessage = (event) => {
     const msg = JSON.parse(event.data);
     if (msg.type === 'TRUCK_UPDATE') {
       setLiveTrucks(prev => ({ ...prev, [msg.data.truck_id]: msg.data }));
     } else if (msg.type === 'FIELD_COLLECTED') {
       setLocalFields(prev => prev.map(f => f.id === msg.data.field_id ? { ...f, status: 'Completed' } : f));
     }
   };
   ```
4. **Distinct Buyer vs Hub Marker Icons**:
   - Check `b.type` or `b.facility_type`:
     * If `"Private Association Hub"` or `"Logistics Hub"`: Render a blue/purple depot icon (`#3b82f6` or `#8b5cf6`).
     * If `"Biogas Plant"` or `"Power Plant"`: Render the red factory icon (`#dc2626`).
5. **Truck Tooltip & Smooth CSS Transition**:
   - Add `.custom-truck-icon { transition: transform 0.4s linear; }` to `index.css`.
   - Tooltip displays Origin, Origin Type (Private Hub vs Biogas Plant), Target Field, Leg, Load, and ETA.

---

## 4. Caveats

1. **OSRM Live Network Calls vs Offline Fallback**:
   - Generating paths on-the-fly via public OSRM (`router.project-osrm.org`) requires internet access and can suffer from rate-limiting or network latency during judging presentations.
   - **Recommendation**: Compute high-fidelity road-following waypoint sequences ahead of time and embed them into the backend simulation / `route_coords.json` with linear interpolation fallback so it works 100% reliably offline.
2. **PostgreSQL PostGIS vs SQLite in Local Dev**:
   - The project uses GeoAlchemy2 with PostGIS functions (`ST_Y`, `ST_X`, `ST_AsGeoJSON`). If running in Docker without PostGIS, coordinate extractors need defensive fallbacks. Currently, the environment has PostgreSQL/PostGIS connected.
3. **R1–R3 Dependencies**:
   - Field states ("Pending" vs "Completed") and plant coordinates outside cluster polygons overlap with R2 and R3. The database model modifications and seed updates must be synchronized with `explorer_survey_1` and `explorer_survey_2`.

---

## 5. Conclusion

- **R4 (Dynamic Truck Logistics)**:
  1. The current fleet tracking in `websockets.py` operates in a static closed loop disconnected from fields and origins.
  2. The mixed logistics hub model can be cleanly implemented by designating 50% of trucks to Biogas Plants (commercial offtakers) and 50% to Private Associations / FPO Hubs.
  3. Generating full-cycle waypoint paths (`Hub/Plant -> Field -> Hub/Plant`) with arrival detection enables the simulation to mark fields as `"Completed"` in real time, broadcast the event to the map, change field pins from green to grey, and transition truck states and tonnage.
  4. A contract bug in `BiomassMap.jsx` (`data.data.forEach` on an object) must be resolved to restore truck ghost paths.
- **R5 (Dynamic Risk Scoring)**:
  1. The current `burning_risk.py` is unused and multi-factor, while `clusters.py` relies on hardcoded biomass tiers.
  2. A calibrated sigmoidal logistic growth formula strictly parameterized on $\Delta = (\text{today} - \text{harvest\_date}).\text{days}$ fulfills R5 with mathematical rigor:
     $$\text{Risk}(\Delta) = \min\left(100, \max\left(5, \text{round}\left(\frac{100}{1 + e^{-0.35 \cdot \Delta}}\right)\right)\right)$$
  3. If `status == 'Completed'`, risk score drops to 0.
  4. Clusters dynamically aggregate the risk scores of their active member fields.

---

## 6. Verification Method

1. **Backend Test Suite**:
   Run the project test command:
   ```bash
   python -m unittest discover -s backend/tests
   ```
   *Expected result*: All 21 tests pass without regression.
2. **Formula Unit Verification**:
   Execute a test verifying the mathematical properties of `calculate_field_risk_score`:
   - $\Delta = -10$ days (harvest in future) $\implies$ Score $\approx 5$
   - $\Delta = 0$ days (harvest today) $\implies$ Score $\approx 50$
   - $\Delta = +4$ days (past harvest) $\implies$ Score $\approx 80$ (High Risk)
   - Completed field $\implies$ Score $= 0$
3. **Frontend Code Quality**:
   Run the frontend linter:
   ```bash
   cd frontend && npm run lint
   ```
   *Expected result*: 0 errors.
4. **Simulation Cycle Validation**:
   Connect a WebSocket test client to `ws://localhost:8000/api/v1/ws/tracking` and verify that messages with `type: "TRUCK_UPDATE"` contain `origin_type` ("Biogas Plant" vs "Private Association Hub") and that `FIELD_COLLECTED` events are received.
