---
status: complete
phase: 02-typed-criteria-modeling
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md
started: 2026-02-16T20:05:45.046Z
updated: 2026-02-16T20:24:45.296Z
---

## Current Test

[testing complete]

## Tests

### 1. Criteria route loads full authoring flow
expected: Opening `/criteria` shows the full criteria authoring step (not placeholder), including template picker, add criterion entry, list controls, and a disabled `Continue to ratings` until criteria are valid.
result: pass

### 2. Manual criterion create/edit requires title
expected: Creating or editing a criterion requires a non-empty title, allows optional description, and saves into the list when valid.
result: pass

### 3. Numeric measured criterion enforces raw direction
expected: For `numeric_measured`, save is blocked until raw direction is selected, optional unit can be entered, and saved criterion reflects measured semantics.
result: pass

### 4. Compact and rich list modes both work
expected: Criteria list starts in compact mode and switching to rich mode reveals additional detail; switching back preserves criteria data.
result: pass

### 5. Reorder controls are up/down only
expected: Criteria can be reordered only with Move up/Move down controls (no drag-drop), and resulting order updates correctly.
result: issue
reported: "no: The 'Move up' and 'Move down' buttens lituarly do not do anything. Also there are no direct errors within console or similar. But what works are things like the button being grayed out if it is most highest or lowest in list."
severity: major

### 6. Single and bulk delete use confirmation plus undo
expected: Deleting one or multiple criteria shows one confirmation path with names/count preview, and undo restores deleted criteria in-session.
result: pass

### 7. Templates are sectioned and confirm before add
expected: Template picker shows `Recommended` and `Measured` sections; selecting a template opens confirm/customize before criterion creation.
result: pass

### 8. Positivity hints are assistive with one-click rewrite
expected: Negative wording triggers non-blocking positivity suggestions (for example, Cost -> Affordability) that can be applied with one click.
result: pass

### 9. Ratings/results deep links enforce criteria prereq
expected: Visiting `/ratings` or `/results` without required criteria redirects to `/criteria` and displays actionable recovery messaging.
result: pass

## Summary

total: 9
passed: 8
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Criteria can be reordered only with Move up/Move down controls (no drag-drop), and resulting order updates correctly."
  status: failed
  reason: "User reported: no: The 'Move up' and 'Move down' buttens lituarly do not do anything. Also there are no direct errors within console or similar. But what works are things like the button being grayed out if it is most highest or lowest in list."
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
