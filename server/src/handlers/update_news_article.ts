
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput, type NewsArticle } from '../schema';

export const updateNewsArticle = async (input: UpdateNewsArticleInput): Promise<NewsArticle> => {
  try {
    // Check if article exists
    const existingArticle = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, input.id))
      .execute();

    if (existingArticle.length === 0) {
      throw new Error(`News article with id ${input.id} not found`);
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.summary !== undefined) {
      updateData.summary = input.summary;
    }

    if (input.published_at !== undefined) {
      updateData.published_at = input.published_at;
    }

    if (input.is_featured !== undefined) {
      updateData.is_featured = input.is_featured;
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    // Update the article
    const result = await db.update(newsArticlesTable)
      .set(updateData)
      .where(eq(newsArticlesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('News article update failed:', error);
    throw error;
  }
};
