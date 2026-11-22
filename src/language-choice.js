export function preferredLanguage(saved, languages = []) {
  if (saved === 'en' || saved === 'tr') return saved;
  return /^en(?:-|$)/i.test(languages[0] || '') ? 'en' : 'tr';
}

const pairs = [
  ['/konular/almanca-gramer/', '/en/german-grammar/'],
  ['/konular/mini-paketler/', '/en/mini-packs/'],
  ['/konular/articles/', '/en/articles/'],
  ['/konular/word-order/', '/en/word-order/'],
  ['/konular/doctor/', '/en/appointments/'],
  ['/dtz-sinavi/', '/en/dtz-exam/'],
];

export function otherLanguagePath(path, language, hash = '') {
  const level = /^(?:\/konular\/almanca-|\/en\/german-)(a1|a2|b1)\/$/.exec(path)?.[1];
  if (level) return language === 'tr' ? '/konular/almanca-' + level + '/' : '/en/german-' + level + '/';
  const pair = pairs.find(routes => routes.includes(path));
  if (pair) return pair[language === 'tr' ? 0 : 1] + (pair[0].includes('gramer') && /^#[ab][12]$/.test(hash) ? hash : '');
  if (language === 'tr') return '/?lang=tr';
  if (path.startsWith('/dtz-mektup-yazma/')) return '/en/dtz-exam/#writing-help';
  if (path.startsWith('/dtz-') || ['/sinavlar/', '/konular/exams/'].includes(path)) return '/en/dtz-exam/';
  if (path === '/konular/almanca-a1-test/') return '/en/german-a1/';
  return path.startsWith('/konular/') ? '/en/#lessons' : '/en/';
}
