# Website setup

Original decisions recorded: 29 October 2026. Updated: 30 October 2026. See the [long-term roadmap](roadmap.md) for product sequencing and [production notes](production.md) for the live build, configuration and release checklist.

## Repository and current files

- Remote: https://github.com/mahmutyoung/baulingo-site
- Local folder: `C:\Users\90505\Documents\POS\german-app\baulingo-site`
- Working branch: `main`.
- Starting revision: `dff7162` (Sync public privacy policy with current in-app notice).
- Local source: `index.html`, `style.css`, `app.js`, `src/`, `assets/`, `downloads/`, `privacy/` and `impressum/`. The owner supplied the public postal address; the privacy page now describes Cloudflare website hosting without changing native app telemetry wording.
- Local tooling: `npm run dev`, `npm test` and `npm run build`. The build writes public files to `dist/`.
- Live homepage: https://baulingo.app/
- Live policy: https://baulingo.app/privacy/
- Legacy policy used by the Android app: https://mahmutyoung.github.io/baulingo-site/privacy/

This is a separate local Git repository from the Android app. No website changes should require an Android build.

The owner bought `baulingo.app` through Cloudflare and deployed the main site there. HTTPS, live site responses and the WWW redirect have been checked; account billing settings and the full DNS configuration have not been audited. Preserve the legacy GitHub Pages policy address; its availability was not retested during this documentation update.

## Agreed scope

The website is mainly static. Its first audience is Turkish speakers learning German. Help visitors find a Turkish explanation, understand a German example and practise it. The [approved homepage reference](design/homepage.md) controls the layout and visible wording. Build further content in small steps.

Downloads are free. Do not require an account, email address or signup. Each resource should have a page with a description, preview, direct download and relevant app link.

The live site offers two original text study notes, topic search, Turkish explanations, recorded phrase audio and a sentence exercise. Topic links also lead to static readable pages. The requested original DTZ simulation is now implemented locally at `/dtz-deneme-sinavi/`, with 45 scored listening/reading questions plus ungraded writing/speaking; publication is pending. Other exam packages remain planned. See [DTZ implementation notes](content/dtz-web.md).

This is not a full web version of the learner app. Embed small interactive experiments within the main website to understand Turkish-speaking visitors' demand and preferences. Experiments use the site's existing pages, design and deployment. Add Worker logic only when an agreed feature needs it.

The current roadmap stage is understanding demand: define one embedded experiment and its evidence method before broad content or activity expansion. Later directions include stronger content, improved practice, continuing study, a relevant app connection and sustainable expansion. Accounts, synchronisation and paid learning products remain conditional options; see roadmap.md for decision gates.

## Hosting and costs

For local human review, use `/dev/review/` on the development server. The current session runs on port 4180; the normal default is 4173. Review uses the existing local server and no external service or paid plan. `npm run preview` disables its endpoints. See [the review guide](development/review.md).

| Project name | Address | Purpose |
| --- | --- | --- |
| `baulingo-site` | `baulingo.app` | Public static website |

The owner has now deployed `baulingo-site` at `baulingo.app`. Product experiments are embedded within this website; the previous separate experiment project/subdomain proposal is superseded. A separate `baulingo-www-redirect` Worker handles only the authorized WWW redirect; see [current deployment notes](production.md).

Use Cloudflare's Free domain plan and Workers Free with Static Assets. The domain purchase and renewal remain separate costs. Do not enable paid plans, usage billing or services that require a paid subscription.

Serve pages and downloads directly as static assets. Do not invoke Worker code for every static request. Static asset requests and storage have no additional charge. Dynamic Worker requests have separate free limits.

Limits checked on 29 October 2026: Workers Free allows 20,000 static files per version and 25 MiB per static file. Keep downloads within these limits. Recheck limits when implementing. Do not add R2, a database or paid analytics to the initial setup.

The public custom domain and the WWW-to-HTTPS-apex redirect are active. Recheck the preview and public domain after future releases. The separate WWW Worker preserves paths and query strings; its source and operational notes are in `cloudflare/www-redirect/`.

## Routes and future content

The current routes support the approved homepage and static learning/resource content. Embedded experiments fit within these existing pages. Add routes when selected content requires them; the roadmap does not commit to separate update or support sections.

| Path | Purpose |
| --- | --- |
| `/` | Approved Turkish homepage, topic discovery and short practice |
| `/konular/` and topic pages | Turkish explanations and German examples |
| `/kaynaklar/` | Resource descriptions and direct downloads |
| `/dtz-deneme-sinavi/` | Full original DTZ practice simulation; locally implemented, pending publication |
| `/downloads/*.txt` | Published free study files |
| `/impressum/` | Publisher details and contact |
| `/privacy/` | Accurate public privacy policy |

Keep the current structured topic source and generated page pattern while developing the first embedded experiment. Markdown and the optional architecture migration can be considered when the content library justifies them. Do not invent app store links or publish placeholder worksheets as finished resources. Search traffic is a goal, not a guaranteed result.

## Boundaries

- Preserve privacy access and the owner's approved Turkish layout during future changes.
- Keep app source, environment files, Firebase configuration, credentials and signing keys out of this public repository.
- Publish only a dedicated static output directory. Do not publish the repository root, Git metadata or handoff documents.
- Ship embedded experiments with the public website; keep native Android releases independent.
- Define each experiment's learner question, demand/preference signals and any feedback or data needs before implementing its measurement.
- The app currently links to the GitHub Pages policy. Changing that app URL is a separate app task. Preserve access to the old policy during migration.
- The app repository currently exports this site through `scripts/build-app-site.cjs`. Inspect that ownership before editing generated pages. Do not later overwrite independent website changes with an old export.

## Sources

- [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Static site setup](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
