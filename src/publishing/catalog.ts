import english from '../mini-packs/library.json' with { type: 'json' };
import turkish from '../mini-packs/library-tr.json' with { type: 'json' };
import grammarEnglish from '../mini-packs/grammar.json' with { type: 'json' };
import grammarTurkish from '../mini-packs/grammar-tr.json' with { type: 'json' };
import { grammarPath, lessonPath, levelPath } from '../mini-packs/routes.js';
import { englishHome } from '../../scripts/english-pages.mjs';
import { createCatalog, siteOrigin } from './model.ts';
import type { CollectionRecord, ContentRecord, Level, PageRecord } from './model.ts';

type LessonLocale = 'en' | 'tr';
type Link = { id: string; title: string };
type Example = { de: string } & Partial<Record<LessonLocale, string>>;
type LessonRecord = {
  pack: {
    id: string;
    cefr: string;
    title: string;
    objective: string;
    vocabulary: readonly { example: Example }[];
    grammar: { explanation: string; example: Example };
  };
  related?: readonly Link[];
  prerequisites?: readonly Link[];
};

const locales = ['en', 'tr'] as const;
const tracks = [
  { id: 'everyday-communication', category: 'everyday_communication', en: english, tr: turkish },
  { id: 'grammar', category: 'grammar', en: grammarEnglish, tr: grammarTurkish },
] as const satisfies readonly ({
  id: string;
  category: ContentRecord['category'];
} & Record<LessonLocale, readonly LessonRecord[]>)[];

export const homeTr: PageRecord = {
  id: 'home-tr',
  path: '/',
  locale: 'tr',
  title: 'Baulingo — Almancada aradığın cevap.',
  heading: 'Almancada aradığın cevap.',
  description: 'Türkçe açıklamalarla Almanca öğren. Günlük konuşmalar, der die das, cümle kurma ve hemen deneyebileceğin ücretsiz alıştırmalar.',
  translationGroup: 'home',
  index: true,
  sitemap: true,
};

export const homeEn: PageRecord = {
  id: 'home-en',
  path: englishHome.path,
  locale: 'en',
  title: englishHome.title + ' · Baulingo',
  heading: englishHome.heading.join(' '),
  description: englishHome.description,
  translationGroup: 'home',
  index: true,
  sitemap: true,
};

function level(value: string): Level {
  if (value === 'A1' || value === 'A2' || value === 'B1') return value;
  throw new Error(`Unknown lesson level: ${value}`);
}

const content: ContentRecord[] = [];
const collections: CollectionRecord[] = [];
const lessonRecords = new Map<string, LessonRecord>();
export const lessonPages: PageRecord[] = [];
const languageLabels = { en: 'German', tr: 'Almanca' };
const linkIds = (record: LessonRecord) => [...(record.related ?? []), ...(record.prerequisites ?? [])].map(link => link.id);

for (const track of tracks) {
  const contentIds = track.en.map(({ pack }) => pack.id);
  if (contentIds.length !== track.tr.length || contentIds.some((id, index) => id !== track.tr[index]?.pack.id)) {
    throw new Error(`Localized collection members differ: ${track.id}`);
  }
  collections.push({ id: track.id, contentIds });
  for (const locale of locales) {
    const records: readonly LessonRecord[] = track[locale];
    for (const [index, record] of records.entries()) {
      const { pack, related = [], prerequisites = [] } = record;
      const source = track.en[index];
      if (!source || pack.cefr !== source.pack.cefr) throw new Error(`Localized levels differ: ${pack.id}`);
      if (locale === 'en') {
        content.push({
          id: pack.id, format: 'mini_pack', category: track.category, level: level(pack.cefr),
          locales, relatedIds: [...related, ...prerequisites].map(link => link.id),
        });
      } else if (linkIds(source).join(' ') !== linkIds(record).join(' ')) {
        throw new Error(`Localized lesson relationships differ: ${pack.id}`);
      }
      const id = `${pack.id}:${locale}`;
      const path = lessonPath(pack.id, locale);
      if (!path) throw new Error(`Missing public route: ${id}`);
      lessonPages.push({
        id, path, locale, title: `${pack.title} · ${languageLabels[locale]} ${pack.cefr} · Baulingo`,
        heading: pack.title, description: pack.objective, contentId: pack.id, translationGroup: pack.id,
        index: true, sitemap: true,
      });
      lessonRecords.set(id, record);
    }
  }
}

export const catalog = createCatalog(content, collections, [homeTr, homeEn, ...lessonPages]);

export function lessonPreview(page: PageRecord) {
  const record = lessonRecords.get(page.id);
  const definition = page.contentId && catalog.content.get(page.contentId);
  if (!record || !definition || (page.locale !== 'tr' && page.locale !== 'en')) {
    throw new Error(`Missing lesson preview: ${page.id}`);
  }
  const { pack } = record;
  const locale = page.locale;
  const grammar = definition.category === 'grammar';
  const example = grammar ? pack.grammar.example : pack.vocabulary[0]?.example;
  const translation = example?.[locale];
  if (!example?.de || !translation) throw new Error(`Missing localized example: ${page.id}`);
  const related = grammar ? record.related?.[0] : undefined;
  const relatedPage = related && catalog.pages.get(`${related.id}:${locale}`);
  if (grammar && (!related || !relatedPage)) throw new Error(`Missing related lesson page: ${page.id}`);
  const levelURL = levelPath(definition.level, locale);
  const parentURL = new URL('../', siteOrigin + page.path).pathname;
  const back = grammar ? grammarPath(locale) + '#' + definition.level.toLowerCase()
    : parentURL === levelURL ? '../' : levelURL;
  return {
    back,
    label: `${languageLabels[locale]} ${definition.level}`,
    info: grammar ? pack.grammar.explanation : pack.objective,
    example: example.de, translation,
    related: related && relatedPage ? { path: relatedPage.path, title: related.title } : undefined,
  };
}
