# Website analytics operations

The unified Astro analytics contract went live on **26 November 2026**. Use **27 November 2026** as the first full day for comparisons under the new schema. Cloudflare measures aggregate traffic and performance. The dedicated website GA4 property measures consenting activity, and Search Console reports Google organic discovery. [Live release](production.md#release--26-november-2026) · [Configuration](#reproducible-ga4-configuration) · [Reporting setup](#reporting-setup)

## Default analytics coverage

Use the existing Cloudflare Free plan HTTP Traffic view for baseline request counts and bandwidth. It measures traffic at the edge, including asset and crawler requests. Use Cloudflare Web Analytics for aggregate browser page views and performance where the beacon is served. Each source describes a different population. [Cloudflare Zone Analytics](https://developers.cloudflare.com/analytics/account-and-zone-analytics/zone-analytics/) · [Cloudflare Web Analytics collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)

On 26 November 2026 a fresh Chrome profile with GA4 declined loaded one Cloudflare beacon on each of `/` and `/konular/`. Cloudflare accepted a measurement from each page with HTTP 204, and the Google Analytics tag was absent on both. This verifies default-on collection for those pages from the test network. Dashboard ingestion and coverage across regions were outside this check. The saved credential and Wrangler login both received authorization errors from the zone and GraphQL endpoints, so the check used browser and network evidence.

Use the explicit GA4 choice for learning events, study time, campaign attribution and returning-browser measurement. Review beacon configuration and regional scope before expanding browser collection. German regulators assess whether audience measurement can run without consent based on its configuration and purpose. [German data protection authorities’ guidance](https://www.lfd.niedersachsen.de/download/142884/Orientierungshilfe_fuer_Anbieter_von_digitalen_Diensten_Stand_November_2024_.pdf)

## Cloudflare deployment history

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

## GA4 website integration

The live site sends consenting activity to `baulingo-web`, property `565704627`, stream `16407606337`, measurement ID `G-R1YH6T64JM`. Earlier data remains in its original property and schema. The Android/Firebase property is independent.

### Cookie settings

The website uses GA4 measurement ID `G-R1YH6T64JM`. Its shared cookie dialog offers **Reject all**, **Configure** and **Accept all** in Turkish, English and German. Essential storage for choices and progress stays available. The site loads Google's tag only after explicit acceptance or saving the analytics option enabled. The footer **Cookie settings** control reopens the choices. Consent is saved in the browser and synchronized across open tabs. Withdrawal stops tracking, clears local analytics data and accessible GA cookies, and reloads tabs that had enabled the tag. Privacy and Imprint open directly and offer the same settings control. Raw search text, attempted answers, DTZ written drafts and saved attempts stay out of custom events.

On 26 November 2026, GA4 Admin → Product links → Search Console links showed the `baulingo.app` domain property linked to **Baulingo Web** (stream `16407606337`, property `565704627`) since 24 November 2026. Check whether the Search Console reports collection is published in GA4 Reports → Library. Use landing-page aggregates to compare Google search performance with site activity. Search queries are available in aggregate through Search Console.


## Learning event reference

The consent version requests renewed consent from previously consenting visitors and preserves earlier refusals. Tracking is disabled on local, review and noindex pages.

| Event | Meaning |
| --- | --- |
| learning_started / learning_resumed / learning_paused | Explicit practice start, resume or pause; a start is per active activity, not a unique learner |
| learning_completed | Checked exercise/test, exam-result transition or self-marked lesson completion; distinguish completion_type |
| exercise_answered / exercise_retried | Graded checks or final exam answers; attempts may repeat, so not unique questions |
| section_completed | Reviewed mini-pack sections, writing tasks, DTZ phase transitions |
| topic_selected / level_selected / language_changed | Content opened or explicit level/language choice |
| search_performed / search_no_results | Submitted homepage search or settled input; result count only |
| hint_used / answer_revealed | Explicit assistance; not a correct answer |
| audio_played / audio_completed | Successful playback start/end of tracked clips |
| study_time | Noncumulative seconds while visible, up to 60 seconds since last interaction; approximate, not attention or mastery; passive listening/reading beyond the inactivity cap is not included |
| feedback_submitted | Optional mini-pack helpful/not-helpful response after all sections completed |
| download_clicked / app_store_clicked | Public resource and local export clicks, Android store link clicks |
| learning_error | Fixed error categories, no message/stack contents |

The [repository specification](#reproducible-ga4-configuration) defines reporting fields and key events. Site-generated events use sanitized parameters and clean page URLs, and site configuration disables ads signals and personalization. A separate automatic page view from Google's tag can include query strings, as recorded in the [production audit](#production-measurement-audit--26-november-2026).

Acceptance checks: no Google script/events before consent, after rejection/withdrawal, or in review. Test a Turkish and English mini-pack, grammar lesson, sentence builder, A1 test, DTZ test and writing course. Check one event per meaningful action, correct vs incorrect, no raw answer/search/draft text, clean page URLs and no duplicate SPA page views. Verify 30-second study-time deltas, visibility/idle cutoff and optional feedback. Keep the property separate from Android. No historical backfill.


## Mini-pack analytics taxonomy — 25 November 2026

Both everyday communication and grammar lessons use the same learning format: `activity_type = mini_pack`. The separate event-scoped dimension `content_category` identifies the subject: `everyday_communication` or `grammar`. All mini-pack player events, including progress, answer checks, time, level selection and library errors, inherit the category from the selected track. Existing lesson IDs, levels, languages and other activity types are unchanged.

The [repository specification](#reproducible-ga4-configuration) includes **Content Category** as the event-scoped dimension `content_category`. For the unified mini-pack funnel, use `activity_type exactly matches mini_pack` on each step and break down by Content Category (or CEFR Level). For a grammar-only funnel, additionally require `content_category exactly matches grammar`. The former `activity_type = grammar` remains in historical data, and previous everyday mini-pack events have no content_category. Compare post-release periods when using the new schema.

## Unified consented analytics and attribution

Phase 6 uses the existing website stream `G-R1YH6T64JM` and opt-in settings. It adds event-specific required fields at the browser dispatch boundary and derives page, content and collection metadata from the publishing catalog. Mini-pack IDs resolve from the existing localized lesson routes. The build projects only reporting metadata to the browser. Embedded sentence practice uses its authored exercise ID with a `sentence-` prefix. The common fields are `page_id`, `content_id`, `content_format`, `collection_id`, `content_language`, `content_category` and `level` when applicable. Existing `activity_id`, `activity_type` and event-specific fields remain available.

| Signal | Unit and reporting use |
| --- | --- |
| `page_view` | A clean URL path on document entry or after a distinct in-page path change. Back/Forward can record a revisit. Query and fragment changes on the same path do not create a page view. |
| `content_viewed` | One consecutive exposure per content ID on a page. Direct lesson visits count. A reader entry can expose the collection and then the first lesson. Filter for a content ID to count individual learning material. |
| `topic_selected` and `level_selected` | Explicit learner choices in the existing instrumented controls. Direct lesson entry and Back/Forward no longer produce a mini-pack selection. |
| `learning_started`, `learning_resumed`, `learning_paused` | Practice opens or begins through interaction. A restored DTZ attempt has an explicit resume action. Repeated input in the same active activity does not start it again. |
| `study_time` | Whole-second deltas flushed roughly every 30 seconds, on visibility changes, at exit and when switching activities. They retain the originating page and content. Time is bounded by document visibility and 60 seconds since the last trusted interaction. |
| `exercise_answered` and `learning_completed` | Answered events require a correct or incorrect outcome. Scored completion also requires a valid answered and correct count. Self-review completion has no score. Reading, reference and guide pages can be viewed without an artificial completion. |
| `visit_started` | One consented acquisition window starts at entry. Same-origin navigation and reloads can carry it within the 30-minute inactivity limit. `browser_visit` uses a local timestamp to distinguish first and returning browsers within 90 days when storage is available. |

The transport accepts these entry signals:

- An exact HTTPS origin of `chatgpt.com` or a single `utm_source=chatgpt.com` gives `ai_source=chatgpt`, `campaign_source=chatgpt.com` and `campaign_medium=referral`. This captures observable ChatGPT referrals. The sources do not distinguish search, other ChatGPT surfaces, copied links or mentions without a click. [ChatGPT web search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt) · [Examples of tagged citation URLs](https://developers.openai.com/api/reference/python/resources/responses/methods/create)
- The initial registered site campaign is `utm_source=baulingo&utm_medium=referral&utm_campaign=german-courses`. It is available for approved links and synthetic checks. Phase 6 does not distribute a tagged link. Register future source, medium and campaign combinations in the code before using them. [GA4 campaign fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#campaign_source)
- Unregistered, duplicate or malformed tag values are discarded. A trusted referrer origin can independently identify a referral. If the trusted ChatGPT referrer conflicts with the registered Baulingo campaign, attribution is empty. A missing referrer and no approved tag leave a new visit unattributed.

An automatic homepage locale redirect carries only normalized acquisition tags to the English entry. Analytics storage starts after consent and retains normalized attribution and the canonical landing page ID for the active tab. Analytics URLs omit query strings and fragments. External referrers are reduced to their origin. Withdrawal stops event dispatch, clears local analytics storage and accessible GA cookies, and reloads the page. Preview, review and noindex conditions keep GA disabled.

### GA4 definitions and report boundary

Manage reporting definitions through the [repository specification](#reproducible-ga4-configuration). Use native campaign fields for registered campaigns. For later releases, verify stream settings, browser requests, Realtime and processed reports separately. Preserve the historical event schema and record new release boundaries.

Use the count of `visit_started` with `ai_source=chatgpt` as the observable referral denominator. Compare exposed content and applicable starts or completions by `landing_page_id` and `content_id`. For conversion, count qualifying visits in a GA4 session segment where the tool supports that scope. Raw event totals include repeat views, repeated practice and multiple lessons. A Baulingo tab window can differ from GA4's session definition. Keep checked completions, self-review completions and exam results separate. Counts describe consenting browsers, and the returning flag measures browser storage rather than people. Use Search Console for organic landing-page discovery and Cloudflare for aggregate traffic.

### Production measurement audit — 26 November 2026

The [26 November production release](production.md#release--26-november-2026) is the reporting boundary for unified analytics. Treat that day's data as a mixed release-day sample. The GA4 Data API returned 44 page views, 12 content views, six visit starts and four topic selections for the sampled events. Realtime separately returned one study-time event. The processed sample had rows by level, language and category, while the new page, content, collection, landing-page and format dimensions were blank. Check a fully processed post-release day before drawing conclusions about that reporting coverage.

Chrome captured collection requests from the deployed site after opt-in. The audit intercepted synthetic requests before ingestion. The site-generated page view carried its page ID and a clean URL. A second page view on the same navigation lacked the page ID and included the entry query string on a tagged URL. Chrome traced it to Google's `gtag.js` sending to `G-R1YH6T64JM`. It remained when the test browser suppressed Baulingo's manual page-view command. Treat page-view counts and rates from before the fix as provisional.

The fix went live on **26 November 2026 at 20:27 UTC**. It queues Google's global `send_page_view=false` setting before tag initialization and retains the stream setting. After deployment, isolated Chrome captured one attributed page view with a clean URL on Topics and the homepage, plus the expected ChatGPT attribution, learning start, hint and study-time events. With consent denied, the tag was absent and there were no Google requests. Synthetic requests were intercepted before ingestion. [Production release](production.md#page-view-fix--26-november-2026) · [Google tag configuration](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#send_page_view)

The deployed DTZ player loaded and played the real listening audio. After simulating the end of playback, Chrome recorded one scored answer, four section completions, one `exam_result` with one answered and zero correct, and a one-second study delta. A tagged ChatGPT visit queued the expected source and landing-page ID. A visit tagged with an unsupported source queued no `ai_source`. The follow-up GA4 query on release day still had blank processed attribution fields.

The event contract has exposure, practice and active study signals. It has no general engaged-content or reading-completion event. A1 and DTZ scored answer events omit attempt ordinals, so their scored outcomes do not support first-attempt accuracy broken out by exercise. Writing task review can emit another section completion after the learner clears and rechecks it. Count those as review actions. DTZ reports a rejected playback start as `audio_failed`. The separate audio-element error handler updates the interface only, so failures after playback starts may be absent from analytics. Report writing and mini-pack self-review separately from checked sentence and A1 completions and DTZ exam results.

### Reproducible GA4 configuration

The [analytics specification](../src/analytics/schema.ts) declares **19 event-scoped dimensions, five event-scoped metrics and three key events**. Active Study Time uses seconds. The other metrics use standard units. `learning_started`, `learning_completed` and `app_store_clicked` each count once per event with no default monetary value. The 26 November live verification matched the schema and returned a Data API report. The unmanaged `answer_outcome` dimension and `purchase` key event were retained. [Google’s key event reference](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1alpha/properties.keyEvents)

1. The `baulingo-web` Cloud project provides quota and has the Analytics Admin, Analytics Data and Search Console APIs enabled.
2. Use a Google identity with **Viewer** access for checks or **Editor** access for authorized changes, and permission to use the quota project. Confirm the website stream's measurement ID is `G-R1YH6T64JM`. [Google Analytics access management](https://support.google.com/analytics/answer/9305788)
3. Reuse the existing Application Default Credentials if they have the needed OAuth scopes. If sign-in is required, use the existing desktop OAuth client JSON kept outside the repository. Use `analytics.readonly` for audit and verification. Add `https://www.googleapis.com/auth/analytics.edit` only for approved writes and retain `analytics.readonly` if verifying in the same session. An edit-only token returned HTTP 403 from the Data API. Add `https://www.googleapis.com/auth/webmasters.readonly` for Search Console reads. [Google Cloud ADC setup](https://docs.cloud.google.com/docs/authentication/set-up-adc-local-dev-environment)

```powershell
# Run sign-in only when the existing ADC needs new authorization.
gcloud auth application-default login --client-id-file="<local desktop OAuth client JSON>" --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"
try {
  $env:BAULINGO_GA4_QUOTA_PROJECT = 'baulingo-web'
  $env:BAULINGO_GA4_ACCESS_TOKEN = (gcloud auth application-default print-access-token)
  if ($LASTEXITCODE -ne 0 -or -not $env:BAULINGO_GA4_ACCESS_TOKEN) { throw 'ADC token unavailable' }
  npm run analytics:check
  npm run analytics:sync
  npm run analytics:verify
} finally {
  Remove-Item Env:BAULINGO_GA4_ACCESS_TOKEN, Env:BAULINGO_GA4_QUOTA_PROJECT -ErrorAction SilentlyContinue
}
```

- **Check** reads the target property, web stream and complete paginated lists of custom dimensions, metrics and key events. It reports missing, outdated, conflicting and unmanaged definitions. Unmanaged definitions warrant review and can coexist with a healthy check.
- **Sync** previews by default. After reviewing the plan and approving its additions, use `npm run analytics:sync -- --apply` with an Editor token. Sync creates missing definitions within the standard limits. It rechecks after creation. Existing definitions and integrations stay in place, including entries with a different display name, scope, metric unit or counting method. [Google’s configuration limits](https://support.google.com/analytics/answer/12229528)
- **Verify** checks the website stream URL, overlapping enhanced measurement options, Data API metadata and a small standard report. An empty report can pass the availability probe. Pending managed definitions, drift or API failures return a nonzero exit code. Use production Chrome to check consent and request parameters, Realtime for recent ingestion, and processed Data API reports for reporting availability. The owner reported that DebugView did not work during the handoff. [Data API metadata](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/getMetadata)

## Reporting setup

Use dates from **27 November 2026** onward for clean post-migration comparisons. The 26 November release day mixes schemas. GA4 uses Europe/Berlin. Search Console uses Pacific Time for conventional daily reports. Compare complete days within each source and use weekly trends for cross-source comparisons. Exclude blank or `(not set)` identities from attributed rates and display them separately in the quality report. If a denominator is zero or unknown, display the rate as unavailable. GA4 distinct users reflect its reporting identity in the consenting population. An event count measures actions. A user may qualify in multiple lesson, format or segment rows, so request totals at the desired grain instead of adding distinct counts.

### Metric definitions

| Area | Metric and calculation | Coverage and limits |
| --- | --- | --- |
| Acquisition | **Google organic impressions and clicks** use Search Console totals at the selected grain. **CTR** = clicks ÷ impressions. **Average position** is Search Console's impression-weighted average position of the top result at the reported grain. Use native totals or weight positions by impressions within the same aggregation. | Use Site Impression for overall totals and query tables. Use URL Impression for landing-page tables. Query anonymization and row limits can make table sums differ from totals. Keep query and page reports at their native grains. |
| Acquisition | **Traffic sources and landing pages** use GA4 Sessions by Session source / medium and native Landing page. Break down by Country, Language and Device category. **Session engagement rate** = engaged sessions ÷ sessions. | GA4's Language is the browser or device language. Use Content Language for the learning material. The landing-page and engagement reports are provisional while duplicate page views can inflate page-based measures. |
| Acquisition | **Observable AI referrals** = `visit_started` events with `ai_source=chatgpt`, grouped by `landing_page_id`. **Share** = those events ÷ all observed `visit_started` events. | The unit is a consented Baulingo acquisition window. Later activity can be analyzed by the same landing ID and AI source. GA4 sessions are a different unit. Unapproved, untagged or unobservable sources remain unclassified. |
| Content | **Content viewers** = GA4 Total users on `content_viewed` per content ID. **Practice-engaged viewers** = distinct exposed users who subsequently start, resume or record positive study time for that same ID in a closed funnel. **Content engagement rate** = those users ÷ exposed users at the first step. | Applies to items with both exposure and practice. Collection landing views can use Collection ID where Content ID is absent. Embedded sentence exercises have no standalone exposure event. For reading and reference, report exposure only. Use format, category and collection for comparisons, and Content ID for lesson rows. |
| Content | **Learning starts** = event count for `learning_started`. Also show distinct starters through Total users with the same event filter. **Active study time** = sum of `duration_seconds` on `study_time`. Divide seconds by 60 for minutes. | Practice formats with instrumentation. Repeated starts may represent repeated practice. Study time counts visible whole-second deltas within 60 seconds of trusted input. It can miss passive listening and reading. |
| Learning | **Completions and completion rate** = `learning_completed` count by Completion Type, plus distinct users completing after a start ÷ distinct users starting in a closed funnel for the same material. **Section progression** = distinct users arriving at an ordered section step ÷ distinct users at the preceding step. | Checked covers sentence and A1, self-review covers mini-packs and writing, and exam-result covers DTZ. DTZ scores receptive sections only. Use ordered sections for the selected item. Writing review toggles can repeat actions, so use a funnel for people and event counts for actions. |
| Learning | **Graded attempts** = `exercise_answered` events. **Overall graded accuracy** = correct outcomes ÷ all graded outcomes. **First-attempt accuracy** = correct outcomes with `attempt_number=1` ÷ graded outcomes with `attempt_number=1`. For scored completions, **question-weighted score** = sum of Correct Answers ÷ sum of Questions Answered. | Sentence and applicable graded mini-pack exercises send an ordinal. GA4 registers it as a metric, so routine GA4 reports cannot filter raw answer events to ordinal 1. Leave first-attempt accuracy unavailable in those reports. A1 and DTZ omit the ordinal. Exclude self-review from scored completion rollups. |
| Learning | **Retries, hints and answer reveals** = separate action counts for `exercise_retried`, `hint_used` and `answer_revealed`. **Usefulness response share** = helpful responses ÷ all `feedback_submitted` responses with a valid value. | Use only where the player exposes the action. A1's retry event represents a test reset. Mini-pack usefulness is optional and describes respondents only. |
| Retention | **First and returning browser windows** = `visit_started` counts split by Browser Visit. **Returning-window share** = returning windows ÷ windows with either classification. **Site cohort retention** = `cohortActiveUsers` ÷ `cohortTotalUsers` for first-session cohorts at each completed week offset. | The browser flag uses local storage and a 90-day lookback. A browser can contribute several windows. GA4's first-session cohort measures return to the site using GA4 identity. Keep these separate from learner retention. |
| Retention | **Returning learners** = users who start in a cohort week and start again in a later measured week. Divide by the first week's starters for that cohort's weekly return rate. **Repeat content engagement** = distinct users who start, resume or record study time for one fixed content ID on at least two different property-local dates within the last 28 complete days, divided by distinct users with any of those events for that ID in the same window. | Use Cohort Exploration for weekly starts. An event-defined cohort can include the same user in multiple cohort weeks. For fixed-item repeat engagement, use a user sequence with the same ID on both steps and confirm different dates in User Explorer. The aggregated Data API does not expose an exact cross-date user sequence count. |
| Technical quality | **Learning errors** = `learning_error` count by code, format and page. **Playback and archive failures** = separate totals for `audio_failed`, `library_failed` and `resource_failed`. **Missing required parameter share** = applicable events lacking the parameter ÷ applicable events. | Current error coverage varies by path. There is no consistent attempted-load denominator for a failure rate. For dimensions, count blank and `(not set)` rows. For required custom metrics, subtract the GA4 parameter occurrence count from event count. Check one event and parameter at a time. |
| Technical quality | **Core Web Vitals** use field p75 LCP and INP in milliseconds and CLS as a unitless score on the available 28-day window. | Use Search Console's Mobile and Desktop page groups, or the CrUX field view in PageSpeed Insights for an eligible URL or its origin. Keep origin and URL results labeled. A missing field sample is unavailable. [CrUX reporting tools](https://developer.chrome.com/docs/crux/methodology/tools) |

### Programmatic queries

With the desktop OAuth client, request both `analytics.readonly` and `webmasters.readonly` for combined reporting. Use property `565704627` and the Search Console property `sc-domain:baulingo.app`. Send the bearer token from local credentials and set the quota project to `baulingo-web`. Clear the short-lived token from the shell after the queries.

- **Search Console.** POST to `https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Abaulingo.app/searchAnalytics/query` with `startDate`, `endDate`, `type: "web"` and `dataState: "final"`. Request `dimensions: ["page"]` for landing pages and `["query"]` for search terms. Add `country`, `device` or `date` only when needed. Paginate using `rowLimit` and `startRow`. [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- **GA4.** POST to `https://analyticsdata.googleapis.com/v1beta/properties/565704627:runReport`. Use explicit `dateRanges` and an `eventName` dimension filter for each event-based report. Use `customEvent:<parameter>` for registered dimensions and metric sums, such as `customEvent:duration_seconds`. Use `countCustomEvent:duration_seconds` with `eventCount` for study-time parameter coverage. Use `eventCount` for actions and `totalUsers` for distinct users. Query acquisitions with `sessionSourceMedium`, `country`, `language` or `deviceCategory`, and `sessions`, `totalUsers`, `engagementRate`. Run a separate report grouped by native `landingPage`. For first-session cohorts specify `cohortSpec` with `firstSessionDate`, weekly granularity and offsets for complete weeks. Request `cohort`, `cohortNthWeek`, `cohortActiveUsers` and `cohortTotalUsers`. [Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema) · [Cohort reporting](https://developers.google.com/analytics/devguides/reporting/data/v1/advanced#cohort_reports)

On 26 November, the Search Console page and query calls returned finalized rows for 12–24 November. GA4 accepted the acquisition, landing-page, content, engagement, learning, study-time, return, error, parameter-coverage and cohort report shapes. The release-day sample had no processed rows for learning outcomes, study-time totals or errors, and custom attribution remained sparse. The cohort query had a week-zero row only. PageSpeed Insights returned HTTP 429, so Baulingo's current CrUX field coverage remains unverified. Use the Search Console Core Web Vitals screen or rerun the PageSpeed Insights field check.

### Saved GA4 Explorations

1. In **Explore → Funnel exploration**, name the exploration **Baulingo practice progression**. Set the date range to complete post-migration days. In **Settings → Steps → edit**, add `learning_started` and `learning_completed` as indirectly followed steps with a one-day limit. Require the same fixed Content ID at both steps. Set the appropriate Completion Type on completion, and leave **Make open funnel** off. Duplicate the tab for other formats and for section paths. For viewer engagement, use `content_viewed` first and an OR group of `learning_started`, `learning_resumed` and `study_time` second, with the same fixed content ID.
2. In **Explore → Cohort exploration**, name it **Baulingo weekly learner return**. In **Settings** set **Cohort inclusion → Others → learning_started** and **Return criteria → Others → learning_started**. Select **Weekly**, **Standard** and **Active users**. Divide each later complete-week cell by its cohort size, or use **Per cohort user** when displayed. For site retention, duplicate and use **First touch** with **Any event** as the return criterion.
3. In the funnel or a free-form exploration, right-click a count and choose **View users** to open User Explorer with that population. Open a row to review the event sequence, content IDs and timing. For a recurring fixed lesson, create a user segment via **Variables → Segments → + → User segment → Add sequence**, use the same Content ID and qualifying event on both steps, then inspect the timestamps for repeats on different dates. Keep sequence counts distinct from the weekly cohort calculation. [GA4 funnel exploration](https://support.google.com/analytics/answer/9327974) · [Cohort exploration](https://support.google.com/analytics/answer/9670133) · [User Explorer](https://support.google.com/analytics/answer/9283607)

### Native Looker Studio report

1. In Looker Studio choose **Create → Data Source → Google Analytics → Authorize**, select **baulingo-web** and connect. Create two more data sources with the **Search Console** connector, domain property **baulingo.app** and search type **Web**. Choose **Site Impression** for queries and **URL Impression** for landing pages. [Google Analytics connector](https://docs.cloud.google.com/data-studio/connect-to-google-analytics) · [Search Console connector](https://docs.cloud.google.com/data-studio/connect-to-search-console)
2. Choose **Create → Report**, add the three sources via **Add data**, and create pages named **Acquisition**, **Content**, **Learning**, **Retention** and **Technical quality**. Add a **Date range control** to each page. For GA4 learning charts also set a fixed filter keeping dates from 27 November 2026 onward. Use **Add a chart → Table** and set the data source, dimensions, metrics and chart filters in **Setup**. [Date range control](https://docs.cloud.google.com/data-studio/date-range-control)
3. In **Acquisition**, create separate Search Console tables by Query and Landing Page, with clicks, impressions, CTR and average position. Add GA4 tables by Session source / medium and Landing page with Sessions, and a separate AI referral table filtered to `visit_started` by AI Source and Landing Page ID. In **Content**, use separate charts for exposure, starts and study time with the event filters above. Add controls for Content Format, Content Category and Collection ID, with Content ID in the lesson table.
4. In **Learning**, use GA4 event tables split by Completion Type, Section ID, Outcome and Feedback as applicable. Link to the saved GA4 exploration for ordered, distinct-user funnel rates. In **Retention**, use a Browser Visit table filtered to `visit_started` and link to the cohort exploration for week-by-week retention. In **Technical quality**, chart Learning Error Code with Event count and add a link to Search Console Core Web Vitals. Keep source availability visible for missing-parameter and field-data checks that are unavailable in the connector.
5. If a custom field is absent, use **Resource → Manage added data sources → Edit → Refresh fields → Apply** and confirm that the chart uses the intended scope and units. Preview the report and compare a complete date range against the API queries. Keep Search Console and GA4 charts separate unless a later comparison specifies a shared canonical URL and matching grain. [Refresh data source fields](https://docs.cloud.google.com/data-studio/refresh-data-source-fields)

## Search Console performance extraction

The read-only `seo:performance` command writes JSON and CSV pairs in a timestamped directory under ignored `.dev/seo/`. Each JSON file contains its request metadata and limitations; the CSV alongside it contains the corresponding rows. Obtain a short-lived ADC token with both `analytics.readonly` and `webmasters.readonly` as described above, and set `BAULINGO_GA4_ACCESS_TOKEN` and `BAULINGO_GA4_QUOTA_PROJECT`. The existing desktop client and GA4 credentials are shared; no token is saved by the command.

```powershell
npm run seo:performance -- --range 28 --compare true
npm run seo:performance -- --range custom --start 2026-11-01 --end 2026-11-23
```

Ranges are `7`, `28`, `90`, `max` (starting before the 16-month availability window), and `custom`. Optional `--property`, `--type`, and `--output` select the property, search type, and local output directory. The default end date is three days before the current UTC date; Search Console reports dates in Pacific time, and a recent day may not yet be finalized. The default property is the discovered domain property; override it if property access changes. Use `--compare true` for an equal preceding period.

The total report is queried independently from date, query, page, query/page, country, device, query/date, page/date and search-appearance reports. Google may anonymize queries or omit rows, and property- and page-level aggregation differ. Do not sum these reports to reconstruct property totals or average their CTR or positions. The API supplies finalized data only; an empty row set does not establish zero search demand. Review weekly, and retain selected exports outside the production build if a longer history is needed. No indexing or GA4-joining command is implemented by this phase.

## Search Console indexing checks

`npm run seo:indexing` reads the submitted sitemap list, compares the production sitemap with the current catalog, and inspects up to four representative URLs by default. It uses the same short-lived credentials and quota project as `seo:performance`. It makes only read requests; it does not submit sitemaps or request indexing.

```powershell
npm run seo:indexing
npm run seo:indexing -- --urls "https://baulingo.app/,https://baulingo.app/en/" --limit 2
npm run seo:indexing -- --performance .dev/seo/<run>/current-page.json
```

The optional page-performance JSON must be an unfiltered `page` report for the same property. Its missing rows are candidates for review, not proof of zero impressions; unmatched reported URLs are not necessarily removed. Use the same reporting dates when making comparisons. The JSON output in `.dev/seo-indexing/<run>/indexing.json` preserves the sitemap status, comparison, selected inspection fields, HTTP status, redirect location and canonical checks. `--property` and `--output` override defaults. URL selection accepts exact catalog sitemap URLs, limits each run to 100, and defaults to at most five. Prioritize important or newly changed pages; do not inspect the entire catalog routinely.

Responses are cached by property and URL in `.dev/seo-indexing/cache` for seven days. Use `--cache-days 0` to refresh and `--limit` to bound the request count; the cache reports its original inspection timestamp. Google quotas still apply, and cached data may be stale. A failed inspection stops the run; prior cached successful responses remain available.

URL Inspection reports Google's indexed information, not a live indexing test. HTTP and canonical checks apply only to selected URLs and do not establish indexability or visibility. The catalog has no publication dates, so the command cannot identify newly published pages without external evidence. Compare the Search Console interface and investigate unexpected exclusions, canonical changes and redirects before treating them as faults. Review sitemap status weekly and inspect only important changes or anomalies.

## Map Search Console pages to content

Run `npm run seo:map -- .dev/seo/<run>/current-page.json` (or use a query/page or page/date JSON report). The command writes a new JSON and CSV pair under `.dev/seo-mapped/`, preserving each original URL, normalized URL, search metrics and dimension values alongside catalog `page_id`, `content_id`, `content_format`, `content_category`, `collection_id`, `level` and `content_language`. Filter the CSV by these fields to compare catalog-defined levels, languages, formats, collections and categories. Empty fields mean the catalog does not define that classification; they are not inferred.

Only exact catalog URLs on the production origin map after standard URL parsing. Query strings, alternate hosts and unknown paths remain unmatched for review; this includes legal routes outside the publishing catalog. Localized pages retain distinct page IDs. No clicks or impressions are reassigned between URL variants. Detailed Search Console rows may be omitted and cannot reconstruct property totals. Request totals at the required grain where possible; do not average row CTR or position. Search and learning metrics are not joined by this command.

## Combined page evidence

After the first full clean GA4 day has passed and finalized Search Console data exists for the same dates, run `npm run seo:combined -- .dev/seo/<run>/current-page.json`. The input must be an unfiltered finalized web page report for `sc-domain:baulingo.app`, starting no earlier than 27 November 2026. Reports are written to `.dev/seo-combined/<run>/`. The command reads GA4 property `565704627` with the existing read-only token and quota project.

The page CSV combines Google Search page rows with Google organic landing-page sessions and page-ID event measures. The JSON retains separate content-ID event rows, response metadata, unmatched GA4 identities and canonical aliases excluded from the join. Catalog pages with GA4 evidence but no Search Console row are included with search metrics unavailable. Empty measures mean no corresponding reported row; they are not asserted to be zero. Search Console and GA4 use Pacific and Berlin dates respectively, and differ in attribution, aggregation, and consent coverage. Counts of starts and completions are events, not user conversion rates. Returning learner sequences and conversion funnels are unavailable here; they require suitable cohort or funnel analysis. Do not join search queries to learning events or sum distinct users across content or pages. Inspect GA4 response metadata for thresholding or other quality restrictions before interpreting results.
## Search opportunity review

Run `npm run seo:opportunities -- .dev/seo/<run>/current-query_page.json`. Optionally add the matching adjacent `previous-query_page.json`, and then a same-period `.dev/seo-combined/<run>/combined.json`. Use `-` in place of the previous report if only GA4 evidence is supplied. JSON and a short Markdown review are written under `.dev/seo-opportunities/`.

The first rules flag low-CTR query/page rows with at least 100 impressions and average position at most 20, and query overlap where at least two catalog pages each have 30 impressions. These are conservative review thresholds, not statistical significance tests, evidence of causation or ranking guarantees. All candidates are low confidence and require checking search intent, actual page content and the search results. The report makes no recommendations from unmatched URLs. Search Console does not disclose every query, and its impressions are not keyword search volume. Do not attribute GA4 engagement to a search query.

An empty opportunity list means the rules found insufficient evidence, not that no opportunities exist. Content-gap recommendations still require manual research; no absence of disclosed query rows is treated as a content gap. `futureKeywordPlanner` is a placeholder only; no Google Ads integration is enabled.

## SEO command workflow

Run `npm run seo:check` after setting the same read-only ADC token and quota-project environment variables used by GA4. It lists accessible properties and permission levels, checks the selected property and requests a finalized 28-day total. `--property <property>` selects another property. A successful empty report verifies connectivity, not traffic. The command reports whether it sent the quota-project header; it does not independently establish billing or quota attribution.

Use `seo:performance` for Search Console JSON/CSV extraction, `seo:indexing` for sitemap and selected URL inspection, `seo:map` for catalog mapping, `seo:combined` for clean-period GA4 page evidence, and `seo:opportunities` for the currently implemented review rules. These are local read-only tools. Their timestamped outputs and inspection cache default to ignored `.dev/` directories and are not production assets. Follow the individual sections above for options, definitions and limitations.

## SEO integration verification — 26 November 2026

The read-only property discovery returned `sc-domain:baulingo.app` with owner access. A fresh direct API request for 1–23 November matched the saved unfiltered total: 3 clicks, 28 impressions, CTR 10.7%, and average position 16.4. This is an API-to-export comparison, not a comparison with the Search Console interface. A live URL Inspection sample reported the DTZ mock test as crawled but currently unindexed; three sampled index pages were indexed. The live sitemap matched all 297 catalog sitemap locations, while Search Console's sitemap status still reported its older download.

The first opportunity report found no candidates under its thresholds. GA4's first clean full day begins 27 November; no clean-period combined report could be validated on 26 November. Search Console UI comparison, full GA4 join validation after that date, and the unimplemented recommendation types above remain outstanding. Automated tests cover date validation, missing dimensions, pagination, empty rows, token/permission/quota error handling, URL mapping, basic GA4 joins and CSV escaping; they do not prove the complete live GA4 workflow or every API quota behavior.

On the following local verification, 140 Node tests, the build and Astro check passed (Astro telemetry was disabled for the check). All ten saved Search Console CSVs matched their corresponding JSON rows. The clean GA4 baseline day of 27 November was still in progress; a full-day report cannot be validated until it finishes and both services have processed the period.

### Search Console interface comparison

On 27 November 2026, the signed-in Search Console interface for the domain property showed Web search results for 29 October–24 November: 3 clicks, 34 impressions, 8.8% CTR and position 18.9. A separate finalized, unfiltered API request for the same dates returned 3 clicks, 34 impressions, CTR 0.0882352941 and position 18.9117647. The interface values match the API after rounding. This completes the previously outstanding interface-to-API comparison for that property, search type and date range; it does not verify every dimension report or the pending GA4 join.

### Additional opportunity evidence

Pass `--indexing .dev/seo-indexing/<run>/indexing.json` to include selected recent (at most 30-day-old) inspection results for the same property. An exclusion, unexpected status or canonical mismatch produces a review item, not a live indexing verdict. Pass both `--page-current .dev/seo/<run>/current-page.json` and `--page-previous .dev/seo/<run>/previous-page.json` for adjacent equivalent page periods. The current period must match the query/page input. A fall of at least 40% requires at least 100 previous and 50 current reported impressions; an improvement of at least three position places requires 100 impressions in both periods. Query mix and search appearance can change position, and no causality is implied.

With matching combined GA4 data, at least 20 learning-start events and fewer than 50 explicitly reported search impressions prompt a review of relevant internal links. At least 50 Google organic landing sessions and an explicitly reported zero starts prompt an instrumentation and page-purpose review. The existing combined extractor represents absent rows as unknown, so it does not manufacture zero starts; the latter rule cannot fire from missing event rows. Landing sessions and page events have different scopes, and their comparison is not a conversion rate. All thresholds are review heuristics and do not establish learner demand.
