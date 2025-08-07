
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryItemsTable } from '../db/schema';
import { type CreateGalleryItemInput } from '../schema';
import { getGalleryItems } from '../handlers/get_gallery_items';

// Test data
const testItems: CreateGalleryItemInput[] = [
  {
    title: 'First Gallery Item',
    description: 'Description for first item',
    image_url: 'https://example.com/image1.jpg',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    category: 'nature',
    taken_at: new Date('2024-01-01')
  },
  {
    title: 'Second Gallery Item',
    description: null,
    image_url: 'https://example.com/image2.jpg',
    thumbnail_url: null,
    category: null,
    taken_at: null
  }
];

describe('getGalleryItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no gallery items exist', async () => {
    const result = await getGalleryItems();
    expect(result).toEqual([]);
  });

  it('should fetch all gallery items', async () => {
    // Create test items
    await db.insert(galleryItemsTable).values(testItems).execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(2);
    
    // Check first item
    const firstItem = result.find(item => item.title === 'First Gallery Item');
    expect(firstItem).toBeDefined();
    expect(firstItem!.title).toEqual('First Gallery Item');
    expect(firstItem!.description).toEqual('Description for first item');
    expect(firstItem!.image_url).toEqual('https://example.com/image1.jpg');
    expect(firstItem!.thumbnail_url).toEqual('https://example.com/thumb1.jpg');
    expect(firstItem!.category).toEqual('nature');
    expect(firstItem!.taken_at).toBeInstanceOf(Date);
    expect(firstItem!.created_at).toBeInstanceOf(Date);
    expect(firstItem!.id).toBeDefined();

    // Check second item with nullable fields
    const secondItem = result.find(item => item.title === 'Second Gallery Item');
    expect(secondItem).toBeDefined();
    expect(secondItem!.title).toEqual('Second Gallery Item');
    expect(secondItem!.description).toBeNull();
    expect(secondItem!.image_url).toEqual('https://example.com/image2.jpg');
    expect(secondItem!.thumbnail_url).toBeNull();
    expect(secondItem!.category).toBeNull();
    expect(secondItem!.taken_at).toBeNull();
    expect(secondItem!.created_at).toBeInstanceOf(Date);
  });

  it('should return items ordered by created_at descending', async () => {
    // Create items with delay to ensure different timestamps
    await db.insert(galleryItemsTable).values([testItems[0]]).execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(galleryItemsTable).values([testItems[1]]).execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(2);
    
    // Most recent should be first (Second Gallery Item was created last)
    expect(result[0].title).toEqual('Second Gallery Item');
    expect(result[1].title).toEqual('First Gallery Item');
    
    // Verify ordering by checking timestamps
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle items with all nullable fields as null', async () => {
    const minimalItem: CreateGalleryItemInput = {
      title: 'Minimal Item',
      description: null,
      image_url: 'https://example.com/minimal.jpg',
      thumbnail_url: null,
      category: null,
      taken_at: null
    };

    await db.insert(galleryItemsTable).values([minimalItem]).execute();

    const result = await getGalleryItems();

    expect(result).toHaveLength(1);
    const item = result[0];
    
    expect(item.title).toEqual('Minimal Item');
    expect(item.description).toBeNull();
    expect(item.image_url).toEqual('https://example.com/minimal.jpg');
    expect(item.thumbnail_url).toBeNull();
    expect(item.category).toBeNull();
    expect(item.taken_at).toBeNull();
    expect(item.created_at).toBeInstanceOf(Date);
    expect(item.id).toBeDefined();
  });
});
