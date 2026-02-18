# Requirements: Skip Overthinking

**Defined:** 2026-02-16
**Core Value:** Help people make better decisions quickly by converting subjective tradeoffs into a clear, trustworthy, and explainable ranking where higher always means better.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Decision Setup

- [ ] **DEC-01**: User can create a decision with a required title.
- [ ] **DEC-02**: User can optionally add a decision description and icon.
- [ ] **DEC-03**: User can navigate a step-gated wizard and only move forward when required prerequisites are satisfied.
- [ ] **DEC-04**: User can return to any completed step without losing entered data.

### Options

- [ ] **OPT-01**: User can add, edit, and delete options in a decision.
- [ ] **OPT-02**: User can set optional description and icon for each option.
- [ ] **OPT-03**: User can reorder options manually.
- [ ] **OPT-04**: User sees validation that at least two options are required before ratings and results are meaningful.

### Criteria

- [ ] **CRT-01**: User can add, edit, delete, and reorder criteria with required title and optional description.
- [ ] **CRT-02**: User can create criteria from a template picker with sections for recommended criteria and measured criteria.
- [ ] **CRT-03**: User can choose criterion type: `rating_1_20` or `numeric_measured`.
- [ ] **CRT-04**: User sees guidance to phrase negative concepts positively so scores stay in desirability language.
- [ ] **CRT-05**: User can configure measured numeric criteria with optional unit display and required raw direction (`higher raw is better` or `lower raw is better`).
- [ ] **CRT-06**: User sees measured-criteria guidance copy explaining that real raw values are converted to 1-20 desirability while preserving the chosen raw direction.
- [ ] **CRT-07**: User does not encounter per-criterion invert toggles; semantics are handled via positive criterion wording or measured conversion direction.

### Ratings Matrix

- [ ] **RAT-01**: User can edit an option-by-criterion ratings matrix where unset cells remain blank by default.
- [ ] **RAT-02**: User can enter direct desirability values from 1-20 for `rating_1_20` criteria.
- [ ] **RAT-03**: User can enter raw numeric values for measured criteria and see derived desirability in 1-20.
- [ ] **RAT-04**: User can switch `rating_1_20` input mode at decision level between numeric and 7-level labels using fixed mappings (Terrible=1.0, Very Poor=4.2, Poor=7.3, OK=10.5, Good=13.7, Very Good=16.8, Excellent=20.0).
- [ ] **RAT-05**: User can never enter or view desirability value 0 anywhere in the product.
- [ ] **RAT-06**: User can see that equal numeric raw values map to neutral derived desirability of 10.5.
- [ ] **RAT-07**: User can view both raw and derived values for measured criteria to preserve transparency.
- [ ] **RAT-08**: User can trigger an explicit "Fill missing with Neutral (10)" action; blanks are never silently imputed, and rating mode switching remains non-destructive via dual persistence with nearest-value ghost previews.

### Weights and Coverage

- [ ] **WGT-01**: User can assign integer importance weights to every criterion.
- [ ] **WGT-02**: User can proceed to results only after all criteria have assigned weights.
- [ ] **WGT-03**: User can see per-option weighted coverage based on filled criteria and total weight.
- [ ] **WGT-04**: User receives prominent warning when option coverage drops below configured threshold.
- [ ] **WGT-05**: User receives softer warning when a criterion has too many blanks across options.

### Results and Explainability

- [ ] **RES-01**: User sees WSM as the default ranking method using normalized desirability scores.
- [ ] **RES-02**: User sees WPM as a secondary strict check with agreement/difference indicator.
- [ ] **RES-03**: User can expand strict-check details to view WPM ranking and top-option differences when methods disagree.
- [ ] **RES-04**: User sees a radar chart when there are at least three criteria.
- [ ] **RES-05**: User sees a two-criteria dial fallback when criteria count is exactly two.
- [ ] **RES-06**: User sees a one-criterion comparison bar fallback when criteria count is exactly one.
- [ ] **RES-07**: User can hover results visuals to inspect criterion desirability and optional raw values for measured criteria.
- [ ] **RES-08**: User can focus a selected option in results visuals while dimming others.
- [ ] **RES-09**: User sees a compact ranking table with rank, score, and coverage badge.
- [ ] **RES-10**: User can expand "why" details to inspect weighted contribution breakdowns.
- [ ] **RES-11**: User can toggle display of raw inputs in results only when measured criteria exist.

