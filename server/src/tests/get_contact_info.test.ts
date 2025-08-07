
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactInfoTable } from '../db/schema';
import { type CreateContactInfoInput } from '../schema';
import { getContactInfo } from '../handlers/get_contact_info';

describe('getContactInfo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contact info exists', async () => {
    const result = await getContactInfo();
    expect(result).toEqual([]);
  });

  it('should fetch all contact information', async () => {
    // Create test contact info
    await db.insert(contactInfoTable).values([
      {
        department: 'Administration',
        contact_type: 'phone',
        label: 'Main Office',
        value: '555-0100',
        is_primary: true,
        display_order: 0
      },
      {
        department: 'Administration',
        contact_type: 'email',
        label: 'General Inquiries',
        value: 'info@example.com',
        is_primary: false,
        display_order: 1
      }
    ]).execute();

    const result = await getContactInfo();

    expect(result).toHaveLength(2);
    expect(result[0].department).toEqual('Administration');
    expect(result[0].label).toEqual('Main Office');
    expect(result[0].value).toEqual('555-0100');
    expect(result[0].is_primary).toBe(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should order by department, then display_order, then primary first', async () => {
    // Insert in deliberately wrong order to test sorting
    await db.insert(contactInfoTable).values([
      {
        department: 'Utilities', // Should be last alphabetically
        contact_type: 'phone',
        label: 'Utilities Main',
        value: '555-0300',
        is_primary: false,
        display_order: 0
      },
      {
        department: 'Administration', // Should be first alphabetically
        contact_type: 'email',
        label: 'Admin Secondary',
        value: 'admin2@example.com',
        is_primary: false, // Should be after primary
        display_order: 0
      },
      {
        department: 'Administration', // Same department
        contact_type: 'phone',
        label: 'Admin Primary',
        value: '555-0100',
        is_primary: true, // Should be before non-primary
        display_order: 0
      },
      {
        department: 'Fire Department', // Middle alphabetically
        contact_type: 'phone',
        label: 'Emergency',
        value: '555-0200',
        is_primary: true,
        display_order: 1 // Higher display_order
      },
      {
        department: 'Fire Department', // Same department
        contact_type: 'email',
        label: 'Fire Info',
        value: 'fire@example.com',
        is_primary: false,
        display_order: 0 // Lower display_order, should come before Emergency
      }
    ]).execute();

    const result = await getContactInfo();

    expect(result).toHaveLength(5);

    // First should be Administration department, primary contact first
    expect(result[0].department).toEqual('Administration');
    expect(result[0].is_primary).toBe(true);
    expect(result[0].label).toEqual('Admin Primary');

    // Second should be Administration department, non-primary contact
    expect(result[1].department).toEqual('Administration');
    expect(result[1].is_primary).toBe(false);
    expect(result[1].label).toEqual('Admin Secondary');

    // Third should be Fire Department, lower display_order first
    expect(result[2].department).toEqual('Fire Department');
    expect(result[2].display_order).toEqual(0);
    expect(result[2].label).toEqual('Fire Info');

    // Fourth should be Fire Department, higher display_order
    expect(result[3].department).toEqual('Fire Department');
    expect(result[3].display_order).toEqual(1);
    expect(result[3].label).toEqual('Emergency');

    // Last should be Utilities department
    expect(result[4].department).toEqual('Utilities');
    expect(result[4].label).toEqual('Utilities Main');
  });

  it('should handle all contact types correctly', async () => {
    await db.insert(contactInfoTable).values([
      {
        department: 'Test Dept',
        contact_type: 'phone',
        label: 'Phone Contact',
        value: '555-0100',
        is_primary: false,
        display_order: 0
      },
      {
        department: 'Test Dept',
        contact_type: 'email',
        label: 'Email Contact',
        value: 'test@example.com',
        is_primary: false,
        display_order: 0
      },
      {
        department: 'Test Dept',
        contact_type: 'address',
        label: 'Physical Address',
        value: '123 Main St',
        is_primary: false,
        display_order: 0
      },
      {
        department: 'Test Dept',
        contact_type: 'hours',
        label: 'Business Hours',
        value: 'Mon-Fri 9AM-5PM',
        is_primary: false,
        display_order: 0
      }
    ]).execute();

    const result = await getContactInfo();

    expect(result).toHaveLength(4);
    const contactTypes = result.map(item => item.contact_type);
    expect(contactTypes).toContain('phone');
    expect(contactTypes).toContain('email');
    expect(contactTypes).toContain('address');
    expect(contactTypes).toContain('hours');
  });
});
