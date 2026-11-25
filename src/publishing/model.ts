export const siteOrigin = 'https://baulingo.app';

export type Locale = 'en' | 'tr' | 'de';
export type Level = 'A1' | 'A2' | 'B1';

export interface ContentRecord {
  id: string;
  format: 'mini_pack';
  category: 'grammar' | 'everyday_communication';
  level: Level;
  locales: readonly Locale[];
  relatedIds: readonly string[];
}

export interface CollectionRecord {
  id: string;
  contentIds: readonly string[];
}

export interface PageRecord {
  id: string;
  path: string;
  locale: Locale;
  title: string;
  heading: string;
  description: string;
  contentId?: string;
  collectionId?: string;
  canonicalId?: string;
  translationGroup?: string;
  index: boolean;
  sitemap: boolean;
}

function byId<T extends { id: string }>(records: readonly T[], kind: string) {
  const result = new Map<string, T>();
  for (const record of records) {
    if (!record.id.trim()) throw new Error(`Missing ${kind} ID`);
    if (result.has(record.id)) throw new Error(`Duplicate ${kind} ID: ${record.id}`);
    result.set(record.id, record);
  }
  return result;
}

export function createCatalog(
  contentRecords: readonly ContentRecord[],
  collectionRecords: readonly CollectionRecord[],
  pageRecords: readonly PageRecord[],
) {
  const content = byId(contentRecords, 'content');
  const collections = byId(collectionRecords, 'collection');
  const pages = byId(pageRecords, 'page');
  const paths = new Map<string, PageRecord>();
  const translations = new Map<string, PageRecord[]>();

  for (const record of content.values()) {
    if (!record.locales.length || new Set(record.locales).size !== record.locales.length) {
      throw new Error(`Invalid content locales: ${record.id}`);
    }
    for (const id of record.relatedIds) {
      if (!content.has(id)) throw new Error(`Unknown content ${id} related to ${record.id}`);
    }
  }
  for (const collection of collections.values()) {
    if (new Set(collection.contentIds).size !== collection.contentIds.length) {
      throw new Error(`Duplicate content in collection ${collection.id}`);
    }
    for (const id of collection.contentIds) {
      if (!content.has(id)) throw new Error(`Unknown content ${id} in ${collection.id}`);
    }
  }
  for (const page of pages.values()) {
    if (!/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(page.path)) {
      throw new Error(`Invalid page path: ${page.path}`);
    }
    if (paths.has(page.path)) throw new Error(`Duplicate page path: ${page.path}`);
    paths.set(page.path, page);
    for (const field of ['title', 'heading', 'description'] as const) {
      if (!page[field].trim()) throw new Error(`Missing ${field}: ${page.id}`);
    }
    if (page.contentId !== undefined) {
      const record = content.get(page.contentId);
      if (!record) throw new Error(`Unknown content ${page.contentId} on ${page.id}`);
      if (!record.locales.includes(page.locale)) throw new Error(`Missing content locale on ${page.id}`);
    }
    if (page.collectionId !== undefined && !collections.has(page.collectionId)) {
      throw new Error(`Unknown collection ${page.collectionId} on ${page.id}`);
    }
    if (!page.index && (page.sitemap || page.translationGroup !== undefined)) {
      throw new Error(`Non-indexable page in sitemap or translations: ${page.id}`);
    }
    if (page.canonicalId !== undefined && page.canonicalId !== page.id) {
      const canonical = pages.get(page.canonicalId);
      if (!canonical) throw new Error(`Unknown canonical ${page.canonicalId} on ${page.id}`);
      if (!canonical.index || (canonical.canonicalId && canonical.canonicalId !== canonical.id) ||
          page.sitemap || page.translationGroup) {
        throw new Error(`Invalid canonical relationship on ${page.id}`);
      }
    }
    if (page.translationGroup !== undefined) {
      if (!page.translationGroup.trim()) throw new Error(`Missing translation group ID on ${page.id}`);
      const group = translations.get(page.translationGroup) ?? [];
      if (group.some(other => other.locale === page.locale)) {
        throw new Error(`Duplicate translation locale in ${page.translationGroup}`);
      }
      if (group.some(other => other.contentId !== page.contentId || other.collectionId !== page.collectionId)) {
        throw new Error(`Translation group links different content or collections: ${page.translationGroup}`);
      }
      group.push(page);
      translations.set(page.translationGroup, group);
    }
  }
  for (const [id, group] of translations) {
    if (group.length < 2) throw new Error(`Translation group ${id} requires two or more locales`);
    group.sort((a, b) => a.locale.localeCompare(b.locale));
  }

  return {
    content, collections, pages, paths,
    canonical(page: PageRecord) {
      return pages.get(page.canonicalId ?? page.id) ?? page;
    },
    alternates(page: PageRecord): readonly PageRecord[] {
      return page.translationGroup ? translations.get(page.translationGroup) ?? [] : [];
    },
    sitemapLocations() {
      return pageRecords.filter(page => page.sitemap).map(page => siteOrigin + page.path);
    },
  };
}

export function outputFile(path: string) {
  return path.slice(1) + 'index.html';
}

export function sitemapXml(locations: readonly string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations.map(location => `<url><loc>${location}</loc></url>`).join('')}</urlset>\n`;
}
