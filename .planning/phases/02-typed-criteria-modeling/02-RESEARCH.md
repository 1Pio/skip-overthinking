# Phase 2: Typed Criteria Modeling - Research

**Researched:** 2026-02-16
**Domain:** Criteria authoring domain model, typed criterion configuration, and desirability semantics in a React + TypeScript + Zod wizard
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
No `*-CONTEXT.md` file existed when this research was first produced.

Superseding product decisions captured after research:
- Phase 2 supports only `rating_1_20` and `numeric_measured` criteria types (no `boolean` or `enum` in this phase).
- No per-criterion invert toggle is allowed.
- Numeric measured criteria require explicit raw direction and preserve 1-20 desirability semantics.
- Decision-level numeric vs 7-level label rating mode is deferred to Phase 3.

Project constraints provided with this phase request:
- Existing stack established in Phase 1: Bun + Vite + React + TypeScript + Zod, hash routing, persisted draft reducer.
- Decision/options wizard and route guards already implemented; phase 2 extends flow with criteria authoring.
- Core product principle: desirability language where higher is better.
- Phase scope requirements: CRT-01, CRT-02, CRT-03, CRT-04, CRT-05, CRT-06, CRT-07.

### Claude's Discretion
No discretionary section was provided via `CONTEXT.md`.

Reasonable discretion for planning:
- Exact template catalog contents and grouping labels, as long as recommended vs measured sections are explicit.
- UI composition details (single composite form vs modular per-type panels) as long as type-specific config is explicit and validated.

### Deferred Ideas (OUT OF SCOPE)
No phase-specific deferred ideas were provided via `CONTEXT.md`.

Respect existing roadmap deferrals from project docs:
- Numeric range lock UX is a later feature, not Phase 2 baseline.
</user_constraints>

## Summary

Phase 2 should be planned as a data-model-first phase, not a UI-first phase. The most important work is defining a single typed criterion contract that represents the two in-scope criterion types (`rating_1_20`, `numeric_measured`) with explicit desirability semantics and predictable validation rules. Once that contract exists, the criteria step UI becomes straightforward CRUD + reorder + type-specific editors.

Given the existing Phase 1 architecture, criteria should follow the same pattern already used for options: domain types + Zod schemas + pure action creators + reducer integration + route guard checks. This keeps all step gating and deep-link behavior consistent with the current wizard and avoids introducing one-off form or state behavior that will break Phase 3 ratings.

Template picker behavior should be implemented as deterministic defaults that populate the same typed criterion model used by manual creation. Treat templates as pre-filled criterion drafts, not a separate data shape. This keeps CRT-02 aligned with CRT-03/05/06/07 and prevents duplication.

**Primary recommendation:** Lock one discriminated-union criterion schema in Phase 2 and drive templates, CRUD, validation, and routing from that single source of truth, limited to `rating_1_20` and `numeric_measured`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.1.1 | Criteria step UI and route integration | Already established and integrated with current wizard routes/provider stack |
| react-router | 7.13.0 | Criteria route screen + step guards | Existing route-per-step wizard and deep-link behavior already depend on it |
| TypeScript | 5.9.2 | Typed criterion unions, action payloads, and reducer safety | Required to keep criterion-type-specific config strongly modeled |
| Zod | 4.3.6 | Criterion schema validation, gate checks, and safe parsing | Already used for decision/options validation and prerequisite checks |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Browser `crypto.randomUUID` (with fallback) | Web standard | Stable criterion IDs, matching existing option ID strategy | Use for add/create actions to keep list identity stable under edit/reorder/delete |
| Existing DraftProvider + reducer | Current app code | Canonical draft state and persistence | Extend existing draft state to include `criteria` and reuse reducer/action patterns |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod discriminated union for criterion variants | Manual `if/else` validation in submit handlers | Faster to start, but creates drift between UI checks and route/action checks |
| Reducer-managed criteria state | Step-local component state only | Simpler short term, but breaks revisit/deep-link consistency and Phase 3 integration |
| Template defaults mapped into criterion schema | Separate template-only model | Adds mapping debt and higher risk of divergence bugs |

