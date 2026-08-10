# Developer Console Handoff Design

## Goal

Replace the API Docs request-access form with a clear handoff to the Quran.Foundation Developer Console while preserving the existing `/request-access` URL for bookmarks and search results.

## Experience

- Keep the existing API Docs header, typography, colors, and page shell.
- Lead with a short explanation and one primary action: **Create an API app**.
- Link the primary action directly to `https://dev-console.quran.foundation/projects/new`.
- Provide a quieter secondary link for returning developers to manage existing apps.
- Explain the lifecycle in three brief steps: create the app, build in pre-live, request production permissions.
- Give existing clients a direct import action at `https://dev-console.quran.foundation/claims`, while clarifying that pending legacy requests need no action.
- Keep the prominent **Request Access** navbar action linked to the `/request-access` bridge page.
- Send the homepage prerequisite card directly to the Developer Console app-creation flow after briefly explaining what the Console provides.

## Scope

Only the API Docs repository changes. The Developer Console is treated as the destination and is not modified.

## Accessibility and responsive behavior

- Use semantic links, headings, and an ordered list.
- Maintain visible focus states through Docusaurus button/link styles.
- Keep actions usable on narrow screens without horizontal overflow.
- Ensure the page remains understandable without decorative icons.
