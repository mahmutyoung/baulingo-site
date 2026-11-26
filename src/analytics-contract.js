// @ts-check

const enums = /** @type {const} */ ({
  activity_type: ['sentence','dtz','mini_pack','writing','a1_test','topic','resource','audio','site'],
  content_category: ['grammar','everyday_communication'],
  content_language: ['tr','en','de'],
  target_language: ['tr','en','de'],
  level: ['A1','A2','B1','B2','C1','C2'],
  outcome: ['correct','incorrect'],
  feedback: ['helpful','not_helpful'],
  error_code: ['audio_failed','library_failed','resource_failed'],
  completion_type: ['checked','self_review','exam_result'],
});
const ids = /** @type {const} */ (['activity_id','exercise_id','section_id']);
const counts = /** @type {const} */ (['result_count','attempt_number','questions_answered','correct_answers','duration_seconds']);
const context = /** @type {const} */ (['activity_type','content_language']);
const activity = /** @type {const} */ ([...context,'activity_id']);
const detail = /** @type {const} */ (['exercise_id','section_id','attempt_number']);
const schema = /** @type {const} */ ({
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
});

/** @typedef {{[K in keyof typeof enums]: (typeof enums)[K][number]} & Record<(typeof ids)[number], string> & Record<(typeof counts)[number], number>} Fields */
/** @typedef {keyof typeof schema} LearningEvent */
/** @template {LearningEvent} N @typedef {Pick<Fields, (typeof schema)[N][0][number]> & Partial<Pick<Fields, (typeof schema)[N][1][number] | 'content_category' | 'level'>>} EventFields */
/** @template {LearningEvent} N @typedef {N extends 'learning_completed'
 * ? Omit<EventFields<N>, 'completion_type' | 'questions_answered' | 'correct_answers'> &
 *   ({completion_type: 'self_review'} | ({completion_type: 'checked' | 'exam_result'} & Pick<Fields, 'questions_answered' | 'correct_answers'>))
 * : EventFields<N>} EventInput */
/** @typedef {EventInput<'learning_started'>} ActivityContext */

/** @param {keyof Fields} key @param {unknown} value */
function accepted(key, value) {
  if ((/** @type {readonly string[]} */ (ids)).includes(key)) return typeof value === 'string' && /^[A-Za-z0-9-]{1,64}$/.test(value);
  if ((/** @type {readonly string[]} */ (counts)).includes(key)) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 86400;
  }
  const options = enums[/** @type {keyof typeof enums} */ (key)];
  return (/** @type {readonly unknown[]} */ (options)).includes(value);
}

/** @param {string} name @param {Record<string, unknown>} [values] */
export function sanitizeLearningEvent(name, values = {}) {
  if (!Object.hasOwn(schema, name) || !values || typeof values !== 'object') return null;
  const [required, optional] = schema[/** @type {LearningEvent} */ (name)];
  if (!required.every(key => accepted(key, values[key]))) return null;
  if (name === 'search_no_results' && values.result_count !== 0) return null;
  if (name === 'study_time' && values.duration_seconds === 0) return null;
  if (name === 'learning_completed' && values.completion_type !== 'self_review' &&
    (!accepted('questions_answered', values.questions_answered) || !accepted('correct_answers', values.correct_answers) ||
      Number(values.correct_answers) > Number(values.questions_answered))) return null;
  const fields = new Set(/** @type {(keyof Fields)[]} */ ([...required, ...optional, 'content_category', 'level']));
  if (name === 'learning_completed' && values.completion_type === 'self_review') {
    fields.delete('questions_answered');
    fields.delete('correct_answers');
  }
  return Object.fromEntries([...fields].flatMap(key => accepted(key, values[key]) ? [[key, values[key]]] : []));
}