**Installation:**
```bash
# No additional packages are required for Phase 2 baseline.
bun install
```

## Architecture Patterns

### Recommended Project Structure
```
src/
|- features/criteria/
|  |- components/          # CriteriaStep, CriterionForm, CriterionList, TemplatePicker
|  |- state/               # criterion.types.ts, criterion.actions.ts, criterionPrereq.ts
|  |- criteria.schema.ts   # Discriminated union + shared field constraints
|  |- criteriaGate.schema.ts
|  `- templates.ts         # Recommended/measured template catalog + default builders
|- features/decision/state/ # Extend DecisionDraft + reducer action union
`- routes/criteria/         # Criteria route screen and navigation wiring
```

### Pattern 1: Discriminated Criterion Union as Canonical Contract
**What:** Represent criteria as a discriminated union keyed by `type`, where each variant has explicit config.
**When to use:** Always, because CRT-03/05/06/07 require distinct configuration per type.
**Example:**
```ts
// Source: https://zod.dev/api#discriminated-unions
import { z } from "zod";

const desirabilityValueSchema = z.number().min(1).max(20);
const criterionBaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Criterion title is required"),
  description: z.string().trim().optional(),
  order: z.number().int().nonnegative(),
});

const ratingCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("rating_1_20"),
  config: z.object({}),
});

const numericCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("numeric"),
  config: z.object({
    unit: z.string().trim().min(1),
    rawDirection: z.enum(["higher_better", "lower_better"]),
  }),
});

const booleanCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("boolean"),
  config: z.object({
    yes: desirabilityValueSchema,
    no: desirabilityValueSchema,
  }),
});

const enumCriterionSchema = criterionBaseSchema.extend({
  type: z.literal("enum"),
  config: z.object({
    choices: z.array(z.string().trim().min(1)).min(1),
    desirabilityByChoice: z.record(z.string(), desirabilityValueSchema),
  }),
});

export const criterionSchema = z.discriminatedUnion("type", [
  ratingCriterionSchema,
  numericCriterionSchema,
  booleanCriterionSchema,
  enumCriterionSchema,
]);
```

### Pattern 2: Template as Typed Draft Factory
**What:** Template picker returns pre-populated criterion inputs that still pass through the same schema and action path.
**When to use:** For CRT-02; recommended and measured sections should be labels over a shared creation pipeline.
**Example:**
```ts
type CriterionTemplate = {
  id: string;
  section: "recommended" | "measured";
  label: string;
  build: () => {
    title: string;
    type: "rating_1_20" | "numeric" | "boolean" | "enum";
    config: unknown;
  };
};

const templates: CriterionTemplate[] = [
  {
    id: "recommended-affordability",
    section: "recommended",
    label: "Affordability",
    build: () => ({ title: "Affordability", type: "rating_1_20", config: {} }),
  },
  {
    id: "measured-cost",
    section: "measured",
    label: "Cost",
    build: () => ({
      title: "Cost",
      type: "numeric",
      config: { unit: "USD", rawDirection: "lower_better" },
    }),
  },
];
```

### Pattern 3: Shared Criteria Completion Gate
**What:** One `criteriaGateSchema` helper is used by both UI continue button and route guards.
**When to use:** Always, mirroring existing options gating architecture.
**Example:**
```ts
// Source pattern: src/features/options/optionsGate.schema.ts
import { z } from "zod";
import { criterionSchema } from "./criteria.schema";

export const criteriaGateSchema = z.object({
  criteria: z.array(criterionSchema).min(1, "At least one criterion is required"),
});
```