### Persistence, Auth, and Sync

- [ ] **SYN-01**: User can continue using the app without login with local persistence.
- [x] **SYN-02**: Authenticated user can save and resume decisions with Convex live sync.
- [x] **SYN-03**: Authenticated data access enforces ownership checks by `userId` on backend operations.
- [ ] **SYN-04**: Anonymous decisions remain local-only in v1 and are not persisted server-side.

### Deployment and Runtime

- [ ] **DEP-01**: User can run the app as a GitHub Pages-compatible SPA with hash routing.
- [ ] **DEP-02**: User can load built assets correctly on GitHub Pages with Vite base path set to repo path.
- [ ] **DEP-03**: User can build and deploy via GitHub Actions for static hosting.
- [ ] **DEP-04**: User can run local workflows with Bun commands (`bun dev`, `bun run build`, `bun run lint`).

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Data Portability

- **PORT-01**: User can export a decision as versioned JSON including metadata, schema, typed criteria config, weights, ratings, and scoring preferences.
- **PORT-02**: User can import valid versioned JSON as a new decision with schema validation and clear conflict handling.

### Numeric Stability

- **NUMR-01**: User can lock numeric criterion ranges to stabilize desirability mapping when new options are added.

### Advanced Guidance

- **GUID-01**: User can view sensitivity hints about how weight changes may affect rank order.
- **GUID-02**: User can access enhanced visualization polish beyond core radar/dial/bar functionality.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Automatic multi-currency conversion | Not required for v1 and adds external-rate complexity |
| Anonymous cloud sync | Security model for public frontend does not permit safe v1 anonymous server storage |
| Large MCDA method settings panel | Conflicts with calm, utilitarian UX goal and overcomplicates core decision flow |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEC-01 | Phase 1 | Pending |
| DEC-02 | Phase 1 | Pending |
| DEC-03 | Phase 1 | Pending |
| DEC-04 | Phase 1 | Pending |
| OPT-01 | Phase 1 | Pending |
| OPT-02 | Phase 1 | Pending |
| OPT-03 | Phase 1 | Pending |
| OPT-04 | Phase 1 | Pending |
| CRT-01 | Phase 2 | Pending |
| CRT-02 | Phase 2 | Pending |
| CRT-03 | Phase 2 | Pending |
| CRT-04 | Phase 2 | Pending |
| CRT-05 | Phase 2 | Pending |
| CRT-06 | Phase 2 | Pending |
| CRT-07 | Phase 2 | Pending |
| RAT-01 | Phase 3 | Pending |
| RAT-02 | Phase 3 | Pending |
| RAT-03 | Phase 3 | Pending |
| RAT-04 | Phase 3 | Pending |
| RAT-05 | Phase 3 | Pending |
| RAT-06 | Phase 3 | Pending |
| RAT-07 | Phase 3 | Pending |
| RAT-08 | Phase 3 | Pending |
| WGT-01 | Phase 3 | Pending |
| WGT-02 | Phase 3 | Pending |
| WGT-03 | Phase 3 | Pending |
| WGT-04 | Phase 3 | Pending |
| WGT-05 | Phase 3 | Pending |
| RES-01 | Phase 4 | Pending |
| RES-02 | Phase 4 | Pending |
| RES-03 | Phase 4 | Pending |
| RES-04 | Phase 4 | Pending |
| RES-05 | Phase 4 | Pending |
| RES-06 | Phase 4 | Pending |
| RES-07 | Phase 4 | Pending |
| RES-08 | Phase 4 | Pending |
| RES-09 | Phase 4 | Pending |
| RES-10 | Phase 4 | Pending |
| RES-11 | Phase 4 | Pending |
| SYN-01 | Phase 5 | Pending |
| SYN-02 | Phase 5 | Complete |
| SYN-03 | Phase 5 | Complete |
| SYN-04 | Phase 5 | Pending |
| DEP-01 | Phase 1 | Pending |
| DEP-02 | Phase 1 | Pending |
| DEP-03 | Phase 1 | Pending |
| DEP-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-02-16*
*Last updated: 2026-02-16 after roadmap creation*
