# Phase 4: Results and Explainability - Research

**Researched:** 2026-02-18
**Domain:** Results ranking/explainability UX (WSM primary, WPM strict check, adaptive visuals, linked interactions)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
### Ranking table shape
- Use a balanced-density table (compact but readable).
- Keep default columns essential-first: rank, option, score, coverage; also clearly indicate WSM method without adding clutter.
- Coverage is percent-first with supporting badge semantics and subtle-but-noticeable color shifts.
- Ties use shared rank numbers (e.g., 1, 1, 3).

### WSM vs WPM messaging
- WSM remains primary; WPM appears as a visible but secondary strict-check panel.
- Agreement state is concise and lightweight.
- Difference state is neutral (not alarmist): simple "methods differ" notice by default.
- Expanded difference view can pivot to near-full WPM perspective, with small callouts indicating what WSM would report.

### Adaptive visual style
- For 3+ criteria radar: show all option lines near-equal emphasis, no area fill.
- Radar line color should be distinct per option, with higher-ranked options tending toward slightly brighter/more positive colors.
- Radar draw order (z-level) follows ranking so higher-ranked option lines render above lower-ranked lines.
- For 2 criteria dial: balanced presentation (visual clarity plus numeric anchors).
- For 1 criterion comparison bar: preserve ranking order.
- Criteria-count visual transitions use expressive motion.

### Explainability interactions
- Linked hover across table and visuals (hover in one highlights the same option everywhere).
- Focus mode uses moderate dimming for non-focused options.
- "Why" contribution details open in a compact, easy-to-digest modal popup.
- Breakdown modal closes via explicit X control or backdrop click.
- Raw/desirability display uses one global toggle near explainability controls (shown when measured criteria exist).

### Design language and copy quality
- Design, UI, UX, and wording quality are all high-priority and should feel intentionally crafted, not generic.
- The experience should already reflect a utilitarian design style: clear hierarchy, high legibility, low-friction interactions, and purposeful copy.

### Claude's Discretion
- Exact text copy for WPM agreement/difference micro-messaging.
- Exact thresholds and scale mapping for "slightly brighter/more positive" ranking-based line color tendency.
- Exact easing, timing, and choreography of expressive visual transitions.
- Exact visual design details (spacing, typography, iconography) while preserving compact readability.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
</user_constraints>

## Summary

Phase 4 should be planned as a presentation-and-interpretation layer over the Phase 3 scoring contracts. The main technical requirement is not new math, but deterministic projection of existing desirability, weights, and coverage into trustworthy rankings/explanations. Keep WSM as the default narrative, render WPM as a strict-check companion, and avoid introducing any new scoring modes or hidden imputations.

The current app architecture already has the right foundations: reducer-driven draft state, route-level guards, and shared selector/schema contracts in `src/features/ratings/state` and `src/features/ratings/*.schema.ts`. Phase 4 should add a dedicated `results` feature module with selector-first computations (WSM/WPM/contributions/ties/coverage) and thin, controlled UI components (table, strict-check panel, adaptive chart block, why modal). This keeps correctness centralized and avoids drift between table values, chart tooltips, and explainability details.

For visuals and interactions, lock to adaptive charting (radar/gauge/bar by criteria count), synchronized hover/focus state, and conditional raw/desirability toggles only when measured criteria exist. Use library primitives for charts and dialog behavior instead of custom SVG/focus-trap code.

