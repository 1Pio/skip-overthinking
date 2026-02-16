---
phase: 02-typed-criteria-modeling
plan: 01
subsystem: criteria
tags: [zod, reducer, criteria, templates, typescript]

requires:
  - phase: 01-foundation-setup-and-options
    provides: Canonical DecisionDraft, option actions, and Zod gate patterns from phase 1
provides:
  - Canonical discriminated criteria contract restricted to rating_1_20 and numeric_measured
  - Typed criteria action creators for CRUD, up/down reorder, selection mode, and multi-delete undo payloads
  - Shared criteria minimum gate helpers and DecisionDraft reducer integration
affects: [phase-02-criteria-ui-and-routing, phase-03-ratings-input-and-conversion]

tech-stack:
  added: []
  patterns: [criteria-discriminated-union, zod-safeparse-gates, reducer-owned-criteria-transitions]

key-files:
  created: [src/features/criteria/criteria.schema.ts, src/features/criteria/criteriaGate.schema.ts, src/features/criteria/state/criterion.types.ts, src/features/criteria/templates.ts, src/features/criteria/state/criterion.actions.ts, src/features/criteria/state/criterionPrereq.ts]
  modified: [src/features/decision/state/draft.types.ts, src/features/decision/state/draft.reducer.ts, src/features/decision/state/draft.storage.ts]

key-decisions:
  - "Modeled criteria as a two-variant discriminated union to prevent schema drift and phase scope creep."
  - "Stored criteria transitions in reducer-owned action payloads with dense order normalization for deterministic state."
  - "Backed criteria completion checks with criteriaGateSchema.safeParse to share one guard contract across UI and routes."

patterns-established:
  - "Criteria templates are typed draft factories, not a separate template model."
  - "Criteria actions emit full normalized arrays, allowing reducer handling to stay immutable and predictable."

duration: 4 min
completed: 2026-02-16
---

# Phase 2 Plan 1: Typed Criteria Domain Foundations Summary

**Shipped a canonical two-type criteria contract with measured-direction semantics, template defaults, and reducer-backed criteria action transitions wired into DecisionDraft state.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T19:23:32Z
- **Completed:** 2026-02-16T19:28:08Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Added `criterionSchema` as a discriminated union limited to `rating_1_20` and `numeric_measured`, including required `rawDirection` for measured criteria and a shared desirability invariant string.
- Added `criteriaGateSchema` and prerequisite helpers so minimum-criteria readiness is checked through one Zod `safeParse` contract.
- Added a typed v1 template catalog with 8 entries split across `Recommended` and `Measured`, each expressed as a typed draft factory.
- Added criteria action creators and reducer integration for add/edit/delete/reorder, selection mode entry/clear, and multi-delete undo payload flow.
- Extended `DecisionDraft` with canonical criteria state and criteria UI state primitives for deterministic criteria transitions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Define canonical criteria schema, gate, and template defaults** - `42c093c` (feat)
2. **Task 2: Add criteria action creators and integrate criteria into draft reducer state** - `47ead65` (feat)

**Plan metadata:** `4b8c478`

## Files Created/Modified

- `src/features/criteria/criteria.schema.ts` - Canonical criteria discriminated union, type enums, and desirability invariant export.
- `src/features/criteria/criteriaGate.schema.ts` - Minimum-one-criterion gate schema used by completion checks.
- `src/features/criteria/state/criterion.types.ts` - Canonical criteria domain/input/selection/undo payload types.
- `src/features/criteria/templates.ts` - Typed recommended/measured template catalog and draft factory helpers.
- `src/features/criteria/state/criterion.actions.ts` - Pure criteria action creators with immutable normalized transitions.
- `src/features/criteria/state/criterionPrereq.ts` - Shared criteria prerequisite helpers delegating to gate safe-parse.
- `src/features/decision/state/draft.types.ts` - DecisionDraft extended with criteria, selection state, and undo state.
- `src/features/decision/state/draft.reducer.ts` - Reducer union now handles criteria actions as canonical transitions.
- `src/features/decision/state/draft.storage.ts` - Storage hydration guard updated for new criteria fields and undo payload validation.

## Decisions Made

- Kept criteria schema variants flat and discriminated by `type` to mirror existing option patterns and simplify reducer/action usage.
- Used `up`/`down` only reorder semantics for criteria actions in this phase to match scope and list determinism requirements.
- Included criteria selection and multi-delete undo state in `DecisionDraft` so upcoming criteria UI can remain reducer-driven with no parallel local state model.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Hardened DecisionDraft storage hydration for new criteria fields**
- **Found during:** Task 2 (criteria reducer integration)
- **Issue:** Existing `isDecisionDraft` accepted payloads without criteria fields, which could hydrate stale persisted drafts and break criteria flow assumptions.
- **Fix:** Added validation for `criteria`, `criteriaSelection`, and `criteriaMultiDeleteUndo` (including `criteriaSchema` checks) before accepting persisted data.
- **Files modified:** `src/features/decision/state/draft.storage.ts`
- **Verification:** `bun run build && bun run lint`
- **Committed in:** `47ead65` (Task 2)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Deviation was required to keep persisted draft hydration compatible with the new canonical criteria state and prevent invalid runtime state.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Criteria domain schema, templates, actions, and reducer state are ready for phase 2 criteria route/UI composition.
- Shared criteria prerequisite helper is ready for `/ratings` and `/results` guard wiring in downstream plans.

---
*Phase: 02-typed-criteria-modeling*
*Completed: 2026-02-16*

## Self-Check: PASSED

- Verified summary and listed key files exist on disk.
- Verified task commits `42c093c` and `47ead65` exist in git history.
