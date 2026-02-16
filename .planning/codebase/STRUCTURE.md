# Codebase Structure

**Analysis Date:** 2026-02-16

## Directory Layout

```
skip-overthinking/
|-- .planning/                         # Planning artifacts and generated codebase mapping docs
|   |-- codebase/                      # Architecture/structure/convention/testing/concerns references
|   `-- pre-execution-project-research/# Pre-build requirements and product definition docs
|-- .git/                              # Git metadata and object database
|-- .gitignore                         # Git ignore configuration (currently empty)
`-- LICENSE                            # Repository license (MIT)
```

## Directory Purposes

**`.planning/`:**
- Purpose: Central location for planning-time documents consumed by orchestration workflows.
- Contains: `codebase/` mapping outputs and `pre-execution-project-research/` requirement docs.
- Key files: `.planning/pre-execution-project-research/What-And-How-To-Build.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`

**`.planning/pre-execution-project-research/`:**
- Purpose: Store high-level product and implementation intent before code exists.
- Contains: Narrative specification markdown documents.
- Key files: `.planning/pre-execution-project-research/What-And-How-To-Build.md`

**`.planning/codebase/`:**
- Purpose: Store machine- and human-consumable repository maps for planning/execution commands.
- Contains: Generated codebase reference docs.
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`

## Key File Locations

**Entry Points:**
- `.planning/pre-execution-project-research/What-And-How-To-Build.md`: Current authoritative entry point for project behavior and architecture intent.

**Configuration:**
- `.gitignore`: Repository ignore configuration.
- `.git/config`: Local git repository configuration.

**Core Logic:**
- Not detected; no application logic files currently exist in `src/`, `app/`, or `server/` paths.

**Testing:**
- Not detected; no test configuration (`jest.config.*`, `vitest.config.*`) or test files (`*.test.*`, `*.spec.*`) are present.

## Naming Conventions

**Files:**
- Root metadata files use conventional names: `.gitignore`, `LICENSE`.
- Planning docs use markdown with descriptive names, including title-cased hyphenated file naming in `.planning/pre-execution-project-research/What-And-How-To-Build.md`.

**Directories:**
- Hidden system/project directories start with a dot (`.planning`, `.git`).
- Planning directory names are kebab-case or command-oriented (`pre-execution-project-research`, `codebase`).

## Where to Add New Code

**New Feature:**
- Primary code: Not established yet; create a top-level runtime directory (recommended `src/`) and place feature code under `src/features/<feature-name>/`.
- Tests: Not established yet; colocate tests as `*.test.ts(x)` beside source files or add `tests/` once a runner is chosen.

**New Component/Module:**
- Implementation: Create under a newly introduced source root (recommended `src/components/` for UI modules or `src/modules/` for domain modules).

**Utilities:**
- Shared helpers: Use `src/lib/` or `src/utils/` after source tree initialization; keep path choice consistent once selected.

## Special Directories

**`.git/`:**
- Purpose: Internal version-control data store.
- Generated: Yes.
- Committed: No.

**`.planning/`:**
- Purpose: Planning and mapping documents used by orchestrated workflows.
- Generated: Mixed (some files authored, some generated).
- Committed: Yes.

---

*Structure analysis: 2026-02-16*