**Primary recommendation:** Implement Phase 4 as selector-driven results projection + synchronized UI state, using MUI X Charts for adaptive visuals and Base UI dialog/switch primitives for explainability controls.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Results route composition and synchronized interaction state | Existing runtime (`bun.lock`) and established reducer/context patterns |
| react-router | 7.13.0 | Keep `/results` guard behavior and wizard back-navigation intact | Already used route-guard architecture in `ResultsRoute.tsx` |
| TypeScript | 5.9.x | Typed ranking rows, explainability payloads, chart series mappings | Prevents cross-view drift and invalid selector outputs |
| zod | 4.3.6 | Optional result-shape assertions for ranking payload/gates | Aligns with existing gate-schema discipline |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mui/x-charts | 8.27.0 | Radar (3+), Gauge (2), BarChart (1), built-in highlighting/tooltip control | Primary charting engine for adaptive results visuals |
| @mui/material | 7.3.8 | Required peer dependency for `@mui/x-charts` | Install alongside charts package |
| @emotion/react + @emotion/styled | 11.14.0 + 11.14.1 | Required styling peers for MUI packages | Install with MUI peers |
| @base-ui/react | 1.2.0 | Accessible Dialog/Switch primitives for Why modal + raw toggle | Use for compact modal behavior and toggle semantics without Radix |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@mui/x-charts` adaptive set | Custom SVG charts | Violates locked "don't hand-roll charting" direction; higher maintenance and a11y risk |
| Base UI Dialog/Switch | Hand-built modal/toggle semantics | Recreates focus-trap, escape, and labeling edge cases already solved |
| Selector-first results compute | Per-component ad hoc calculations | Inconsistent numbers between table/tooltips/modal and harder debugging |

**Installation:**
```bash
bun add @mui/x-charts @mui/material @emotion/react @emotion/styled @base-ui/react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
|- features/results/
|  |- components/                    # RankingTable, MethodCheckPanel, AdaptiveVisual, WhyModal
|  |- state/
|  |  |- results.selectors.ts        # WSM/WPM scores, tie ranks, contributions, chart payloads
|  |  `- results.types.ts            # Result row/series/view-state types
|  `- results.schema.ts              # (optional) shape assertions for computed payloads
|- routes/results/
|  `- ResultsRoute.tsx               # Guarded route, orchestrates results feature UI
`- styles.css                        # Utilitarian visual polish + motion + reduced-motion rules
```

### Pattern 1: Selector-First Scoring Projection
**What:** Compute WSM/WPM, ranks, tie numbering, coverage, and explainability contributions in one shared selector layer.
**When to use:** Always; components should render precomputed view models, not recalculate scoring logic.
**Example:**
```typescript
// Source: .planning/pre-execution-project-research/What-And-How-To-Build.md
const sWsm = (desirability - 1) / 19; // 0..1, can include 0 internally
const sWpm = desirability / 20;       // strictly positive for product model

const wsmScore = normalizedWeights.reduce((sum, w, i) => sum + w * sWsmValues[i], 0);
const wpmScore = normalizedWeights.reduce((product, w, i) => product * sWpmValues[i] ** w, 1);
```

### Pattern 2: Shared-Rank Tie Strategy (1,1,3)
**What:** Use standard competition ranking for ties so rank numbers skip after ties.
**When to use:** Final displayed rank column in WSM and WPM tables.
**Example:**
```typescript
// Source: locked decision in 04-CONTEXT.md (ties = 1,1,3)
const assignSharedRanks = (sortedScores: number[]): number[] => {
  const ranks: number[] = [];
  let currentRank = 1;
  for (let i = 0; i < sortedScores.length; i += 1) {
    if (i > 0 && sortedScores[i] !== sortedScores[i - 1]) {
      currentRank = i + 1;
    }
    ranks.push(currentRank);
  }
  return ranks;
};
```

### Pattern 3: Adaptive Visual Router by Criteria Count
**What:** Render one chart container that switches internals by criteria count (`>=3` radar, `2` gauge/dial, `1` bar).
**When to use:** Always in results visuals to satisfy RES-04/05/06.
**Example:**
```typescript
// Source: .planning/REQUIREMENTS.md (RES-04..RES-06)
if (criteriaCount >= 3) return <RadarChart {...radarProps} />;
if (criteriaCount === 2) return <Gauge {...dialProps} />;
return <BarChart layout="horizontal" {...singleCriterionProps} />;
```

### Pattern 4: Controlled Highlight Synchronization
**What:** Keep a single `highlightedOptionId` + `focusedOptionId` state; table rows and charts both read/write it.
**When to use:** Linked hover/focus interactions across table and visuals.
**Example:**
```tsx
// Source: https://mui.com/x/react-charts/highlighting/
<RadarChart
  highlightedItem={highlightedItem}
  onHighlightChange={setHighlightedItem}
/>

<RankingTable
  highlightedOptionId={highlightedOptionId}
  onRowHover={setHighlightedOptionId}
