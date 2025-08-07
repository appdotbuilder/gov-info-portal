
import { db } from '../db';
import { galleryItemsTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type GalleryItem } from '../schema';

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  try {
    const results = await db
      .select()
      .from(galleryItemsTable)
      .orderBy(desc(galleryItemsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    throw error;
  }
};
