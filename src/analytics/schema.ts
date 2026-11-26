export const measurementId = 'G-R1YH6T64JM';

const enums = {
  activity_type: ['sentence','dtz','mini_pack','writing','a1_test','topic','resource','audio','site'],
  content_category: ['grammar','everyday_communication'],
  content_language: ['tr','en','de'],
  target_language: ['tr','en','de'],
  level: ['A1','A2','B1','B2','C1','C2'],
  outcome: ['correct','incorrect'],
  feedback: ['helpful','not_helpful'],
  error_code: ['audio_failed','library_failed','resource_failed'],
  completion_type: ['checked','self_review','exam_result'],
} as const;
const ids = ['activity_id','exercise_id','section_id'] as const;
const counts = ['result_count','attempt_number','questions_answered','correct_answers','duration_seconds'] as const;
const context = ['activity_type','content_language'] as const;
const activity = [...context,'activity_id'] as const;
const detail = ['exercise_id','section_id','attempt_number'] as const;
export const learningEvents = {
  learning_started: [activity, []],
  learning_resumed: [activity, []],
  learning_paused: [activity, []],
  learning_completed: [[...activity,'completion_type'], ['questions_answered','correct_answers']],
  exercise_answered: [[...activity,'outcome'], detail],
  exercise_retried: [activity, detail],
  topic_selected: [activity, []],
  level_selected: [[...context,'level'], ['activity_id']],
  search_performed: [[...context,'result_count'], []],
  search_no_results: [[...context,'result_count'], []],
  hint_used: [activity, detail],
  answer_revealed: [activity, detail],
  audio_played: [activity, ['section_id']],
  audio_completed: [activity, ['section_id']],
  section_completed: [[...activity,'section_id'], ['completion_type']],
  study_time: [[...activity,'duration_seconds'], []],
  feedback_submitted: [[...activity,'feedback'], []],
  language_changed: [[...context,'target_language'], []],
  download_clicked: [activity, []],
  app_store_clicked: [activity, []],
  learning_error: [[...context,'error_code'], ['activity_id']],
} as const;

type Fields = { [K in keyof typeof enums]: (typeof enums)[K][number] }
  & Record<typeof ids[number], string> & Record<typeof counts[number], number>;
export type LearningEvent = keyof typeof learningEvents;
type EventFields<N extends LearningEvent> = Pick<Fields, typeof learningEvents[N][0][number]>
  & Partial<Pick<Fields, typeof learningEvents[N][1][number] | 'content_category' | 'level'>>;
export type EventInput<N extends LearningEvent> = N extends 'learning_completed'
  ? Omit<EventFields<N>, 'completion_type' | 'questions_answered' | 'correct_answers'> &
    ({ completion_type: 'self_review' } | ({ completion_type: 'checked' | 'exam_result' } & Pick<Fields, 'questions_answered' | 'correct_answers'>))
  : EventFields<N>;
export type ActivityContext = EventInput<'learning_started'>;

function accepted(key: keyof Fields, value: unknown) {
  if ((ids as readonly string[]).includes(key)) return typeof value === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(value);
  if ((counts as readonly string[]).includes(key)) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 86400;
  }
  return (enums[key as keyof typeof enums] as readonly unknown[]).includes(value);
}

export function sanitizeLearningEvent(name: string, values: Record<string, unknown> = {}) {
  if (!Object.hasOwn(learningEvents, name) || !values || typeof values !== 'object') return null;
  const [required, optional] = learningEvents[name as LearningEvent];
  if (!required.every(key => accepted(key, values[key]))) return null;
  if (name === 'search_no_results' && values.result_count !== 0) return null;
  if (name === 'study_time' && values.duration_seconds === 0) return null;
  if (name === 'learning_completed' && values.completion_type !== 'self_review' &&
    (!accepted('questions_answered', values.questions_answered) || !accepted('correct_answers', values.correct_answers) ||
      Number(values.correct_answers) > Number(values.questions_answered))) return null;
  const fields = new Set<keyof Fields>([...required, ...optional, 'content_category', 'level']);
  if (name === 'learning_completed' && values.completion_type === 'self_review') {
    fields.delete('questions_answered');
    fields.delete('correct_answers');
  }
  return Object.fromEntries([...fields].flatMap(key => accepted(key, values[key]) ? [[key, values[key]]] : []));
}

export const ga4Property = { id: '565704627', displayName: 'baulingo-web', origin: 'https://baulingo.app' } as const;
export const ga4Limits = { customDimensions: 50, customMetrics: 50, keyEvents: 30 } as const;

export const entryAttribution = {
  ai: { campaign_source: 'chatgpt.com', campaign_medium: 'referral', ai_source: 'chatgpt' },
  campaign: { campaign_source: 'baulingo', campaign_medium: 'referral', campaign_name: 'german-courses' },
  visitWindow: 30 * 60_000,
  returningWindow: 90 * 24 * 60 * 60_000,
} as const;

