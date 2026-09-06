# Handoff Report: Farmer Dashboard Payments & Alerts Survey (R1)

**Agent**: `explorer_survey_farmer`  
**Date**: 2026-09-06  
**Scope**: Requirement R1 (Dynamic Farmer Panel Tabs — Payments & Alerts) & Acceptance Criteria

---

## 1. Observation

### 1.1 Payments Tab — Current State & Code Inspection
- **File**: `frontend/src/components/FarmerDashboard.jsx`
  - **Lines 11–17**: Hardcoded static array `PAYMENT_HISTORY`:
    ```javascript
    const PAYMENT_HISTORY = [
      { date: '15 Aug 2026', field: 'Farm A', tonnes: 22.5, rate: 2500, total: 56250, mode: 'UPI', status: 'Paid' },
      { date: '12 Jul 2026', field: 'Farm A', tonnes: 10.2, rate: 2400, total: 24480, mode: 'Bank Transfer', status: 'Paid' },
      { date: '03 Jun 2026', field: 'Farm C', tonnes: 8.0, rate: 2350, total: 18800, mode: 'UPI', status: 'Paid' },
      { date: '18 Apr 2026', field: 'Farm B', tonnes: 14.3, rate: 2300, total: 32890, mode: 'UPI', status: 'Paid' },
      { date: '22 Sep 2026', field: 'Farm B', tonnes: 28.0, rate: 2500, total: 70000, mode: 'Bank Transfer', status: 'Pending' },
    ];
    ```
  - **Lines 680–737**: The Payments tab table renders `PAYMENT_HISTORY.map(...)` directly, and computes `Total Paid` exclusively against this static array:
    ```jsx
    <tfoot>
      <tr className="bg-emerald-50">
        <td colSpan={4} className="px-3 py-2.5 font-bold text-gray-700">Total Paid</td>
        <td className="px-3 py-2.5 font-black text-emerald-700">
          ₹{PAYMENT_HISTORY.filter(r => r.status === 'Paid').reduce((a, r) => a + r.total, 0).toLocaleString()}
        </td>
        <td colSpan={2} />
      </tr>
    </tfoot>
    ```
  - **Line 315**: Component declaration ignores `activeTab`, `onTabChange`, and `fields` props:
    ```javascript
    export default function FarmerDashboard({ farmerUser, onLogout: _onLogout, onRegisterClick: _onRegisterClick }) {
      const [activeTab, setActiveTab] = useState('overview');
    ```
  - **Line 410**: `myFields` is derived solely as `const myFields = farmerUser?.fields || [];`.
  - **Lines 518–527**: Overview tab card for "Total Earnings" routes to the Payments tab:
    ```jsx
    <button onClick={() => setActiveTab('payments')} ...>
      <p className="text-2xl font-black text-gray-900 mt-0.5">₹{(farmerUser?.total_earnings || 0).toLocaleString()}</p>
    ```

