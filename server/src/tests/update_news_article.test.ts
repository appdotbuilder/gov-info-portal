
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput } from '../schema';
import { updateNewsArticle } from '../handlers/update_news_article';
import { eq } from 'drizzle-orm';

describe('updateNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a news article with all fields', async () => {
    // Create a news article directly in database first
    const created = await db.insert(newsArticlesTable)
      .values({
        title: 'Original Title',
        content: 'Original content',
        summary: 'Original summary',
        published_at: new Date('2024-01-01'),
        is_featured: false,
        category: 'news'
      })
      .returning()
      .execute();

    const createdArticle = created[0];

    // Update the article
    const updateInput: UpdateNewsArticleInput = {
      id: createdArticle.id,
      title: 'Updated Title',
      content: 'Updated content',
      summary: 'Updated summary',
      published_at: new Date('2024-02-01'),
      is_featured: true,
      category: 'announcement'
    };

    const result = await updateNewsArticle(updateInput);

    // Verify all fields were updated
    expect(result.id).toBe(createdArticle.id);
    expect(result.title).toBe('Updated Title');
    expect(result.content).toBe('Updated content');
    expect(result.summary).toBe('Updated summary');
    expect(result.published_at).toEqual(new Date('2024-02-01'));
    expect(result.is_featured).toBe(true);
    expect(result.category).toBe('announcement');
    expect(result.created_at).toEqual(createdArticle.created_at);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdArticle.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    // Create a news article directly in database first
    const created = await db.insert(newsArticlesTable)
      .values({
        title: 'Original Title',
        content: 'Original content',
        summary: 'Original summary',
        published_at: new Date('2024-01-01'),
        is_featured: false,
        category: 'news'
      })
      .returning()
      .execute();

    const createdArticle = created[0];

    // Update only title and is_featured
    const updateInput: UpdateNewsArticleInput = {
      id: createdArticle.id,
      title: 'Updated Title Only',
      is_featured: true
    };

    const result = await updateNewsArticle(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toBe('Updated Title Only');
    expect(result.is_featured).toBe(true);
    expect(result.content).toBe('Original content'); // Should remain unchanged
    expect(result.summary).toBe('Original summary'); // Should remain unchanged
    expect(result.category).toBe('news'); // Should remain unchanged
    expect(result.updated_at.getTime()).toBeGreaterThan(createdArticle.updated_at.getTime());
  });

  it('should save updated article to database', async () => {
    // Create a news article directly in database first
    const created = await db.insert(newsArticlesTable)
      .values({
        title: 'Original Title',
        content: 'Original content',
        summary: null,
        is_featured: false,
        category: 'news'
      })
      .returning()
      .execute();

    const createdArticle = created[0];

    // Update the article
    const updateInput: UpdateNewsArticleInput = {
      id: createdArticle.id,
      title: 'Database Updated Title',
      summary: 'New summary'
    };

    await updateNewsArticle(updateInput);

    // Query database to verify changes were saved
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, createdArticle.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Database Updated Title');
    expect(articles[0].summary).toBe('New summary');
    expect(articles[0].content).toBe('Original content'); // Should remain unchanged
    expect(articles[0].updated_at.getTime()).toBeGreaterThan(createdArticle.updated_at.getTime());
  });

  it('should update summary to null', async () => {
    // Create a news article with summary directly in database
    const created = await db.insert(newsArticlesTable)
      .values({
        title: 'Test Article',
        content: 'Test content',
        summary: 'Original summary',
        is_featured: false,
        category: 'news'
      })
      .returning()
      .execute();

    const createdArticle = created[0];

    // Update summary to null
    const updateInput: UpdateNewsArticleInput = {
      id: createdArticle.id,
      summary: null
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.summary).toBeNull();
    expect(result.title).toBe('Test Article'); // Should remain unchanged
  });

  it('should throw error when article does not exist', async () => {
    const updateInput: UpdateNewsArticleInput = {
      id: 999, // Non-existent ID
      title: 'Updated Title'
    };

    await expect(updateNewsArticle(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should automatically update the updated_at timestamp', async () => {
    // Create a news article directly in database first
    const created = await db.insert(newsArticlesTable)
      .values({
        title: 'Test Article',
        content: 'Test content',
        summary: null,
        is_featured: false,
        category: 'news'
      })
      .returning()
      .execute();

    const createdArticle = created[0];
    
    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the article
    const updateInput: UpdateNewsArticleInput = {
      id: createdArticle.id,
      title: 'Updated Title'
    };

    const result = await updateNewsArticle(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdArticle.updated_at.getTime());
    expect(result.created_at).toEqual(createdArticle.created_at); // Should remain unchanged
  });
});
