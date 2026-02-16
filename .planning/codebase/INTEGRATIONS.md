# External Integrations

**Analysis Date:** 2026-02-16

## APIs & External Services

**Backend/Data Platform:**
- Convex - Planned for authenticated cloud sync and backend functions; documented in `.planning/pre-execution-project-research/What-And-How-To-Build.md:248` and `.planning/pre-execution-project-research/What-And-How-To-Build.md:254`.
  - SDK/Client: Not detected in committed manifests/imports (no `package.json` and no source imports present).
  - Auth: `userId` ownership checks are specified in planning doc at `.planning/pre-execution-project-research/What-And-How-To-Build.md:254`; concrete env var names are not defined.

**Hosting/Delivery:**
- GitHub Pages - Planned static SPA hosting in `.planning/pre-execution-project-research/What-And-How-To-Build.md:261`.
  - SDK/Client: Not applicable.
  - Auth: Not applicable.

## Data Storage

**Databases:**
- Not detected in committed code/config.
- Planned: Convex-managed cloud data model described in `.planning/pre-execution-project-research/What-And-How-To-Build.md:291`.
  - Connection: Env var/connection details not defined in committed files.
  - Client: Not detected in committed manifests/imports.

**File Storage:**
- Local filesystem only at repository level; no object/file storage integration is detected.

**Caching:**
- Browser `localStorage` is planned for anonymous mode in `.planning/pre-execution-project-research/What-And-How-To-Build.md:249`.

## Authentication & Identity

**Auth Provider:**
- Provider implementation is not committed.
- Planned: Optional login flow with authenticated `userId` authorization checks in backend functions, as documented in `.planning/pre-execution-project-research/What-And-How-To-Build.md:246` and `.planning/pre-execution-project-research/What-And-How-To-Build.md:254`.
  - Implementation: Authenticated users sync to Convex; anonymous users remain local-only per `.planning/pre-execution-project-research/What-And-How-To-Build.md:248` and `.planning/pre-execution-project-research/What-And-How-To-Build.md:255`.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/etc. manifests, config files, or source imports present).

**Logs:**
- Logging strategy is not defined in committed implementation files.

## CI/CD & Deployment

**Hosting:**
- Planned GitHub Pages target in `.planning/pre-execution-project-research/What-And-How-To-Build.md:261`.

**CI Pipeline:**
- GitHub Actions is planned for static deploy in `.planning/pre-execution-project-research/What-And-How-To-Build.md:265`.
- Committed workflow files are not detected (`.github/workflows/*` not present).

## Environment Configuration

**Required env vars:**
- Not detected in committed code/config (no env schema, no runtime manifest, no `.env*` files detected).
- Backend auth/data references exist conceptually in planning doc (`userId` ownership in `.planning/pre-execution-project-research/What-And-How-To-Build.md:254`) but variable names are unspecified.

**Secrets location:**
- Not detected in repository (no committed secret management config files).

## Webhooks & Callbacks

**Incoming:**
- None detected in committed code/config.

**Outgoing:**
- None detected in committed code/config.

---

*Integration audit: 2026-02-16*
