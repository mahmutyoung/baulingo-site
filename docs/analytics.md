# Website analytics configuration

Prepared: 30 October 2026. This is a configuration and operating guide, not evidence that collection is active.

## Default analytics coverage

Use the existing Cloudflare Free plan HTTP Traffic view for baseline request counts and bandwidth. It measures traffic at the edge, including asset and crawler requests. Use Cloudflare Web Analytics for aggregate browser page views and performance where the beacon is served. Each source describes a different population. [Cloudflare Zone Analytics](https://developers.cloudflare.com/analytics/account-and-zone-analytics/zone-analytics/) · [Cloudflare Web Analytics collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)

On 26 November 2026 a fresh Chrome profile with GA4 declined loaded one Cloudflare beacon on each of `/` and `/konular/`. Cloudflare accepted a measurement from each page with HTTP 204, and the Google Analytics tag was absent on both. This verifies default-on collection for those pages from the test network. Dashboard ingestion and coverage across regions were outside this check. The saved credential and Wrangler login both received authorization errors from the zone and GraphQL endpoints, so the check used browser and network evidence.

Use the explicit GA4 choice for learning events, study time, campaign attribution and returning-browser measurement. Review beacon configuration and regional scope before expanding browser collection. German regulators assess whether audience measurement can run without consent based on its configuration and purpose. [German data protection authorities’ guidance](https://www.lfd.niedersachsen.de/download/142884/Orientierungshilfe_fuer_Anbieter_von_digitalen_Diensten_Stand_November_2024_.pdf)

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

Website property separation (24 November 2026): the owner provided a dedicated website measurement ID. After this change is deployed, new consenting website traffic will go to the separate website property. Historical data remains in the previous property; Android/Firebase configuration is unchanged. Verify the new property in Realtime/DebugView and configure its custom definitions and Search Console link independently.

The public website source now includes an optional Google Analytics 4 integration using measurement ID `G-R1YH6T64JM`, with no separate environment variable required. The JavaScript module is delivered from `src/analytics.js` and loads Google's tag only after visitors explicitly select **Analize izin ver** / **Allow analytics**. Declining means no Google tag is loaded. The footer **Analiz ayarları** / **Analytics settings** control permits withdrawal, clears accessible GA cookies, and reloads to stop the previously loaded tag. Consent is stored locally when browser storage is available. No visitor's raw search text, attempted answer, DTZ written draft or saved attempt is included in custom events.

Events: `learning_started` and `learning_completed` for the short sentence builder and the DTZ mock exam; `exercise_answered` with only `correct` / `incorrect` for the sentence builder. Custom parameters are `activity_id`, `activity_type`, `content_language`, and for checks `outcome`. An event labelled completion means the activity reached its correct-answer or exam-result state, not a demonstrated long-term learning gain. Activity and landing-page reports require real visitor consent and Google Analytics configuration.

The website also includes the necessary Google Tag Manager/Analytics script, connection and image CSP exceptions, while preserving Cloudflare Web Analytics. It updates only the public website privacy section; native app tracking and Android disclosures are unchanged. The code changes are not evidence of live delivery, data collection or analytics dashboards. After the feature is released, verify the GA4 tag in the production browser only after consent, no Google requests before consent, event visibility in GA4 Realtime/DebugView, and no tracking after withdrawal. Run `npm test` and `npm run build` before release.

**Manual Google account step:** Go to GA4 Admin → Product links → Search Console links and link the verified `baulingo.app` property to the matching GA4 web stream. This account-level action cannot be completed by repository changes alone. Then publish the Search Console reports collection in GA4 Reports → Library. The integration does not expose each visitor's Google query to activity events; use landing-page aggregates for comparisons.


## Expanded learning analytics — 24 November 2026

Source-side instrumentation, pending build, deployment and GA4 verification. The dedicated website property uses `G-R1YH6T64JM`. The v2 consent notice requests renewed consent from previously consenting visitors; earlier refusals remain respected. No analytics are sent for local, review or noindex pages. No new database or native app changes.

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

GA4 Admin: register event-scoped custom dimensions activity_id, activity_type, content_category, exercise_id, section_id, level, content_language, target_language, outcome, completion_type, feedback and error_code; register custom metrics duration_seconds, result_count, attempt_number, questions_answered, correct_answers. Mark learning_started and learning_completed as key events if desired. Disable enhanced measurement automatic page views based on browser history, site search, form interactions, outbound clicks and file downloads (the site sends its own sanitized events; prevent duplication and URL/query/draft leakage). Review URL data redaction, Google Signals and ads settings in the new property; code disables ads signals and personalization. Page URLs omit queries and fragments, so campaign attribution from UTM parameters is limited. Use Search Console landing-page reporting. Do not treat consented GA4 users as all visitors.

Acceptance checks: no Google script/events before consent, after rejection/withdrawal, or in review. Test a Turkish and English mini-pack, grammar lesson, sentence builder, A1 test, DTZ test and writing course. Check one event per meaningful action, correct vs incorrect, no raw answer/search/draft text, clean page URLs and no duplicate SPA page views. Verify 30-second study-time deltas, visibility/idle cutoff and optional feedback. Keep the property separate from Android. No historical backfill.


## Mini-pack analytics taxonomy — 25 November 2026

Both everyday communication and grammar lessons use the same learning format: `activity_type = mini_pack`. The separate event-scoped dimension `content_category` identifies the subject: `everyday_communication` or `grammar`. All mini-pack player events, including progress, answer checks, time, level selection and library errors, inherit the category from the selected track. Existing lesson IDs, levels, languages and other activity types are unchanged.

In GA4, create the event-scoped custom dimension **Content Category**, parameter `content_category`. For the unified mini-pack funnel, use `activity_type exactly matches mini_pack` on each step and break down by Content Category (or CEFR Level). For a grammar-only funnel, additionally require `content_category exactly matches grammar`. Previously collected events are not rewritten: the former `activity_type = grammar` remains in historical data and previous everyday mini-pack events have no content_category. Compare post-release periods when using the new schema.

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

Register event-scoped dimensions for `page_id`, `content_id`, `content_format`, `collection_id`, `landing_page_id`, `ai_source` and `browser_visit` alongside applicable [existing definitions](#expanded-learning-analytics--24-november-2026). Use native campaign fields for the registered campaigns. Before release, confirm the stream's enhanced measurement settings disable automatic history page views, site search, outbound clicks, form interactions and file downloads where they overlap the custom implementation or would include raw URLs. Verify Realtime or DebugView after an authorized deployment and annotate the actual release boundary. Historic events are retained in their original schema.

Use the count of `visit_started` with `ai_source=chatgpt` as the observable referral denominator. Compare exposed content and applicable starts or completions by `landing_page_id` and `content_id`. For conversion, count qualifying visits in a GA4 session segment where the tool supports that scope. Raw event totals include repeat views, repeated practice and multiple lessons. A Baulingo tab window can differ from GA4's session definition. Keep checked completions, self-review completions and exam results separate. Counts describe consenting browsers, and the returning flag measures browser storage rather than people. Use Search Console for organic landing-page discovery and Cloudflare for aggregate traffic.
