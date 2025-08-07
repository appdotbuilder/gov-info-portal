
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type CreateInformationPageInput, type UpdateInformationPageInput } from '../schema';
import { updateInformationPage } from '../handlers/update_information_page';
import { eq } from 'drizzle-orm';

// Test data
const testPageInput: CreateInformationPageInput = {
  title: 'Test Page',
  slug: 'test-page',
  content: 'This is test content',
  page_type: 'general',
  is_published: true,
  meta_description: 'Test meta description'
};

const anotherPageInput: CreateInformationPageInput = {
  title: 'Another Page',
  slug: 'another-page',
  content: 'Another test content',
  page_type: 'service',
  is_published: false,
  meta_description: null
};

describe('updateInformationPage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an information page', async () => {
    // Create initial page
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      title: 'Updated Title',
      content: 'Updated content',
      is_published: false
    };

    const result = await updateInformationPage(updateInput);

    expect(result.id).toEqual(initialPage.id);
    expect(result.title).toEqual('Updated Title');
    expect(result.slug).toEqual(testPageInput.slug); // Unchanged
    expect(result.content).toEqual('Updated content');
    expect(result.page_type).toEqual(testPageInput.page_type); // Unchanged
    expect(result.is_published).toEqual(false);
    expect(result.meta_description).toEqual(testPageInput.meta_description); // Unchanged
    expect(result.created_at).toEqual(initialPage.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at > initialPage.updated_at).toBe(true);
  });

  it('should save updated page to database', async () => {
    // Create initial page
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      title: 'Database Updated Title',
      page_type: 'about'
    };

    await updateInformationPage(updateInput);

    // Verify in database
    const pages = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.id, initialPage.id))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].title).toEqual('Database Updated Title');
    expect(pages[0].page_type).toEqual('about');
    expect(pages[0].slug).toEqual(testPageInput.slug); // Unchanged
    expect(pages[0].updated_at).toBeInstanceOf(Date);
    expect(pages[0].updated_at > initialPage.updated_at).toBe(true);
  });

  it('should update only provided fields', async () => {
    // Create initial page
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    // Update only title
    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      title: 'Only Title Updated'
    };

    const result = await updateInformationPage(updateInput);

    expect(result.title).toEqual('Only Title Updated');
    expect(result.slug).toEqual(initialPage.slug); // Should remain unchanged
    expect(result.content).toEqual(initialPage.content); // Should remain unchanged
    expect(result.page_type).toEqual(initialPage.page_type); // Should remain unchanged
    expect(result.is_published).toEqual(initialPage.is_published); // Should remain unchanged
    expect(result.meta_description).toEqual(initialPage.meta_description); // Should remain unchanged
  });

  it('should update slug and ensure uniqueness', async () => {
    // Create initial page
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      slug: 'new-unique-slug'
    };

    const result = await updateInformationPage(updateInput);

    expect(result.slug).toEqual('new-unique-slug');

    // Verify in database
    const pages = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.slug, 'new-unique-slug'))
      .execute();

    expect(pages).toHaveLength(1);
    expect(pages[0].id).toEqual(initialPage.id);
  });

  it('should throw error if page does not exist', async () => {
    const updateInput: UpdateInformationPageInput = {
      id: 999,
      title: 'Non-existent page'
    };

    await expect(updateInformationPage(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should throw error if slug already exists', async () => {
    // Create two pages
    const [page1] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    const [page2] = await db.insert(informationPagesTable)
      .values(anotherPageInput)
      .returning()
      .execute();

    // Try to update page2 with page1's slug
    const updateInput: UpdateInformationPageInput = {
      id: page2.id,
      slug: page1.slug // This should fail
    };

    await expect(updateInformationPage(updateInput)).rejects.toThrow(/already exists/i);
  });

  it('should allow updating same page with its own slug', async () => {
    // Create page
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    // Update page with same slug (should be allowed)
    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      slug: initialPage.slug,
      title: 'Updated Title'
    };

    const result = await updateInformationPage(updateInput);

    expect(result.slug).toEqual(initialPage.slug);
    expect(result.title).toEqual('Updated Title');
  });

  it('should handle nullable meta_description updates', async () => {
    // Create page with meta_description
    const [initialPage] = await db.insert(informationPagesTable)
      .values(testPageInput)
      .returning()
      .execute();

    // Update to null
    const updateInput: UpdateInformationPageInput = {
      id: initialPage.id,
      meta_description: null
    };

    const result = await updateInformationPage(updateInput);

    expect(result.meta_description).toBeNull();

    // Update back to a value
    const updateInput2: UpdateInformationPageInput = {
      id: initialPage.id,
      meta_description: 'New meta description'
    };

    const result2 = await updateInformationPage(updateInput2);

    expect(result2.meta_description).toEqual('New meta description');
  });
});
