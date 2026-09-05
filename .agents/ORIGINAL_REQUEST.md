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
