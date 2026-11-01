export function preferredLanguage(saved, languages = []) {
  if (saved === 'en' || saved === 'tr') return saved;
  return /^en(?:-|$)/i.test(languages[0] || '') ? 'en' : 'tr';
}