### 1.2 Alerts Tab — Current State & Code Inspection
- **File**: `frontend/src/components/FarmerDashboard.jsx`
  - **Lines 19–25**: Hardcoded static array `NOTIFICATIONS`:
    ```javascript
    const NOTIFICATIONS = [
      { id: 1, icon: '✅', text: 'Farm B matched with GreenFuel Plant, Bathinda', time: '2h ago', type: 'success' },
      { id: 2, icon: '🚛', text: 'Truck dispatched for Farm A — ETA 47 min', time: '1h ago', type: 'info' },
      { id: 3, icon: '💰', text: 'Payment ₹56,250 credited to your UPI', time: 'Yesterday', type: 'success' },
      { id: 4, icon: '⚠️', text: 'Harvest window closing in 2 days for Farm B', time: '2 days ago', type: 'warning' },
      { id: 5, icon: '📋', text: 'Welcome to StubbleConnect! Your profile is complete.', time: '5 days ago', type: 'neutral' },
    ];
    ```
  - **Lines 739–775**: Renders `NOTIFICATIONS.map(...)` whenever `hasFields` is true:
    ```jsx
    <h3 className="font-bold text-gray-900 text-sm">Recent Notifications</h3>
    {NOTIFICATIONS.map(n => (
      <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ...`}>
    ```
  - **Line 417**: Tab bar badge is statically hardcoded to `2`:
    ```javascript
    { id: 'alerts', label: t('alerts'), badge: 2 },
    ```

### 1.3 Parent Container Contract & Sidebar Integration
- **File**: `frontend/src/App.jsx`
  - **Lines 313–337**: `App.jsx` passes `activeTab={activeTab}`, `onTabChange={...}`, and `farmerUser={farmerUser}` to `FarmerDashboard`.
  - **Lines 320–327**: When `tab === 'receipts'`, CSV export is hardcoded with static receipts.
- **File**: `frontend/src/components/Sidebar.jsx`
  - **Lines 62–67**: Farmer sidebar nav items:
    ```javascript
    const farmerNavItems = [
      { id: 'overview', label: 'Dashboard', icon: MapPin },
      { id: 'fields', label: 'My Fields', icon: Wheat },
      { id: 'payments', label: 'Payments & Receipts', icon: CheckCircle },
      { id: 'alerts', label: 'Alerts', icon: Bell }
    ];
    ```
  - Clicking sidebar nav items calls `setActiveTab(tab)` in `App.jsx`, but `FarmerDashboard` does not synchronize with `activeTab` prop, causing sidebar navigation to be ignored.

### 1.4 Backend Data Models & Live API Query
- **Live Query**: Executed `http://localhost:8000/api/v1/farmers/me?phone=9876543210` (Gurmit Singh):
  ```json
  {
    "status": "success",
    "data": {
      "id": "5a0509c0-62d6-4a37-a634-36103d7a2158",
      "name": "Gurmit Singh",
      "phone": "9876543210",
      "village": "Mehma Bhagwana",
      "district": "Bathinda",
      "fpo_id": "#88100",
      "tier": "Gold",
      "joined_date": "2026-07-08",
      "total_biomass_sold": 12.5,
      "total_earnings": 31250.0,
      "fields": [
        {
          "id": "f9fbed93-46b1-4ac9-a7fc-c196e61cdf10",
          "name": "Farm A",
          "location": "Mehma Bhagwana",
          "acres": 31.2,
          "crop_type": "Paddy / Basmati",
          "harvest_date": "2026-09-06",
          "biomass_est": 14.2,
          "status": "Pickup Scheduled",
          "status_color": "amber"
        },
        {
          "id": "b14c5b3c-e72c-45e3-88a6-e4b70927eab3",
          "name": "Farm B",
          "location": "Mehma Bhagwana",
          "acres": 6.0,
          "crop_type": "Basmati 1509",
          "harvest_date": "2026-08-17",
          "biomass_est": 12.5,
          "status": "Sold & Paid",
          "status_color": "emerald"
        }
      ]
    }
  }
  ```
- **File**: `backend/app/db/models.py`
  - **Line 23**: `status = Column(String, default="Pending")` — stores values `'Pending'` or `'Completed'`.
- **File**: `backend/app/api/v1/endpoints/seed.py`
  - **Lines 217–233**: `past_field_1` is seeded with `status="Completed"`, `biomass=12.5`.
- **File**: `backend/app/api/v1/endpoints/farmers.py`
  - **Lines 16–31**: `field_status(harvest_date_str)` calculates status purely from `(hd - today).days`. If `days_diff < 0`, it returns `"Sold & Paid"`, `"emerald"`.
  - **Lines 45–60**: `build_farmer_profile` ignores the database column `f.status` when assigning `status` to `fields_data`, thus converting `status="Completed"` into `"Sold & Paid"`.

---

## 2. Logic Chain

### 2.1 Payments Tab Dynamic Payout Logic
1. **Observation 1.1 & 1.4**: The requirement mandates:
   > "The Payments tab calculates totals based on the `fields` array where `status == 'Completed'`."
2. **Observation 1.4**: The backend model stores `status = "Completed"`, but `farmers.py` returned `"Sold & Paid"` because of `field_status()`. Furthermore, Gurmit Singh has 1 completed field: `biomass_est = 12.5` T.
3. **Calculation Formula**:
   - `tonnes = Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0)`
   - `rate = Number(f.rate || 2500)` (MSP standard in application: ₹2,500/tonne)
   - `payout = tonnes * rate`
   - Payout for 12.5 Tonnes = `12.5 * 2500 = ₹31,250` (matches `farmerUser.total_earnings = 31250.0` from `/me` endpoint).
4. **Filtering Condition**:
   - Filter condition: `const completedFields = myFields.filter(f => f.status === 'Completed' || f.status === 'Sold & Paid');`
   - Total payout: `const totalPayout = completedFields.reduce((sum, f) => sum + ((Number(f.biomass_est || f.biomass || 0)) * (Number(f.rate || 2500))), 0);`
5. **UI Rendering**:
   - If `completedFields.length > 0`: Map each field to a table row displaying `Date`, `Field Name`, `Tonnes`, `Rate/T (₹2,500)`, `Total (₹)`, `Mode (UPI/Bank Transfer)`, and `Status (Paid)`. In `tfoot`, render `Total Paid: ₹{totalPayout.toLocaleString()}`.
   - If `completedFields.length === 0`: Render an empty state or empty row indicating "No completed field payouts yet. Payouts are generated once collection is marked Completed." with Total Paid = ₹0.

