
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type CreateInformationPageInput, type GetInformationPageBySlugInput } from '../schema';
import { getInformationPageBySlug } from '../handlers/get_information_page_by_slug';

// Test input for creating pages
const testPageInput: CreateInformationPageInput = {
  title: 'Test Service Page',
  slug: 'test-service',
  content: 'This is test content for the service page.',
  page_type: 'service',
  is_published: true,
  meta_description: 'Test meta description'
};

const unpublishedPageInput: CreateInformationPageInput = {
  title: 'Unpublished Page',
  slug: 'unpublished-page',
  content: 'This page is not published.',
  page_type: 'general',
  is_published: false,
  meta_description: null
};

describe('getInformationPageBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return published page by slug', async () => {
    // Create test page
    await db.insert(informationPagesTable)
      .values({
        title: testPageInput.title,
        slug: testPageInput.slug,
        content: testPageInput.content,
        page_type: testPageInput.page_type,
        is_published: testPageInput.is_published,
        meta_description: testPageInput.meta_description
      })
      .execute();

    // Test input for query
    const queryInput: GetInformationPageBySlugInput = {
      slug: 'test-service'
    };

    const result = await getInformationPageBySlug(queryInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test Service Page');
    expect(result!.slug).toEqual('test-service');
    expect(result!.content).toEqual('This is test content for the service page.');
    expect(result!.page_type).toEqual('service');
    expect(result!.is_published).toBe(true);
    expect(result!.meta_description).toEqual('Test meta description');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent slug', async () => {
    const queryInput: GetInformationPageBySlugInput = {
      slug: 'non-existent-page'
    };

    const result = await getInformationPageBySlug(queryInput);

    expect(result).toBeNull();
  });

  it('should return null for unpublished page', async () => {
    // Create unpublished page
    await db.insert(informationPagesTable)
      .values({
        title: unpublishedPageInput.title,
        slug: unpublishedPageInput.slug,
        content: unpublishedPageInput.content,
        page_type: unpublishedPageInput.page_type,
        is_published: unpublishedPageInput.is_published,
        meta_description: unpublishedPageInput.meta_description
      })
      .execute();

    const queryInput: GetInformationPageBySlugInput = {
      slug: 'unpublished-page'
    };

    const result = await getInformationPageBySlug(queryInput);

    expect(result).toBeNull();
  });

  it('should only return published pages when multiple pages exist', async () => {
    // Create both published and unpublished pages
    await db.insert(informationPagesTable)
      .values([
        {
          title: testPageInput.title,
          slug: testPageInput.slug,
          content: testPageInput.content,
          page_type: testPageInput.page_type,
          is_published: testPageInput.is_published,
          meta_description: testPageInput.meta_description
        },
        {
          title: unpublishedPageInput.title,
          slug: unpublishedPageInput.slug,
          content: unpublishedPageInput.content,
          page_type: unpublishedPageInput.page_type,
          is_published: unpublishedPageInput.is_published,
          meta_description: unpublishedPageInput.meta_description
        }
      ])
      .execute();

    // Query for published page - should work
    const publishedQuery: GetInformationPageBySlugInput = {
      slug: 'test-service'
    };

    const publishedResult = await getInformationPageBySlug(publishedQuery);
    expect(publishedResult).not.toBeNull();
    expect(publishedResult!.is_published).toBe(true);

    // Query for unpublished page - should return null
    const unpublishedQuery: GetInformationPageBySlugInput = {
      slug: 'unpublished-page'
    };

    const unpublishedResult = await getInformationPageBySlug(unpublishedQuery);
    expect(unpublishedResult).toBeNull();
  });
});
