
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type NewsArticle } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const results = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.is_featured, true))
      .orderBy(desc(newsArticlesTable.published_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Featured news retrieval failed:', error);
    throw error;
  }
}
