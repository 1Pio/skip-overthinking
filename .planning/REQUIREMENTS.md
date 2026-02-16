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
- [ ] **CRT-03**: User can choose criterion type: `rating_1_20`, `numeric`, `boolean`, or `enum`.
- [ ] **CRT-04**: User sees guidance to phrase negative concepts positively so scores stay in desirability language.
- [ ] **CRT-05**: User can configure measured numeric criteria with unit selection and raw direction (higher-better or lower-better).
- [ ] **CRT-06**: User can configure enum criteria with explicit desirability mapping values.
- [ ] **CRT-07**: User can configure boolean criteria with explicit yes/no desirability mapping defaults.

### Ratings Matrix

- [ ] **RAT-01**: User can edit an option-by-criterion ratings matrix where unset cells remain blank by default.
- [ ] **RAT-02**: User can enter direct desirability values from 1-20 for `rating_1_20` criteria.
- [ ] **RAT-03**: User can enter raw numeric values for measured criteria and see derived desirability in 1-20.
- [ ] **RAT-04**: User can enter boolean and enum values that map to 1-20 desirability.
- [ ] **RAT-05**: User can never enter or view desirability value 0 anywhere in the product.
- [ ] **RAT-06**: User can see that equal numeric raw values map to neutral derived desirability of 10.5.
- [ ] **RAT-07**: User can view both raw and derived values for measured criteria to preserve transparency.
- [ ] **RAT-08**: User can trigger an explicit "Fill missing with Neutral (10)" action; blanks are never silently imputed.

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
- [ ] **SYN-02**: Authenticated user can save and resume decisions with Convex live sync.
- [ ] **SYN-03**: Authenticated data access enforces ownership checks by `userId` on backend operations.
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
| DEC-01 | Phase TBD | Pending |
| DEC-02 | Phase TBD | Pending |
| DEC-03 | Phase TBD | Pending |
| DEC-04 | Phase TBD | Pending |
| OPT-01 | Phase TBD | Pending |
| OPT-02 | Phase TBD | Pending |
| OPT-03 | Phase TBD | Pending |
| OPT-04 | Phase TBD | Pending |
| CRT-01 | Phase TBD | Pending |
| CRT-02 | Phase TBD | Pending |
| CRT-03 | Phase TBD | Pending |
| CRT-04 | Phase TBD | Pending |
| CRT-05 | Phase TBD | Pending |
| CRT-06 | Phase TBD | Pending |
| CRT-07 | Phase TBD | Pending |
| RAT-01 | Phase TBD | Pending |
| RAT-02 | Phase TBD | Pending |
| RAT-03 | Phase TBD | Pending |
| RAT-04 | Phase TBD | Pending |
| RAT-05 | Phase TBD | Pending |
| RAT-06 | Phase TBD | Pending |
| RAT-07 | Phase TBD | Pending |
| RAT-08 | Phase TBD | Pending |
| WGT-01 | Phase TBD | Pending |
| WGT-02 | Phase TBD | Pending |
| WGT-03 | Phase TBD | Pending |
| WGT-04 | Phase TBD | Pending |
| WGT-05 | Phase TBD | Pending |
| RES-01 | Phase TBD | Pending |
| RES-02 | Phase TBD | Pending |
| RES-03 | Phase TBD | Pending |
| RES-04 | Phase TBD | Pending |
| RES-05 | Phase TBD | Pending |
| RES-06 | Phase TBD | Pending |
| RES-07 | Phase TBD | Pending |
| RES-08 | Phase TBD | Pending |
| RES-09 | Phase TBD | Pending |
| RES-10 | Phase TBD | Pending |
| RES-11 | Phase TBD | Pending |
| SYN-01 | Phase TBD | Pending |
| SYN-02 | Phase TBD | Pending |
| SYN-03 | Phase TBD | Pending |
| SYN-04 | Phase TBD | Pending |
| DEP-01 | Phase TBD | Pending |
| DEP-02 | Phase TBD | Pending |
| DEP-03 | Phase TBD | Pending |
| DEP-04 | Phase TBD | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 0
- Unmapped: 48 ⚠️

---
*Requirements defined: 2026-02-16*
*Last updated: 2026-02-16 after initial definition*
