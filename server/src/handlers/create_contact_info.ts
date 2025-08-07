
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type CreateContactInfoInput, type ContactInfo } from '../schema';

export const createContactInfo = async (input: CreateContactInfoInput): Promise<ContactInfo> => {
  try {
    // Insert contact info record
    const result = await db.insert(contactInfoTable)
      .values({
        department: input.department,
        contact_type: input.contact_type,
        label: input.label,
        value: input.value,
        is_primary: input.is_primary,
        display_order: input.display_order
      })
      .returning()
      .execute();

    const contactInfo = result[0];
    return contactInfo;
  } catch (error) {
    console.error('Contact info creation failed:', error);
    throw error;
  }
};
