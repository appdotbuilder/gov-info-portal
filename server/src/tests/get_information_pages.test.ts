
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type CreateInformationPageInput } from '../schema';
import { getInformationPages } from '../handlers/get_information_pages';

describe('getInformationPages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no published pages exist', async () => {
    const result = await getInformationPages();
    expect(result).toEqual([]);
  });

  it('should return only published information pages', async () => {
    // Create published page
    await db.insert(informationPagesTable).values({
      title: 'Published Page',
      slug: 'published-page',
      content: 'This is published content',
      page_type: 'service',
      is_published: true,
      meta_description: null
    }).execute();

    // Create unpublished page
    await db.insert(informationPagesTable).values({
      title: 'Unpublished Page',
      slug: 'unpublished-page',
      content: 'This is unpublished content',
      page_type: 'about',
      is_published: false,
      meta_description: null
    }).execute();

    const result = await getInformationPages();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Published Page');
    expect(result[0].is_published).toBe(true);
    expect(result[0].slug).toEqual('published-page');
    expect(result[0].content).toEqual('This is published content');
    expect(result[0].page_type).toEqual('service');
  });

  it('should order pages alphabetically by title', async () => {
    // Create pages in non-alphabetical order
    await db.insert(informationPagesTable).values({
      title: 'Zebra Services',
      slug: 'zebra-services',
      content: 'Zebra content',
      page_type: 'service',
      is_published: true,
      meta_description: null
    }).execute();

    await db.insert(informationPagesTable).values({
      title: 'Alpha Information',
      slug: 'alpha-info',
      content: 'Alpha content',
      page_type: 'general',
      is_published: true,
      meta_description: null
    }).execute();

    await db.insert(informationPagesTable).values({
      title: 'Beta Regulations',
      slug: 'beta-regs',
      content: 'Beta content',
      page_type: 'regulation',
      is_published: true,
      meta_description: null
    }).execute();

    const result = await getInformationPages();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Alpha Information');
    expect(result[1].title).toEqual('Beta Regulations');
    expect(result[2].title).toEqual('Zebra Services');
  });

  it('should return complete page objects with all fields', async () => {
    await db.insert(informationPagesTable).values({
      title: 'Complete Page',
      slug: 'complete-page',
      content: 'Complete content with all fields',
      page_type: 'about',
      is_published: true,
      meta_description: 'Meta description for SEO'
    }).execute();

    const result = await getInformationPages();

    expect(result).toHaveLength(1);
    const page = result[0];
    
    expect(page.id).toBeDefined();
    expect(page.title).toEqual('Complete Page');
    expect(page.slug).toEqual('complete-page');
    expect(page.content).toEqual('Complete content with all fields');
    expect(page.page_type).toEqual('about');
    expect(page.is_published).toBe(true);
    expect(page.meta_description).toEqual('Meta description for SEO');
    expect(page.created_at).toBeInstanceOf(Date);
    expect(page.updated_at).toBeInstanceOf(Date);
  });

  it('should handle pages with null meta_description', async () => {
    await db.insert(informationPagesTable).values({
      title: 'Page Without Meta',
      slug: 'no-meta',
      content: 'Content without meta description',
      page_type: 'service',
      is_published: true,
      meta_description: null
    }).execute();

    const result = await getInformationPages();

    expect(result).toHaveLength(1);
    expect(result[0].meta_description).toBeNull();
  });
});
