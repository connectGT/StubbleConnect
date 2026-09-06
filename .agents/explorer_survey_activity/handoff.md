# Handoff Report: Requirement R2 Live Activity Feed Investigation

**Agent**: `explorer_survey_activity`  
**Date**: 2026-09-06  
**Scope**: Requirement R2 — Real-time Live Activity Feed in Admin Dashboard (WebSocket and polling integration for new field/farmer registrations).

---

## 1. Observation

### 1.1 Frontend Component Architecture
- **Location of Live Activity Feed**:
  - Rendered by `frontend/src/components/RecentActivity.jsx` (lines 18–94), which is placed inside `frontend/src/components/BottomRow.jsx` (line 15) and rendered in the Admin Dashboard inside `frontend/src/App.jsx` (line 300).
  - Also rendered in expanded modal format inside `frontend/src/components/modals/ListViewModal.jsx` (lines 112–128) when `type === 'activity'`.

- **Current Implementation in `RecentActivity.jsx`** (lines 21–32):
  ```javascript
  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:8000/api/v1/analytics/activity-feed')
        .then(res => res.json())
        .then(data => setActivities(data))
        .catch(err => console.error("Could not fetch activities:", err));
    };
    
    fetchData();
    window.addEventListener('refresh-dashboard-data', fetchData);
    return () => window.removeEventListener('refresh-dashboard-data', fetchData);
  }, []);
  ```
  - **Absence of WebSocket**: `RecentActivity.jsx` does not open or listen to any WebSocket connection.
  - **Absence of Polling**: `RecentActivity.jsx` only executes `fetchData()` once on component mount, and when a synthetic window event `refresh-dashboard-data` is dispatched locally in the same browser window.
  - **Cross-process/Multi-tab Blindness**: When a new field is registered via API, another client tab, background worker, or external script, the feed does not receive any notification or update.

- **Defensive Empty State Requirement**:
  - `frontend/tests/empirical_challenge.mjs` (lines 287–293) strictly asserts:
    ```javascript
    recentActivityContent.includes('activities.length === 0') &&
    recentActivityContent.includes('No recent activities logged yet.')
    ```
  - Any updates to `RecentActivity.jsx` must preserve these exact strings and empty state condition.

- **Icon Mapping & Rendering**:
  - `RecentActivity.jsx` (lines 11–16) currently maps:
    ```javascript
    const iconMap = {
      field_registered: Wheat,
      cluster_matched: Share2,
      route_generated: Route,
      default: UserCheck
    };
    ```

### 1.2 Backend WebSocket Infrastructure
- **WebSocket Endpoint & Manager**:
  - File: `backend/app/api/v1/endpoints/websockets.py`.
  - Prefix `/ws` on router, included in `backend/app/main.py` (line 38) under `settings.API_V1_STR` (`/api/v1`).
  - Active endpoint: `@router.websocket("/tracking")` -> full path `ws://localhost:8000/api/v1/ws/tracking`.
  - Singleton `manager = ConnectionManager()` provides:
    - `active_connections: list[WebSocket]`
    - `async def connect(self, websocket: WebSocket)`
    - `def disconnect(self, websocket: WebSocket)`
    - `async def broadcast(self, message: str)` (safely removes disconnected sockets on send failure).
  - Existing message types broadcasted by `simulate_truck_movement()` (lines 151–189):
    - `TRUCK_UPDATE` (continuous GPS coordinates every 0.5s)
    - `FIELD_COLLECTED` (`{"type": "FIELD_COLLECTED", "data": {"field_id": ..., "truck_id": ..., "new_status": "Completed"}}`)
  - **Missing Event**: `websockets.py` currently has no broadcast logic for field registrations or farmer registrations.

- **Existing Frontend WebSocket Consumer**:
  - File: `frontend/src/components/BiomassMap.jsx` (lines 94–108):
    ```javascript
    const ws = new WebSocket('ws://localhost:8000/api/v1/ws/tracking');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'TRUCK_UPDATE') { ... }
      else if (message.type === 'FIELD_COLLECTED') { ... }
    };
    ```
  - Demonstrates that `ws://localhost:8000/api/v1/ws/tracking` is active, accessible, and already standardized for real-time frontend streaming.

