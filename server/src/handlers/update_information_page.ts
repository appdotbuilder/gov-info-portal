
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type UpdateInformationPageInput, type InformationPage } from '../schema';
import { eq } from 'drizzle-orm';

export const updateInformationPage = async (input: UpdateInformationPageInput): Promise<InformationPage> => {
  try {
    // First, check if the page exists
    const existingPages = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.id, input.id))
      .execute();

    if (existingPages.length === 0) {
      throw new Error(`Information page with ID ${input.id} not found`);
    }

    // If updating slug, check for uniqueness
    if (input.slug) {
      const slugCheck = await db.select()
        .from(informationPagesTable)
        .where(eq(informationPagesTable.slug, input.slug))
        .execute();

      // If slug exists and belongs to a different page, throw error
      if (slugCheck.length > 0 && slugCheck[0].id !== input.id) {
        throw new Error(`Information page with slug '${input.slug}' already exists`);
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.page_type !== undefined) updateData.page_type = input.page_type;
    if (input.is_published !== undefined) updateData.is_published = input.is_published;
    if (input.meta_description !== undefined) updateData.meta_description = input.meta_description;

    // Update the page
    const result = await db.update(informationPagesTable)
      .set(updateData)
      .where(eq(informationPagesTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Information page update failed:', error);
    throw error;
  }
};
