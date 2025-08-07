
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type GetNewsArticlesByTypeInput } from '../schema';
import { getNewsArticles } from '../handlers/get_news_articles';

describe('getNewsArticles', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no articles exist', async () => {
    const result = await getNewsArticles();
    expect(result).toEqual([]);
  });

  it('should return all articles when no filter provided', async () => {
    // Create test articles
    await db.insert(newsArticlesTable).values([
      {
        title: 'First Article',
        content: 'First content',
        category: 'news',
        published_at: new Date('2024-01-01')
      },
      {
        title: 'Second Article', 
        content: 'Second content',
        category: 'announcement',
        published_at: new Date('2024-01-02')
      }
    ]).execute();

    const result = await getNewsArticles();
    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Second Article');
    expect(result[1].title).toEqual('First Article');
  });

  it('should filter by category correctly', async () => {
    // Create test articles with different categories
    await db.insert(newsArticlesTable).values([
      {
        title: 'News Article',
        content: 'News content',
        category: 'news',
        published_at: new Date('2024-01-01')
      },
      {
        title: 'Announcement Article',
        content: 'Announcement content', 
        category: 'announcement',
        published_at: new Date('2024-01-02')
      }
    ]).execute();

    const input: GetNewsArticlesByTypeInput = {
      category: 'news',
      limit: 10,
      offset: 0
    };

    const result = await getNewsArticles(input);
    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('News Article');
    expect(result[0].category).toEqual('news');
  });

  it('should order by published_at descending (most recent first)', async () => {
    // Create articles with different published dates
    await db.insert(newsArticlesTable).values([
      {
        title: 'Oldest Article',
        content: 'Old content',
        category: 'news',
        published_at: new Date('2024-01-01')
      },
      {
        title: 'Newest Article',
        content: 'New content',
        category: 'news', 
        published_at: new Date('2024-01-03')
      },
      {
        title: 'Middle Article',
        content: 'Middle content',
        category: 'news',
        published_at: new Date('2024-01-02')
      }
    ]).execute();

    const result = await getNewsArticles();
    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Newest Article');
    expect(result[1].title).toEqual('Middle Article');
    expect(result[2].title).toEqual('Oldest Article');
  });

  it('should apply pagination correctly', async () => {
    // Create more articles than default limit
    const articles = Array.from({ length: 15 }, (_, i) => ({
      title: `Article ${i + 1}`,
      content: `Content ${i + 1}`,
      category: 'news' as const,
      published_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
    }));

    await db.insert(newsArticlesTable).values(articles).execute();

    // Test default pagination
    const defaultResult = await getNewsArticles();
    expect(defaultResult).toHaveLength(10);

    // Test custom limit
    const limitResult = await getNewsArticles({ limit: 5, offset: 0 });
    expect(limitResult).toHaveLength(5);

    // Test offset
    const offsetResult = await getNewsArticles({ limit: 5, offset: 5 });
    expect(offsetResult).toHaveLength(5);
    expect(offsetResult[0].title).not.toEqual(limitResult[0].title);
  });

  it('should handle all enum categories', async () => {
    // Create articles for each category
    await db.insert(newsArticlesTable).values([
      {
        title: 'News Article',
        content: 'News content',
        category: 'news',
        published_at: new Date('2024-01-01')
      },
      {
        title: 'Announcement Article',
        content: 'Announcement content',
        category: 'announcement',
        published_at: new Date('2024-01-02')
      },
      {
        title: 'Regulation Article',
        content: 'Regulation content',
        category: 'regulation',
        published_at: new Date('2024-01-03')
      },
      {
        title: 'Service Update Article',
        content: 'Service update content',
        category: 'service_update',
        published_at: new Date('2024-01-04')
      }
    ]).execute();

    // Test each category filter
    const categories = ['news', 'announcement', 'regulation', 'service_update'] as const;
    
    for (const category of categories) {
      const result = await getNewsArticles({ 
        category, 
        limit: 10, 
        offset: 0 
      });
      expect(result).toHaveLength(1);
      expect(result[0].category).toEqual(category);
    }
  });

  it('should return correct article structure', async () => {
    await db.insert(newsArticlesTable).values({
      title: 'Test Article',
      content: 'Test content',
      summary: 'Test summary',
      category: 'news',
      is_featured: true,
      published_at: new Date('2024-01-01T10:00:00Z')
    }).execute();

    const result = await getNewsArticles();
    expect(result).toHaveLength(1);
    
    const article = result[0];
    expect(article.id).toBeDefined();
    expect(article.title).toEqual('Test Article');
    expect(article.content).toEqual('Test content');
    expect(article.summary).toEqual('Test summary');
    expect(article.category).toEqual('news');
    expect(article.is_featured).toEqual(true);
    expect(article.published_at).toBeInstanceOf(Date);
    expect(article.created_at).toBeInstanceOf(Date);
    expect(article.updated_at).toBeInstanceOf(Date);
  });
});