const activeStudySemantics = 'Visible active study in whole-second deltas, bounded by 60 seconds since trusted input.';
export const eventSemantics = {
  page_view: 'Entry or changed page path without a query or fragment.',
  visit_started: 'Consented acquisition window with a 30 minute inactivity limit.',
  content_viewed: 'Consecutive exposure to a collection or individual item.',
  learning_started: 'Explicit interaction starts practice for the active activity.',
  learning_resumed: 'Explicit continuation of a restored attempt.',
  learning_paused: 'Explicit pause of an active attempt.',
  learning_completed: 'Checked practice, exam result or self-marked completion.',
  exercise_answered: 'One graded check or exam answer. Questions may repeat.',
  exercise_retried: 'Explicit retry of an exercise or test.',
  topic_selected: 'Explicit choice of learning content.',
  level_selected: 'Explicit choice of level.',
  search_performed: 'Settled search or submitted query. Only the result count is sent.',
  search_no_results: 'A tracked search returned zero results.',
  hint_used: 'Explicit hint request.',
  answer_revealed: 'Explicit request for the answer or model.',
  audio_played: 'Start of tracked playback.',
  audio_completed: 'Tracked playback reached its end.',
  section_completed: 'Reviewed mini-pack section, writing task or completed exam section.',
  study_time: activeStudySemantics,
  feedback_submitted: 'Optional helpful or not helpful choice.',
  language_changed: 'Explicit language choice.',
  download_clicked: 'Resource download or local export action.',
  app_store_clicked: 'Click to the Android listing.',
  learning_error: 'Allowlisted failure category without the message or stack.',
} satisfies Record<LearningEvent | 'page_view' | 'visit_started' | 'content_viewed', string>;

type TransportDimension = 'page_id' | 'content_id' | 'content_format' | 'collection_id' | 'landing_page_id' | 'ai_source' | 'browser_visit';
type MetricParameter = typeof counts[number];
function dimension(parameterName: Exclude<keyof Fields, MetricParameter> | TransportDimension, displayName: string, description: string) {
  return { parameterName, displayName, description, scope: 'EVENT' } as const;
}
function metric(parameterName: MetricParameter, displayName: string, description: string, measurementUnit: 'STANDARD' | 'SECONDS' = 'STANDARD') {
  return { parameterName, displayName, description, scope: 'EVENT', measurementUnit } as const;
}
function keyEvent(eventName: LearningEvent) {
  return { eventName, countingMethod: 'ONCE_PER_EVENT' } as const;
}

export const ga4Definitions = {
  customDimensions: [
    dimension('activity_id', 'Activity ID', 'Stable ID of the tracked learning activity.'),
    dimension('activity_type', 'Activity Type', 'Activity grouping retained for existing reports.'),
    dimension('content_category', 'Content Category', 'Grammar or everyday communication.'),
    dimension('exercise_id', 'Exercise ID', 'Stable exercise identifier within an activity.'),
    dimension('section_id', 'Section ID', 'Stable section identifier within an activity.'),
    dimension('level', 'CEFR Level', 'CEFR level of the content or explicitly chosen level.'),
    dimension('content_language', 'Content Language', 'Language of the learning content.'),
    dimension('target_language', 'Target Language', 'Language selected by the learner.'),
    dimension('outcome', 'Outcome', 'Correct or incorrect graded answer.'),
    dimension('completion_type', 'Completion Type', 'Checked, self-review or exam-result completion.'),
    dimension('feedback', 'Feedback', 'Helpful or not helpful feedback after practice.'),
    dimension('error_code', 'Learning Error Code', 'Allowlisted failure category.'),
    dimension('page_id', 'Page ID', 'Stable ID of the localized page.'),
    dimension('content_id', 'Content ID', 'Stable ID of the learning material across locales.'),
    dimension('content_format', 'Content Format', 'Publishing format of the material or embedded sentence.'),
    dimension('collection_id', 'Collection ID', 'Stable ID of the course or collection.'),
    dimension('landing_page_id', 'Landing Page ID', 'Stable ID of the entry page for the acquisition window.'),
    dimension('ai_source', 'AI Source', 'Observable ChatGPT entry from an approved referrer or tag.'),
    dimension('browser_visit', 'Browser Visit', 'First or returning browser within 90 days when storage is available.'),
  ],
  customMetrics: [
    metric('duration_seconds', 'Active Study Time', activeStudySemantics, 'SECONDS'),
    metric('result_count', 'Search Result Count', 'Number of results returned by a tracked search.'),
    metric('attempt_number', 'Attempt Number', 'Ordinal of the current exercise attempt.'),
    metric('questions_answered', 'Questions Answered', 'Count of questions answered for a scored completion.'),
    metric('correct_answers', 'Correct Answers', 'Count of correct answers for a scored completion.'),
  ],
  keyEvents: [keyEvent('learning_started'), keyEvent('learning_completed'), keyEvent('app_store_clicked')],
};
