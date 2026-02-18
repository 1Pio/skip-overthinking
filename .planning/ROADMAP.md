# Roadmap: Skip Overthinking

## Overview

This roadmap delivers a complete decision-making flow from first setup to explainable results, then adds persistence and authenticated sync. Phases are derived from requirement clusters and ordered by user workflow dependencies: foundation and wizard first, typed criteria and scoring semantics next, explainability and visualization after scoring is stable, and sync/security once decision data shape is complete.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation, Setup, and Options** - Deliver runnable app foundation, step-gated decision setup, and option management. (Completed 2026-02-16)
- [x] **Phase 2: Typed Criteria Modeling** - Deliver criteria authoring with templates, desirability-first wording guidance, and numeric measured direction configuration. (Completed 2026-02-17)
- [x] **Phase 3: Ratings, Weights, and Coverage Integrity** - Deliver matrix input with reversible rating_1_20 input modes, 1-20 desirability conversion integrity, and missing-data safeguards. (Completed 2026-02-18)
- [x] **Phase 4: Results and Explainability** - Deliver rankings, strict-check validation, and adaptive decision visuals. (Completed 2026-02-18)
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
**Plans**: 7 plans
Plans:
- [x] 01-01-PLAN.md - Bootstrap Bun/Vite/TypeScript app baseline and local command surface.
- [x] 01-02-PLAN.md - Build centralized draft-state persistence and decision prerequisite helpers.
- [x] 01-03-PLAN.md - Implement validated decision setup step with required-title gating and persisted revisit.
- [x] 01-04-PLAN.md - Implement option-domain state/actions/schema/reorder foundations.
- [x] 01-05-PLAN.md - Add GitHub Pages runtime/base-path wiring and Actions deployment workflow.
- [x] 01-06-PLAN.md - Wire route-per-step wizard shell with decision prerequisite route guards.
- [x] 01-07-PLAN.md - Implement options UI integration and minimum-two guards for criteria/ratings/results.

### Phase 2: Typed Criteria Modeling
**Goal**: Users can define comparable decision criteria using `rating_1_20` and `numeric_measured` inputs with explicit desirability semantics before entering ratings.
**Depends on**: Phase 1
**Requirements**: CRT-01, CRT-02, CRT-03, CRT-04, CRT-05, CRT-06, CRT-07
**Success Criteria** (what must be TRUE):
  1. User can add/edit/delete/reorder criteria with required title and optional description.
  2. User can create criteria from a template picker that clearly separates recommended and measured criteria.
  3. User can choose criterion type (`rating_1_20`, `numeric_measured`) and complete type-specific configuration.
  4. User can configure numeric measured criteria with optional unit and required raw direction (`lower raw is better` or `higher raw is better`) while preserving the 1-20 desirability invariant.
  5. User sees guidance to phrase negative concepts positively so all scoring stays in desirability language, and does not encounter per-criterion invert toggles.
**Plans**: 5 plans
Plans:
- [x] 02-01-PLAN.md - Establish typed criteria schema/actions/templates and reducer-integrated criteria state.
- [x] 02-02-PLAN.md - Build criteria list authoring UX with compact/rich views, reorder, and safe delete workflows.
- [x] 02-03-PLAN.md - Implement sectioned template picker plus dedicated typed editor with positivity rewrite guidance.
- [x] 02-04-PLAN.md - Integrate criteria route flow and enforce criteria prerequisites for ratings/results.
- [x] 02-05-PLAN.md - Close UAT reorder regression so Move up/down controls update criteria order reliably.

