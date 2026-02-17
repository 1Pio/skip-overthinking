---
phase: 03-ratings-weights-and-coverage-integrity
plan: 01
subsystem: state
tags: [ratings, weights, zod, reducer, selectors]

requires:
  - phase: 02-typed-criteria-modeling
    provides: typed criteria contracts and reducer-driven draft state
provides:
  - canonical ratings matrix schemas and typed state/actions/selectors
  - shared integer-weights gate contract for results readiness checks
  - DecisionDraft integration for ratings matrix, mode, and criterion weights
affects: [phase-03-plan-02, phase-03-plan-03, phase-04-results]

tech-stack:
  added: []
  patterns:
    - flat matrix cells keyed by optionId::criterionId
    - dual-persisted rating_1_20 cells with non-destructive mode switching
    - selector-owned measured desirability derivation with equal-raw neutral 10.5

key-files:
  created:
    - src/features/ratings/ratings.schema.ts
    - src/features/ratings/ratingsGate.schema.ts
    - src/features/ratings/state/rating.types.ts
    - src/features/ratings/state/rating.actions.ts
    - src/features/ratings/state/rating.selectors.ts
    - src/features/ratings/state/ratingPrereq.ts
  modified:
    - src/features/decision/state/draft.types.ts
    - src/features/decision/state/draft.reducer.ts
    - src/features/decision/state/draft.storage.ts

key-decisions:
  - "Use optionId::criterionId as the canonical ratings matrix key to remain reorder-safe."
  - "Persist both numeric and seven-level rating representations and only mutate the actively edited representation."
  - "Set criterion blank-rate soft warning threshold at 30% as a centralized constant."

patterns-established:
  - "Schema-first ratings domain with reusable constants for thresholds and desirability constraints."
  - "Storage hydration migration that defaults invalid ratings fields while keeping valid prior draft data."

duration: 7 min
completed: 2026-02-17
---

# Phase 3 Plan 1: Ratings Domain Contracts Summary

**Ratings matrix semantics are now centralized with dual-mode persistence, measured 1-20 derivation (including the 10.5 equal-raw neutral case), and integer-weight gating wired into DecisionDraft state.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-17T16:19:05Z
- **Completed:** 2026-02-17T16:26:25Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Built a dedicated ratings domain (schema + gate + types + actions + selectors + prereq helpers) with explicit 1..20 desirability constraints and no 0 output paths.
- Implemented reversible `rating_1_20` behavior by persisting both numeric and seven-level values plus `lastEditedMode`, with nearest ghost mapping support.
- Added selector coverage logic for missing-cell review, completion metrics, per-option weighted coverage severity, and criterion blank-rate diagnostics.
- Integrated ratings matrix, mode, and criterion weights into draft reducer/storage so persisted drafts hydrate safely with schema-backed migration defaults.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build canonical ratings/weights schemas, types, and selectors** - `0fecf57` (feat)
2. **Task 2: Integrate ratings domain into DecisionDraft reducer and storage hydration** - `05d986c` (feat)

**Plan metadata:** pending

## Files Created/Modified

- `src/features/ratings/ratings.schema.ts` - ratings constants and Zod schemas for cells, matrix, mode, and integer weights.
- `src/features/ratings/ratingsGate.schema.ts` - shared gate requiring complete integer weight assignments.
- `src/features/ratings/state/rating.types.ts` - canonical ratings type aliases, key helpers, and fixed seven-level mappings.
- `src/features/ratings/state/rating.actions.ts` - immutable actions for cell edits, mode switching, explicit neutral fill, and weight updates.
- `src/features/ratings/state/rating.selectors.ts` - measured desirability derivation and coverage/missingness selectors with smoke checks.
- `src/features/ratings/state/ratingPrereq.ts` - results-readiness helper backed by `ratingsGateSchema.safeParse`.
- `src/features/decision/state/draft.types.ts` - DecisionDraft extension for ratings matrix, mode, and weights.
- `src/features/decision/state/draft.reducer.ts` - reducer handling for ratings action union.
- `src/features/decision/state/draft.storage.ts` - schema-backed hydration validation/migration for new ratings fields.

## Decisions Made

- Chose a flat `optionId::criterionId` matrix key instead of index-based structures to preserve correctness across reorder operations.
- Kept measured criteria storage raw-only and derivation selector-owned, with explicit neutral `10.5` when all filled raws are equal.
- Added centralized criterion blank-rate soft warning threshold (`0.3`) to keep warning policy configurable and explicit.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ratings semantics, persistence contracts, and readiness helpers are in place for Phase 3 matrix/weights UI wiring.
- Ready for `03-02-PLAN.md` implementation work.

## Self-Check: PASSED

- Verified all expected ratings domain and DecisionDraft integration files exist on disk.
- Verified task commits `0fecf57` and `05d986c` exist in git history.

---
*Phase: 03-ratings-weights-and-coverage-integrity*
*Completed: 2026-02-17*
