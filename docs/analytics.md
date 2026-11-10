# Website analytics configuration

Prepared: 30 October 2026. This is a configuration and operating guide, not evidence that collection is active.

## Verified state

- The owner authorized deployment on 30 October 2026. Final main-site version: `f08cba0f-c32c-4a16-aaa8-df1a22d063f0`, based on working-tree changes over `57d04316378916291ac92765ca78b4ec74411440`. No commit or push was requested.
- Cloudflare's API confirms that `baulingo.app` uses the Free Website plan. No billing or plan changes were made.
- The owner's automatic setup injects the versioned beacon in a live Chrome browser. Both CSP policies now permit the exact unversioned beacon and its versioned subpaths, plus same-origin reporting. No manual script was added.
- Live homepage and topic-index browser checks confirm script HTTP 200 and RUM POST HTTP 204 without CSP or analytics network errors. The check's network location is Germany. A subsequent authenticated GraphQL report confirms ingestion: four page views on 30 October 2026 (two homepage, two topic index), consistent with verification traffic rather than established learner demand. The dashboard UI itself was not inspected.
- Raw non-browser fetches did not receive an injected script even after the update. Use a real browser to verify automatic setup.
- The website privacy disclosure is deployed. Android disclosures remain unchanged. Learning/resource/legal pages, audio, downloads, WWW redirects preserving paths/queries, real 404 responses and preview noindex passed live smoke checks.
- The Wrangler OAuth login lacks Web Analytics access. A separate API token supplied locally in the ignored `.env` now permits read-only inspection. RUM API checks confirm `auto_install: true`, an enabled ruleset, and one active inclusive rule with host `*` and paths `["*"]`. The narrower hostname/path exclusions below are still proposed, not applied. Regional options were not established by the returned fields. No account settings were changed.

## Intended free configuration

Use Cloudflare Web Analytics for aggregate website traffic and browser performance. Keep the existing Free plan. Do not enable paid analytics products, Logpush, storage, databases or a dynamic request handler.

Use the owner's automatic setup with production-host rules. No site token or manual script is needed in the repository. If live verification shows that automatic injection is unavailable, investigate before changing the installation method.

| Setting | Intended value |
| --- | --- |
| Site | `baulingo.app` |
| Production hostname | Exactly `baulingo.app`; exclude WWW, workers.dev, localhost and future subdomains |
| Included content | Homepage `/`, `/konular/` and topic pages, `/kaynaklar/` |
| Excluded content | `/privacy/`, `/impressum/`, missing pages and direct downloads |
| Tracking scope | Aggregate traffic and performance; no custom activity events, replay or learner identifiers |

Check regional collection settings explicitly. Cloudflare may exclude EU/UK traffic depending on the setup option. Record the actual choice before interpreting Germany/Turkey traffic; an excluded region is missing data, not zero demand. Do not silently change an existing regional exclusion.

For automatic setup, open **Web Analytics → Manage site → Advanced options** and use hostname/path rules for the intended content above. Replace a broad zone-wide inclusion rather than leaving it alongside the restricted rules. Inspect configuration rules too: they can override Web Analytics rules. The API currently confirms a broader active inclusion (host `*`, paths `["*"]`). The intended restrictions in this guide have not been applied; the supplied token grants read access only.

The website section of `/privacy/` and verified CSP changes are deployed. Preserve all Android app disclosures and the legacy policy URL. Future changes should use the normal static release process.

## Useful review views

These are recommended dashboard filters and review practices, not saved dashboards already created in the account.

| View | Filters / breakdown | Decision it supports |
| --- | --- | --- |
| Weekly overview | Production hostname, last 7 days; compare with the previous 7 days when data exists | Whether traffic is growing and where it comes from |
| Content discovery | Page path; compare homepage, topic index, individual topics and resources | Which published pages receive attention |
| Audience | Country and device/browser breakdown | Whether we reach the intended audience and support its devices |
| Acquisition | Referrer breakdown | Which referring sites bring visitors; use Search Console separately for Google search queries |
| Mobile performance | Mobile devices, page path, Core Web Vitals | Which pages need loading or interaction improvements |

