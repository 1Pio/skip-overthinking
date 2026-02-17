# Phase 3: Ratings, Weights, and Coverage Integrity - Research

**Researched:** 2026-02-17
**Domain:** Ratings matrix data model, reversible `rating_1_20` mode switching, weighted coverage feedback, and pre-results integrity gates
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
- Full cross-app UI redesign of all existing pages as a dedicated effort beyond this phase boundary.
- Enforcing a project-wide design-system rollout for all future phases as a separate planning concern.
- Deep visual design pass (icons/brand-level polish) targeted for later phases.
</user_constraints>

## Summary

Phase 3 should be planned as an integrity-first data and UX phase: matrix editing is only the visible layer. The core technical risk is silent semantic drift (mode switching that mutates intent, blanks treated implicitly, or 0 sneaking into a 1-20 domain). The implementation should center on explicit domain contracts: fixed 7-level mapping, dual persistence for reversible rating mode switching, measured raw-to-derived conversion with a neutral equal-values edge case, and route-level guards that block results until weights are complete.

The existing codebase already favors reducer-driven immutable updates, reorder-safe normalization, and Zod-backed gate schemas (`optionsGate`, `criteriaGate`). Phase 3 should extend that same architecture instead of creating local component-only state. This keeps deep-link and back-navigation behavior deterministic and aligns with the current wizard flow.

For UX, locked decisions strongly favor a compact spreadsheet-like matrix, a trust-first explicit neutral-fill review flow, and inline/sticky coverage feedback. Use a utilitarian visual system with selective Tailwind/shadcn/Lucide adoption only where it makes these exact workflows clearer and faster.

**Primary recommendation:** Implement Phase 3 around a canonical ratings+weights domain model (with dual-mode persistence and explicit missingness), then drive UI and route guards from shared selectors/schemas so no scoring-critical behavior is implied or hidden.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.1.1 | Ratings matrix, sticky summary panel, controlled matrix inputs | Already used in app and required for reducer/context patterns already in production code |
| react-router | 7.13.0 | Ratings route and results gating with redirect state | Existing wizard flow already uses route-level guards and deep-link protection |
| TypeScript | 5.9.2 | Typed ratings/weights unions and selector safety | Prevents invalid states for dual-persisted rating mode and measured/raw variants |
| Zod | 4.3.6 | Shared gate schemas and score-domain invariants (1..20, integer weights) | Keeps gating and state hydration validation aligned with existing options/criteria patterns |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS + `@tailwindcss/vite` | 4.1.18 + 4.1.18 | Utility styling for compact matrix, sticky zones, subtle fill-state tints | Introduce in Phase 3 only where matrix readability/scan speed improves materially |
| shadcn CLI | 3.8.5 | Scaffold utilitarian primitives (`Table`, `ScrollArea`, `Card`, `Collapsible`, `Switch`, `Badge`) | Use when component composition speed is needed and styles stay intentionally plain |
| lucide-react | 0.574.0 | Lightweight status/action icons for coverage warnings and review flows | Use sparingly for at-a-glance semantics in summary/detail panels |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dual persistence (`numeric_value` + `seven_level_value`) | One canonical value remapped on toggle | Simpler storage but violates RAT-08 non-destructive switching guarantee |
| Explicit missing markers (`null`/blank state) | Auto-fill blanks to neutral during compute | Faster implementation but breaks trust-first explicit-fill requirement |
| Shared selector-based measured derivation | Compute per-cell ad hoc inside components | Easier to start, but drifts under reorder/edit and creates inconsistent derived values |

**Installation:**
```bash
# Existing baseline
npm install

# Optional Phase 3 UI uplift (allowed by context)
npm install tailwindcss @tailwindcss/vite lucide-react
npm install -D shadcn
```

## Architecture Patterns

### Recommended Project Structure
```
src/
|- features/ratings/
|  |- components/                # Matrix, mode toggle, neutral-fill review, coverage panel
|  |- state/
|  |  |- ratings.types.ts        # Cell unions, mode enums, ghost metadata
|  |  |- ratings.actions.ts      # Pure immutable updates + explicit fill action
|  |  |- ratings.selectors.ts    # Derived desirability, coverage, warnings
|  |  `- ratingsPrereq.ts        # Results-step prerequisites
|  |- ratings.schema.ts          # 1..20 invariants, mapping enum, weight schema
|  `- ratingsGate.schema.ts      # Results gate: complete weights + valid matrix state
|- features/decision/state/
|  |- draft.types.ts             # Extend with ratings/weights/mode state
|  |- draft.reducer.ts           # Integrate ratings actions
|  `- draft.storage.ts           # Hydrate/persist new fields safely
`- routes/ratings/
   `- RatingsRoute.tsx           # Guarded screen wiring + continue-to-results checks
