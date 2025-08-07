
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type CreateInformationPageInput } from '../schema';
import { createInformationPage } from '../handlers/create_information_page';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateInformationPageInput = {
  title: 'Test Information Page',
  slug: 'test-information-page',
  content: 'This is test content for the information page',
  page_type: 'general',
  is_published: true,
  meta_description: 'Test meta description'
};

describe('createInformationPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an information page', async () => {
    const result = await createInformationPage(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Information Page');
    expect(result.slug).toEqual('test-information-page');
    expect(result.content).toEqual(testInput.content);
    expect(result.page_type).toEqual('general');
    expect(result.is_published).toEqual(true);
    expect(result.meta_description).toEqual('Test meta description');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save information page to database', async () => {
    const result = await createInformationPage(testInput);

    // Verify page exists in database
    const pages = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.id, result.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].title).toEqual('Test Information Page');
    expect(pages[0].slug).toEqual('test-information-page');
    expect(pages[0].content).toEqual(testInput.content);
    expect(pages[0].page_type).toEqual('general');
    expect(pages[0].is_published).toEqual(true);
    expect(pages[0].meta_description).toEqual('Test meta description');
    expect(pages[0].created_at).toBeInstanceOf(Date);
    expect(pages[0].updated_at).toBeInstanceOf(Date);
  });

  it('should apply default values correctly', async () => {
    const inputWithDefaults: CreateInformationPageInput = {
      title: 'Default Test Page',
      slug: 'default-test-page',
      content: 'Content with defaults',
      page_type: 'service',
      is_published: true,
      meta_description: null
    };

    const result = await createInformationPage(inputWithDefaults);

    expect(result.is_published).toEqual(true);
    expect(result.meta_description).toBeNull();
  });

  it('should throw error when slug already exists', async () => {
    // Create first page
    await createInformationPage(testInput);

    // Try to create another page with same slug
    const duplicateInput: CreateInformationPageInput = {
      ...testInput,
      title: 'Different Title'
    };

    await expect(createInformationPage(duplicateInput))
      .rejects.toThrow(/slug.*already exists/i);
  });

  it('should handle different page types', async () => {
    const servicePageInput: CreateInformationPageInput = {
      title: 'Service Information',
      slug: 'service-info',
      content: 'Service content',
      page_type: 'service',
      is_published: false,
      meta_description: null
    };

    const result = await createInformationPage(servicePageInput);

    expect(result.page_type).toEqual('service');
    expect(result.is_published).toEqual(false);
    expect(result.meta_description).toBeNull();
  });

  it('should handle null meta_description', async () => {
    const inputWithNullMeta: CreateInformationPageInput = {
      title: 'Page Without Meta',
      slug: 'page-without-meta',
      content: 'Content without meta description',
      page_type: 'about',
      is_published: true,
      meta_description: null
    };

    const result = await createInformationPage(inputWithNullMeta);

    expect(result.meta_description).toBeNull();
  });
});
