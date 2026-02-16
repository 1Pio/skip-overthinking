# Skip Overthinking

## What This Is

Skip Overthinking is a small decision app that turns a messy choice into a clear, explainable ranking with MCDA using a weighted decision matrix. Users create a decision, add options and criteria, enter ratings, set weights, and get an interactive results view with a radar-style visualization and compact rankings. The experience is fast, calm, utilitarian, and designed to reduce accidental self-deception through clear defaults and transparent scoring.

## Core Value

Help people make better decisions quickly by converting subjective tradeoffs into a clear, trustworthy, and explainable ranking where higher always means better.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] Users can complete a step-gated decision wizard from setup through live results without losing context.
- [ ] All scoring and visualization stays on a consistent desirability scale of 1-20 where higher is always better.
- [ ] Users can create typed criteria (rating, numeric, boolean, enum) and see transparent raw-to-derived desirability conversion.
- [ ] Results provide explainable WSM rankings with WPM as a strict check, plus coverage-aware missing-data warnings.
- [ ] Users can persist and resume decisions via optional auth + sync, or local-only storage when unauthenticated.

### Out of Scope

- Full currency conversion across units -- v1 uses user-selected units for clarity without conversion complexity.
- Anonymous server-side storage -- v1 keeps anonymous state local-only to avoid insecure public data exposure.
- Extensive advanced sensitivity tooling -- defer until core wizard and explainable results are stable.

## Context

The product solves overthinking during everyday decisions by making tradeoffs explicit and comparable. The UX invariant is non-negotiable: values are always desirability scores where 1 is worst and 20 is best, with 0 never shown. Measured criteria accept real-world numeric inputs (for example, cost or time) but are converted into derived 1-20 desirability used by scoring, charts, and ranking, while keeping raw values visible for transparency. Missing ratings remain blank and are surfaced via weighted coverage warnings rather than silently imputed.

The target stack is a React + Vite + TypeScript SPA with Tailwind and Base UI-style component conventions, deployed to GitHub Pages using hash routing and repo-base path configuration. Convex provides authenticated live sync when users are logged in; unauthenticated usage is local-only with export/import portability.

## Constraints

- **Scoring semantics**: 1-20 desirability scale only, with higher always better and 0 disallowed -- prevents axis flipping and user confusion.
- **Data handling**: For measured criteria, store both raw input and derived desirability -- preserves transparency and editability.
- **Result integrity**: Missing ratings stay blank and coverage must be surfaced -- avoids hidden assumptions and biased rankings.
- **Method policy**: WSM is default and WPM is secondary robustness check -- keeps UX simple while preserving strict validation.
- **Frontend stack**: React + Vite + TypeScript + Tailwind with Base UI conventions and no Radix -- aligns with implementation and dependency constraints.
- **Deployment**: GitHub Pages SPA with hash routing and proper Vite base path -- required for static hosting reliability.
- **Package management**: Bun-only scripts and tooling -- standardizes local and CI command behavior.
- **Security model**: Frontend is public, backend enforces ownership by userId, anonymous state local-only -- prevents accidental data exposure.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Enforce desirability as the universal 1-20 scale in all UI and scoring | Removes cognitive overhead and prevents chart/matrix interpretation errors | -- Pending |
| Keep wizard step-gated with backward navigation and forward locks | Preserves data dependencies while allowing iterative refinement | -- Pending |
| Support typed criteria with automatic raw-to-desirability derivation | Balances real-world input convenience with comparable scoring semantics | -- Pending |
| Use WSM as default and WPM only as strict results check | Keeps core experience simple while surfacing robustness concerns | -- Pending |
| Store raw and derived values for measured criteria | Enables transparency, explainability, and editing without recomputation ambiguity | -- Pending |
| Use Convex sync only for authenticated users; keep anonymous local-only | Reduces security risk and access-control complexity in v1 | -- Pending |

---
*Last updated: 2026-02-16 after initialization*
