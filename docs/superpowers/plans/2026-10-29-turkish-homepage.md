# Turkish Homepage Implementation Plan

Status: historical implementation plan. The core modules, local tooling and approved homepage draft are implemented. The owner wants further development in small steps. See `docs/architecture.md`; this remains a local visual/interaction draft rather than a complete learning library. The unchecked task lists below preserve the original plan.

Latest visual update: the owner supplied a new screenshot and explicitly requested that exact format. `docs/design/homepage.md` and `docs/design/homepage-reference.png` supersede the earlier visual selection. The layout was changed without adding a new product scope. Existing exercise/search behaviour is reused; local evidence is recorded in `design-qa.md`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the selected Turkish-first homepage with a working phrase exercise and useful topic discovery.

**Architecture:** Preserve static HTML/CSS and add native browser modules. Pure exercise/search rules remain separate from DOM rendering. Node scripts preview and build only public files.

**Tech Stack:** HTML, CSS, JavaScript modules, Node built-in test runner; no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-29-turkish-homepage-design.md`

## Global Constraints

- Turkish is the first interface language. Keep German examples in German.
- Downloads require no signup.
- Preserve the current privacy document and its address.
- Exam packages remain planned.
- No publication or DNS changes are part of this pass.

## Review Focus

- Incomplete/wrong answers must not be credited; words cannot be duplicated.
- Removing words, hints, reset and continuation must preserve a coherent exercise.
- Turkish dotted/dotless I and searches without diacritics must work.
- Keyboard focus must remain usable when dialogs open/close and on narrow phones.
- Development/private files must not be served or included in the public output.

## Task 1: Exercise and search rules

Files: `src/exercise.js`, `src/topics.js`, `tests/learning.test.mjs`.

Interfaces: `newExercise(id)`, `toggleWord(state, wordId)`, `checkAnswer(state)`, `nextHint(state)`, `searchTopics(query)`.

- [ ] Write tests for selection/removal, incomplete/wrong/correct answers, reset/tea continuation, hints and Turkish search.
- [ ] Run `node --test tests/learning.test.mjs`; confirm failure before modules exist.
- [ ] Implement pure rules and reviewed topic descriptions.
- [ ] Run the focused tests and confirm they pass.

## Task 2: Responsive selected design

Files: `index.html`, `style.css`, `app.js`, local fonts/icons and `downloads/`.

Consumes Task 1 interfaces. Produces the complete Turkish homepage, accessible dialogs and real study-note downloads.

- [ ] Copy the existing approved fonts/photo/logo and use licensed icon assets.
- [ ] Implement the selected layout and Turkish copy with semantic HTML.
- [ ] Connect the exercise, feedback, hint, continuation, topics, search and resources.
- [ ] Check desktop/mobile layout and all core controls in a browser.

## Task 3: Preview, public build and review

Files: `package.json`, `scripts/dev.mjs`, `scripts/build.mjs`, `.gitignore`, `README.md`, `docs/setup.md`, `docs/handoff.md`, `design-qa.md`.

- [ ] Add a dependency-free preview and allowlisted public build.
- [ ] Verify the build excludes non-public files; check local links, MIME types and privacy preservation.
- [ ] Capture desktop/mobile evidence and compare the selected image with the page.
- [ ] Fix substantive visual/interaction findings and repeat affected checks.
- [ ] Obtain an independent review, fix important findings, and record final verification.

## Execution ledger

Ruling: implement in the existing checkout, preserving the owner's uncommitted notes. No optional worktree creation is necessary for this bounded website change.

Ruling: the selected visual and the explicit request to build authorize this implementation. Continue without another plan/design approval round.

Ruling: keep the established buildless website instead of creating a separate prototype. A starter would add a second source and an unnecessary runtime.

Ruling: use the installed Chrome through its DevTools protocol for local verification because this session exposes no in-app Browser tool. Do not use Playwright CLI or MCP.

Baseline: existing static files inspected; no package or existing automated test suite. The privacy hash was recorded before changes and its bytes were verified unchanged afterward. Nine focused tests, a public build and local browser checks now pass; see `design-qa.md` for the checks and their limits.
