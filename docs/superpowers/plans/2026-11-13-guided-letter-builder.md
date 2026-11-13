# Guided letter builder implementation plan

**Goal:** Implement the combined design approved in chat: one clear instruction/field at a time, meaningful letter sections, related patterns, labelled icons and simple navigation for Turkish-speaking learners who prefer a simple format.

**Architecture:** Preserve static educational content and existing task IDs. Add pure assembly/state rules and a focused DOM builder for non-simulation full-letter tasks. Keep player persistence authoritative. Reuse the existing phrase reference; show three relevant patterns beside the current field and keep the complete searchable toolbox available. Use licensed Tabler outline icons with visible Turkish labels. Continue in the existing working directory on the explicitly requested branch, preserving all previous uncommitted work.

## Approved design

The guided route is the primary choice. Steps are greeting, introduction, the four original task points, closing, name and review. The current point's exact authored label remains visible. Long Turkish teaching paragraphs become readable list items without rewriting or deleting their text. The letter-shaped preview shows each section, highlights the current one and supports returning to earlier fields. At review the complete letter is editable. On mobile the task is first and a “Mektubumu gör” control reveals the preview. Independent/timed simulation remains a full-letter editor.

No changes to educational data: 24 destinations, 47 tasks, 64 phrase entries, source/model text and existing answer rules remain intact. Existing freeform drafts open in full-letter review. Structured parts are stored separately; editing parts must not silently overwrite a freeform draft. Explicitly transferring new parts preserves the previous full draft. Export and unavailable-storage behavior include the structured work.

## Tasks

- [x] Add failing tests for letter assembly, safe synchronization, restore/merge and exportable partial work.
- [x] Implement pure builder rules and bounded persisted fields in the existing player/rules, preserving unrelated tasks/tabs.
- [x] Add the step UI, semantic letter preview, relevant phrase insertion and labelled library icons. Reduce duplicated CSS/controller code to keep the public core below 2 MB.
- [x] Apply simple task names and list presentation; emphasise guided practice on the course index while preserving other routes.
- [x] Browser-check new/old drafts, editing/recombination, reload, failure storage, phrase insertion, keyboard, preview navigation, mobile/desktop and unchanged simulation/short exercises.
- [x] Run full tests/build, verify content fingerprint and public boundaries/budget, review the code and rendered design, update core docs and newest local review entry. No push, publication or commit is inferred from branch creation.
