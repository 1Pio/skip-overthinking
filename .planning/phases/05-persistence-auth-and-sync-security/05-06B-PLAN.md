---
phase: 05-persistence-auth-and-sync-security
plan: 06B
type: execute
wave: 2
depends_on:
  - 05-01
  - 05-02B
  - 05-06
files_modified:
  - src/app/App.tsx
  - src/features/workspace/Workspace.tsx
  - package.json
autonomous: true
requirements:
  - SYN-02
  - SYN-01
user_setup: []

must_haves:
  truths:
    - "Sync banner is integrated at top of app"
    - "User sees warning toast when localStorage is nearly full"
  artifacts:
    - path: "src/app/App.tsx"
      provides: "App with SyncBanner integration"
    - path: "src/features/workspace/Workspace.tsx"
      provides: "Workspace with quota warning toast"
  key_links:
    - from: "src/app/App.tsx"
      to: "src/features/auth/sync/SyncBanner.tsx"
      via: "SyncBanner component in app layout"
      pattern: "<SyncBanner"
    - from: "src/features/workspace/Workspace.tsx"
      to: "src/features/auth/storage/local.storage.ts"
      via: "getStorageWarning quota check"
      pattern: "getStorageWarning\\(\\)"
---

<objective>
Integrate sync banner into app and add localStorage quota warning toast.

Purpose: Complete sync error handling UI integration (SYN-02) and guide users before hitting storage limit (SYN-01).
Output: App with sync banner at top and quota warning toast in workspace.
</objective>

<execution_context>
@C:/Users/aaron/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/aaron/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/features/auth/sync/SyncBanner.tsx
@src/features/auth/storage/local.storage.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Integrate sync banner into app</name>
  <files>
    - src/app/App.tsx
  </files>
  <action>
    Update src/app/App.tsx:

    1. Import SyncBanner from "../features/auth/sync"

    2. Add SyncBanner to app layout:
    - Place at top of app, before RouterProvider
    - Should be fixed at top of viewport
    - Structure: <AuthProvider><SyncBanner /><RouterProvider ... /></AuthProvider>

    3. Styling:
    - Ensure banner doesn't overlap with important content
    - Add padding or margin to account for banner height
    - Or use z-index to ensure banner is above content

    IMPORTANT: Sync banner should be visible above all content when there's a sync error.
  </action>
  <verify>
    - src/app/App.tsx imports SyncBanner
    - SyncBanner is placed above RouterProvider
    - Banner is fixed at top of viewport
    - Content has appropriate spacing for banner
  </verify>
  <done>
    Sync banner is integrated into app layout.
  </done>
</task>

<task type="auto">
  <name>Task 2: Add localStorage quota warning toast</name>
  <files>
    - src/features/workspace/Workspace.tsx
    - src/app/App.tsx
    - package.json
  </files>
  <action>
    Add localStorage quota warning toast:

    1. Choose toast library:
    - If app already has a toast library, use it
    - Otherwise, install sonner: `bun add sonner`
    - Add Toaster component to App.tsx

    2. Add quota check in Workspace component:
    - Use useEffect to periodically check storage quota
    - Call getStorageWarning() from local.storage.ts
    - If warning exists: Show toast with warning message

    3. Warning messages (from storage utils):
    - At 90% full: "Storage is nearly full. Delete older decisions or sign in for cloud storage."
    - At 80% full: "Storage is getting full. Consider deleting older decisions."

    4. Toast behavior:
    - Show warning toast only once per session (or with debounce)
    - Use toast.warning() for warning messages
    - Toast is dismissible

    IMPORTANT: Quota warnings guide users to delete decisions or sign in before hitting hard limit.
  </action>
  <verify>
    - Toast library is installed if needed
    - Toaster component is in App.tsx
    - Workspace checks storage quota on mount
    - Warning toast shows at 80%/90% thresholds
    - Toast shows appropriate message
    - Warning appears only once per session
  </verify>
  <done>
    LocalStorage quota warning toast guides users to free space.
  </done>
</task>

<task type="auto">
  <name>Task 3: Verify integration</name>
  <files>
    - src/app/App.tsx
  </files>
  <action>
    Verify the integration:

    1. Confirm sync banner is properly integrated at top of app
    2. Confirm Toaster component is present for toast notifications
    3. Confirm banner and toast don't interfere with each other
    4. Confirm both components work independently

    No code changes needed - just verification step.
  </action>
  <verify>
    - App.tsx structure is correct
    - SyncBanner and Toaster are properly placed
    - Components don't overlap or interfere
  </verify>
  <done>
    Sync banner and quota warning integration is verified.
  </done>
</task>

</tasks>

<verification>
- Sync banner shows persistent warning when errors occur
- Banner can be dismissed or retried
- Banner is fixed at top of app
- localStorage quota warnings show toast at 80%/90%
- Toast is dismissible
- Banner and toast don't interfere with each other
</verification>

<success_criteria>
- Sync errors are visible in persistent banner
- User can dismiss or retry sync errors
- Quota warnings guide users before hitting limit
- All requirements SYN-01 and SYN-02 are addressed at the integration level
</success_criteria>

<output>
After completion, create `.planning/phases/05-persistence-auth-and-sync-security/05-06B-SUMMARY.md`
</output>
