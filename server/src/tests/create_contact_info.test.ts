
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type CreateContactInfoInput } from '../schema';
import { createContactInfo } from '../handlers/create_contact_info';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateContactInfoInput = {
  department: 'Customer Service',
  contact_type: 'phone',
  label: 'Main Phone',
  value: '555-123-4567',
  is_primary: true,
  display_order: 1
};

describe('createContactInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create contact info', async () => {
    const result = await createContactInfo(testInput);

    // Basic field validation
    expect(result.department).toEqual('Customer Service');
    expect(result.contact_type).toEqual('phone');
    expect(result.label).toEqual('Main Phone');
    expect(result.value).toEqual('555-123-4567');
    expect(result.is_primary).toEqual(true);
    expect(result.display_order).toEqual(1);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact info to database', async () => {
    const result = await createContactInfo(testInput);

    // Query using proper drizzle syntax
    const contactInfos = await db.select()
      .from(contactInfoTable)
      .where(eq(contactInfoTable.id, result.id))
      .execute();

    expect(contactInfos).toHaveLength(1);
    expect(contactInfos[0].department).toEqual('Customer Service');
    expect(contactInfos[0].contact_type).toEqual('phone');
    expect(contactInfos[0].label).toEqual('Main Phone');
    expect(contactInfos[0].value).toEqual('555-123-4567');
    expect(contactInfos[0].is_primary).toEqual(true);
    expect(contactInfos[0].display_order).toEqual(1);
    expect(contactInfos[0].created_at).toBeInstanceOf(Date);
  });

  it('should create contact info with defaults', async () => {
    const minimalInput: CreateContactInfoInput = {
      department: 'IT Support',
      contact_type: 'email',
      label: 'Support Email',
      value: 'support@example.com',
      is_primary: false,
      display_order: 0
    };

    const result = await createContactInfo(minimalInput);

    expect(result.department).toEqual('IT Support');
    expect(result.contact_type).toEqual('email');
    expect(result.is_primary).toEqual(false);
    expect(result.display_order).toEqual(0);
    expect(result.id).toBeDefined();
  });

  it('should handle different contact types', async () => {
    const addressInput: CreateContactInfoInput = {
      department: 'Main Office',
      contact_type: 'address',
      label: 'Physical Address',
      value: '123 Main St, City, State 12345',
      is_primary: true,
      display_order: 0
    };

    const result = await createContactInfo(addressInput);

    expect(result.contact_type).toEqual('address');
    expect(result.value).toEqual('123 Main St, City, State 12345');

    // Verify in database
    const saved = await db.select()
      .from(contactInfoTable)
      .where(eq(contactInfoTable.id, result.id))
      .execute();

    expect(saved[0].contact_type).toEqual('address');
    expect(saved[0].value).toEqual('123 Main St, City, State 12345');
  });
});