Review weekly and record the collection start date, regional exclusions and known test traffic. Do not treat Cloudflare visits as identified people or retention. Browser blockers and collection exclusions can reduce coverage. Requests in edge analytics include a different population, such as bots and assets, and are not interchangeable with browser page views.

Cloudflare Web Analytics does not support custom events. Homepage topic dialogs, search, audio, exercise completion and download clicks cannot be inferred from these page reports. The [roadmap](roadmap.md)'s embedded preference experiment still needs its own defined evidence method; page popularity alone does not establish preference or learning value.

## Activation verification and rollback

1. Confirm the analytics site and exact hostname/path/region settings in Cloudflare, and record the chosen installation method.
2. Run `npm test` and `npm run build`; inspect the built CSP and privacy text before deploying the explicit static output.
3. In a production browser, verify that the beacon loads once, the RUM request succeeds and neither CSP produces an error. Hide the tab or navigate away to trigger performance reporting.
4. Check representative homepage/topic/resource pages. Confirm that local previews, workers.dev, legal pages and the WWW redirect do not collect.
5. Confirm new data appears in the account after processing. A successful HTTP response is not proof of dashboard ingestion. Record the first verified collection date and distinguish verification traffic from real visitors.
6. To stop collection, disable automatic injection in Cloudflare or remove the manual beacon, depending on the installation method. Recheck production requests and keep the privacy notice accurate. CSP permissions alone cannot send analytics.

## Verification evidence

Local verification on 30 October 2026: all 18 tests pass; the static build succeeds. A fresh local HTTP preview confirms both homepage CSP policies permit the automatic beacon and same-origin reporting, and no manual beacon was added. The website privacy disclosure is included; Android disclosures match the previous revision after normalizing Windows line endings. Relative links in this guide, production notes and handoff resolve. Desktop/mobile privacy checks at 1440/390 px found no horizontal overflow. Subsequent live browser checks confirm successful measurement delivery as recorded above; a subsequent authenticated GraphQL report confirms ingestion of four page views, consistent with verification traffic. The dashboard UI itself was not inspected.

## References

- [Cloudflare Web Analytics rules](https://developers.cloudflare.com/web-analytics/configuration-options/rules/)
- [CSP requirements, collection and custom-event limitations](https://developers.cloudflare.com/web-analytics/faq/)
- [Data origin and collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)
- [RUM site API and permissions](https://developers.cloudflare.com/api/resources/rum/subresources/site_info/)

## GA4 website integration — prepared 10 November 2026

The public website source now includes an optional Google Analytics 4 integration using measurement ID `G-3XSNDN7FE4`, with no separate environment variable required. The JavaScript module is delivered from `src/analytics.js` and loads Google's tag only after visitors explicitly select **Analize izin ver** / **Allow analytics**. Declining means no Google tag is loaded. The footer **Analiz ayarları** / **Analytics settings** control permits withdrawal, clears accessible GA cookies, and reloads to stop the previously loaded tag. Consent is stored locally when browser storage is available. No visitor's raw search text, attempted answer, DTZ written draft or saved attempt is included in custom events.

Events: `learning_started` and `learning_completed` for the short sentence builder and the DTZ mock exam; `exercise_answered` with only `correct` / `incorrect` for the sentence builder. Custom parameters are `activity_id`, `activity_type`, `content_language`, and for checks `outcome`. An event labelled completion means the activity reached its correct-answer or exam-result state, not a demonstrated long-term learning gain. Activity and landing-page reports require real visitor consent and Google Analytics configuration.

The website also includes the necessary Google Tag Manager/Analytics script, connection and image CSP exceptions, while preserving Cloudflare Web Analytics. It updates only the public website privacy section; native app tracking and Android disclosures are unchanged. The code changes are not evidence of live delivery, data collection or analytics dashboards. After the feature is released, verify the GA4 tag in the production browser only after consent, no Google requests before consent, event visibility in GA4 Realtime/DebugView, and no tracking after withdrawal. Run `npm test` and `npm run build` before release.

**Manual Google account step:** Go to GA4 Admin → Product links → Search Console links and link the verified `baulingo.app` property to the matching GA4 web stream. This account-level action cannot be completed by repository changes alone. Then publish the Search Console reports collection in GA4 Reports → Library. The integration does not expose each visitor's Google query to activity events; use landing-page aggregates for comparisons.
