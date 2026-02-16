# What-and-how-to-build

Build a small, “skip overthinking” decision app that turns a messy choice into a clear, explainable ranking using MCDA with a weighted decision matrix. Users define a decision, add options, define criteria, rate each option per criterion, assign criterion importance (weights), then view an interactive results page with a radar chart and a compact ranking table. The whole product should feel fast, calm, and utilitarian with a slight Anthropic vibe: clean typography, restrained color accents, and sensible defaults that prevent accidental self-deception.

## Non-negotiable UX invariant

### Higher is always better (everywhere)

Across the entire UI (matrix, charts, tables, summaries), **higher values must always mean “better / more desirable.”** Users must never have to mentally flip axes on the radar chart.

This is achieved by treating all criterion scores as a **desirability score** on the same scale:

* **Desirability scale is always 1–20**
* **1 = worst, 20 = best**
* **0 is never allowed or shown anywhere**
* For “neutral”, use a subtle hint: **Neutral ≈ 10–11** (do not force a default)

If a criterion is conceptually “lower is better” (cost, time, risk), the user-facing criterion should preferably be phrased positively (Affordability, Speed, Safety). If a criterion is entered as raw numbers in real units, the system converts it to 1–20 desirability automatically (details below).

---

## Core product flow and rules

The UI is a step-gated wizard with persistent tabs. Users can always go backward to any completed step, but cannot jump forward into steps that depend on missing prerequisites.

1. **Decision setup**
   Title required. Description and icon optional. This creates the decision record.

2. **Options**
   At least **2 options** required. Each option: title required, description/icon optional. Option ordering is user-controlled.

3. **Criteria**
   Define non-trivial criteria (properties). Each criterion has:

   * title (required), description (optional), order
   * a criterion **type** (see “Criteria templates and typed inputs” below)
   * **desirability semantics**: scores are interpreted as “higher is better” in all views

Minimum: at least 1 criterion, but for a radar chart you want 3+ criteria to avoid degenerate shapes.

4. **Ratings**
   Matrix editor: options × criteria. Cells default to **unset** (blank), not auto-filled.

   Ratings input depends on criterion type:

   * Default criteria: users enter **1–20** desirability directly
   * Typed numeric criteria: users enter **raw values** (ex: 843 AED), system derives **1–20** desirability
   * Boolean/enum criteria: users select values, system maps to **1–20** desirability

Never allow 0 anywhere in the product.

You must warn when data is too incomplete, but do not block progress unless it is truly unusable. A good rule:

* prominent warning if an option’s **Coverage** (filled weight coverage) is below a threshold (example 70%)
* softer warning if a criterion has too many blanks across options

5. **Weights (importance)**
   Each criterion gets an importance weight (simple integer scale is fine, like 1–10). Normalize weights in scoring. Step 6 is locked until every criterion has a weight.

6. **Results**
   The results page is the “end” of the wizard, but the whole decision remains editable. Results update live as the user changes anything.

---

## Criteria templates and typed inputs (new, important)

### Goal

Provide a quick “template picker” when creating a criterion, so users can choose:

* simple recommended desirability criteria (still 1–20 input), or
* “measured” criteria that accept real-world raw values (currency, time, distance, etc.) and are **automatically converted** into 1–20 desirability for scoring and charts.

### Template picker UX

In the “Create criterion” UI:

* Section A: **Recommended criteria** (simple, 1–20 desirability)
* Section B: **Measured criteria** (raw numeric + unit selector + conversion)

Keep the catalog small and high-leverage. This should feel like a shortcut, not a feature matrix.

#### Recommended criteria examples (1–20 desirability)

Affordability, Value for money, Ease of use, Speed, Reliability, Maintainability, Flexibility, Safety (low risk), Comfort, Aesthetic fit, Support quality, Long-term upside.

If the user types a “negative” concept like “Cost”, suggest a positive equivalent:

* “Cost” → “Affordability”
* “Time” → “Speed”
* “Effort” → “Ease”
* “Risk” → “Safety”
  Copy hint example under the input:
* “Scores are desirability: 20 is best, 1 is worst.”

