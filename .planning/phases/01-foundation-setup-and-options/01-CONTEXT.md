# Phase 01 Context

## Decisions

- Router mode is locked to `HashRouter` for GitHub Pages reliability in Phase 1.
- Option reordering baseline in Phase 1 is button-based controls: up/down plus move-to-top/move-to-bottom.
- Drag-and-drop reordering is deferred; if added later, keep button controls as an accessibility fallback.
- Zod is required for all step-gate validation logic.
- React Hook Form is optional per step; use it only when form complexity justifies it.
- Draft persistence is required in Phase 1 for logged-out usage via `localStorage`.
- Icon inputs in Phase 1 are simple string values with inline preview; no full icon picker.

## Deferred Ideas

- Drag-and-drop option sorting in Phase 1.
- Full icon picker UI in Phase 1.

## Claude's Discretion

- Whether to use RHF in specific forms that remain small and simple.
- Exact UI presentation for move controls and icon preview as long as behavior matches locked decisions.
