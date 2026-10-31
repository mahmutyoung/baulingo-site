# Local website review

Run `npm run dev` and open `http://127.0.0.1:4173/dev/review/`. For the current local session use `http://127.0.0.1:4180/dev/review/` (`npm run dev -- --port 4180`). The sibling `german-visual-mvp` Studio supplied the interaction pattern; no app code or dependencies were imported.

## Review flow

1. Choose a recent change in **Review my work**. The latest registered change is first. Read its summary and optional Before / after details.
2. Follow the numbered stops, or navigate normally inside the real website preview. Use Desktop, Phone (390 px) or Small phone (320 px), Reload preview, or Open separately.
3. For DTZ, the section shortcuts provide sample listening, reading, writing, speaking and results without waiting for the continuous recording. These are example states, not completed learner work or evidence of exam correctness.
4. Enter a note and choose Approved or Save note. Feedback stays in `.dev/website-review.json`, excluded from Git and publication. Decisions apply only to that stop and captured source fingerprint. Earlier-source decisions are labeled accordingly. Saving does not trigger agent work, mark unrelated parts approved or authorize deployment.
5. After edits, select **Refresh changes**. It rebuilds the static preview in a fresh Node worker so generated content/templates and sample answers update together. Refresh does not run tests. Saving against newer source with an older preview is rejected. If server/middleware code changes, restart the dev server too.

Draft notes survive switching stops/changes within the page session. They are not saved across a page reload unless submitted. Failed saves and newer text typed during a pending save remain in the editor. The last selected change/stop is a convenience stored in browser session storage.

Each main section, article, form, question and dialog has a **+** comment button in the preview, including dynamically rendered exercises and open dialogs. Select one to name the target above the editor. Component notes save its page path, DOM selector, readable label and an additional whole-site source fingerprint. Drafts are separate for each component and whole stop. Use **Tüm durak için yorum** to clear the target, or disable **Bileşen yorumları (+)** to walk through without overlays. Component approvals never approve the whole stop. These controls appear only inside the review iframe; opening a preview separately remains a normal isolated walkthrough without annotation controls.

The three owner notes from 31 October were applied locally: collapse the phone navigation, remove the header's free-resource link, and remove the final sentence of the DTZ pre-start panel. The original notes remain intact, labeled applied locally and awaiting review; no approval was recorded on the owner's behalf.

The preview replaces localStorage with a private in-memory store before website modules initialize. It never reads or alters the normal saved DTZ attempt. Links retain the sandbox marker through legal pages and back. Each walkthrough stop reloads its own sample; iframe state is not durable learner progress. Normal website tabs remain normal.

## Source and boundaries

- `dev/review/changes.json` is the maintained change catalog. Record the newest visible change first with an honest summary, Before / after wording, relevant source/media files and concrete walkthrough stops. The summaries are authored handoffs, not an automatic Git diff; historical screenshots are not archived.
- `dev/review/index.html`, CSS and JavaScript provide the workspace and isolated preview bridge. `scripts/review-server.mjs` owns local endpoints/notes/fingerprints; `scripts/review-rebuild.mjs` and `review-build.mjs` rebuild in a fresh module context.
- Only normal development mode enables `/dev/review/`. `npm run preview` and `--production` return 404 for review endpoints. The public static allowlist contains none of the tool, catalog or feedback files. No deployed domain or new hosting project is needed.
- Development responses permit same-origin iframes. Public `_headers` and production-style preview retain their frame protections. Review routes accept loopback hosts only; saves/refresh require the same origin, JSON and bounded request bodies. Writes are serialized and atomic, stale approvals rejected, and unreadable saved notes preserved rather than replaced.
- Annotated local previews, including legal pages, use the dev response CSP so the local bridge can run. Normal pages keep their original meta CSP; neither legal source HTML nor production protections are changed by annotation serving.
- The source list is explicit. Include changed shared code and media when maintaining a catalog entry; the tool does not infer every affected page automatically. Refresh rebuilding does not prove that all relevant checks passed.

## Verification

Automated tests check development-only routes/public exclusion, same-origin writes, payload limits, persistence, stale source/build rejection, corrupt-data preservation and legal-link markers. A temporary copy of explicit sources proves that two successive worker builds pick up changed topic templates/content and changed DTZ answer keys. Browser checks cover six DTZ shortcuts, unchanged normal storage, local note saves, draft retention after navigation/errors and during pending saves, privacy/impressum → home → DTZ isolation, and responsive preview controls. Browser verification uses a separate scratch feedback file; it does not add test notes to the owner's review file.

31 October component feedback verification: all 34 Node tests and the public build passed. Browser checks covered 320/390/1440 px navigation, Escape, real link navigation, no-JavaScript fallback, the shortened DTZ introduction, component note persistence/draft switching, annotation visibility controls, legal-page annotations, and an actual pointer click on a comment button inside a modal. Desktop and phone screenshots were inspected. The original three owner notes remained unchanged in number; test notes went to a separate scratch store. No deployment was performed.

Saved reviews have Edit and Delete controls. Edits retain the original target and source version; deletion requires confirmation. Concurrent changes to a note are rejected instead of overwritten. Historical Needs changes decisions remain visible.
