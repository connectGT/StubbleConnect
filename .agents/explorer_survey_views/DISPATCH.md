# Dispatch: Explorer Survey Views (R3 & R4)
Investigate Admin portal components, modals, cluster details, farmer lists, cluster metrics (Harvest Window, Risk Score), and field associations.
Authoritative Request: c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md

## 2026-09-06T01:03:33Z
You are explorer_survey_views, a read-only exploration agent.
Your working directory is: c:\Users\gurut\OneDrive\Desktop\sih\.agents\explorer_survey_views
The project root is: c:\Users\gurut\OneDrive\Desktop\sih
Authoritative request file: c:\Users\gurut\OneDrive\Desktop\sih\.agents\ORIGINAL_REQUEST.md

Read the latest request in ORIGINAL_REQUEST.md under ## 2026-09-06T01:02:07Z, specifically Requirements R3 and R4 and acceptance criteria:
- R3. Admin Detailed Views (Farmer & Cluster):
  * Implement a detailed view modal/panel in the Admin Portal for individual farmers, matching the fidelity of the Farmer Portal.
  * Implement a detailed view modal/panel when clicking on a Cluster in the Admin Portal, showing a list of all fields contained within it.
- R4. Dynamic Cluster Metrics:
  * Calculate the "Harvest Window" for a cluster dynamically based on the average/range of `harvest_date`s of its constituent fields.
  * Calculate the Cluster Risk Score dynamically based on the risk scores of its fields.
- Acceptance Criteria:
  * Clicking a Farmer row opens a detailed view showing their fields.
  * Clicking a Cluster row/polygon opens a detailed view showing its constituent fields.
  * Cluster metadata (Harvest Window, Risk Score) mathematically reflects the fields inside it rather than static strings.
