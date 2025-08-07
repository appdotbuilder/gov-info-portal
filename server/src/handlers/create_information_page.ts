
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type CreateInformationPageInput, type InformationPage } from '../schema';
import { eq } from 'drizzle-orm';

export const createInformationPage = async (input: CreateInformationPageInput): Promise<InformationPage> => {
  try {
    // Check if slug already exists
    const existingPage = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.slug, input.slug))
      .execute();

    if (existingPage.length > 0) {
      throw new Error(`Information page with slug '${input.slug}' already exists`);
    }

    // Insert information page record
    const result = await db.insert(informationPagesTable)
      .values({
        title: input.title,
        slug: input.slug,
        content: input.content,
        page_type: input.page_type,
        is_published: input.is_published,
        meta_description: input.meta_description
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Information page creation failed:', error);
    throw error;
  }
};
