---
phase: 02-typed-criteria-modeling
plan: 04
subsystem: ui
tags: [react-router, criteria, route-guards, prerequisites, desirability]

requires:
  - phase: 02-03
    provides: Full criteria authoring experience with typed editor and template flows
provides:
  - Criteria route now hosts the complete authoring workflow with explicit progression controls
  - Ratings and results routes now enforce criteria prerequisites with recovery redirects
affects: [phase-03-ratings-entry, deep-link-guarding, criteria-authoring-flow]

tech-stack:
  added: []
  patterns: [route-state-recovery-messaging, shared-criteria-prereq-guard]

key-files:
  created: []
  modified: [src/routes/criteria/CriteriaRoute.tsx, src/features/criteria/components/CriteriaStep.tsx, src/routes/ratings/RatingsRoute.tsx, src/routes/results/ResultsRoute.tsx]

key-decisions:
  - "Flow guard messaging from route redirects into the criteria step so users recover in-place instead of losing context."
  - "Use hasMinimumCriteria as the shared prerequisite contract in ratings/results route guards to keep deep-link behavior deterministic."

patterns-established:
  - "Downstream wizard routes preserve existing option guard behavior, then layer criteria readiness checks before rendering."
  - "Criteria recovery messaging is displayed on /criteria via router state and surfaced as an alert in the step UI."

duration: 1 min
completed: 2026-02-16
---

# Phase 2 Plan 4: Criteria Route Integration and Guard Enforcement Summary

**The wizard now routes users through full criteria authoring before ratings, and deep links to ratings/results are redirected back to criteria with explicit recovery messaging when prerequisites are missing.**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-16T19:52:07Z
- **Completed:** 2026-02-16T19:53:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Wired the criteria route to carry recovery guard messaging into the integrated `CriteriaStep` flow while preserving explicit navigation controls.
- Reinforced helper copy in criteria authoring that measured values are converted into 1-20 desirability where higher is better.
- Added criteria prerequisite guards to both ratings and results routes so direct URL access cannot bypass required criteria setup.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire complete criteria authoring experience into the criteria route** - `e3c8969` (feat)
2. **Task 2: Enforce criteria prerequisites on ratings and results routes with recovery messaging** - `9a2d186` (feat)

**Plan metadata:** `pending`

## Files Created/Modified

- `src/routes/criteria/CriteriaRoute.tsx` - Reads route guard state and passes recovery messaging into the criteria authoring step.
- `src/features/criteria/components/CriteriaStep.tsx` - Accepts guard alerts and clarifies numeric measured conversion into desirability semantics.
- `src/routes/ratings/RatingsRoute.tsx` - Adds criteria readiness guard and redirects blocked users to `/criteria` with next-action copy.
- `src/routes/results/ResultsRoute.tsx` - Adds criteria readiness guard and redirects blocked users to `/criteria` with next-action copy.

## Decisions Made

- Prioritized in-route recovery messaging for criteria prerequisites so blocked users understand exactly what to fix without leaving the wizard context.
- Kept one shared criteria gate helper (`hasMinimumCriteria`) for downstream route access checks to avoid split guard contracts.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Criteria authoring and route prerequisites are now aligned for end-to-end wizard progression.
- Phase 2 is complete from plan execution perspective and ready for transition to next phase planning/execution.

---
*Phase: 02-typed-criteria-modeling*
*Completed: 2026-02-16*

## Self-Check: PASSED

- Verified summary file exists on disk.
- Verified task commits `e3c8969` and `9a2d186` exist in git history.
