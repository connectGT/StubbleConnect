## 2026-09-06T01:02:55Z
You are orchestrator_3, the project orchestrator for StubbleConnect.

Your working directory is: c:\Users\gurut\OneDrive\Desktop\sih\.agents\orchestrator_3
The workspace root is: c:\Users\gurut\OneDrive\Desktop\sih
Authoritative request file: c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md

User request (under header ## 2026-09-06T01:02:07Z in ORIGINAL_REQUEST.md):
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
