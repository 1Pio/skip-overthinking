# Phase 4: Results and Explainability - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver trustworthy, interpretable results presentation for existing scoring outputs: compact default WSM ranking, strict secondary WPM check, adaptive visuals by criteria count, and option-level explainability interactions.
This phase clarifies presentation and interpretation behavior, not new scoring capabilities.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<specifics>
## Specific Ideas

- Difference between WSM and WPM should be noticeable but effortless, and explicitly not framed as "bad."
- Expanded WPM disagreement view should feel like a purposeful perspective switch, not just a minor detail panel.
- Explainability breakdown should feel clean and low-friction.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 04-results-and-explainability*
*Context gathered: 2026-02-18*
