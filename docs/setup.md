# Website setup

Original decisions recorded: 29 October 2026. Updated: 30 October 2026. This records local work, not a deployment. See [production preparation](production.md) for the current build, configuration and release checklist; the longer-term routes below remain proposals.

## Repository and current files

- Remote: https://github.com/mahmutyoung/baulingo-site
- Local folder: `C:\Users\90505\Documents\POS\german-app\baulingo-site`
- Working branch: `main`.
- Starting revision: `dff7162` (Sync public privacy policy with current in-app notice).
- Local source: `index.html`, `style.css`, `app.js`, `src/`, `assets/`, `downloads/`, `privacy/` and `impressum/`. The owner supplied the public postal address; the privacy page now describes Cloudflare website hosting without changing native app telemetry wording.
- Local tooling: `npm run dev`, `npm test` and `npm run build`. The build writes public files to `dist/`.
- Current documented homepage: https://mahmutyoung.github.io/baulingo-site/
- Current documented policy: https://mahmutyoung.github.io/baulingo-site/privacy/

This is a separate local Git repository from the Android app. No website changes should require an Android build.

The owner bought `baulingo.app` through Cloudflare. Account settings, DNS and current public responses have not been inspected in this task. The GitHub Pages addresses above come from the existing README. They were not retested during this handoff.

## Agreed scope

The website is mainly static. Its first audience is Turkish speakers learning German. Help visitors find a Turkish explanation, understand a German example and practise it. The [approved homepage reference](design/homepage.md) controls the layout and visible wording. Build further content in small steps.

Downloads are free. Do not require an account, email address or signup. Each resource should have a page with a description, preview, direct download and relevant app link.

The site offers two original text study notes through a resource dialog and standalone resource page. Topic search, short Turkish explanations, recorded phrase audio and a sentence exercise work locally. Topic links also lead to static readable pages. Full exam packages remain planned.

This is not a full web version of the learner app. Small interactive experiments can have their own deployment. Add Worker logic only when an agreed feature needs it.

## Hosting and costs

| Project name | Address | Purpose |
| --- | --- | --- |
| `baulingo-site` | `baulingo.app` | Public static website |
| `baulingo-lab` | To be decided | Separate feature experiments |

The experiment project name is proposed; its address remains undecided. No Cloudflare project has been created for this draft.

Use Cloudflare's Free domain plan and Workers Free with Static Assets. The domain purchase and renewal remain separate costs. Do not enable paid plans, usage billing or services that require a paid subscription.

Serve pages and downloads directly as static assets. Do not invoke Worker code for every static request. Static asset requests and storage have no additional charge. Dynamic Worker requests have separate free limits.

Limits checked on 29 October 2026: Workers Free allows 20,000 static files per version and 25 MiB per static file. Keep downloads within these limits. Recheck limits when implementing. Do not add R2, a database or paid analytics to the initial setup.

Connect the public domain after checking the deployment preview. Cloudflare Custom Domains manage the required DNS records and certificates. Redirect `www.baulingo.app` to `https://baulingo.app`, preserving paths and query strings.

## Longer-term content structure

These paths are longer-term proposals. The current build uses the approved homepage with dialogs and static `/konular/`, `/kaynaklar/`, `/impressum/` and `/privacy/` routes; it does not publish the following proposed article/update/support sections yet.

| Path | Purpose |
| --- | --- |
| `/` | App introduction, examples and confirmed download links |
| `/learn/` | Articles about German in everyday situations |
| `/downloads/` | Resource pages and free files |
| `/updates/` | App news |
| `/support/` | Help and contact |
| `/privacy/` | Accurate public privacy policy |

Keep articles and resource descriptions in Markdown when a content build is added. A framework is not required for the first hosting migration. Do not invent app store links or publish placeholder worksheets as finished resources. Search traffic is a goal, not a guaranteed result.

## Boundaries

- Preserve privacy access during migration. The local homepage has been replaced with the owner's approved Turkish layout; this does not change the currently deployed site.
- Keep app source, environment files, Firebase configuration, credentials and signing keys out of this public repository.
- Publish only a dedicated static output directory. Do not publish the repository root, Git metadata or handoff documents.
- Keep experiment deployments separate from the public site and Android releases.
- Decide experiment access and data needs when the first experiment is defined.
- The app currently links to the GitHub Pages policy. Changing that app URL is a separate app task. Preserve access to the old policy during migration.
- The app repository currently exports this site through `scripts/build-app-site.cjs`. Inspect that ownership before editing generated pages. Do not later overwrite independent website changes with an old export.

## Sources

- [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Static site setup](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
