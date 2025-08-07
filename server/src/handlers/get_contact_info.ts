
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type ContactInfo } from '../schema';
import { asc, desc } from 'drizzle-orm';

export async function getContactInfo(): Promise<ContactInfo[]> {
  try {
    const result = await db.select()
      .from(contactInfoTable)
      .orderBy(
        asc(contactInfoTable.department),
        asc(contactInfoTable.display_order),
        desc(contactInfoTable.is_primary) // Primary contacts first (true > false)
      )
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    throw error;
  }
}
