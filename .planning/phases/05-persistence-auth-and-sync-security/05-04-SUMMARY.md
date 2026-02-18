---
phase: 05-persistence-auth-and-sync-security
plan: 04
subsystem: sync
tags: [convex, merge, cache, toast, sonner]

# Dependency graph
requires:
  - phase: 05-01
    provides: Convex backend with decision mutations
  - phase: 05-02
    provides: LocalDecision type and localStorage service
provides:
  - Storage merge service for local-to-Convex decision migration
  - Storage sync service for caching Convex decisions locally
  - useMergeOnSignIn hook for automatic merge on authentication
affects: [workspace, auth-flow]

# Tech tracking
tech-stack:
  added: [sonner]
  patterns:
    - Auth-state transition detection with useRef
    - Callback-based mutation pattern for merge service

key-files:
  created:
    - src/features/workspace/storage-merge.service.ts
    - src/features/workspace/storage-sync.service.ts
    - src/features/workspace/hooks/useMergeOnSignIn.ts
  modified:
    - package.json

key-decisions:
  - "Merge uses callback pattern to decouple from Convex client - enables testing"
  - "ConvexDecisionPayload excludes transient UI state (criteriaSelection, criteriaMultiDeleteUndo)"
  - "Toast notifications use sonner library for consistent UX"
  - "Cache is cleared before repopulating from Convex to ensure consistency"

patterns-established:
  - "Callback-based service pattern: mergeDecisions takes createDecision callback"
  - "Auth state transition detection: useRef to track wasAuthenticated"
  - "One-time execution guards: hasMerged/hasCached refs prevent duplicate operations"

requirements-completed: [SYN-01, SYN-02, SYN-03]

# Metrics
duration: 6 min
completed: 2026-02-18
---

# Phase 5 Plan 04: Storage Merge and Sync Services Summary

**Storage merge service, sync service, and useMergeOnSignIn hook enabling local-to-Convex decision migration on sign-in with toast notifications.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-18T18:06:14Z
- **Completed:** 2026-02-18T18:12:32Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Created storage merge service with conflict resolution for duplicate local IDs
- Created storage sync service for caching Convex decisions to localStorage
- Created useMergeOnSignIn hook that triggers merge on sign-in transition
- Added sonner toast library for user notifications

## Task Commits

Each task was committed atomically:

1. **Task 1: Create storage merge service** - `58a37b0` (feat)
2. **Task 2: Create storage sync service for authenticated cache** - `205d94f` (feat)
3. **Task 3: Create useMergeOnSignIn hook** - `a83d0f3` (feat)

**Plan metadata:** (pending final commit)

_Note: TDD tasks may have multiple commits (test → feat → refactor)_

## Files Created/Modified
- `src/features/workspace/storage-merge.service.ts` - Merge service with resolveConflict and mergeDecisions functions
- `src/features/workspace/storage-sync.service.ts` - Sync service with cacheFromConvex and clearCache functions
- `src/features/workspace/hooks/useMergeOnSignIn.ts` - Hook for merge-on-sign-in and caching
- `package.json` - Added sonner dependency

## Decisions Made
- Used callback pattern for mergeDecisions to decouple from Convex client implementation
- Defined ConvexDecisionPayload type to exclude transient UI state not stored in Convex
- Added sonner for toast notifications with success/error variants
- Cache is cleared before repopulating to ensure consistency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed import path for generateDecisionId**
- **Found during:** Task 1 (storage merge service)
- **Issue:** Plan specified import from local.storage.ts, but generateDecisionId is exported from utils.ts
- **Fix:** Corrected import to use utils.ts
- **Files modified:** src/features/workspace/storage-merge.service.ts
- **Verification:** TypeScript compilation (pending Convex generated files)
- **Committed in:** 58a37b0 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed ConvexDecisionPayload type for transient UI state**
- **Found during:** Task 1 (storage merge service)
- **Issue:** LocalDecision includes criteriaSelection and criteriaMultiDeleteUndo which are transient UI state not stored in Convex
- **Fix:** Created ConvexDecisionPayload type that excludes transient fields
- **Files modified:** src/features/workspace/storage-merge.service.ts
- **Verification:** Type mismatch resolved
- **Committed in:** 58a37b0 (Task 1 commit)

**3. [Rule 3 - Blocking] Removed unused convex variable**
- **Found during:** Task 3 (useMergeOnSignIn hook)
- **Issue:** useConvex was imported but not needed since useMutation handles mutation creation
- **Fix:** Removed unused import
- **Files modified:** src/features/workspace/hooks/useMergeOnSignIn.ts
- **Verification:** No unused variable warning
- **Committed in:** a83d0f3 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All fixes were minor import/type corrections. No scope creep.

## Issues Encountered
None - all tasks completed successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Merge and sync services ready for integration with workspace components
- Toast notifications configured and ready for use
- Next plan: 05-05 will update draft storage for multi-decision and router integration

---
*Phase: 05-persistence-auth-and-sync-security*
*Completed: 2026-02-18*

## Self-Check: PASSED

All files created and commits verified:
- src/features/workspace/storage-merge.service.ts: FOUND
- src/features/workspace/storage-sync.service.ts: FOUND
- src/features/workspace/hooks/useMergeOnSignIn.ts: FOUND
- Commit 58a37b0: FOUND
- Commit 205d94f: FOUND
- Commit a83d0f3: FOUND
