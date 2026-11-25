import english from '../mini-packs/library.json' with { type: 'json' };
import turkish from '../mini-packs/library-tr.json' with { type: 'json' };
import grammarEnglish from '../mini-packs/grammar.json' with { type: 'json' };
import grammarTurkish from '../mini-packs/grammar-tr.json' with { type: 'json' };
import { grammarPath, lessonPath, lessonTitle, levelPath, readerPath } from '../mini-packs/routes.js';
import { englishHome } from '../../scripts/english-pages.mjs';
import { englishCourseMetadata, grammarIndexMetadata } from '../../scripts/lesson-pages.mjs';
import { a1ReviewIds, a1TestMetadata, turkishCourseMetadata } from '../../scripts/course-pages.mjs';
import { createCatalog, siteOrigin } from './model.ts';
import type { CollectionRecord, ContentRecord, Level, PageRecord } from './model.ts';
import { resourceCollections, resourceContent, resourcePages } from './resources.ts';

type LessonLocale = 'en' | 'tr';
type Link = { id: string; title: string };
type Example = { de: string } & Partial<Record<LessonLocale, string>>;
type LessonRecord = {
  title?: string;
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

export const readerPages: PageRecord[] = [
  {
    id: 'reader-en', path: readerPath('en'), locale: 'en', title: 'German mini-packs · Baulingo',
    heading: 'German mini-packs',
    description: 'Practise everyday German with 67 free A1–B1 mini-packs with English explanations and interactive exercises.',
    collectionId: 'everyday-communication', translationGroup: 'mini-pack-reader', index: true, sitemap: true,
  },
  {
    id: 'reader-tr', path: readerPath('tr'), locale: 'tr',
    title: 'Almanca Kursu A1–B1: Türkçe Açıklamalı 67 Ders · Baulingo',
    heading: 'Almanca Kursu A1–B1',
    description: 'Türkçe açıklamalar, diyaloglar ve alıştırmalarla ücretsiz Almanca kursu. A1, A2 ve B1 düzeylerinde 67 ders.',
    collectionId: 'everyday-communication', translationGroup: 'mini-pack-reader', index: true, sitemap: true,
  },
];

export const grammarIndexPages: PageRecord[] = locales.map(locale => ({
  ...grammarIndexMetadata(locale),
  id: `grammar-index-${locale}`, locale, collectionId: 'grammar',
  translationGroup: 'grammar-index', index: true, sitemap: true,
}));

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
        id, path, locale, title: lessonTitle(pack, locale),
        heading: pack.title, description: pack.objective, contentId: pack.id, translationGroup: pack.id,
        index: true, sitemap: true,
      });
      lessonRecords.set(id, record);
    }
  }
}

const courseLevels = ['A1', 'A2', 'B1'] as const;
const courseCollections = courseLevels.map(level => ({
  id: `everyday-${level.toLowerCase()}`,
  contentIds: english.filter(({ pack }) => pack.cefr === level).map(({ pack }) => pack.id),
}));
export const coursePages = courseLevels.flatMap((level, index) => {
  const collection = courseCollections[index]!;
  return locales.map(locale => ({
    ...({ en: englishCourseMetadata, tr: turkishCourseMetadata }[locale](level, collection.contentIds.length)),
    id: `${collection.id}-${locale}`, locale, level, collectionId: collection.id,
    translationGroup: collection.id, index: true, sitemap: true,
  }));
});

export const a1TestPage: PageRecord = {
  ...a1TestMetadata, title: a1TestMetadata.title + ' · Baulingo',
  id: 'a1-test-tr', contentId: 'a1-practice-test', locale: 'tr', index: true, sitemap: true,
};
content.push({
  id: 'a1-practice-test', format: 'a1_test', category: 'everyday_communication', level: 'A1',
  locales: ['tr'], relatedIds: a1ReviewIds,
});

export const catalog = createCatalog([...content, ...resourceContent],
  [...collections, ...courseCollections, ...resourceCollections],
  [homeTr, homeEn, ...readerPages, ...grammarIndexPages, ...coursePages, ...lessonPages, a1TestPage, ...resourcePages]);

const everydayRecords = {
  en: new Map(english.map(record => [record.pack.id, record])),
  tr: new Map(turkish.map(record => [record.pack.id, record])),
};

export function courseLessons(page: typeof coursePages[number]) {
  const collection = catalog.collections.get(page.collectionId)!;
  return collection.contentIds.map(id => {
    const record = everydayRecords[page.locale].get(id);
    if (!record) throw new Error(`Missing localized course lesson: ${id}:${page.locale}`);
    return record;
  });
}

export function grammarIndexLessons(page: PageRecord) {
  const collection = page.collectionId && catalog.collections.get(page.collectionId);
  if (!collection) throw new Error(`Missing collection for ${page.id}`);
  return collection.contentIds.map(id => {
    const record = lessonRecords.get(`${id}:${page.locale}`);
    if (!record) throw new Error(`Missing localized collection lesson: ${id}:${page.locale}`);
    return { pack: record.pack, title: record.title ?? record.pack.title };
  });
}

export function lessonPreview(page: PageRecord) {
  const record = lessonRecords.get(page.id);
  const definition = page.contentId && catalog.content.get(page.contentId);
  if (!record || !definition || !definition.level || (page.locale !== 'tr' && page.locale !== 'en')) {
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
    grammar,
    label: `${languageLabels[locale]} ${definition.level}`,
    info: grammar ? pack.grammar.explanation : pack.objective,
    example: example.de, translation,
    related: related && relatedPage ? { path: relatedPage.path, title: related.title } : undefined,
  };
}