### 2.2 Alerts Tab Dynamic Generation Logic
1. **Observation 1.2**: Current alerts are 5 hardcoded entries from `NOTIFICATIONS`. The acceptance criteria mandates:
   > "The Alerts tab shows at least 2 dynamic alerts based on actual field states."
2. **Observation 1.4**: In a live farmer profile (e.g. Gurmit Singh), fields have real statuses:
   - `Farm A`: `status = "Pickup Scheduled"`, `harvest_date = "2026-09-06"`
   - `Farm B`: `status = "Completed"` (or `"Sold & Paid"`), `harvest_date = "2026-08-17"`
3. **Dynamic Rule Mapping**:
   - **Rule 1 (Completed Field)**:
     * Alert: `Payment processed: ₹${payout.toLocaleString()} for ${f.name} (${tonnes}T biomass collected)` (Icon: `💰`, Type: `success`)
     * Alert: `${f.name} collection completed in ${location}` (Icon: `✅`, Type: `success`)
   - **Rule 2 (Pickup Scheduled Field)**:
     * Alert: `Pickup scheduled for ${f.name} (${location}) — Logistics truck assigned` (Icon: `🚛`, Type: `info`)
   - **Rule 3 (Registered / Pending Field)**:
     * Alert: `Field registered: ${f.name} in ${location} (${f.acres} Acres, ${f.crop_type})` (Icon: `📋`, Type: `info`)
     * Alert: `${f.name} queued for regional biomass cluster aggregation` (Icon: `🌱`, Type: `neutral`)
   - **Rule 4 (Harvest Window Imminent / Overdue)**:
     * If `diffDays <= 2` and not completed: `Harvest window closing in ${diffDays} days for ${f.name}` (Icon: `⚠️`, Type: `warning`)
4. **Guarantee of Acceptance Criteria (>= 2 dynamic alerts)**:
   - Any single registered field generates at least 2 dynamic alerts (e.g., "Field registered..." and "Queued for clustering...").
   - A farmer with active + completed fields generates 4–5 dynamic alerts.
   - The badge on the Alerts tab header dynamically displays `dynamicAlerts.length`.

### 2.3 Backend / API Harmony Logic
1. **Observation 1.4**: In `backend/app/api/v1/endpoints/farmers.py`, `f.status == "Completed"` should be respected in `build_farmer_profile`:
   ```python
   if f.status == "Completed":
       status = "Completed"
       color = "emerald"
   else:
       status, color = field_status(f.harvest_date or "")
   ```
2. This ensures `GET /api/v1/farmers/me` returns `"status": "Completed"` for completed fields, directly satisfying acceptance criteria checks that test `status == 'Completed'`.

---

## 3. Caveats

1. **Dual Status Compatibility**: While the acceptance criteria mentions `status == 'Completed'`, backend currently returns `"Sold & Paid"` for past harvests unless patched. The frontend code should support `f.status === 'Completed' || f.status === 'Sold & Paid'` for robust forward and backward compatibility.
2. **Props vs Internal State**: In `FarmerDashboard.jsx`, props `activeTab`, `onTabChange`, and `fields` should be destructured from component props so parent components and automated test runners can drive the tab state or pass mock fields directly.
3. **App.jsx CSV Export**: In `App.jsx` line 320, when `tab === 'receipts'`, the CSV string is currently static. The worker should also dynamically build CSV data from `farmerUser.fields.filter(f => f.status === 'Completed')`.
4. **Window.alert() in FarmerDashboard**: Line 87 in `FarmerDashboard.jsx` contains `alert('Map view coming soon!')`, which is flagged in contract tests. The worker should replace this with `showToast()`.

---

## 4. Conclusion & Proposed Implementation

### 4.1 Proposed Implementation in `frontend/src/components/FarmerDashboard.jsx`

#### A. Component Signature & Tab Synchronization
```jsx
export default function FarmerDashboard({
  farmerUser,
  fields: propFields,
  activeTab: propActiveTab,
  onTabChange,
  onLogout: _onLogout,
  onRegisterClick: _onRegisterClick
}) {
  const [internalTab, setInternalTab] = useState('overview');
  const activeTab = propActiveTab || internalTab;
  const setActiveTab = (tab) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  
  const myFields = propFields || farmerUser?.fields || [];
  const hasFields = myFields.length > 0;
```

