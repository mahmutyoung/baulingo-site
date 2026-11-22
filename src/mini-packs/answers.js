export const normalizeAnswer = value => value.normalize('NFC').trim().toLocaleLowerCase('de-DE')
  .replace(/[.!?]+$/, '').trim().replace(/\s+/g, ' ')

export function matchesAnswer(input, answers) {
  const normalized = normalizeAnswer(input)
  return normalized !== '' && answers.some(answer => normalizeAnswer(answer) === normalized)
}
