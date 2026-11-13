# Turkish DTZ letter learning

The owner chose the proposed short-lesson format and requested implementation. Adapt the owner's `dtz-writing-book-web` into the existing Baulingo static build. Turkish is the first audience: explanations, navigation, feedback and self-checks are Turkish; authentic task texts and model letters remain German.

Use `/dtz-mektup-yazma/` as a course index, with individually addressable lessons. Preserve all fourteen source chapters, splitting the eleven letter types into shorter lessons. Each learning lesson has Turkish guidance, a short automatically checked activity, the original writing tasks, self-checks, optional models and a sentence-revision field. The reference and learning-plan lessons remain useful tools rather than artificial quizzes. Three simulations offer A/B choices and an optional thirty-minute practice clock.

Store drafts, self-checks, deliberate completion and the last lesson locally in a separate storage key. Saving a response never implies mastery. Provide text export and scoped reset. Denied or failed storage must be reported honestly while the current page remains usable. Do not grade free writing or claim an official result.

Considered retaining the original book UI (quick transfer but long German chapters) and guided lessons (more adaptation, clearer Turkish and mobile learning). Owner selected guided lessons. Reuse Baulingo's Newsreader/BaulingoSans, ivory #FAF7F0, forest #002B27, sage #78866A, gold #E7C875; left-aligned lesson workspace with a quiet course sidebar and a focused paper-like writing area. Preserve the homepage layout, adding only a relevant writing link.

Keep the original book as an explicit, build-only snapshot with provenance; normal builds never read sibling projects. Static lessons and model answers remain readable without JavaScript. Publish only allowlisted browser modules/styles and generated pages. No accounts, external AI, tracking events, dependencies, deployment or paid services.
