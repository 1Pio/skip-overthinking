---
phase: 05-persistence-auth-and-sync-security
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/auth/storage/utils.ts
autonomous: true
requirements:
  - SYN-01
  - SYN-04
user_setup: []

must_haves:
  truths:
    - "LocalStorage quota warnings are shown when approaching 5MB limit"
  artifacts:
    - path: "src/features/auth/storage/utils.ts"
      provides: "LocalStorage quota checking and key management"
      exports: ["checkQuota", "getStorageUsed", "generateDecisionId"]
  key_links:
    - from: "src/features/auth/storage/utils.ts"
      to: "localStorage"
      via: "quota calculation"
      pattern: "JSON\\.stringify\\(.*\\)\\.length"
---

<objective>
Implement utility functions for quota checking and UUID generation.

Purpose: Enable localStorage quota management and unique decision ID generation (SYN-01, SYN-04).
Output: Utility functions for quota checking, storage warning thresholds, and UUID generation.
</objective>

<execution_context>
@C:/Users/aaron/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/aaron/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement utility functions for quota and UUID</name>
  <files>
    - src/features/auth/storage/utils.ts
  </files>
  <action>
    Create src/features/auth/storage/utils.ts:

    1. generateDecisionId(): string
       - Generate UUID using crypto.randomUUID() or fallback to a simple random implementation
       - Return UUID string

    2. getStorageUsed(): number
       - Iterate through all localStorage keys
       - Calculate total bytes used (UTF-16 string length * 2)
       - Return bytes used

    3. checkQuota(additionalBytes: number = 0): { safe: boolean; used: number; limit: number; remaining: number }
       - Calculate limit: 5 * 1024 * 1024 (5MB)
       - Call getStorageUsed() to get current usage
       - Add additionalBytes to current usage
       - Calculate remaining: limit - (used + additionalBytes)
       - If remaining < 0: safe: false (would exceed quota)
       - Else: safe: true

    4. getStorageWarning(): { showWarning: boolean; message: string } | null
       - Call checkQuota() with 0 additional bytes
       - If used > limit * 0.9 (90% full):
         - showWarning: true
         - message: "Storage is nearly full. Delete older decisions or sign in for cloud storage."
       - Else if used > limit * 0.8 (80% full):
         - showWarning: true
         - message: "Storage is getting full. Consider deleting older decisions."
       - Else: null

    5. formatBytes(bytes: number): string
       - Convert bytes to human-readable format (KB, MB)
       - Return formatted string with 1 decimal place

    IMPORTANT: The 5MB limit is a typical localStorage limit. The warning thresholds (80%, 90%) give users time to act.
  </action>
  <verify>
    - src/features/auth/storage/utils.ts exists
    - generateDecisionId creates unique identifiers
    - getStorageUsed calculates total localStorage bytes
    - checkQuota returns safe flag with usage details
    - getStorageWarning returns warning at 80%/90% thresholds
    - formatBytes converts bytes to readable format
  </verify>
  <done>
    Utility functions for quota checking and UUID generation are implemented.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update storage index to export utils</name>
  <files>
    - src/features/auth/storage/index.ts
  </files>
  <action>
    Update src/features/auth/storage/index.ts to include utility exports:

    Add to localStorageService object:
    - generateDecisionId
    - checkQuota
    - getStorageWarning
    - formatBytes

    This completes the public API with quota management utilities.
  </action>
  <verify>
    - src/features/auth/storage/index.ts exists
    - localStorageService exports generateDecisionId
    - localStorageService exports checkQuota
    - localStorageService exports getStorageWarning
    - localStorageService exports formatBytes
  </verify>
  <done>
    LocalStorage service API includes quota management utilities.
  </done>
</task>

</tasks>

<verification>
- UUID generation creates unique decision IDs
- Quota checking warns at 80%/90% of 5MB limit
- Storage utility functions are exported from public API
</verification>

<success_criteria>
- Quota warnings guide users before hitting storage limit
- UUID generation provides unique decision identifiers
- All requirements SYN-01 and SYN-04 are addressed at the utility level
</success_criteria>

<output>
After completion, create `.planning/phases/05-persistence-auth-and-sync-security/05-02B-SUMMARY.md`
</output>
