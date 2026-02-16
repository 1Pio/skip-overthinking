# Phase 1: Foundation, Setup, and Options - Research

**Researched:** 2026-02-16
**Domain:** React SPA foundation, step-gated setup wizard, option modeling, and GitHub Pages deployment
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
Research was authored before `01-CONTEXT.md` existed.

Post-research locked decisions now in effect:
- Use `HashRouter` in Phase 1.
- Use button-based option reordering (up/down/top/bottom) in Phase 1; no drag-and-drop.
- Use Zod for all step-gate validation.
- Use localStorage draft persistence for logged-out users in Phase 1.
- Use icon string inputs with inline preview in Phase 1.

### Claude's Discretion
RHF usage remains discretionary by per-step complexity.

### Deferred Ideas (OUT OF SCOPE)
- Drag-and-drop sorting in Phase 1.
- Full icon picker UI in Phase 1.
</user_constraints>

## Summary

Phase 1 should be planned as a thin but production-real slice: a deployable React + Vite app on GitHub Pages, with hash-based routing and a wizard shell that enforces prerequisite gates. The highest-leverage decision is to make routing and wizard state architecture correct now, because every later phase depends on navigation stability and preserved in-progress data.

Use a route-per-step wizard with centralized draft state (context + reducer) and explicit step guards. Keep all setup and option data in one draft object, and make forward navigation conditional on schema validation for the current step. Back navigation should always be allowed to completed steps and must never clear data.

For deployment/runtime, treat GitHub Pages constraints as first-class: use hash routing, set Vite `base` to the repo path, and deploy with GitHub Actions `configure-pages`/`upload-pages-artifact`/`deploy-pages`. Keep Bun as the single command surface for local and CI workflows.

**Primary recommendation:** Plan around a route-driven wizard state machine with centralized immutable draft state, and lock deployment correctness early with `HashRouter` + Vite `base` + Pages Actions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | SPA UI runtime | Current mainstream React baseline and required by project decisions |
| Vite | 7.3.1 | Dev server + production build | Officially supports GitHub Pages deployment guidance and repo-base assets |
| react-router | 7.13.0 | Hash routing + step routes | Official `HashRouter`/`createHashRouter` stores path in URL hash (server-safe for Pages) |
| TypeScript | 5.x | Type-safe domain models | Keeps decision/option state and step guards explicit and less error-prone |
| Bun | 1.x stable | Package manager + script runner | Project constraint; supports `bun run` scripts and CI usage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @base-ui/react | 1.2.0 | Headless accessible primitives | Build wizard and option forms while honoring no-Radix decision |
| tailwindcss + @tailwindcss/vite | 4.1.18 | Utility styling and fast iteration | Apply app styling while staying aligned with project style direction |
| zod | 4.3.6 | Step schema validation | Enforce DEC-01/DEC-03 and option validity gates predictably |
| react-hook-form | 7.71.1 | Form state and submission ergonomics | Use for step forms when field-level ergonomics matter |
| @dnd-kit/core + @dnd-kit/sortable | 6.3.x + 10.0.0 | Optional future drag reorder enhancement | Consider after baseline button reordering is shipped |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `HashRouter` | `BrowserRouter` + SPA rewrite config | Works on hosts with rewrite control, but adds avoidable deployment risk on Pages |
| `@dnd-kit/sortable` | Manual up/down buttons only | Simpler and acceptable fallback, but less direct for drag reorder UX |
| RHF + Zod | Hand-rolled form state/validation | Feasible for tiny forms, but grows brittle as wizard requirements expand |

**Installation:**
```bash
bun add react react-dom react-router @base-ui/react zod react-hook-form
bun add -d vite typescript tailwindcss @tailwindcss/vite
# Optional later enhancement (not phase-1 baseline):
# bun add @dnd-kit/core @dnd-kit/sortable
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                 # Router setup, providers, app shell
├── features/decision/   # Wizard steps, step guards, draft reducer
├── features/options/    # Option CRUD, reorder, option validation
├── routes/              # Route definitions (hash-based)
├── ui/                  # Shared Base UI wrappers and design tokens
└── lib/                 # Validation schemas, ids, utility functions
```

