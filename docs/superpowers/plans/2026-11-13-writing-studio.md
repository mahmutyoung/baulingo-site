# Compact writing studio implementation plan

**Goal:** Apply the owner's supplied compact studio reference to DTZ writing, keeping all educational content unchanged.

**Architecture:** Enhance existing static lesson HTML with stage and task navigation. Keep persistence and answer rules in the current player. Add a separate DOM controller for presentation and a phrase toolbox sourced from the existing reference page. Continue in the current working directory because this unreleased course and its review server are already here.

**Constraints:** Preserve 24 destinations, 47 tasks, 64 phrases, all authored explanations/models, stable task IDs and saved responses. No new frameworks, dependencies, analytics or publication. Native details and links retain static access without JavaScript.

## Steps

- [x] Capture content fingerprint and write failing studio checks.
- [x] Compact grouped course navigation; introduce a visible phrase rail in the shared shell, using existing fonts, colours and assets.
- [x] Add lesson stage and single-task navigation, collapsible checking, live draft preview and phrase insertion through existing input/save handlers.
- [x] Verify ordinary exercises, guided letters, A/B simulations, reference pages, hashes, reload, keyboard, mobile layouts and static content.
- [x] Run all tests and build; compare reference and desktop/mobile captures. Update review catalog, architecture and handoff. Leave local preview running.

## Decisions

The supplied image is the approved style direction. Its sample content and four invented course steps are not copied: existing task labels and learning stages remain authoritative. The phrase rail loads the current static phrase reference, avoiding duplicated content across 25 pages and staying within the existing public budget. On phones it becomes a visible expandable toolbox above the work area. Stage navigation is progressive enhancement; all authored content stays in the static document.
