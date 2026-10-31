# Baulingo long-term roadmap

Updated: 30 October 2026. This is the product roadmap. [Architecture](architecture.md) describes implementation, [production notes](production.md) record deployment and verification, and [handoff](handoff.md) identifies the next work.

## Direction

Make Baulingo the place where Turkish speakers find a clear German explanation, practise it immediately and return when they need help again. Use evidence from small embedded experiments to decide which content and learning experiences to develop.

The approved [homepage layout and Turkish wording](design/homepage.md) remain authoritative. Experiments belong inside the homepage or relevant existing website content and ship with the main site. The earlier separate experiment page, project and subdomain proposal is superseded. The WWW redirect Worker is hosting infrastructure.

Build in stages. Later stages are conditional directions, not fixed delivery dates or a commitment to build every feature. Advance when the preceding work answers its learner question.

## Stages

| Stage | Status | Product work | Evidence needed to advance |
| --- | --- | --- | --- |
| 1. Working foundation | Live | Approved homepage, Turkish topic explanations, search, recorded audio, short sentence activity, free study notes, legal pages and reliable hosting. | Technical checks pass and visitors can reach and use the core experience. Live deployment checks and 18 automated tests are recorded in production notes. Learner usefulness still needs evaluation. |
| 2. Understand demand | Next | Small embedded experiments using topic choices, short activities and optional feedback. Begin with one clearly defined learner question. | Learn which problems visitors bring, which formats they choose and why. Compare expressed preferences with actual use where measurement supports it. |
| 3. Develop the strongest content areas | Planned; follows demand evidence | Expand selected topics with Turkish explanations, natural German examples, relevant practice and related resources. | Find which explanations help visitors understand, continue and find their next useful topic. Prioritise demonstrated needs over filling every category. |
| 4. Improve practice | Conditional on useful content and format signals | Develop reusable sentence-building, listening, response-choice and short-writing activities. Introduce formats one at a time. | Identify activities people can understand, finish and find useful enough to repeat. Separate learning difficulties from interface problems. |
| 5. Support a continuing learning habit | Conditional on repeat demand | Connect lessons, offer saved topics and lightweight review. Add accounts or synchronisation when a demonstrated need justifies them. | Establish whether people return and what helps them continue or remember. A return-visit measurement method must exist before reporting retention. |
| 6. Connect website and app | Conditional on a relevant app next step | Let visitors try useful learning experiences on the website and discover the app when it offers a meaningful continuation. | Understand why someone would move from a quick answer to regular study. Use confirmed app availability and real destinations. |
| 7. Expand sustainably | Longer-term options | Develop deeper everyday-life pathways, reviewed exam preparation and potentially paid learning products. | Establish which outcomes learners value enough to commit time or money. Monetisation is an option to validate; existing free resources stay accessible without signup. |

Content and practice can improve together after the initial experiment; stage numbers express dependencies rather than a rigid release schedule.

## Audience and content priorities

Start with Turkish-speaking learners' actual questions in three areas:

- Understanding German: articles, cases, word order and differences from Turkish.
- Using German in daily life: appointments, doctors, shopping, work and official situations.
- Preparing for a specific goal: A1 family reunification or a particular B1 exam. Review each exam's tasks and requirements separately before publishing preparation content.

These are candidate areas, not a preselected winner. Demand evidence determines what receives deeper treatment. The owner subsequently requested the app's existing original DTZ simulation as a website traffic resource. That port is implemented locally, with publication pending; it does not establish exam-preparation demand. Other A1/B1 exam packages remain planned. Keep the available DTZ resource distinct from those unfinished packages.

## Experiment decision cycle

For each embedded experiment, record:

1. Question: the uncertainty about a learner need or preference.
2. Experience: the smallest useful interaction visitors will try and where it fits in the existing website.
3. Evidence: the choices, completion or optional feedback that can answer the question, with the measurement method and limits defined.
4. Decision: what would justify expanding, adjusting or stopping the idea. Define success criteria before interpreting results.

Possible signals include topic or situation choices, activity starts and completions, requests for help and explicit usefulness feedback. An unfinished activity alone does not establish disinterest; the interaction may be confusing or the learner may need an explanation. Page views alone do not establish learning value.

Cloudflare Web Analytics now measures aggregate website traffic and browser performance; see [analytics operations](analytics.md). No experiment event pipeline is implemented. The existing search and practice run in the browser; do not describe them as collected demand data. Specify any data collection, storage and relevant privacy updates as part of the selected experiment. Native app telemetry and first-install behaviour are outside this website roadmap task.

## Immediate next milestone

The owner's latest priority is acquiring traffic before adding a preference experiment. Prepare and publish the existing DTZ simulation as a useful, free resource in the main site, then test relevant community/teacher distribution and search discovery. The [DTZ port](content/dtz-web.md) is implemented locally; publication remains pending. Search Console impressions/clicks and Cloudflare page/referrer reports can inform acquisition, but no channel results or learner demand have yet been established. Do not treat implementation checks as real visitor evidence.

Once relevant visitors arrive, define one embedded experiment brief before expanding activities or adding event tracking. The initial question remains which need visitors most want help with and which activity format helps. Use the existing sentence activity or DTZ experience where appropriate; choose placement and an evidence method without redesigning the homepage.

## Delivery constraints

- Keep Turkish explanations and the selected visual design central.
- Continue with the current static HTML/CSS and native JavaScript foundation. Framework migration, backend services and accounts need a concrete product reason.
- Ship embedded experiments with the website's normal build and deployment. Native Android releases remain independent.
- Keep resources and downloads free and usable without an account or email capture.
- Use the agreed free hosting plans; do not enable paid infrastructure to pursue an unvalidated idea.
- Treat proposed features and measured outcomes separately from what is implemented and verified.