### Pattern 1: Route-Driven Gated Wizard
**What:** Each setup step is a route; forward movement runs a guard/validator; backward movement is always available to completed steps.
**When to use:** Multi-step flows with strict dependency ordering and required persistence.
**Example:**
```tsx
// Source: https://reactrouter.com/api/declarative-routers/HashRouter
import { HashRouter, Navigate, Route, Routes } from 'react-router';

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/setup/decision" replace />} />
        <Route path="/setup/decision" element={<DecisionStep />} />
        <Route path="/setup/options" element={<RequireDecisionStep><OptionsStep /></RequireDecisionStep>} />
      </Routes>
    </HashRouter>
  );
}
```

### Pattern 2: Central Draft State with Reducer + Context
**What:** One canonical `DecisionDraft` object managed by reducer actions (`decisionUpdated`, `optionAdded`, `optionReordered`, etc.).
**When to use:** Cross-step editing where users navigate back/forward and must keep in-progress data.
**Example:**
```tsx
// Source: https://react.dev/reference/react/useReducer
type DraftState = {
  title: string;
  description?: string;
  icon?: string;
  options: Array<{ id: string; title: string; description?: string; icon?: string; order: number }>;
};

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'optionReordered':
      return { ...state, options: action.options };
    default:
      return state;
  }
}
```

### Pattern 3: Option List as Ordered Entities
**What:** Store options with stable ids and explicit `order` field; on reorder, normalize to dense sequence (0..n-1).
**When to use:** Any UI that supports manual ordering and persistent order semantics.
**Example:**
```ts
// Source: https://github.com/clauderic/dnd-kit
function normalizeOrder(options: Option[]): Option[] {
  return [...options]
    .sort((a, b) => a.order - b.order)
    .map((opt, index) => ({ ...opt, order: index }));
}
```

### Anti-Patterns to Avoid
- **State split across steps:** leads to data loss during back-navigation; keep one canonical draft state.
- **Guard logic in UI only:** disabling buttons without route-level checks allows invalid deep links.
- **Index-based option identity:** breaks editing/reorder/delete correctness; use stable ids.
- **BrowserRouter on Pages without rewrites:** causes refresh/deep-link failures.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL routing | Custom hash parsing/router | `react-router` HashRouter/createHashRouter | Handles nested routes, transitions, and history semantics reliably |
| Option reordering baseline (Phase 1) | Custom DnD implementation | Explicit move controls (up/down/top/bottom) | Lower complexity and robust accessibility baseline |
| Schema validation | Ad hoc `if` chains per step | Zod schemas (optionally via RHF resolver) | Centralized, testable gate rules and better error surfaces |
| Pages deployment flow | Custom deploy script with manual artifact handling | Official `actions/configure-pages`, `upload-pages-artifact`, `deploy-pages` | Correct permissions/artifact contract already solved |

**Key insight:** Hand-rolled routing, validation, and drag sorting create hidden edge cases early, which become plan churn in later scoring/results phases.

## Common Pitfalls

### Pitfall 1: Vite base path mismatch
**What goes wrong:** Built assets 404 on GitHub Pages project URL.
**Why it happens:** `base` left as `/` when deploying under `/<repo>/`.
**How to avoid:** Set `base` to `/<repo>/` for project pages.
**Warning signs:** JS/CSS requests load from root instead of repo subpath.

### Pitfall 2: Routing mode mismatch on Pages
**What goes wrong:** Refresh/deep-link shows 404.
**Why it happens:** Browser history routing without server rewrites.
**How to avoid:** Use `HashRouter` for this deployment target.
**Warning signs:** Works in in-app navigation but fails on hard refresh.

### Pitfall 3: Wizard loses data when step unmounts
**What goes wrong:** Back-navigation returns empty fields.
**Why it happens:** Step-local state discarded or form unregister behavior not planned.
**How to avoid:** Keep canonical draft in reducer/context outside step component lifecycle.
**Warning signs:** Data survives within step but disappears after route change.