#### Measured criteria examples (raw numeric + unit)

Cost (currency), Time (min/h/days), Distance (km/miles), Size/Height/Length (cm/m/in), Weight (kg/lb), Storage (GB/TB), Battery life (hours), Noise (dB), Energy use (kWh), Emissions (g/km), Latency (ms).

Units are primarily visual. No currency conversion is required in v1; users pick a unit for clarity and consistency.

### Raw vs derived storage

For measured criteria, store **both**:

* raw value(s) the user entered (for transparency and editing)
* derived desirability score in **1–20 (decimals allowed)**

All scoring, radar charts, and default result views use the **derived desirability**, so “higher is better” stays true everywhere.

### Live derivation for measured numeric criteria

For a numeric criterion, for the set of raw values across options of that criterion:

* `xmin = min(raw)` and `xmax = max(raw)` (over options that are set)

Derive desirability `d ∈ [1..20]` (decimals allowed):

If higher is better:

* `d = 1 + 19 * (x - xmin) / (xmax - xmin)`

If lower is better:

* `d = 1 + 19 * (xmax - x) / (xmax - xmin)`

Edge case:

* if `xmax == xmin`, set `d = 10.5` (neutral)

Important note shown in “Advanced”:

* “Derived scores are relative to the current option set. Adding an option can change the mapping.”

Optional (later, if needed): “Lock range”

* allow locking `xmin/xmax` manually or “lock current range”
* prevents remapping when adding options later

### Boolean and enum criteria mapping

Support fast input types:

* boolean: default mapping yes → 20, no → 1 (optional alternative: no → 10.5)
* enum: map choices to fixed desirability values (example: Poor/OK/Great → 6/12/18) or allow custom mapping

All mappings must preserve “higher is better.”

---

## Scoring methods and how to present them

Use **WSM** (Weighted Sum Model) as the primary, default scoring. **WPM** (Weighted Product Model) exists as a strict robustness check and is never the default.

**All methods operate on the derived desirability score `d` in 1–20, not on raw values.**

### Normalization for scoring

Let `d` be desirability (1–20, decimal allowed).

**WSM normalization (allows 0 internally):**

* `s_wsm = (d - 1) / 19`
* score: `Score_wsm = Σ(w_i' * s_wsm_i)`

**WPM normalization (strictly positive internally, no epsilons):**

* `s_wpm = d / 20` (so 1 maps to 0.05, never 0)
* score: `Score_wpm = Π(s_wpm_i ^ w_i')`

### Missing ratings remain blank

Do not silently treat blanks as 1 or neutral. Instead:

* Compute completeness per option:
  `Coverage = Σ(weights of filled criteria) / Σ(all weights)`
* Offer an explicit action: **“Fill missing with Neutral (10)”** for speed
* In results, show a small “Coverage” badge per option and warn when low

### Where WPM lives in the UX

Results page only:

* Main view: WSM ranking and explanation.
* Under it: compact badge: “WPM agrees ✅” or “WPM differs ⚠️”.
* If differs, show top-3 under WPM inline, plus an expander “View strict check” that reveals full WPM ranking and per-criterion contributions.

This provides the benefit of WPM without turning the app into a math settings panel.

---

## Results UI details

**Final results page contains two main widgets:**

1. **Radar chart** 📊
   Spokes are criteria. Each option is a shape showing its **desirability** across metrics. Display values on the native **1–20** scale. Add a subtle ring or label: **Neutral ≈ 10–11**.

Radar charts collapse when there are fewer than **3 criteria**, not fewer than options. Implement:

* If criteria ≥ 3: standard pointy radar polygons.
* If criteria = 2: switch to a circular “dual-metric dial” style (two axes is not a polygon).
* If criteria = 1: show a simple comparison bar instead of a radar.

Interactivity:

* hover reveals per-criterion desirability (and optionally raw value in a tooltip for measured criteria)
* click an option focuses it (dim others)
* optional toggle “Show raw values” appears only when measured criteria exist (kept off by default)

2. **Final rankings table**
   Default to minimal: option name, score, rank, coverage badge, plus a small “why” expander. Avoid dumping the whole matrix by default.

