
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { getFeaturedNews } from '../handlers/get_featured_news';

describe('getFeaturedNews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured news articles', async () => {
    // Create mix of featured and non-featured articles
    await db.insert(newsArticlesTable)
      .values([
        {
          title: 'Featured Article 1',
          content: 'Featured content 1',
          is_featured: true,
          category: 'news',
          published_at: new Date('2024-01-02')
        },
        {
          title: 'Regular Article',
          content: 'Regular content',
          is_featured: false,
          category: 'news',
          published_at: new Date('2024-01-03')
        },
        {
          title: 'Featured Article 2',
          content: 'Featured content 2',
          is_featured: true,
          category: 'announcement',
          published_at: new Date('2024-01-01')
        }
      ])
      .execute();

    const result = await getFeaturedNews();

    expect(result).toHaveLength(2);
    expect(result.every(article => article.is_featured)).toBe(true);
    expect(result.map(article => article.title)).toEqual([
      'Featured Article 1',
      'Featured Article 2'
    ]);
  });

  it('should return articles ordered by published_at descending', async () => {
    // Create featured articles with different published dates
    await db.insert(newsArticlesTable)
      .values([
        {
          title: 'Oldest Featured',
          content: 'Content',
          is_featured: true,
          category: 'news',
          published_at: new Date('2024-01-01')
        },
        {
          title: 'Newest Featured',
          content: 'Content',
          is_featured: true,
          category: 'news',
          published_at: new Date('2024-01-03')
        },
        {
          title: 'Middle Featured',
          content: 'Content',
          is_featured: true,
          category: 'news',
          published_at: new Date('2024-01-02')
        }
      ])
      .execute();

    const result = await getFeaturedNews();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Newest Featured');
    expect(result[1].title).toEqual('Middle Featured');
    expect(result[2].title).toEqual('Oldest Featured');

    // Verify dates are in descending order
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].published_at >= result[i + 1].published_at).toBe(true);
    }
  });

  it('should return empty array when no featured articles exist', async () => {
    // Create only non-featured articles
    await db.insert(newsArticlesTable)
      .values([
        {
          title: 'Regular Article 1',
          content: 'Content',
          is_featured: false,
          category: 'news'
        },
        {
          title: 'Regular Article 2',
          content: 'Content',
          is_featured: false,
          category: 'announcement'
        }
      ])
      .execute();

    const result = await getFeaturedNews();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all expected fields for featured articles', async () => {
    await db.insert(newsArticlesTable)
      .values({
        title: 'Complete Featured Article',
        content: 'Full article content here',
        summary: 'Article summary',
        is_featured: true,
        category: 'regulation',
        published_at: new Date('2024-01-01T10:00:00Z')
      })
      .execute();

    const result = await getFeaturedNews();

    expect(result).toHaveLength(1);
    const article = result[0];
    
    expect(article.id).toBeDefined();
    expect(article.title).toEqual('Complete Featured Article');
    expect(article.content).toEqual('Full article content here');
    expect(article.summary).toEqual('Article summary');
    expect(article.is_featured).toBe(true);
    expect(article.category).toEqual('regulation');
    expect(article.published_at).toBeInstanceOf(Date);
    expect(article.created_at).toBeInstanceOf(Date);
    expect(article.updated_at).toBeInstanceOf(Date);
  });
});
