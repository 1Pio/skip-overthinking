# Phase 3: Ratings, Weights, and Coverage Integrity - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver matrix input with reversible `rating_1_20` input modes, 1-20 desirability conversion integrity, explicit missing-data handling, complete criterion weighting, and weighted-coverage feedback before results.

</domain>

<decisions>
## Implementation Decisions

### Matrix editing experience
- Use a compact, utilitarian, spreadsheet-like matrix for fast scanning and editing.
- Keep criterion headers and option labels sticky while scrolling.
- Empty cells should read as intentionally blank (not error state) until user acts.
- Filled cells should get subtle visual confirmation (light tint) to improve scan speed.

### Missing data and neutral fill
- Use a top-level coverage summary card that shows completion percentage and missing-cell count.
- Primary action is explicit: `Fill all missing with Neutral (10)` (never automatic).
- Include a review layer before apply so users can inspect which cells will be filled.
- Keep this flow trust-first: clear, deliberate, and reversible-feeling.

### `rating_1_20` mode switching and ghost values
- Place a compact mode toggle near the top-right of the ratings area.
- Keep mode explanation short and always visible (one concise helper line).
- Ghost-mapped values should be only slightly grayed out (not heavily de-emphasized).
- At-a-glance meaning is required; users should understand ghost state without reading long text.

### Weights and coverage feedback
- Use a hybrid Option C pattern: compact sticky summary + expandable detailed panel.
- Surface key status inline (assignment completeness, weighted coverage, low-coverage warnings), not toast-only.
- Keep advanced explanation optional/expandable so default flow feels effortless.
- Preserve utilitarian clarity over decorative presentation.

### Design direction for this phase
- Start improving real UI/UX feel now in Phase 3 (not technical-only UX).
- Keep styling intentionally utilitarian and blank-slate-friendly; avoid heavy visual polish for now.
- It is acceptable to begin introducing Tailwind, shadcn/ui primitives, and Lucide icons during this phase where they directly support Phase 3 work.

### Claude's Discretion
- Exact spacing, typography scale, and component micro-layout details.
- Exact wording of short helper copy for ghost values and warnings.
- Choice of specific shadcn/ui primitives and icon usage as long as utilitarian clarity is preserved.

</decisions>

<specifics>
## Specific Ideas

- "Not too abstracting" controls: visible, compact, understandable at a glance.
- UX goal: hide complexity by default while allowing optional deeper understanding.
- Feedback patterns should feel better than toast-only for important matrix/weight coverage states.

</specifics>

<deferred>
## Deferred Ideas

- Full cross-app UI redesign of all existing pages as a dedicated effort beyond this phase boundary.
- Enforcing a project-wide design-system rollout for all future phases as a separate planning concern.
- Deep visual design pass (icons/brand-level polish) targeted for later phases.

</deferred>

---

*Phase: 03-ratings-weights-and-coverage-integrity*
*Context gathered: 2026-02-17*