```

### Pattern 1: Dual-Persisted `rating_1_20` Cells With Ghost Preview
**What:** Persist both numeric and seven-level representations per rating cell; active mode controls editable field while inactive value remains as ghost-mapped preview.
**When to use:** Always for `rating_1_20` criteria (RAT-04, RAT-08).
**Example:**
```typescript
// Source: .planning/REQUIREMENTS.md (RAT-04, RAT-08)
type SevenLevelLabel =
  | "terrible"
  | "very_poor"
  | "poor"
  | "ok"
  | "good"
  | "very_good"
  | "excellent";

type RatingMode = "numeric" | "seven_level";

type Rating120Cell = {
  criterionType: "rating_1_20";
  numericValue: number | null;      // 1..20, decimal allowed
  sevenLevelValue: SevenLevelLabel | null;
  lastEditedMode: RatingMode | null;
};

const SEVEN_LEVEL_TO_NUMERIC: Record<SevenLevelLabel, number> = {
  terrible: 1.0,
  very_poor: 4.2,
  poor: 7.3,
  ok: 10.5,
  good: 13.7,
  very_good: 16.8,
  excellent: 20.0,
};
```

### Pattern 2: Measured Criteria Derive 1..20 From Current Option Set
**What:** Store raw numeric values per option+criterion and derive desirability from min/max among filled raw values; equal raw values map to 10.5.
**When to use:** `numeric_measured` criteria (RAT-03, RAT-06, RAT-07).
**Example:**
```typescript
// Source: .planning/pre-execution-project-research/What-And-How-To-Build.md
export const deriveMeasuredDesirability = (
  raw: number,
  xmin: number,
  xmax: number,
  rawDirection: "higher_raw_better" | "lower_raw_better",
): number => {
  if (xmax === xmin) {
    return 10.5;
  }

  if (rawDirection === "higher_raw_better") {
    return 1 + (19 * (raw - xmin)) / (xmax - xmin);
  }

  return 1 + (19 * (xmax - raw)) / (xmax - xmin);
};
```

### Pattern 3: Explicit Missingness + Review-Before-Fill
**What:** Blank remains first-class state; fill-neutral is an explicit reviewed mutation, never computed silently.
**When to use:** Any missing rating handling (RAT-01, RAT-08).
**Example:**
```typescript
// Source: .planning/REQUIREMENTS.md (RAT-01, RAT-08)
type FillMissingReviewItem = {
  optionId: string;
  criterionId: string;
  criterionType: "rating_1_20" | "numeric_measured";
};

type FillMissingResult = {
  reviewItems: FillMissingReviewItem[];
  apply: () => void;
};

// Build reviewItems first; apply only after user confirms.
```

### Pattern 4: Weighted Coverage Selectors Drive Inline Status
**What:** Compute completeness and warnings from selectors, then render sticky summary + expandable details (not toast-only).
**When to use:** Always before enabling transition to results (WGT-02..WGT-05).
**Example:**
```typescript
// Source: .planning/PROJECT.md (coverage thresholds), .planning/REQUIREMENTS.md (WGT-03..WGT-05)
const optionCoverage = filledWeight / totalWeight; // 0..1
const optionCoveragePct = Math.round(optionCoverage * 100);

const coverageSeverity =
  optionCoverage < 0.5 ? "strong_warning" :
  optionCoverage < 0.7 ? "warning" :
  "ok";
