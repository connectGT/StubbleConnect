# Original User Request

## 2026-09-05T12:16:55Z

# Teamwork Project Prompt — Draft

> Requested team: The full team

Debug and wire up all currently unconnected UI buttons across the Admin and Farmer panels (including sidebars, empty states, headers, and map hover cards), perform an end-to-end workflow verification, and generate a comprehensive step-by-step presentation guide for the SIH judges.

Working directory: c:/Users/gurut/OneDrive/Desktop/sih
Integrity mode: development

## Requirements

### R1. Wire Dead UI Panels
Scan the frontend React codebase (specifically Sidebars, Headers, Map components, and Empty States) for dead buttons or broken links. Wire them up to appropriate modals, page states, or placeholder components using the existing Tailwind styling.

### R2. End-to-End Workflow Verification
Perform a complete logical check of the system from farmer registration to logistics dispatch to ensure no crashing bugs remain in the primary user journey.

### R3. Generate Presentation Guide
Create a step-by-step markdown guide for the presenters, outlining exactly what to click, what talking points to use, and how to execute the live insertion fail-safe demo perfectly.

## Acceptance Criteria

### UI Completeness (Agent-as-Judge)
- [ ] An auditing agent must review `Sidebar.jsx`, map components, and primary dashboards to verify that `onClick` handlers or `Link` routes are functionally populated.
- [ ] Map hover cards must display connected data or valid actions instead of dead clicks.

### Presentation Guide
- [ ] `SIH_PITCH_GUIDE.md` must exist in the root directory.
- [ ] The guide must explicitly include presentation steps for triggering "DBSCAN clustering" and "Google OR-Tools routing".

## 2026-09-05T19:21:27Z

# Teamwork Project Prompt — Draft

> Status: Launched.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full Team

Fix bugs in StubbleConnect (syncing farmer names and registered fields), enhance the ML clustering to separate biogas plants from farm clusters, and implement a dynamic truck logistics simulation (hub-and-spoke) with date-based dynamic risk scoring.

Working directory: c:\Users\gurut\OneDrive\Desktop\sih
Integrity mode: development

## Requirements

### R1. Fix Data Sync Bugs
Registered fields must appear in the Farmer Panel's "My Fields" list. In the Admin Panel, newly registered fields must display the actual Farmer's name instead of the hardcoded "Farmer". Make sure the frontend panels accurately pull these details.

### R2. Field States (Pending vs. Completed)
Introduce a "Completed" state for fields. 
- Seed a few completed fields at startup so they are immediately visible.
- Completed fields must render as greyed out in the Admin panel and be excluded from active ML clustering.

### R3. Plants and Clustering
Increase the number of Biogas Plants (buyers). Adjust the map coordinates so plants are located away from the farm clusters (outside the polygons). Add 4-5 more cluster polygons in different places.

### R4. Dynamic Truck Logistics
Establish a mixed logistics hub model: some trucks start from private associations (hubs), while others are dispatched directly by the biogas plants. Trucks must dynamically animate on the map moving from their start location, to the fields to collect the biomass, marking the field as "Completed" upon collection, and then returning to their origin. 

### R5. Dynamic Risk Scoring
Implement a mathematical formula to calculate a field's risk score dynamically based solely on the days since its `harvest_date` (closer to/past harvest = higher risk). 

## Acceptance Criteria

### Bug Fixes
- [ ] New fields immediately populate in the Farmer Panel.
- [ ] Admin panel displays correct `farmer_name` for new fields.

### Features
- [ ] At least some fields are initialized as "Completed", appear grey, and are ignored by the clustering algorithm.
- [ ] Plants are visually separated from farm clusters.
- [ ] Trucks animate a full cycle: Hub/Plant -> Field -> Hub/Plant, changing field status to completed upon collection.
- [ ] Risk scores calculate correctly based on the `harvest_date`.

## 2026-09-06T01:02:07Z

# Teamwork Project Prompt — Draft

> Status: Step 9 — Ready for launch — awaiting user approval.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [Full team]

Replace hardcoded UI elements in StubbleConnect with dynamic data and build detailed view components for the Admin panel.

Working directory: c:/Users/gurut/OneDrive/Desktop/sih
Integrity mode: development

## Requirements

### R1. Dynamic Farmer Panel Tabs
- Wire the "Payments" tab in the Farmer Dashboard to display actual completed fields and their calculated payouts (Biomass * Rate) instead of hardcoded data.
- Wire the "Alerts" tab to dynamically generate notifications based on the farmer's real field statuses (e.g., "Field registered", "Pickup scheduled").

### R2. Live Activity Feed in Admin Panel
- Replace the hardcoded "Live Activity" feed in the Admin dashboard with a real WebSocket or polling-based feed that displays actual events (e.g., when a new field or farmer is registered).

### R3. Admin Detailed Views (Farmer & Cluster)
- Implement a detailed view modal/panel in the Admin Portal for individual farmers, matching the fidelity of the Farmer Portal.
- Implement a detailed view modal/panel when clicking on a Cluster in the Admin Portal, showing a list of all fields contained within it.

### R4. Dynamic Cluster Metrics
- Calculate the "Harvest Window" for a cluster dynamically based on the average/range of `harvest_date`s of its constituent fields.
- Calculate the Cluster Risk Score dynamically based on the risk scores of its fields.

## Acceptance Criteria

### Farmer Panel
- [ ] The Payments tab calculates totals based on the `fields` array where `status == 'Completed'`.
- [ ] The Alerts tab shows at least 2 dynamic alerts based on actual field states.

### Admin Panel
- [ ] The Live Activity feed updates when a new field is registered.
- [ ] Clicking a Farmer row opens a detailed view showing their fields.
- [ ] Clicking a Cluster row/polygon opens a detailed view showing its constituent fields.
- [ ] Cluster metadata (Harvest Window, Risk Score) mathematically reflects the fields inside it rather than static strings.
