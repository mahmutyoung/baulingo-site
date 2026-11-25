import { dtzResources } from '../../scripts/dtz-hub.mjs';
import { englishResources } from '../../scripts/english-pages.mjs';
import { turkishResources } from '../../scripts/pages.mjs';
import type { CollectionRecord, ContentRecord, PageRecord } from './model.ts';

type Metadata = Pick<PageRecord, 'locale' | 'path' | 'title' | 'heading' | 'description'>;

export interface ResourceDefinition extends Metadata {
  key: string;
  format: ContentRecord['format'] | null;
  collectionId?: string;
  translationGroup?: string;
  render(page: Metadata & { index?: boolean }, alternates?: string): string;
}

const resourceDefinitions = [...turkishResources(), ...englishResources(), ...dtzResources()];
export const resourcePages: PageRecord[] = resourceDefinitions.map(resource => ({
  id: `${resource.key}:${resource.locale}`, path: resource.path, locale: resource.locale,
  title: resource.title, heading: resource.heading, description: resource.description,
  contentId: resource.format ? resource.key : undefined, collectionId: resource.collectionId,
  translationGroup: resource.translationGroup, index: true, sitemap: true,
}));
export const resourceContent: ContentRecord[] = [];
for (const { key, locale, format } of resourceDefinitions) {
  if (!format) continue;
  const previous = resourceContent.find(record => record.id === key);
  if (previous) {
    if (previous.format !== format) throw new Error(`Localized content format differs: ${key}`);
    previous.locales = [...previous.locales, locale];
  } else {
    resourceContent.push({ id: key, format, locales: [locale], relatedIds: [] });
  }
}

export const resourceCollections: CollectionRecord[] = [{
  id: 'dtz-writing-tr',
  contentIds: resourceDefinitions
    .filter(resource => resource.format === 'writing' && resource.locale === 'tr')
    .map(resource => resource.key),
}];

export const resourceRenderers = new Map(resourceDefinitions.map(resource => [resource.path, resource.render]));