### 1.3 Registration Endpoints
- **Field Registration**:
  - File: `backend/app/api/v1/endpoints/fields.py` (lines 47–102).
  - `POST /api/v1/fields/register`: takes `FieldRegisterRequest`, auto-creates farmer if absent, inserts `Field` model, commits to database (`db.commit()`), and returns `{ "status": "success", "message": "Field registered successfully", "data": { ... } }`.
  - **No Event Emission**: Does not import `manager` or emit any event over WebSocket or record to an activity log.

- **Farmer Registration**:
  - File: `backend/app/api/v1/endpoints/farmers.py` (lines 82–110).
  - `POST /api/v1/farmers/register`: registers new `Farmer`, commits to database, returns profile.
  - **No Event Emission**: Does not broadcast any registration event.

- **Activity Feed Endpoint**:
  - File: `backend/app/api/v1/endpoints/analytics.py` (lines 41–68).
  - `GET /api/v1/analytics/activity-feed`:
    ```python
    recent_fields = db.query(Field).order_by(Field.id.desc()).limit(3).all()
    for f in recent_fields:
        activities.append({
            "id": f.id,
            "type": "field_registered",
            "title": f"Field registered by {f.farmer_name}",
            "subtitle": f"Village {f.village}",
            "time": "Recently"
        })
    ```
  - **Sorting Defect**: `Field.id` is defined in `backend/app/db/models.py` (line 13) as `Column(String, primary_key=True, default=generate_uuid)` where `generate_uuid()` generates random UUID4 strings. Ordering by `Field.id.desc()` sorts alphabetically, which does NOT guarantee newly registered fields appear first!
  - **Missing Farmer Activity**: Farmer registration events are not queried or represented.
  - **Static Timestamps**: Every item receives static string `"Recently"`.

---

## 2. Logic Chain

1. **Root Cause of Acceptance Criteria Failure**:
   - The user requires: *"The Live Activity feed updates when a new field is registered."*
   - Currently, if a field is registered externally (or from another device/tab), `RecentActivity.jsx` has no WebSocket listener to receive real-time push events, and no polling mechanism (`setInterval`) to periodically fetch updates.
   - Even if `RecentActivity.jsx` fetches `/api/v1/analytics/activity-feed`, the backend query sorts `Field` by UUID string (`Field.id.desc()`), so a newly registered field with a lexicographically lower UUID will not appear in the top 3 results.

2. **Integration Topology**:
   - The existing WebSocket gateway (`/api/v1/ws/tracking` in `websockets.py`) is already connected by `BiomassMap.jsx` and can handle multiple concurrent connections.
   - Broadcasting `FIELD_REGISTERED` (and `FARMER_REGISTERED`) through `manager.broadcast()` allows `RecentActivity.jsx` (and any other interested UI components such as `BiomassMap.jsx`) to receive instant push notifications without opening redundant WebSocket routes.

3. **Dual-Delivery Strategy (WebSocket + Polling Fallback)**:
   - To guarantee 100% test reliability and resilience against WebSocket connection drops or test harnesses that run without WebSocket servers:
     - **Primary Push**: `RecentActivity.jsx` connects to `ws://localhost:8000/api/v1/ws/tracking` and prepends incoming `FIELD_REGISTERED`, `FARMER_REGISTERED`, and `FIELD_COLLECTED` events to its state immediately.
     - **Fallback Polling**: A light 3–4 second interval (or on `refresh-dashboard-data`) polls `/api/v1/analytics/activity-feed`.
     - **Chronological Backend Store**: In `analytics.py`, maintain a recent in-memory activity ring buffer (or timestamp-ordered log) updated on registration and pickup events, ensuring `/api/v1/analytics/activity-feed` always returns the true chronological latest events.

---

## 3. Caveats