```

### Anti-Patterns to Avoid
- **Mode-switch overwrite:** replacing user-entered value in the inactive mode destroys reversibility and violates RAT-08.
- **Index-keyed matrix cells:** storing by row/column index breaks integrity under reorder; key by `optionId` + `criterionId`.
- **Implicit imputation in selectors:** treating blank as 10 or 1 during compute hides missingness and erodes trust.
- **Toast-only warning delivery:** critical coverage warnings vanish and fail WGT inline feedback expectations.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input/range validation for 1..20 and integer weights | Ad hoc parse/if logic per component | Shared Zod schemas + safeParse gate helpers | Prevents drift across route guards, UI validation, and storage hydration |
| Sticky table behavior | JS scroll-sync code for headers/first column | CSS `position: sticky` in a single scroll container | Browser-native behavior is simpler, more stable, and easier to maintain |
| Icon sprite pipeline for status hints | Custom SVG registry/build tooling | `lucide-react` direct imports | Tree-shaken icons with typed props and no custom pipeline debt |
| Rating-mode migration logic | One-off conversion scripts in component handlers | Pure selector/helpers for fixed mapping + nearest ghost resolution | Ensures deterministic reversible behavior across all entry points |

**Key insight:** In this phase, custom "quick" logic around missingness, mapping, and gating creates correctness debt faster than UI debt; lock semantics in shared schemas/selectors first.

## Common Pitfalls

### Pitfall 1: Zero leaks into desirability domain
**What goes wrong:** `0` appears in inputs, previews, or derived outputs.
**Why it happens:** Numeric parsing defaults or unbounded input controls bypass domain validation.
**How to avoid:** Use `z.number().min(1).max(20)` for all desirability surfaces; clamp/reject before state write.
**Warning signs:** Any cell render path displays `0` or accepts `0` keystrokes as valid.

### Pitfall 2: Destructive mode toggles
**What goes wrong:** Switching numeric <-> seven-level replaces prior explicit entry.
**Why it happens:** Only one persisted field per cell or overwrite-on-toggle reducers.
**How to avoid:** Persist both representations and track `lastEditedMode`; render inactive representation as ghost.
**Warning signs:** Toggle twice and original value is gone.

### Pitfall 3: Measured derived values become stale after edits
**What goes wrong:** Derived desirability doesn't update when one option raw value changes.
**Why it happens:** Derivation cached per-cell without recomputing criterion-level min/max.
**How to avoid:** Recompute from selector over all filled raw values for each criterion.
**Warning signs:** Equal raw values no longer show neutral 10.5; inconsistent rows for same criterion.

### Pitfall 4: Route lets users enter results with incomplete weights
**What goes wrong:** `/results` is reachable with missing criterion weights.
**Why it happens:** Continue-button-only checks without route guard.
**How to avoid:** Add shared `ratingsGateSchema` + results route guard mirroring options/criteria architecture.
**Warning signs:** Direct URL navigation bypasses UI disable state.

### Pitfall 5: Fill-neutral action feels hidden or irreversible
**What goes wrong:** Users cannot inspect affected cells before applying neutral fill.
**Why it happens:** One-click mutation without preview list/confirm affordance.
**How to avoid:** Review layer with count + explicit apply/cancel before reducer mutation.
**Warning signs:** Unexpected matrix changes after clicking CTA and immediate confusion.

## Code Examples

Verified patterns from official docs and current project architecture:

### Controlled numeric input that preserves blank state
```typescript
// Source: https://react.dev/reference/react-dom/components/input
const [value, setValue] = useState<string>("");

<input
  type="number"
  min={1}
  max={20}
  step="0.1"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>;
```

### Shared gate schema pattern for route guards
```typescript
// Source: src/features/options/optionsGate.schema.ts and src/features/criteria/criteriaGate.schema.ts
import { z } from "zod";

export const ratingsGateSchema = z.object({
  criteria: z.array(z.object({ id: z.string(), weight: z.number().int() })).min(1),
  allWeightsAssigned: z.literal(true),
});
```

### Sticky header/label implementation basis
```css
/* Source: https://developer.mozilla.org/en-US/docs/Web/CSS/position */
.matrix-header {
  position: sticky;
  top: 0;
  z-index: 2;
}

