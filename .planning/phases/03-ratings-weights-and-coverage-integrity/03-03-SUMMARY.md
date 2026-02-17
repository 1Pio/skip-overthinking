---
phase: 03-ratings-weights-and-coverage-integrity
plan: 03
subsystem: ui
tags: [ratings, weights, coverage, route-guards, react, typescript]

requires:
  - phase: 03-01
    provides: ratings domain contracts and shared thresholds
  - phase: 03-02
    provides: ratings matrix UI, explicit fill-missing flow
provides:
  - Hybrid sticky summary plus expandable weights and coverage diagnostics panel
  - Integer-only criterion weight entry wired into ratings workflow
  - Shared route guard helper that blocks results until all weights are complete
affects: [phase-04-results-and-explainability, results-routing, ratings-workflow]

tech-stack:
  added: []
  patterns: [shared prereq helper for route guards, sticky summary with progressive details]

key-files:
  created: [src/features/ratings/components/WeightsCoveragePanel.tsx]
  modified:
    [
      src/features/ratings/components/RatingsStep.tsx,
      src/features/ratings/state/rating.selectors.ts,
      src/features/ratings/state/ratingPrereq.ts,
      src/routes/ratings/RatingsRoute.tsx,
      src/routes/results/ResultsRoute.tsx,
      src/styles.css,
    ]

key-decisions:
  - "Use a sticky compact summary with expandable diagnostics so key coverage status stays always visible."
  - "Centralize weight-complete results access checks in shared ratingPrereq helpers for both continue flow and deep links."

patterns-established:
  - "Results guard pattern: enforce prerequisites in route and pass explicit recovery guidance via navigation state."
  - "Weight and coverage panel pattern: compact always-on summary plus opt-in detail diagnostics."

duration: 1 min
completed: 2026-02-17
---

# Phase 3 Plan 3: Weights, Coverage, and Results Gating Summary

**Integer-only criterion weighting now drives an always-visible weighted coverage panel with severity warnings and blocks results access until weights are complete.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-17T16:40:08Z
- **Completed:** 2026-02-17T16:41:13Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Added `WeightsCoveragePanel` with a sticky compact status summary and expandable diagnostics.
- Added integer-only weight inputs and weighted coverage/blank-rate warning rendering inline in ratings.
- Enforced complete-weight prerequisites for both ratings continue navigation and direct `/results` deep links.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add integer weights and hybrid weighted-coverage panel with inline warnings** - `f5d0fbe` (feat)
2. **Task 2: Enforce results gating on complete weights via shared prereq helpers** - `ccbd24d` (feat)

## Files Created/Modified
- `src/features/ratings/components/WeightsCoveragePanel.tsx` - Sticky summary and expandable weights/coverage diagnostics UI.
- `src/features/ratings/components/RatingsStep.tsx` - Panel integration and continue-button gating by weight completeness.
- `src/features/ratings/state/rating.selectors.ts` - Weight assignment status selector used by ratings UI.
- `src/features/ratings/state/ratingPrereq.ts` - Shared results-access helper and reusable guard message.
- `src/routes/ratings/RatingsRoute.tsx` - Continue flow guard routing with explicit recovery copy.
- `src/routes/results/ResultsRoute.tsx` - Direct route guard redirect to ratings when weights are incomplete.
- `src/styles.css` - Utilitarian styles for sticky summary, severity bands, and detail layout.

## Decisions Made
- Kept severity status always visible in a compact sticky summary while moving deeper diagnostics to an expandable section.
- Reused one prereq helper contract for both ratings progression and results deep-link protection to keep guard behavior deterministic.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 plan scope is complete and results route integrity is now enforced before explainability work.
- Ready for Phase 4 planning/execution focused on rankings, strict checks, and visualization.

---
*Phase: 03-ratings-weights-and-coverage-integrity*
*Completed: 2026-02-17*

## Self-Check: PASSED
- Found: `src/features/ratings/components/WeightsCoveragePanel.tsx`
- Found: `.planning/phases/03-ratings-weights-and-coverage-integrity/03-03-SUMMARY.md`
- Found commit: `f5d0fbe`
- Found commit: `ccbd24d`
