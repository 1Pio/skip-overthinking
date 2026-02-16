# Roadmap: Skip Overthinking

## Overview

This roadmap delivers a complete decision-making flow from first setup to explainable results, then adds persistence and authenticated sync. Phases are derived from requirement clusters and ordered by user workflow dependencies: foundation and wizard first, typed criteria and scoring semantics next, explainability and visualization after scoring is stable, and sync/security once decision data shape is complete.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation, Setup, and Options** - Deliver runnable app foundation, step-gated decision setup, and option management.
- [ ] **Phase 2: Typed Criteria Modeling** - Deliver criteria authoring with templates and explicit desirability mappings.
- [ ] **Phase 3: Ratings, Weights, and Coverage Integrity** - Deliver matrix input, conversion to 1-20 desirability, and missing-data safeguards.
- [ ] **Phase 4: Results and Explainability** - Deliver rankings, strict-check validation, and adaptive decision visuals.
- [ ] **Phase 5: Persistence, Auth, and Sync Security** - Deliver local persistence plus authenticated ownership-enforced sync.

## Phase Details

### Phase 1: Foundation, Setup, and Options
**Goal**: Users can start a decision in a deployed app, progress through gated setup steps, and define a valid option set without losing context.
**Depends on**: Nothing (first phase)
**Requirements**: DEC-01, DEC-02, DEC-03, DEC-04, OPT-01, OPT-02, OPT-03, OPT-04, DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. User can load the app from GitHub Pages with working hash-based routes and correctly resolved assets.
  2. User can create a decision with required title, optionally add description/icon, and move forward only when step prerequisites are satisfied.
  3. User can return to completed wizard steps and keep previously entered decision data intact.
  4. User can add/edit/delete/reorder options with optional metadata and is blocked from ratings/results until at least two options exist.
  5. User can run local development and build workflows with Bun commands and produce a deployable static build.
**Plans**: 4 plans
Plans:
- [ ] 01-01-PLAN.md - Bootstrap Bun/Vite/TypeScript app and GitHub Pages deployment workflow.
- [ ] 01-02-PLAN.md - Add route-per-step wizard shell with centralized draft state and guard hooks.
- [ ] 01-03-PLAN.md - Implement validated decision setup step with required-title gating and persisted revisit.
- [ ] 01-04-PLAN.md - Implement option CRUD/reorder with minimum-two guard for criteria, ratings, and results.

### Phase 2: Typed Criteria Modeling
**Goal**: Users can define comparable decision criteria using typed inputs and explicit desirability semantics before entering ratings.
**Depends on**: Phase 1
**Requirements**: CRT-01, CRT-02, CRT-03, CRT-04, CRT-05, CRT-06, CRT-07
**Success Criteria** (what must be TRUE):
  1. User can add/edit/delete/reorder criteria with required title and optional description.
  2. User can create criteria from a template picker that clearly separates recommended and measured criteria.
  3. User can choose criterion type (`rating_1_20`, `numeric`, `boolean`, `enum`) and complete type-specific configuration.
  4. User can configure numeric unit and direction, enum desirability mapping, and boolean yes/no desirability mapping explicitly.
  5. User sees guidance to phrase negative concepts positively so all scoring stays in desirability language.
**Plans**: TBD

### Phase 3: Ratings, Weights, and Coverage Integrity
**Goal**: Users can fill the option-by-criterion matrix on a strict 1-20 desirability scale, assign complete weights, and understand missing-data impact.
**Depends on**: Phase 2
**Requirements**: RAT-01, RAT-02, RAT-03, RAT-04, RAT-05, RAT-06, RAT-07, RAT-08, WGT-01, WGT-02, WGT-03, WGT-04, WGT-05
**Success Criteria** (what must be TRUE):
  1. User can edit the ratings matrix and leave cells blank by default, with no silent imputation.
  2. User can enter rating, numeric raw, boolean, and enum inputs and always see derived desirability constrained to 1-20 (never 0).
  3. User can view both raw and derived values for measured criteria, including neutral 10.5 derivation when numeric raw values are equal.
  4. User can explicitly apply "Fill missing with Neutral (10)" as a deliberate action rather than automatic behavior.
  5. User can assign integer weights to all criteria, is blocked from results until complete, and sees weighted coverage plus low-coverage warnings.
**Plans**: TBD

### Phase 4: Results and Explainability
**Goal**: Users can trust and interpret rankings through default WSM results, WPM robustness checks, and context-aware visuals.
**Depends on**: Phase 3
**Requirements**: RES-01, RES-02, RES-03, RES-04, RES-05, RES-06, RES-07, RES-08, RES-09, RES-10, RES-11
**Success Criteria** (what must be TRUE):
  1. User sees a compact ranking table with rank, score, and coverage badge based on WSM as the default method.
  2. User sees WPM as a strict secondary check with clear agreement/difference status and expandable disagreement details.
  3. User sees appropriate visuals by criteria count: radar (>=3), dial (2), or comparison bar (1).
  4. User can inspect criterion-level desirability (and optional raw measured inputs) on hover and focus one option while dimming others.
  5. User can expand "why" contribution breakdowns and toggle raw input display only when measured criteria exist.
**Plans**: TBD

### Phase 5: Persistence, Auth, and Sync Security
**Goal**: Users can safely persist decisions in local-only anonymous mode or authenticated live sync mode with ownership guarantees.
**Depends on**: Phase 4
**Requirements**: SYN-01, SYN-02, SYN-03, SYN-04
**Success Criteria** (what must be TRUE):
  1. User can use the app without login and resume local decisions across sessions.
  2. Anonymous decisions remain local-only and are never stored server-side.
  3. Authenticated user can save and resume decisions with Convex-backed live sync.
  4. Authenticated backend operations enforce `userId` ownership so users cannot access other users' decision data.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Setup, and Options | 0/4 | Not started | - |
| 2. Typed Criteria Modeling | 0/TBD | Not started | - |
| 3. Ratings, Weights, and Coverage Integrity | 0/TBD | Not started | - |
| 4. Results and Explainability | 0/TBD | Not started | - |
| 5. Persistence, Auth, and Sync Security | 0/TBD | Not started | - |