### Anti-Patterns to Avoid
- **Type switching without config reset:** stale config from previous type leaks into new type and creates hidden invalid states.
- **Template-specific data model:** diverges from manual criterion authoring and doubles validation work.
- **UI-only positivity guidance:** if guidance is only static copy, users still create negative labels that undermine desirability semantics.
- **Criteria order as implicit array index only:** edit/delete/reorder behavior becomes brittle and harder to persist safely.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Variant validation for 4 criterion types | Custom nested `if` checks per submit path | Zod `discriminatedUnion` + variant schemas | Keeps runtime validation and TS narrowing aligned with one contract |
| Enum desirability bookkeeping | Parallel arrays with positional coupling | Choice list + explicit mapping object validated by schema | Prevents silent mismatches when choices are edited/reordered |
| Wizard completion checks | Duplicate ad hoc logic in components/routes | Shared `criteriaGateSchema.safeParse` helper | Matches established Phase 1 guard architecture |
| Positivity-language normalization | Free-text warnings only | Small curated suggestion map (`cost -> affordability`, etc.) plus helper copy | Enforces CRT-04 intent consistently without overengineering NLP |

**Key insight:** The biggest risk in this phase is schema drift between criterion variants, templates, and route guards; one canonical criterion contract avoids most downstream churn.

## Common Pitfalls

### Pitfall 1: Criterion type changes leave invalid stale config
**What goes wrong:** User switches from `numeric` to `boolean`, but old `unit/rawDirection` data remains attached.
**Why it happens:** State updates patch fields incrementally without rebuilding variant payload.
**How to avoid:** On type change, replace entire `config` with variant defaults and re-validate with union schema.
**Warning signs:** `safeParse` fails after seemingly valid edits; hidden fields persist in persisted draft JSON.

### Pitfall 2: Enum mappings drift from enum choices
**What goes wrong:** Deleted/renamed choice leaves orphaned desirability mapping key.
**Why it happens:** Choices and mappings are edited separately and not reconciled.
**How to avoid:** Use one action that updates both choice list and mapping object atomically.
**Warning signs:** Missing mapping errors for visible choices, or extra keys not shown in UI.

### Pitfall 3: Boolean/enum desirability accepts out-of-range values
**What goes wrong:** Mapping values outside 1..20 leak into draft and later scoring logic.
**Why it happens:** Inputs parse as strings or unchecked numbers; no shared desirability schema.
**How to avoid:** Centralize `desirabilityValueSchema = z.number().min(1).max(20)` and reuse it everywhere.
**Warning signs:** Phase 3 calculators needing defensive clamping.

### Pitfall 4: Route guards allow advancing without valid criteria
**What goes wrong:** User reaches `/ratings` with zero or invalid criteria.
**Why it happens:** Existing guards currently check only minimum options.
**How to avoid:** Introduce criteria completion helper and apply it in criteria->ratings/results route flow.
**Warning signs:** Ratings screen renders without criterion columns.

### Pitfall 5: Positivity guidance is present but non-actionable
**What goes wrong:** Users still enter negative criteria labels (`Cost`, `Risk`) and later invert semantics mentally.
**Why it happens:** Guidance copy is generic and not contextual to entered text.
**How to avoid:** Add targeted suggestions and example replacements inline during title editing.
**Warning signs:** Frequent negative noun titles in saved criteria.

## Code Examples

Verified patterns from official sources and current codebase:

### Discriminated union for type-safe criterion variants
```ts
// Source: https://zod.dev/api#discriminated-unions
const CriterionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("rating_1_20"), config: z.object({}) }),
  z.object({
    type: z.literal("numeric"),
    config: z.object({ unit: z.string(), rawDirection: z.enum(["higher_better", "lower_better"]) }),
  }),
  z.object({ type: z.literal("boolean"), config: z.object({ yes: z.number().min(1).max(20), no: z.number().min(1).max(20) }) }),
  z.object({ type: z.literal("enum"), config: z.object({ choices: z.array(z.string()), desirabilityByChoice: z.record(z.string(), z.number().min(1).max(20)) }) }),
]);
```

### Reducer update pattern for immutable list updates
```ts
// Source: https://react.dev/reference/react/useReducer
function criteriaReducer(state: State, action: Action): State {
  switch (action.type) {
    case "criterionAdded":
      return { ...state, criteria: action.payload.criteria };
    case "criterionEdited":
      return { ...state, criteria: action.payload.criteria };
    case "criterionDeleted":
      return { ...state, criteria: action.payload.criteria };
    case "criterionReordered":
      return { ...state, criteria: action.payload.criteria };
    default:
      return state;
  }
}
```

