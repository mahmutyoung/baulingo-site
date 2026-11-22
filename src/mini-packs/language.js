export const language = document.documentElement.lang === 'tr' ? 'tr' : 'en';
export const label = (english, turkish) => language === 'tr' ? turkish : english;