### Phase 3: Ratings, Weights, and Coverage Integrity
**Goal**: Users can fill the option-by-criterion matrix on a strict 1-20 desirability scale, switch `rating_1_20` input modes non-destructively, assign complete weights, and understand missing-data impact.
**Depends on**: Phase 2
**Requirements**: RAT-01, RAT-02, RAT-03, RAT-04, RAT-05, RAT-06, RAT-07, RAT-08, WGT-01, WGT-02, WGT-03, WGT-04, WGT-05
**Success Criteria** (what must be TRUE):
  1. User can edit the ratings matrix and leave cells blank by default, with no silent imputation.
  2. User can enter rating_1_20 criteria in either numeric mode or 7-level label mode, and enter numeric measured raw values, with all scoring constrained to 1-20 desirability (never 0).
  3. User can view both raw and derived values for measured criteria, including neutral 10.5 derivation when numeric raw values are equal.
  4. User can explicitly apply "Fill missing with Neutral (10)" as a deliberate action rather than automatic behavior.
  5. User can switch rating_1_20 input mode non-destructively (dual persistence with nearest-value ghosting and reversible edits) while keeping user intent across mode toggles.
  6. User can assign integer weights to all criteria, is blocked from results until complete, and sees weighted coverage plus low-coverage warnings.
**Plans**: 3 plans
Plans:
- [X] 03-01-PLAN.md - Establish ratings and weights domain contracts with dual persistence, conversion integrity, and shared gates.
- [X] 03-02-PLAN.md - Implement compact sticky ratings matrix UX with mode toggle, ghost previews, and explicit neutral-fill review flow.
- [X] 03-03-PLAN.md - Add integer weights, weighted coverage warnings panel, and results gating on complete weights.

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
**Plans**: 4 plans
Plans:
- [x] 04-01-PLAN.md - Install approved results UI dependencies and build selector-first WSM/WPM projection contracts.
- [x] 04-02-PLAN.md - Implement compact WSM ranking table and neutral secondary WPM strict-check panel.
- [x] 04-03-PLAN.md - Implement adaptive visuals plus explainability controls and compact why modal interactions.
- [x] 04-04-PLAN.md - Integrate ResultsStep into guarded route and apply polished utilitarian styling/motion.

### Phase 5: Persistence, Auth, and Sync Security
**Goal**: Users can safely persist decisions in local-only anonymous mode or authenticated live sync mode with ownership guarantees.
**Depends on**: Phase 4
**Requirements**: SYN-01, SYN-02, SYN-03, SYN-04
**Success Criteria** (what must be TRUE):
  1. User can use the app without login and resume local decisions across sessions.
  2. Anonymous decisions remain local-only and are never stored server-side.
   3. Authenticated user can save and resume decisions with Convex-backed live sync.
   4. Authenticated backend operations enforce `userId` ownership so users cannot access other users' decision data.
**Plans**: 12 plans
Plans:
- [x] 05-01-PLAN.md — Setup Convex backend with auth and ownership-enforced decision storage
- [x] 05-02-PLAN.md — Implement localStorage-based decision storage for anonymous users
- [x] 05-02B-PLAN.md — Add localStorage quota management and utilities
- [x] 05-03-PLAN.md — Build auth context and sign-in modal
- [ ] 05-03B-PLAN.md — Build settings modal and auth footer component
- [ ] 05-04-PLAN.md — Build storage merge service and sync error handling hook
- [ ] 05-05-PLAN.md — Update draft storage for multi-decision and router integration
- [ ] 05-06-PLAN.md — Add sync error state and persistent warning banner
- [ ] 05-06B-PLAN.md — Integrate sync banner and storage warning toast
- [ ] 05-07-PLAN.md — Build decision card and new decision button components
- [ ] 05-08-PLAN.md — Build decision workspace page with checkpoint
- [ ] 05-09-PLAN.md — Integrate AuthProvider, AuthFooter, and first launch modal

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Setup, and Options | 7/7 | Complete | 2026-02-16 |
| 2. Typed Criteria Modeling | 5/5 | Complete | 2026-02-17 |
| 3. Ratings, Weights, and Coverage Integrity | 3/3 | Complete | 2026-02-18 |
| 4. Results and Explainability | 4/4 | Complete | 2026-02-18 |
| 5. Persistence, Auth, and Sync Security | 4/12 | In Progress | - |