/>
```

### Pattern 5: Explainability Modal + Global Raw Toggle
**What:** Use one compact modal for "Why" details and one global raw/desirability switch, shown only when measured criteria exist.
**When to use:** RES-10 and RES-11 flows.
**Example:**
```tsx
// Source: https://base-ui.com/react/components/dialog
<Dialog.Root open={isWhyOpen} onOpenChange={setIsWhyOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>{/* weighted contribution breakdown */}</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Anti-Patterns to Avoid
- **Recomputing scores in UI components:** causes table/chart/modal mismatches under edits.
- **Dense-rank tie display (`1,1,2`)**: violates locked tie semantics (`1,1,3`).
- **Treating WPM differences as warnings/errors by default:** violates neutral messaging requirement.
- **Always-visible raw toggle:** violates RES-11 and adds noise when no measured criteria exist.
- **Area-filled radar polygons:** violates locked no-area-fill visual decision.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Adaptive radar/gauge/bar SVG rendering | Custom chart primitives | `@mui/x-charts` (`RadarChart`, `Gauge`, `BarChart`) | Built-in tooltip/highlight/composition lowers correctness and interaction risk |
| Modal focus trap/backdrop-dismiss/ESC | Ad hoc modal logic | `@base-ui/react/dialog` | Handles keyboard/focus semantics and close behavior consistently |
| Tooltip positioning/portal behavior | Custom popper math | MUI Charts tooltip slots / `ChartsTooltip` | Avoids collision/portal edge cases and chart-coordinate sync bugs |
| Duplicate scoring equations in each widget | Inline WSM/WPM snippets per component | Shared `results.selectors.ts` | One source of truth for score, rank, coverage, contributions |
| Row + chart hover syncing via DOM queries | Event-bus/DOM traversal tricks | Controlled React state (`highlightedItem`, `focusedOptionId`) | Deterministic behavior and testable interaction contracts |

**Key insight:** The highest failure mode in this phase is inconsistent interpretation, not missing visuals. Centralize math and interaction state first; keep rendering components declarative.

## Common Pitfalls

### Pitfall 1: Wrong normalization between WSM and WPM
**What goes wrong:** WPM reuses WSM normalization or adds epsilon hacks, distorting strict-check meaning.
**Why it happens:** Formula duplication and copy/paste from one method to another.
**How to avoid:** Keep explicit separate transforms (`(d-1)/19` for WSM, `d/20` for WPM) in shared selectors.
**Warning signs:** WPM nearly always equals WSM order even on intentionally divergent inputs.

### Pitfall 2: Silent blank handling in results
**What goes wrong:** Missing ratings are implicitly treated as neutral/low, changing rank trustworthiness.
**Why it happens:** Results code bypasses existing explicit-missing policy.
**How to avoid:** Reuse Phase 3 selectors and coverage semantics; never impute in results view.
**Warning signs:** Coverage badges stay high despite known blanks.

### Pitfall 3: Tie numbering implementation drift
**What goes wrong:** Ranks display as `1,1,2` or `1,2,2` instead of `1,1,3`.
**Why it happens:** Using dense rank or ordinal rank helpers by habit.
**How to avoid:** Add dedicated tie-rank helper and snapshot tests for tie arrays.
**Warning signs:** Third item after a tie shows rank `2`.

### Pitfall 4: Linked hover and focus desync
**What goes wrong:** Hovering table row highlights one option while chart tooltip/focus shows another.
**Why it happens:** Multiple local states with inconsistent IDs/order assumptions.
**How to avoid:** Single shared IDs and stable `option.id` mapping across all views.
**Warning signs:** Issue appears after option reorder or when ties occur.

### Pitfall 5: Motion ignores reduced-motion preference
**What goes wrong:** Expressive transitions remain heavy for reduced-motion users.
**Why it happens:** Animations hard-coded without media query/skip controls.
**How to avoid:** Use MUI `skipAnimation` and CSS `prefers-reduced-motion` overrides for choreography.
**Warning signs:** Chart transitions animate at full intensity with reduced-motion OS setting enabled.

## Code Examples

Verified patterns from official docs and project contracts:

### WSM/WPM method transforms
```typescript
// Source: .planning/pre-execution-project-research/What-And-How-To-Build.md
export const toWsmNormalized = (d: number) => (d - 1) / 19;
export const toWpmNormalized = (d: number) => d / 20;
```

### Controlled chart highlight synchronization
```tsx
// Source: https://mui.com/x/react-charts/highlighting/
const [highlightedItem, setHighlightedItem] = useState<
  { seriesId: string | number; dataIndex?: number } | null
>(null);

<BarChart highlightedItem={highlightedItem} onHighlightChange={setHighlightedItem} />
```

### Radar configured for no area fill and item tooltip trigger
```tsx
// Source: https://mui.com/x/react-charts/radar/
<RadarChart
  series={series.map((entry) => ({ ...entry, fillArea: false }))}
  radar={{ metrics }}
  slotProps={{ tooltip: { trigger: 'item' } }}
/>
```

### Compact Why modal with backdrop/X close
```tsx
// Source: https://base-ui.com/react/components/dialog
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Why this rank</Dialog.Title>
      <Dialog.Close aria-label="Close">X</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-method table-only output | WSM default + visible WPM strict-check panel | Product requirements v1 (2026-02-16) | Better trust calibration without overwhelming default UX |
| One chart type regardless of dimension | Criteria-count adaptive radar/dial/bar | Requirements RES-04..RES-06 | Prevents misleading/degenerate visual forms |
| Isolated widget hovers | Cross-linked controlled highlight/focus state | MUI X controlled highlighting patterns | Stronger explainability and faster mental mapping |

**Deprecated/outdated:**
- Results pages that silently impute missing values are out of policy for this product.
- Custom visualization primitives for core results are discouraged when MUI X provides covered components.

## Open Questions

1. **Exact rank-brightness threshold map for line colors**
   - What we know: Higher-ranked options should be slightly brighter/more positive; exact mapping is discretionary.
   - What's unclear: Concrete threshold scale (linear vs stepped) and max delta before visual bias appears.
   - Recommendation: Start with a bounded 3-step delta (top/middle/bottom clusters), validate readability in tie-heavy cases.

2. **Final microcopy tone for WPM difference panel**
   - What we know: Must be neutral and concise by default, with non-alarmist expansion language.
   - What's unclear: Exact sentence-level phrasing for agreement vs difference states.
   - Recommendation: Draft copy variants in planning and validate against locked "strict check, not warning" framing.

## Sources

### Primary (HIGH confidence)
- `C:\Users\aaron\localProjects\skip-overthinking\.planning\phases\04-results-and-explainability\04-CONTEXT.md` - locked phase decisions and discretionary boundaries
- `C:\Users\aaron\localProjects\skip-overthinking\.planning\REQUIREMENTS.md` - RES-01..RES-11 requirement contract
- `C:\Users\aaron\localProjects\skip-overthinking\.planning\ROADMAP.md` - phase goal/success criteria
- `C:\Users\aaron\localProjects\skip-overthinking\.planning\pre-execution-project-research\What-And-How-To-Build.md` - WSM/WPM math policy and results UX behavior
- `C:\Users\aaron\localProjects\skip-overthinking\src\features\ratings\state\rating.selectors.ts` - current derivation and coverage selector patterns
- `C:\Users\aaron\localProjects\skip-overthinking\src\features\ratings\state\ratingPrereq.ts` - shared guard helper contract reused by results route
- https://mui.com/x/react-charts/quickstart/ - installation, peer dependencies, feature availability framing
- https://mui.com/x/api/charts/radar-chart/ - radar API, `skipAnimation`, highlight/tooltip control props
- https://mui.com/x/react-charts/radar/ - radar series options (`fillArea`) and interaction model
- https://mui.com/x/react-charts/gauge/ - gauge API/composition and meter accessibility
- https://mui.com/x/react-charts/bars/ - bar fallback layout and animation controls
- https://mui.com/x/react-charts/highlighting/ - controlled highlight synchronization patterns
- https://mui.com/x/react-charts/tooltip/ - tooltip trigger/control and customization behavior
- https://base-ui.com/react/components/dialog - modal anatomy and close behavior
- https://base-ui.com/react/components/switch - accessible global toggle primitive
- https://base-ui.com/react/overview/quick-start - portal/isolation setup guidance

### Secondary (MEDIUM confidence)
- https://mui.com/x/introduction/licensing/ - open-core plan model and package plan boundaries
- `npm view` package metadata (2026-02-18): `@mui/x-charts`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `@base-ui/react`

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions and peer dependencies verified via official docs and npm metadata.
- Architecture: HIGH - directly grounded in locked context + existing reducer/selector patterns in repo.
- Pitfalls: MEDIUM-HIGH - tied to explicit requirements and known chart/interaction failure modes; microcopy/color mapping remains discretionary.

**Research date:** 2026-02-18
**Valid until:** 2026-03-20 (30 days)
