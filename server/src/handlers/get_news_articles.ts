
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type GetNewsArticlesByTypeInput, type NewsArticle } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getNewsArticles(input?: GetNewsArticlesByTypeInput): Promise<NewsArticle[]> {
  try {
    // Use default values if no input provided
    const filters = input || { limit: 10, offset: 0 };

    // Build query in a single chain to maintain proper type inference
    const baseQuery = db.select().from(newsArticlesTable);
    
    const query = filters.category
      ? baseQuery
          .where(eq(newsArticlesTable.category, filters.category))
          .orderBy(desc(newsArticlesTable.published_at))
          .limit(filters.limit)
          .offset(filters.offset)
      : baseQuery
          .orderBy(desc(newsArticlesTable.published_at))
          .limit(filters.limit)
          .offset(filters.offset);

    const results = await query.execute();
    return results;
  } catch (error) {
    console.error('Getting news articles failed:', error);
    throw error;
  }
}
