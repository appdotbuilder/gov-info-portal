
import { db } from '../db';
import { informationPagesTable } from '../db/schema';
import { type InformationPage } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getInformationPages(): Promise<InformationPage[]> {
  try {
    const results = await db.select()
      .from(informationPagesTable)
      .where(eq(informationPagesTable.is_published, true))
      .orderBy(asc(informationPagesTable.title))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch information pages:', error);
    throw error;
  }
}