#### B. Dynamic Payments Computation
```jsx
  // Calculate payments dynamically from completed fields (R1 Acceptance Criteria)
  const completedFields = myFields.filter(f => f.status === 'Completed' || f.status === 'Sold & Paid');
  const totalPayout = completedFields.reduce((sum, f) => {
    const tonnes = Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0);
    const rate = Number(f.rate || 2500);
    return sum + (tonnes * rate);
  }, 0);
```

#### C. Dynamic Alerts Generator
```jsx
  // Dynamically generate notifications from real field states (R1 Acceptance Criteria)
  const dynamicAlerts = React.useMemo(() => {
    const alerts = [];
    let id = 1;

    myFields.forEach((field, i) => {
      const fieldName = field.name || `Farm ${String.fromCharCode(65 + i)}`;
      const location = field.location || field.village || 'Punjab';
      const status = field.status || 'Registered';
      const biomass = Number(field.biomass_est || field.biomass || ((field.acres || 0) * 2.5) || 0);
      const rate = Number(field.rate || 2500);
      const harvestDate = field.harvest_date || field.harvestDate || 'Upcoming';

      if (status === 'Completed' || status === 'Sold & Paid') {
        alerts.push({
          id: id++,
          icon: '💰',
          text: `Payment credited: ₹${(biomass * rate).toLocaleString()} for ${fieldName} (${biomass}T collected)`,
          time: `Completed (${harvestDate})`,
          type: 'success'
        });
        alerts.push({
          id: id++,
          icon: '✅',
          text: `${fieldName} collection verified and closed in ${location}`,
          time: 'Verified',
          type: 'success'
        });
      } else if (status === 'Pickup Scheduled') {
        alerts.push({
          id: id++,
          icon: '🚛',
          text: `Pickup scheduled for ${fieldName} — Logistics truck assigned for collection`,
          time: `Target Date: ${harvestDate}`,
          type: 'info'
        });
        alerts.push({
          id: id++,
          icon: '📋',
          text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'})`,
          time: 'Active',
          type: 'neutral'
        });
      } else {
        alerts.push({
          id: id++,
          icon: '📋',
          text: `Field registered: ${fieldName} in ${location} (${field.acres || 0} Acres, ${field.crop_type || 'Paddy'})`,
          time: `Harvest: ${harvestDate}`,
          type: 'info'
        });
        alerts.push({
          id: id++,
          icon: '🌱',
          text: `${fieldName} queued for biomass cluster aggregation & buyer matching`,
          time: 'Pending Route',
          type: 'neutral'
        });
      }

      // Check for approaching harvest window
      if (field.harvest_date) {
        try {
          const diff = Math.ceil((new Date(field.harvest_date) - new Date()) / (1000 * 60 * 60 * 24));
          if (diff <= 2 && status !== 'Completed' && status !== 'Sold & Paid') {
            alerts.push({
              id: id++,
              icon: '⚠️',
              text: `Harvest window closing in ${Math.max(0, diff)} days for ${fieldName}`,
              time: 'Urgent',
              type: 'warning'
            });
          }
        } catch { /* ignore date parse errors */ }
      }
    });

    if (alerts.length === 0 && farmerUser) {
      alerts.push({
        id: id++,
        icon: '🌾',
        text: `Welcome to StubbleConnect, ${farmerUser.name || 'Farmer'}! Your profile is verified with FPO ${farmerUser.fpo_id || '#88392'}.`,
        time: 'Just now',
        type: 'neutral'
      });
      alerts.push({
        id: id++,
        icon: '📢',
        text: 'No active fields found. Register a harvest to begin logistics matching.',
        time: 'Action Required',
        type: 'info'
      });
    }

    return alerts;
  }, [myFields, farmerUser]);
```

#### D. Tab Badge Synchronization
```jsx
  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'fields', label: t('fields') },
    { id: 'payments', label: t('payments') },
    { id: 'alerts', label: t('alerts'), badge: dynamicAlerts.length },
  ];
