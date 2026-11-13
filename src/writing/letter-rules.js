// Pure composition rules. Free writing is never graded or inferred from a model.
export const emptyLetterParts = () => Array(8).fill('');
export function assembleLetter(parts = []) {
  const body = parts.slice(0, 6).map(value => String(value || '').trim()).filter(Boolean);
  const closing = parts.slice(6, 8).map(value => String(value || '').trim()).filter(Boolean).join('\n');
  return [...body, closing].filter(Boolean).join('\n\n');
}
export function editLetterPart(task, index, value) {
  const parts = emptyLetterParts().map((_, i) => task.letterParts?.[i] || '');
  const previous = assembleLetter(parts);
  parts[index] = value;
  return { ...task, letterParts: parts, draft: !task.draft || task.draft === previous ? assembleLetter(parts) : task.draft };
}
export const transferLetterParts = task => ({ ...task, letterPrevious: task.draft || task.letterPrevious || '', draft: assembleLetter(task.letterParts) });
export function letterStartStep(task) {
  if (task.draft && !task.letterParts?.some(Boolean)) return 8;
  return Number.isInteger(task.letterStep) && task.letterStep >= 0 && task.letterStep <= 8 ? task.letterStep : 0;
}