### Pitfall 4: Guard rails only visual, not structural
**What goes wrong:** Users reach ratings/results with <2 options via URL or state mismatch.
**Why it happens:** Validation exists only in button disabled states.
**How to avoid:** Add route-level and action-level guards for OPT-04.
**Warning signs:** Direct URL access bypasses wizard preconditions.

### Pitfall 5: GitHub Pages workflow missing permissions/needs
**What goes wrong:** Deploy job stalls or fails to find artifact.
**Why it happens:** Missing `pages: write`, `id-token: write`, or missing `needs` chain.
**How to avoid:** Follow official workflow shape and required job wiring.
**Warning signs:** Deploy step repeatedly waits for non-existent artifact.

## Code Examples

Verified patterns from official sources:

### GitHub Pages-safe router
```tsx
// Source: https://reactrouter.com/api/declarative-routers/HashRouter
import { HashRouter } from 'react-router';

export function Root() {
  return <HashRouter>{/* app routes */}</HashRouter>;
}
```

### Vite base config for repo deployment
```ts
// Source: https://vite.dev/guide/static-deploy.html#github-pages
// Source: https://vite.dev/config/shared-options.html#base
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/<REPO>/',
});
```

### GitHub Actions Pages deployment skeleton
```yaml
# Source: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/configure-pages@v5
      - run: bun ci && bun run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Bun command conventions for scripts
```bash
# Source: https://bun.com/docs/runtime/index.md
bun run dev
bun run build
bun run lint
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gh-pages` branch push deploys | GitHub Pages Actions artifact deployment (`configure-pages` + `upload-pages-artifact` + `deploy-pages`) | Current official docs (2026) | More secure and explicit deploy pipeline |
| Browser routing on static hosts with ad hoc 404 fallback | Hash routing for hosts without rewrite control | Ongoing best practice for Pages-style static hosting | Removes deep-link/refresh risk |
| Tailwind v3 PostCSS-first setup | Tailwind v4 Vite plugin path (`@tailwindcss/vite`) | Tailwind v4 era | Cleaner Vite integration and simpler setup |

**Deprecated/outdated:**
- Manual deployment to `gh-pages` without official Pages Actions: works, but is no longer the recommended baseline.

## Open Questions

1. **Resolved after planning:** Phase 1 requires localStorage draft persistence for logged-out users.
2. **Resolved after planning:** Phase 1 icon input is a simple string with inline preview; full picker deferred.

## Sources

### Primary (HIGH confidence)
- https://vite.dev/guide/static-deploy.html#github-pages - Vite GitHub Pages deployment and `base` guidance
- https://vite.dev/config/shared-options.html#base - `base` config behavior
- https://reactrouter.com/api/declarative-routers/HashRouter - HashRouter semantics (URL hash not sent to server)
- https://reactrouter.com/api/data-routers/createHashRouter - Data router hash mode option
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages - Required Pages workflow actions/permissions
- https://bun.com/docs/runtime/index.md - `bun run` script execution model
- https://bun.com/docs/pm/cli/install.md - Bun install/CI conventions (`bun ci`)
- https://bun.com/docs/guides/ecosystem/vite.md - Bun + Vite workflow patterns
- https://base-ui.com/react/overview/quick-start - Base UI package and setup guidance
- https://tailwindcss.com/docs/installation/using-vite - Tailwind v4 Vite integration
- https://react.dev/reference/react/useReducer - Reducer pattern for shared state
- https://react.dev/reference/react/useContext - Context propagation and update behavior

### Secondary (MEDIUM confidence)
- https://raw.githubusercontent.com/clauderic/dnd-kit/master/README.md - dnd-kit capabilities and sortable preset rationale
- https://raw.githubusercontent.com/oven-sh/setup-bun/main/README.md - setup-bun action usage in CI

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - core tools and versions verified via official docs/npm registry
- Architecture: HIGH - directly grounded in React Router/React docs and deployment constraints
- Pitfalls: HIGH - derived from official deployment/routing docs and common failure modes they explicitly address

**Research date:** 2026-02-16
**Valid until:** 2026-03-18 (30 days)