### Route-level guarded wizard progression
```tsx
// Source: src/app/router.tsx
import { Navigate, Outlet } from "react-router";

const RequireCriteriaSetup = () => {
  const { draft } = useDraft();
  if (!isCriteriaStepComplete(draft.criteria)) {
    return <Navigate replace to="/criteria" />;
  }
  return <Outlet />;
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single untyped "score per criterion" inputs | Typed criterion modeling (`rating_1_20`, `numeric`, `boolean`, `enum`) with explicit mapping metadata | Product requirements v1 (2026-02-16) | Enables transparent raw input handling and consistent desirability semantics |
| Implicit "lower is better" mental inversion | Explicit desirability language + rawDirection/mapping configs | Product principle and CRT-04/05/06/07 | Reduces interpretation errors before scoring and results |
| Template as static label shortcut only | Template as typed draft prefill with variant config defaults | Criteria template requirement (CRT-02) | Faster setup without splitting data model paths |

**Deprecated/outdated:**
- "Criterion title alone implies semantics" is no longer acceptable once typed criteria and mappings are required.
- Generic criteria list without type metadata is insufficient for downstream ratings matrix and score derivation.

## Open Questions

1. **Exact minimum validity for enum criteria before save**
   - What we know: CRT-06 requires explicit desirability mapping values.
   - What's unclear: whether minimum enum cardinality should be 1, 2, or 3 choices.
   - Recommendation: enforce minimum 2 choices for comparability and simpler UX messaging.

2. **How aggressive positivity guidance should be**
   - What we know: CRT-04 requires guidance toward positive phrasing.
   - What's unclear: suggestion-only vs warning-level copy for known negative terms.
   - Recommendation: start with non-blocking targeted suggestions (no hard validation block), instrument later.

3. **Unit catalog breadth for numeric templates**
   - What we know: units are visual/contextual in current product research and no conversion is required.
   - What's unclear: full unit taxonomy for v1 UI.
   - Recommendation: ship a small curated list (currency/time/distance/weight/storage) and keep free-text fallback.

## Sources

### Primary (HIGH confidence)
- `.planning/REQUIREMENTS.md` - CRT-01 through CRT-07 scope and semantics
- `.planning/ROADMAP.md` - Phase 2 goal, dependencies, and success criteria
- `.planning/pre-execution-project-research/What-And-How-To-Build.md` - typed criteria intent, template UX, positivity guidance, numeric/boolean/enum semantics
- `src/features/decision/state/draft.types.ts` - current canonical draft shape to extend
- `src/features/decision/state/draft.reducer.ts` - reducer integration pattern
- `src/features/options/state/option.actions.ts` - list CRUD/reorder action pattern to mirror for criteria
- `src/features/options/optionsGate.schema.ts` - Zod-backed step gate pattern
- `src/routes/criteria/CriteriaRoute.tsx` - current placeholder route and navigation slot
- https://zod.dev/api#discriminated-unions - canonical discriminated union schema pattern
- https://zod.dev/api#records - mapping schema pattern for explicit enum desirability maps
- https://react.dev/reference/react/useReducer - reducer purity/immutability guidance
- https://reactrouter.com/api/declarative-routers/HashRouter - hash-router behavior and server-safe URL semantics

### Secondary (MEDIUM confidence)
- https://reactrouter.com/start/data/routing - route nesting/layout/index examples for step route composition
- https://reactrouter.com/api/data-routers/createHashRouter - data-router hash mode details and v7 API shape

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions and usage verified from `package.json` and current source.
- Architecture: HIGH - directly grounded in existing project patterns plus official React/Zod/Router docs.
- Pitfalls: MEDIUM-HIGH - mostly derived from concrete current code gaps and phase dependency constraints.

**Research date:** 2026-02-16
**Valid until:** 2026-03-18 (30 days)
