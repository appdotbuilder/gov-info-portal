
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type GetInformationPageBySlugInput, type InformationPage } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getInformationPageBySlug = async (input: GetInformationPageBySlugInput): Promise<InformationPage | null> => {
  try {
    // Query for published page with matching slug
    const result = await db.select()
      .from(informationPagesTable)
      .where(and(
        eq(informationPagesTable.slug, input.slug),
        eq(informationPagesTable.is_published, true)
      ))
      .limit(1)
      .execute();

    // Return null if no page found
    if (result.length === 0) {
      return null;
    }

    // Return the found page
    return result[0];
  } catch (error) {
    console.error('Failed to get information page by slug:', error);
    throw error;
  }
};
