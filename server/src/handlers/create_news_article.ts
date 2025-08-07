
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput, type NewsArticle } from '../schema';

export const createNewsArticle = async (input: CreateNewsArticleInput): Promise<NewsArticle> => {
  try {
    // Insert news article record
    const result = await db.insert(newsArticlesTable)
      .values({
        title: input.title,
        content: input.content,
        summary: input.summary,
        published_at: input.published_at || new Date(), // Use current time if not provided
        is_featured: input.is_featured, // Zod default is applied
        category: input.category
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('News article creation failed:', error);
    throw error;
  }
};
