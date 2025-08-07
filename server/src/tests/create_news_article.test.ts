
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput } from '../schema';
import { createNewsArticle } from '../handlers/create_news_article';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateNewsArticleInput = {
  title: 'Test News Article',
  content: 'This is the content of the test news article.',
  summary: 'A brief summary of the test article',
  published_at: new Date('2024-01-15T10:30:00Z'),
  is_featured: true,
  category: 'news'
};

describe('createNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a news article with all fields', async () => {
    const result = await createNewsArticle(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test News Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.summary).toEqual(testInput.summary);
    expect(result.published_at).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(result.is_featured).toEqual(true);
    expect(result.category).toEqual('news');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save news article to database', async () => {
    const result = await createNewsArticle(testInput);

    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Test News Article');
    expect(articles[0].content).toEqual(testInput.content);
    expect(articles[0].summary).toEqual(testInput.summary);
    expect(articles[0].is_featured).toEqual(true);
    expect(articles[0].category).toEqual('news');
    expect(articles[0].created_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at).toBeInstanceOf(Date);
  });

  it('should use current time for published_at when not provided', async () => {
    const inputWithoutDate: CreateNewsArticleInput = {
      title: 'Article Without Date',
      content: 'Content without specified published date',
      summary: null,
      is_featured: false,
      category: 'announcement'
    };

    const beforeCreation = new Date();
    const result = await createNewsArticle(inputWithoutDate);
    const afterCreation = new Date();

    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at >= beforeCreation).toBe(true);
    expect(result.published_at <= afterCreation).toBe(true);
  });

  it('should handle null summary correctly', async () => {
    const inputWithNullSummary: CreateNewsArticleInput = {
      title: 'Article with Null Summary',
      content: 'Content for article with null summary',
      summary: null,
      is_featured: false,
      category: 'regulation'
    };

    const result = await createNewsArticle(inputWithNullSummary);

    expect(result.summary).toBeNull();
    expect(result.title).toEqual('Article with Null Summary');
    expect(result.category).toEqual('regulation');
    expect(result.is_featured).toEqual(false);
  });

  it('should handle different article categories', async () => {
    const categories: Array<CreateNewsArticleInput['category']> = [
      'news', 'announcement', 'regulation', 'service_update'
    ];

    for (const category of categories) {
      const input: CreateNewsArticleInput = {
        title: `${category} Article`,
        content: `Content for ${category} article`,
        summary: `Summary for ${category}`,
        is_featured: false,
        category: category
      };

      const result = await createNewsArticle(input);
      expect(result.category).toEqual(category);
      expect(result.title).toEqual(`${category} Article`);
    }
  });
});
