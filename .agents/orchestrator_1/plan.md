# Plan: SIH UI Wiring, E2E Verification & Pitch Guide

## Objective
Satisfy all requirements from ORIGINAL_REQUEST.md:
1. Wire dead UI buttons across Admin and Farmer panels (Sidebar.jsx, Map components, Headers, Dashboards, Empty States).
2. End-to-end workflow verification from farmer registration to logistics dispatch.
3. Generate SIH_PITCH_GUIDE.md with DBSCAN clustering and Google OR-Tools routing steps.

## Phases
- **Phase 0: Survey & Discovery**
  - Dispatch 3 Explorers / Spec Miners:
    - Explorer 1: Frontend UI scanning (Sidebar.jsx, Map components, Headers, Empty states, Dashboard buttons, routes).
    - Explorer 2: End-to-end workflows (Farmer registration, stubble listing, marketplace, logistics dispatch, backend APIs).
    - Explorer 3: Algorithm & Presentation mapping (DBSCAN clustering, Google OR-Tools routing, live fail-safe demo triggers).
  - Aggregate reports into `PROJECT.md`.
- **Phase 1: Milestone Execution**
  - M1: Wire dead UI panels (Sidebar, Map hover cards, Dashboards, Headers, Modals/Routes).
  - M2: E2E Workflow Verification & Fixes (Registration -> Stubble -> Matching -> Logistics).
  - M3: Pitch Guide Generation (SIH_PITCH_GUIDE.md with exact steps, talking points, DBSCAN & OR-Tools).
- **Phase 2: Review, Challenge & Forensic Audit**
  - 2 Reviewers independently verify UI wiring and E2E robustness.
  - 2 Challengers test edge cases and verify guide walkthrough.
  - 1 Forensic Auditor verifies authentic implementation (no mock bypasses).
- **Phase 3: Final Synthesis & Sentinel Report**
  - Compile final evidence and report to parent Sentinel.
