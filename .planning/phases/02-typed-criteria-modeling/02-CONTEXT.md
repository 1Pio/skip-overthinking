# Phase 2: Typed Criteria Modeling - Context

**Gathered:** 2026-02-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Define criteria before ratings: users can create, edit, reorder, and template-seed criteria with explicit desirability semantics so later scoring remains on a 1-20 higher-is-better scale. This phase covers criteria authoring behavior and type configuration only; ratings entry mode mechanics belong to Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Product experience direction
- The tool should make decisions meaningfully easier to handle and think through without overthinking.
- Interactions should feel effortless, low-friction, and visually polished while still producing practically helpful output.

### Template picker behavior
- Show templates in two explicit sections: `Recommended` and `Measured`.
- Selecting a template opens a brief confirm/customize step before the criterion is added.
- Use strong defaults (pre-filled title, type, and mapping guidance where relevant).
- Each template row should stay scan-friendly with one-line purpose copy; include a non-trivial hint only when useful.
- Initial v1 catalog should ship with 6-8 broadly useful templates split across `Recommended` and `Measured`.

### Criteria list workflow
- Default to compact rows (title + type + key mapping status) with user toggle to richer row detail view.
- Reordering uses simple up/down controls in this phase (no drag-and-drop yet).
- Delete uses confirmation modal.
- Include a selection/deletion mode so users can delete multiple criteria in one action.
- For multi-delete, show a single confirmation modal with item count and names preview, then show undo toast after delete.
- Editing opens a dedicated editor panel/modal, not inline expansion.

### Type configuration flow
- Keep only two criterion types in this stage: `rating_1_20` and `numeric_measured`.
- Remove `boolean` and `enum` from Phase 2 scope.
- Global invariant stays fixed: every criterion is a desirability axis, 1-20 only, higher is always better, never 0.
- For `numeric_measured`, user enters literal raw values and must choose conversion direction: `lower raw is better` or `higher raw is better`.
- Unit is visual/contextual (for example AED, USD, km, min, kg).
- Default display emphasizes derived desirability; raw values appear in details/tooltip/panel/modal contexts.

### Desirability language and semantics
- No per-criterion invert toggle is allowed.
- If semantics feel inverted, resolve through better criterion wording (for example "Affordability" instead of "Cost") or measured conversion direction.
- Keep copy that reinforces consistency, such as: entering real values that are converted into desirability so calculations and visuals always read higher-is-better.
- Enforce positivity guidance as soft suggestions (not blocking save), with one-click rewrite hints.

### Claude's Discretion
- Exact visual styling tokens (spacing, typography details, microcopy polish).
- Exact compact-vs-rich toggle placement in the criteria list.
- Final wording polish for helper copy while preserving locked semantics.

### Execution guardrails
- Keep one canonical criteria contract: templates, editor flows, reducer actions, and route guards must all use the same criteria schema/types with no parallel data shapes.
- Treat `numeric_measured` semantics as mandatory: require raw direction before save, allow optional unit, keep only `rating_1_20` and `numeric_measured`, and do not add invert toggles.
- Keep list behavior deterministic: preserve stable criterion IDs and normalize to dense ordering after reorder/delete/undo so state remains predictable.
- Use a single gating source: continue controls and guards for `/ratings` and `/results` must both delegate to the same criteria prerequisite helper.
- Prevent Phase 3 scope leakage: do not introduce decision-level rating mode switching, seven-level mapping tables, dual persistence, nearest-label conversion, or ghost preview behavior.
- Keep positivity guidance assistive: non-blocking suggestions with one-click rewrites, and helper copy that clearly states raw values are converted to 1-20 desirability where higher is better.

</decisions>

<specifics>
## Specific Ideas

- Keep fast scanning as the default interaction pattern across template and criteria surfaces.
- Include concise, practical hints only where they reduce user confusion.
- Preserve clarity that all final scoring and visuals speak one language: desirability, where higher is better.

</specifics>

<deferred>
## Deferred Ideas

- Decision-level Step 4 input mode toggle for `rating_1_20` (numeric mode vs 7-level label mode) is deferred to Phase 3.
- Fixed 7-level mapping table (Terrible=1.0, Very Poor=4.2, Poor=7.3, OK=10.5, Good=13.7, Very Good=16.8, Excellent=20.0) is deferred to Phase 3.
- Non-destructive reversible switching with dual persistence per rating cell (`numeric_value` + `seven_level_value`) and nearest-value ghost previews is deferred to Phase 3.
- Nearest-label conversion and touched-cell overwrite rules during mode switches are deferred to Phase 3.
- Ghost values in deferred mode switching should be subtle and non-punitive, with immediately clear explanation that they are previews from the other mode (not errors or invalid states).

</deferred>

---

*Phase: 02-typed-criteria-modeling*
*Context gathered: 2026-02-16*
