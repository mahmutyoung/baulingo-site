# Local website review workspace

The owner requested the `german-visual-mvp` review pattern: latest change summaries beside a guided walkthrough of the actual website, with saved review notes.

- Serve `/dev/review/` only from development mode. Keep production-style preview and the public allowlist unchanged.
- Maintain a small source catalog of recent changes with before/after wording and walkthrough stops, clearly distinguished from historical screenshots or automatic Git diffs.
- Embed the real website with desktop/phone widths and DTZ section shortcuts. A development-only bridge uses isolated in-memory storage and sample progress, preserving normal learner attempts.
- Save per-stop notes and approved/needs-changes decisions to ignored `.dev/website-review.json`. Fingerprint source versions and reject stale writes. Feedback never starts an agent or authorizes deployment.
- Preserve production CSP/frame protections. Development may allow same-origin framing. Review endpoints reject foreign hosts/origins, excessive request bodies and unknown changes; unreadable feedback must never be overwritten.

Implementation: write failing HTTP/boundary tests; implement native HTML/CSS/JS review source and middleware; hook normal dev startup; document maintenance; run tests/build and browser checks; restart the existing local server on 4180. No dependencies, publication, commits or sibling-repository edits.

Review focus: production exclusion, attempt isolation, explicit sample-state labels, drafts preserved on failed saves, and approvals bound to the captured source version.

Completion evidence: 30/30 tests and real browser walkthrough/isolation/feedback checks passed. Independent review identified source-vs-build coherence, legal-navigation escape and pending-save draft loss; all were repaired and rechecked. Fresh-worker tests demonstrate new generated text and sample answers after source edits. No publication or sibling-repository edits.