.matrix-row-label {
  position: sticky;
  left: 0;
  z-index: 1;
}
```

### Reducer-friendly immutable matrix update
```typescript
// Source: https://react.dev/reference/react/useReducer
const upsertCell = (
  matrix: Record<string, Record<string, CellState>>,
  optionId: string,
  criterionId: string,
  cell: CellState,
) => ({
  ...matrix,
  [optionId]: {
    ...(matrix[optionId] ?? {}),
    [criterionId]: cell,
  },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single subjective score inputs without explicit missingness | Matrix with blank-preserving cells + explicit neutral-fill action | Product requirements v1 (2026-02-16) | Improves trust and auditability of completion assumptions |
| One-mode rating entry only | Decision-level reversible numeric/seven-level dual mode | Phase 3 requirements (RAT-04, RAT-08) | Preserves user intent while allowing preference-based entry UX |
| Raw measured values shown without normalized comparability | Raw + derived 1..20 shown together with neutral-equality edge case | Phase 3 requirements + project research | Keeps transparency while preserving comparable scoring semantics |

**Deprecated/outdated:**
- Silent imputation of missing ratings is out of policy for this product.
- Any desirability representation that includes `0` is invalid for v1.

## Open Questions

1. **Criterion-level "too many blanks" threshold (WGT-05) exact value**
   - What we know: Option coverage thresholds are locked at `<70%` warning and `<50%` strong warning in project decisions.
   - What's unclear: Criterion-level blank-rate threshold and severity split are not explicitly specified in requirements/context.
   - Recommendation: Start with criterion soft warning at `>30% blanks` and keep it configurable in one constant.

2. **Potential policy tension: shadcn primitives vs earlier Base UI no-Radix decision**
   - What we know: Phase 3 context explicitly allows introducing Tailwind/shadcn/Lucide where directly useful.
   - What's unclear: Whether this supersedes earlier project-level "Base UI, no Radix" lock.
   - Recommendation: Treat Phase 3 context as authoritative for this phase, but keep adoption minimal and isolated to ratings components.

3. **Rounding/display precision for derived desirability and ghost mappings**
   - What we know: Domain allows decimals and fixed seven-level mapping values with one decimal.
   - What's unclear: Uniform display precision rule (1 decimal vs 2 decimals) across matrix, ghost, and coverage detail panel.
   - Recommendation: Standardize display to 1 decimal in UI, keep internal calculations full precision.

## Sources

### Primary (HIGH confidence)
- `.planning/REQUIREMENTS.md` - RAT-01..RAT-08 and WGT-01..WGT-05 contract
- `.planning/ROADMAP.md` - phase goal and success criteria
- `.planning/phases/03-ratings-weights-and-coverage-integrity/03-CONTEXT.md` - locked UX decisions and scope boundaries
- `.planning/pre-execution-project-research/What-And-How-To-Build.md` - measured derivation formulas, explicit missingness handling, and neutral edge case
- `.planning/PROJECT.md` - weighted coverage threshold decision (`<70%` warning, `<50%` strong warning)
- `src/features/decision/state/draft.types.ts` - current canonical draft shape to extend
- `src/features/decision/state/draft.reducer.ts` - reducer integration pattern for immutable action-based state
- `src/features/decision/state/draft.storage.ts` - safe hydration/persistence guard patterns
- `src/features/options/optionsGate.schema.ts` and `src/features/criteria/criteriaGate.schema.ts` - shared Zod gate pattern to mirror in Phase 3
- `src/routes/ratings/RatingsRoute.tsx` - current phase entry route slot and prerequisite redirect pattern
- https://react.dev/reference/react-dom/components/input - controlled input behavior and controlled/uncontrolled constraints
- https://react.dev/reference/react/useReducer - reducer purity and immutable update expectations
- https://zod.dev/api - coercion/number constraints/discriminated union patterns
- https://developer.mozilla.org/en-US/docs/Web/CSS/position - sticky positioning behavior and requirements

### Secondary (MEDIUM confidence)
- https://tailwindcss.com/docs/installation/using-vite - Tailwind Vite setup for optional Phase 3 UI uplift
- https://ui.shadcn.com/docs/installation/vite - shadcn integration process for Vite
- https://lucide.dev/guide/packages/lucide-react - icon package usage and tree-shaking guidance
- `npm view` package registry lookups on 2026-02-17 for versions: `tailwindcss`, `@tailwindcss/vite`, `lucide-react`, `shadcn`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - core versions are verified from `package.json` and optional additions are verified from official docs/npm registry.
- Architecture: HIGH - directly grounded in locked context decisions, requirements, and current reducer/schema code patterns.
- Pitfalls: MEDIUM-HIGH - mostly derived from explicit requirements plus known failure modes in matrix/gating workflows; some threshold details remain unspecified.

**Research date:** 2026-02-17
**Valid until:** 2026-03-19 (30 days)