Toggles/expanders:

* “Show contributions” (weight × normalized score)
* “Show raw inputs” (only if measured criteria exist)
* “View strict check” (WPM details) when applicable

---

## Export and import (deferred to later phase)

Do not include export/import in the initial core execution scope. Keep this as a later-phase enhancement (aligned with deferred portability requirements).

When implemented later, export should include:

* decision metadata
* options
* criteria including type/template configuration (units, mapping settings, locked range if any)
* ratings including raw values (when applicable) and derived desirability scores
* weights
* scoring settings (WSM default, WPM check preferences)
* schema version

When implemented later, import should:

* validate schema version
* default to “import as new decision” to avoid conflicts
* optionally allow “import into current decision” later, but only with clear conflict handling

---

## Auth and syncing model

Login is optional but recommended.

* If logged in, all state syncs live with Convex. Users can resume any half-finished decision later.
* If not logged in, keep state locally (localStorage) and rely on export/import for portability.

Security rules:

* Treat the frontend as fully public. No secrets, no privileged keys.
* Every backend function verifies ownership by `userId` when authenticated.
* Anonymous usage is local-only in v1. Do not store anonymous decisions server-side unless you implement secure, unguessable IDs and strict access rules (not needed for v1).

---

## Stack and constraints

**Hosting:** GitHub Pages SPA. Perfectly fine for low traffic.

* Use hash routing to avoid refresh 404s.
* Set Vite base path to `/<repo>/` so assets load correctly.
* Deploy static build via GitHub Actions.

**Frontend:** React + Vite + TypeScript SPA.

* Keep file complexity low. Prefer a small set of feature folders over deep architecture.

**UI system:**

* Tailwind CSS for styling
* shadcn-style component conventions, but **Base UI everywhere**
* No Radix at any point, including transitive dependencies in primitives you choose
* Icon library: choose one consistent set (Lucide is a good default) and stick to it
* Design target: utilitarian, calm, slightly playful color accents, “Anthropic-like” clarity

**Charts:**

* Choose a chart approach that supports radar (criteria ≥ 3) and clean fallbacks (criteria 1–2).
* If a library cannot support the required fallbacks well, implement radar/dial/bar with minimal custom SVG.

**Package manager:**
If a package manager is needed, use **Bun only**.

* scripts: `bun dev`, `bun run build`, `bun run lint`, `bunx` as needed

---

## Data model in Convex (update)

Keep the schema simple and explicit, but extend it to support typed criteria.

Core:

* decisions: userId?, title, description?, icon?, createdAt, updatedAt, scoringPrefs
* options: decisionId, title, description?, icon?, order
* criteria: decisionId, title, description?, order, weight, **type**, **templateConfig**
* ratings: decisionId, optionId, criterionId, updatedAt, **rawValue**, **derivedDesirability (1–20 decimal)**

Suggested criterion fields:

* `type`: `rating_1_20 | numeric | boolean | enum`
* `templateConfig` examples:

  * numeric: unitKind, unit, rawDirection (higherBetter boolean), lockedMin?, lockedMax?
  * enum: choices[], mapping[] (or fixed mapping rule)
  * boolean: mappingYes, mappingNo (defaults to 20/1)

Indexes for fast loads:

* by decisionId on options/criteria/ratings
* by (optionId, criterionId) for matrix reads

Cascade rules:

* deleting an option deletes its ratings
* deleting a criterion deletes its ratings

Derivation recompute rule (simple and safe):

* when a raw numeric rating changes for a criterion, recompute `derivedDesirability` for that criterion across options using current min/max (or locked range)

---

## Implementation priorities (minor update)

The first (main) phases should ship at minimum:

* full wizard
* criteria templates (at least: recommended + numeric cost/time/distance)
* typed rating inputs (raw + derived)
* live matrix editing
* WSM results with explainability
* optional auth with live sync
* WPM strict check UI expansion

Later phases can add (features that are not highly relevant for the core project):

* export/import JSON
* “lock range” for measured criteria if users need stability
* sensitivity hints and nicer chart polish

Keep the core promise: make decisions clearer, not more complicated.
