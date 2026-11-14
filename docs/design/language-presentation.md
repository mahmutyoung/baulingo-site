# German in Turkish and English learning content

Approved by the owner on 14 November 2026.

- Mark an authored German expression mentioned inside Turkish/English prose with `i lang="de"`. Italic type and a pale sage background distinguish the target expression.
- Use bold upright type for a vocabulary target, retaining its authored article. Do not infer articles or plurals.
- Show standalone German examples in upright type, with the translation directly below in the page language. Keep translations outside German language containers.
- Highlight short target expressions rather than whole example panels or learner input. Preserve original German spelling/capitalisation and teaching emphasis.
- Keep existing fonts and ivory/forest/sage/gold colours. Translations use readable muted text, slightly smaller than examples.

`src/learning-text.js` formats explicitly annotated phrases with escaped HTML or safe DOM nodes. Topic annotations and translations belong to topic data; English page examples are authored markup. Writing annotations apply to mixed-language prose, with explicit rules keeping full German stimulus lines upright. Attribute values and saved text remain plain escaped strings. The same convention applies to sentence-practice success feedback. It does not introduce language detection, change exercise answers or rewrite learner drafts.
