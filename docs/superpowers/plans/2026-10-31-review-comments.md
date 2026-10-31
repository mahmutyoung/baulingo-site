# Review Comments Implementation Plan

> **For agentic workers:** Execute each task independently; verify the affected views before marking it done.

**Goal:** Apply the owner's new review comments across desktop, phone and small phone.
**Architecture:** Retain the static site and local-only review tool; keep language-specific content separate and preserve public-build boundaries.
**Tech Stack:** HTML, CSS, native JavaScript, Node built-in tests.

1. **Homepage cleanup** — In `index.html`, remove the resource banner and unfinished B1 letter link. Remove the language-dialog introduction requested for deletion. Check the homepage at all three widths.
2. **Resources removal** — Inventory resource links, dialog, generated page, downloads and sitemap in `index.html`, `app.js`, `scripts/pages.mjs`, `scripts/public-files.mjs` and docs. Remove the website's free resources section and obsolete links; verify navigation and build. The comment says all platforms; inventory the independent app separately before any app change.
3. **Review feedback controls** — In `dev/review/bridge.js`, `review.js`, `index.html` and `scripts/review-server.mjs`, limit plus buttons to main components, add edit/delete for saved notes, and remove Needs changes from the interface. Preserve existing notes and use isolated scratch data for verification; test persistence and all screen sizes.
4. **DTZ sticky panels** — Update `dtz.css` and player behavior so the reading sticky toolbar reduces to countdown and save/pause after scrolling; compact the speaking sticky panel. Verify both states, scrolling, timer and controls on all widths.
5. **DTZ result** — Remove the new-attempt link and button from the result flow in `scripts/dtz-page.mjs` and `src/dtz/player.js`; verify completion, result and retained data controls.
6. **Topic pages and exercises** — Make grammar and daily-life links open their own pages; replace generic practice with exercises relevant to each topic. Update `index.html`, `scripts/pages.mjs`, `src/exercise.js` and `app.js` as needed. Check each page, exercise and no-JavaScript links.
7. **App information page** — Replace the about popup with a static page describing the open alpha and linking to https://play.google.com/store/apps/details?id=com.baulingo.app. Update generated pages, public routes and footer; test link and responsive layout.
8. **English and language-specific content** — Design Turkish and English routes/content separately, add an English option and browser-language detection with a persistent manual override. Define localized content priorities, translate available pages and check language, links, SEO and fallback behavior. Avoid representing untranslated content as complete.
9. **Final verification** — Run `npm test` and `npm run build`; inspect desktop, phone and small-phone layouts, update relevant docs and review catalog, and preserve the owner's saved comments.
