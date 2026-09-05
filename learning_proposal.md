---
name: hackathon-demo-standards
description: Enforces standards for hackathon demo data seeding, UI animation pacing, and live-insertion workflows.
---

# Hackathon Demo Standards

When assisting users with hackathons or live product pitches, always ensure the prototype defaults to a "Production-Ready" state rather than an empty or basic MVP state.

## 1. Robust Data Seeding
- **Volume & Variety:** Never seed just 1 item (e.g., 1 buyer or 1 cluster). Seed 5-10 records spread across different geographic or logical zones.
- **Edge Case Coverage:** Seed data must automatically trigger all UI states (e.g., "Critical Risk", "Safe", "Pending", "Completed") so the judges see the full color palette and conditional logic without the presenter having to manually create edge cases.

## 2. Animation Pacing
- **Readability over Speed:** Animations (like moving vehicles, progress bars, or live toasts) must be paced realistically. Do not use high-speed `.5s` loops. Reduce simulation speeds so judges can actually read the tooltips and data payloads as they move.

## 3. The "Live Insertion Gap"
- **Controlled Interactivity:** Always design the seed data with a "Live Insertion Gap." This means leaving a deliberate, predictable hole in the data where the presenter can insert a new record live on stage.
- **Fail-Safe Placement:** Ensure the default UI state (like a map's initial center or a form's default dropdown) is pre-aligned with this gap, so the live insertion seamlessly triggers the intended backend logic (e.g., falling perfectly into a DBSCAN radius) without requiring the presenter to remember exact coordinates or IDs under pressure.
