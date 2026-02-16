---
status: diagnosed
trigger: "Investigate issue: phase02-test5-criteria-reorder"
created: 2026-02-17T00:00:00Z
updated: 2026-02-17T00:18:00Z
---

## Current Focus

hypothesis: Root cause confirmed in `criterionReordered` normalization step.
test: N/A (diagnosis complete)
expecting: N/A
next_action: return structured root-cause diagnosis

## Symptoms

expected: Criteria can be reordered only with Move up/Move down controls and resulting order updates correctly.
actual: User reports Move up/Move down buttons do not do anything, while boundary disabled states still work.
errors: None reported in console.
reproduction: Phase 2 UAT Test 5 in /criteria list after creating multiple criteria.
started: Discovered during UAT.

## Eliminated

- hypothesis: Move buttons are not wired to handlers.
  evidence: `CriteriaRow` calls `onMove(...)` for both controls, and `CriteriaStep` passes dispatching handler.
  timestamp: 2026-02-17T00:08:40Z

- hypothesis: Draft reducer ignores `criterionReordered`.
  evidence: `draft.reducer.ts` explicitly handles `criterionReordered` and replaces `state.criteria` with action payload.
  timestamp: 2026-02-17T00:11:20Z

## Evidence

- timestamp: 2026-02-17T00:04:00Z
  checked: Searched codebase for Move up/Move down controls
  found: Controls are implemented in `src/features/criteria/components/CriteriaRow.tsx`; `CriteriaStep.tsx` dispatches `criterionReordered(...)`
  implication: Reorder flow exists in UI wiring and likely fails in action/state update path

- timestamp: 2026-02-17T00:04:30Z
  checked: Looked for related UAT and plan references
  found: UAT documents match reported symptom exactly; no additional console errors documented
  implication: Bug is functional logic issue, not runtime exception

- timestamp: 2026-02-17T00:08:10Z
  checked: `CriteriaRow.tsx` and `CriteriaList.tsx`
  found: Move up/down buttons call `onMove(criterion.id, "up"|"down")`; disabled boundaries are based on rendered index
  implication: Button interactivity and boundary disabled logic are implemented independently of state mutation

- timestamp: 2026-02-17T00:08:40Z
  checked: `CriteriaStep.tsx`
  found: `onMove` dispatches `criterionReordered(criteria, { id, direction })` where `criteria` comes from draft state, while rendering uses `orderedCriteria` sorted by `order`
  implication: If action updates criteria orders correctly, UI should re-render in new order

- timestamp: 2026-02-17T00:08:55Z
  checked: `criterion.actions.ts` reorder logic
  found: `criterionReordered` normalizes, computes source/target index, splices moved item, and returns normalized reordered array
  implication: Reorder algorithm itself appears correct; likely issue is downstream consumption of this action

- timestamp: 2026-02-17T00:11:20Z
  checked: `draft.reducer.ts` and `DraftProvider.tsx`
  found: `criterionReordered` is handled in reducer and directly replaces `state.criteria`; provider persists any state change
  implication: Dispatch/reducer pipeline is not missing the action; investigate input data/normalization assumptions

- timestamp: 2026-02-17T00:14:20Z
  checked: `option.actions.ts` and `OptionList.tsx`
  found: Option reorder flow is structurally similar and delegates normalization to `reorderOptions` utility
  implication: Comparing normalization helpers can isolate why criteria reorder is no-op while control wiring is valid

- timestamp: 2026-02-17T00:16:40Z
  checked: Local minimal reproduction of reorder algorithm (`normalize` sort + splice + normalize)
  found: Moving `c` up in `[a,b,c]` still returns `[a,b,c]`
  implication: Sorting by stale `order` before reassigning order makes reorder operation a no-op

## Resolution

root_cause: In `criterionReordered`, array splice creates the intended new sequence, but `normalizeCriteria(nextCriteria)` immediately sorts by each item's old `order` field first, restoring original order before remapping indices. This makes Move up/down produce unchanged criteria ordering.
fix:
verification:
files_changed: []
