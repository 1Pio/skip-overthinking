# Phase 5: Persistence, Auth, and Sync Security - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can safely persist decisions in local-only anonymous mode or authenticated live sync mode with ownership guarantees. Delivers dual-mode persistence (local vs Convex), auth entry/switching UX, a decision workspace/dashboard, and secure backend operations with ownership enforcement.

</domain>

<decisions>
## Implementation Decisions

### Auth mode entry and switching
- Show auth choice on **first app launch** with clear, compact communication that it's 100% optional and only a quality-of-life upgrade for persistent live synced storage
- Users can create decisions without login, treated like projects, and always have option to sign in/out anytime
- **Three-part architecture:**
  - Frontend: 100% frontend, nothing else
  - Local storage: When signed in → merge old things + cache only; When not signed in → source of truth
  - Full backend + auth (Convex): When signed in → only source of truth; When not signed in → not active
- Current auth mode displayed as **subtle footer** status
- **Decision workspace/dashboard page:** Users organize decisions as separate cards (like projects). Sign in/out at top right with settings button that opens centered popup/modal (click outside or X to dismiss). Settings contain: log in/out, account deletion, future style changes. No account name or profile picture, placeholder icon for account
- Sign in/out actions: Within decisions → sticky footer area. Workspace → top right
- **Merge on sign-in:** When signing in, merge local anonymous decisions into authenticated account
- **Merge conflicts:** Multiple decisions can have identical fields (including names) — identified by UUID. If UUIDs conflict, regenerate local UUID before merging
- **Sign out:** Locally clear everything (all decisions and auth tokens). Server data preserved — nothing deleted from account
- **Merge notification:** Toast notification after merge: "X decisions merged into your account"

### Local persistence strategy
- Use **localStorage API** for anonymous decision storage (simple, synchronous, 5-10MB limit)
- **Storage structure:** Claude's discretion — should align with (1) lightweight source of truth when not signed in, (2) lightweight optimal cache when signed in, (3) directly merge/map to Convex backend structure
- **Retention:** Indefinite — keep forever until user explicitly deletes, no automatic expiration
- **Storage full:** Warn and guide — show warning toast explaining limit, guide user to delete older decisions or sign in

### Auth provider and UX
- **Login methods:** Email, Google, GitHub (all three via Convex Auth if supported)
- **Sign-in flow:** Modal from anywhere — clicking auth status anywhere opens sign-in modal
- **Sign-in modal content:**
  - Above auth methods: Clear, compact statement of why sign-in is beneficial
  - Auth buttons: Email, Google, GitHub (clean, minimal, simple, effortless)
  - Below options: Small, slightly grayed out expandable text with notes about what/how/where gets saved
  - Data location preference: Europe if possible when setting up Convex
- **Auth provider:** Convex Auth (native auth provided by Convex directly)

### Sync and conflict handling
- **Sync timing:** Use Convex's default live sync behavior (sync on every change as per Convex best practices)
- **Sync status:** Quiet sync — no visible status, let Convex handle invisibly, only show errors
- **Offline behavior:** Graceful degradation — continue working with local cache, queue changes, auto-sync on reconnect transparently
- **Sync errors:** Persistent warning banner at top until sync succeeds

### Claude's Discretion
- LocalStorage key structure and data organization (best practices for lightweight storage that mirrors Convex backend shape)
- Exact toast/modal designs, spacing, and typography
- Settings modal content organization and flow
- Decision workspace/dashboard card design and interactions

</decisions>

<specifics>
## Specific Ideas

- Keep auth messaging clear and compact — it's optional, just a quality-of-life upgrade
- User mentioned "effortless" multiple times — minimize friction in auth flow
- Data should be able to migrate cleanly between local and Convex without loss or corruption
- Europe data center preference for Convex deployment

</specifics>

<deferred>
## Deferred Ideas

- Future style customization via settings (noted for later)
- Decision workspace/dashboard organization features beyond basic list

---

*Phase: 05-persistence-auth-and-sync-security*
*Context gathered: 2026-02-18*