- **Test Suite Contracts**: `frontend/tests/empirical_challenge.mjs` checks for literal code strings (`activities.length === 0` and `No recent activities logged yet.`). Any modifications must retain these strings.
- **Sync vs Async Endpoints**: `FastAPI` supports both `def` and `async def` endpoints. In `fields.py` and `farmers.py`, the endpoints currently use synchronous `def`. When invoking `manager.broadcast(...)` (which is `async`), the implementation can either:
  - Make `register_field` an `async def` endpoint (`await manager.broadcast(...)`), or
  - Provide a thread-safe helper `manager.broadcast_sync(...)` using the running asyncio event loop or background task.
- **WebSocket URL Configuration**: In dev mode, the URL is `ws://localhost:8000/api/v1/ws/tracking`, matching `BiomassMap.jsx`. Using dynamic host (`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000/api/v1/ws/tracking`) ensures compatibility if run on non-localhost IPs.

---

## 4. Conclusion

To fulfill Requirement R2 and its acceptance criterion:
1. **Backend Event Broadcast (`fields.py` and `farmers.py`)**:
   - In `backend/app/api/v1/endpoints/fields.py`: On successful field creation, broadcast `FIELD_REGISTERED` containing `id`, `farmer_name`, `village`, `acres`, `biomass`, and formatted title/subtitle.
   - In `backend/app/api/v1/endpoints/farmers.py`: On successful farmer creation, broadcast `FARMER_REGISTERED`.
   - In `backend/app/api/v1/endpoints/analytics.py`: Maintain a chronological recent activity queue and record new registration/pickup events, so `GET /api/v1/analytics/activity-feed` always returns genuine recent events newest-first.
2. **Frontend Live Activity (`RecentActivity.jsx`)**:
   - Open a WebSocket connection to `ws://localhost:8000/api/v1/ws/tracking`.
   - On incoming `FIELD_REGISTERED`, `FARMER_REGISTERED`, or `NEW_ACTIVITY` message, prepend the event to `activities` array (capped at 10 items).
   - Maintain a 4-second polling fallback `setInterval(fetchData, 4000)` and preserve existing window event listener.
   - Preserve empty state markup for `empirical_challenge.mjs`.
3. **Synergy in `BiomassMap.jsx`**:
   - Optionally consume `FIELD_REGISTERED` on the map's existing WebSocket to dynamically place newly registered fields without requiring a full page refresh.

---

## 5. Verification Method

### 5.1 Code Inspections
- Inspect `frontend/src/components/RecentActivity.jsx` to confirm WebSocket setup, message listener, polling interval, cleanup on unmount, and empty state strings.
- Inspect `backend/app/api/v1/endpoints/fields.py` to confirm `manager.broadcast` is triggered on field registration.
- Inspect `backend/app/api/v1/endpoints/analytics.py` to confirm `/activity-feed` returns chronological activities with new fields prioritized.

### 5.2 Automated Tests
- **Frontend Empirical Suite**:
  ```bash
  node frontend/tests/empirical_challenge.mjs
  ```
  Expected: Suite 5 (RecentActivity empty state) must pass.
- **Milestone 1 Frontend Contracts**:
  ```bash
  node frontend/tests/test_m1_frontend_contracts.mjs
  ```
- **Backend End-to-End Test Suite**:
  ```bash
  python -m unittest backend/tests/test_e2e_requirements.py
  ```

### 5.3 Live End-to-End Verification
1. Start backend: `uvicorn app.main:app --reload --port 8000`
2. Start frontend: `npm run dev`
3. In browser, navigate to Admin Dashboard (`http://localhost:5173`).
4. Note the current entries in "Live Activity Feed".
5. Submit a new field registration via QuickActionModal or curl:
   ```bash
   curl -X POST http://localhost:8000/api/v1/fields/register \
     -H "Content-Type: application/json" \
     -d '{"farmer_name":"Amritpal Singh","phone":"9876543299","village":"Talwandi Sabo","district":"Bathinda","state":"Punjab","acres":10.5,"crop_type":"Paddy / Basmati","latitude":30.02,"longitude":75.08,"harvest_date":"2026-09-10"}'
   ```
6. Verify that "Field registered by Amritpal Singh" instantly appears at the top of the Live Activity feed without manual page refresh.
