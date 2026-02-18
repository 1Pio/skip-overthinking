---
phase: 05-persistence-auth-and-sync-security
plan: 03B
type: execute
wave: 2
depends_on:
  - 05-01
  - 05-03
files_modified:
  - src/features/auth/components/SettingsModal.tsx
  - src/features/auth/components/AuthFooter.tsx
  - src/features/auth/components/index.ts
autonomous: true
requirements:
  - SYN-02
user_setup: []

must_haves:
  truths:
    - "User can access settings modal to sign out or delete account"
    - "Footer shows current auth mode (local-only or authenticated) subtly"
    - "Modals can be dismissed by clicking outside or X button"
  artifacts:
    - path: "src/features/auth/components/SettingsModal.tsx"
      provides: "Settings modal with sign-out and account deletion"
      contains: "SettingsModal"
    - path: "src/features/auth/components/AuthFooter.tsx"
      provides: "Footer showing current auth mode"
      contains: "AuthFooter"
    - path: "src/features/auth/components/index.ts"
      provides: "Export auth components"
  key_links:
    - from: "src/features/auth/components/SettingsModal.tsx"
      to: "convex/auth"
      via: "signOut and deleteAccount methods"
      pattern: "signOut\\(\\)|deleteAccount\\(\\)"
    - from: "src/features/auth/components/AuthFooter.tsx"
      to: "src/features/auth/auth.context.tsx"
      via: "useAuth hook"
      pattern: "useAuth\\(\\)"
---

<objective>
Create settings modal and auth footer components.

Purpose: Provide auth switching UX (SYN-02) with sign-out/delete options and subtle status display.
Output: Settings modal with sign-out/delete and footer showing current auth mode.
</objective>

<execution_context>
@C:/Users/aaron/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/aaron/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/features/auth/auth.context.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create settings modal component</name>
  <files>
    - src/features/auth/components/SettingsModal.tsx
  </files>
  <action>
    Create src/features/auth/components/SettingsModal.tsx:

    1. Import useAuth from auth.context.tsx

    2. Component interface:
       - isOpen: boolean
       - onClose: () => void

    3. Modal layout:
       - Overlay backdrop (click outside to close)
       - Centered modal container
       - X button to close

    4. Modal content:
       - Header: "Settings" title
       - Account section:
         - Placeholder icon for account (no name or picture per user decision)
         - Current email if available (from Convex auth)
       - Actions section:
         - Sign out button: "Sign Out"
         - Account deletion button: "Delete Account" (red/danger color)
       - Future section:
         - Note: "More settings coming soon" (for future style customization)

    5. Action behavior:
       - Sign out: Calls useAuth().signOut(), then onClose()
       - Delete account: Calls useAuth().deleteAccount(), shows confirmation first, then onClose()

    6. Styling:
       - Use Tailwind for layout
       - Sign out button is standard style
       - Delete account button uses red/danger color
       - Good spacing and clean design

    7. Clicking outside backdrop calls onClose()
    8. X button calls onClose()

    IMPORTANT: No account name or profile picture per user decision. Use placeholder icon.
  </action>
  <verify>
    - src/features/auth/components/SettingsModal.tsx exists
    - Modal has overlay and centered container
    - Placeholder icon is used for account
    - Sign out and delete account buttons exist
    - Delete account button uses red/danger color
    - Future settings note is present
    - Click outside or X closes modal
  </verify>
  <done>
    Settings modal provides sign-out and account deletion options.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create auth footer component</name>
  <files>
    - src/features/auth/components/AuthFooter.tsx
  </files>
  <action>
    Create src/features/auth/components/AuthFooter.tsx:

    1. Import useAuth from auth.context.tsx

    2. Footer content:
       - Fixed at bottom of screen or within decision pages (sticky footer area)
       - Subtle, unobtrusive design
       - Shows current auth mode:
         - If authenticated: "Signed in" (with small green indicator or similar)
         - If not authenticated: "Local-only" (with small gray indicator or similar)
       - Clicking footer opens sign-in modal (if not authenticated) or settings modal (if authenticated)

    3. Styling:
       - Use Tailwind for layout
       - Small text, muted colors
       - Subtle hover effect to indicate clickability
       - Fixed at bottom: `fixed bottom-0 w-full` or sticky within page content

    4. Behavior:
       - Click calls useAuth().openSignInModal() or openSettingsModal()
       - No persistent footer in workspace page (workspace has top-right auth button)

    IMPORTANT: Footer is subtle and unobtrusive. Status is communicated with small indicators, not prominent messaging.
  </action>
  <verify>
    - src/features/auth/components/AuthFooter.tsx exists
    - Footer shows current auth mode (signed in vs local-only)
    - Status is subtle with small indicators
    - Clicking opens appropriate modal
    - Styling is unobtrusive and clean
  </verify>
  <done>
    Auth footer shows current auth mode and provides access to auth modals.
  </done>
</task>

<task type="auto">
  <name>Task 3: Export auth components</name>
  <files>
    - src/features/auth/components/index.ts
  </files>
  <action>
    Update src/features/auth/components/index.ts:

    Export all auth components:
    - SignInModal
    - SettingsModal
    - AuthFooter

    Also re-export types if any (e.g., component props interfaces).

    This creates a clean public API for consuming auth components.
  </action>
  <verify>
    - src/features/auth/components/index.ts exists
    - SignInModal is exported
    - SettingsModal is exported
    - AuthFooter is exported
  </verify>
  <done>
    Auth components are exported and ready for use in app.
  </done>
</task>

</tasks>

<verification>
- Settings modal provides sign-out and account deletion options
- Auth footer subtly shows current auth mode
- All modals can be dismissed by clicking outside or X button
- Footer is unobtrusive and provides subtle auth status
</verification>

<success_criteria>
- Settings modal provides sign-out and account deletion
- Footer shows subtle auth status indicator
- All modals are accessible and dismissible
- Requirement SYN-02 is addressed with auth switching UX
</success_criteria>

<output>
After completion, create `.planning/phases/05-persistence-auth-and-sync-security/05-03B-SUMMARY.md`
</output>