```

#### E. Payments Table Render (Replacing PAYMENT_HISTORY)
```jsx
{completedFields.length > 0 ? (
  completedFields.map((f, i) => {
    const biomass = Number(f.biomass_est || f.biomass || ((f.acres || 0) * 2.5) || 0);
    const rate = Number(f.rate || 2500);
    const total = biomass * rate;
    return (
      <tr key={f.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <td className="px-3 py-2.5 text-gray-600">{f.harvest_date || f.harvestDate || 'Recent'}</td>
        <td className="px-3 py-2.5 font-medium text-gray-900">{f.name || `Farm ${String.fromCharCode(65 + i)}`}</td>
        <td className="px-3 py-2.5 text-gray-700">{biomass}</td>
        <td className="px-3 py-2.5 text-gray-700">₹{rate.toLocaleString()}</td>
        <td className="px-3 py-2.5 font-bold text-gray-900">₹{total.toLocaleString()}</td>
        <td className="px-3 py-2.5 text-gray-600">{f.payment_mode || 'UPI'}</td>
        <td className="px-3 py-2.5">
          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-700">
            Paid
          </span>
        </td>
      </tr>
    );
  })
) : (
  <tr>
    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
      No completed fields yet. Payouts are calculated when fields reach 'Completed' status after collection.
    </td>
  </tr>
)}
```
In `tfoot`:
```jsx
<tfoot>
  <tr className="bg-emerald-50">
    <td colSpan={4} className="px-3 py-2.5 font-bold text-gray-700">Total Paid</td>
    <td className="px-3 py-2.5 font-black text-emerald-700">
      ₹{totalPayout.toLocaleString()}
    </td>
    <td colSpan={2} />
  </tr>
</tfoot>
```

#### F. Alerts Tab Render (Replacing NOTIFICATIONS)
```jsx
{dynamicAlerts.map(n => (
  <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
    n.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
    n.type === 'warning' ? 'bg-amber-50 border-amber-200' :
    n.type === 'info' ? 'bg-blue-50 border-blue-200' :
    'bg-gray-50 border-gray-200'
  }`}>
    <span className="text-base mt-0.5 shrink-0">{n.icon}</span>
    <div className="flex-1">
      <p className={`font-medium leading-relaxed ${
        n.type === 'success' ? 'text-emerald-800' :
        n.type === 'warning' ? 'text-amber-800' :
        n.type === 'info' ? 'text-blue-800' :
        'text-gray-700'
      }`}>{n.text}</p>
      <p className="text-gray-400 mt-0.5">{n.time}</p>
    </div>
  </div>
))}
```

### 4.2 Proposed Backend Enhancement in `backend/app/api/v1/endpoints/farmers.py`
In `build_farmer_profile`:
```python
for i, (f, lat, lng) in enumerate(fields_query):
    if f.status == "Completed":
        status = "Completed"
        color = "emerald"
    else:
        status, color = field_status(f.harvest_date or "")
    
    biomass = f.biomass or round((f.acres or 0) * 2.5, 1)
    total_biomass += biomass if (status == "Completed" or status == "Sold & Paid") else 0
    total_earnings += biomass * 2500 if (status == "Completed" or status == "Sold & Paid") else 0
    fields_data.append({
        "id": f.id,
        "name": f"Farm {chr(65+i)}",
        "location": f.village or farmer.village,
        "acres": f.acres or 0,
        "crop_type": f.crop_type or "Paddy / Basmati",
        "harvest_date": f.harvest_date or "",
        "biomass_est": biomass,
        "status": status,
        "status_color": color,
    })
```

---

## 5. Verification Method

### 5.1 Independent Test Commands
1. **Frontend Contract Conformance**:
   ```powershell
   node frontend/tests/test_m1_frontend_contracts.mjs
   ```
   *Expected outcome*: Suites 1, 2, 3, 4, and 5 run; `FarmerDashboard accepts activeTab and onTabChange props` passes.

2. **Automated Unit Verification of Acceptance Criteria**:
   Create or run a node/jest contract test asserting:
   - `completedFields` filters `fields` where `status == 'Completed'`.
   - `totalPayout` equals `sum(biomass * rate)`.
   - `dynamicAlerts.length >= 2` for a farmer with registered/completed fields.

3. **Backend API Verification**:
   ```powershell
   python -c "import urllib.request, json; res = urllib.request.urlopen('http://localhost:8000/api/v1/farmers/me?phone=9876543210'); data = json.loads(res.read())['data']; print('Completed fields:', [f for f in data['fields'] if f['status'] in ['Completed', 'Sold & Paid']]); print('Total earnings:', data['total_earnings'])"
   ```
   *Expected output*: Farm B returned with status `"Completed"` (or `"Sold & Paid"`), biomass 12.5 T, earnings 31,250.

4. **Visual UI End-to-End Verification**:
   - Start frontend (`npm run dev` in `frontend/`) and backend (`python -m uvicorn app.main:app --port 8000` in `backend/`).
   - Open browser at `http://localhost:5173`.
   - Click "Farmer" role or log in with phone `9876543210`.
   - Navigate to "Payments" tab: observe Farm B listed with 12.5 T @ ₹2,500 = ₹31,250, and Total Paid = ₹31,250.
   - Navigate to "Alerts" tab: observe dynamic alerts reflecting actual field statuses for Farm A and Farm B, with badge count >= 2.
