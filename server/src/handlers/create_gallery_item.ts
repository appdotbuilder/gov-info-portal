
import { db } from '../db';
import { galleryItemsTable } from '../db/schema';
import { type CreateGalleryItemInput, type GalleryItem } from '../schema';

export const createGalleryItem = async (input: CreateGalleryItemInput): Promise<GalleryItem> => {
  try {
    // Insert gallery item record
    const result = await db.insert(galleryItemsTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        thumbnail_url: input.thumbnail_url,
        category: input.category,
        taken_at: input.taken_at
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Gallery item creation failed:', error);
    throw error;
  }
};
