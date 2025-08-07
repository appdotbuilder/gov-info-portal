
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { galleryItemsTable } from '../db/schema';
import { type CreateGalleryItemInput } from '../schema';
import { createGalleryItem } from '../handlers/create_gallery_item';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateGalleryItemInput = {
  title: 'Test Gallery Item',
  description: 'A test image for the gallery',
  image_url: 'https://example.com/image.jpg',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  category: 'events',
  taken_at: new Date('2024-01-15T10:30:00Z')
};

// Test input with minimal required fields (nullable fields set to null)
const minimalInput: CreateGalleryItemInput = {
  title: 'Minimal Gallery Item',
  description: null,
  image_url: 'https://example.com/minimal.jpg',
  thumbnail_url: null,
  category: null,
  taken_at: null
};

describe('createGalleryItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a gallery item with all fields', async () => {
    const result = await createGalleryItem(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Gallery Item');
    expect(result.description).toEqual('A test image for the gallery');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(result.category).toEqual('events');
    expect(result.taken_at).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a gallery item with minimal fields', async () => {
    const result = await createGalleryItem(minimalInput);

    // Validate required fields
    expect(result.title).toEqual('Minimal Gallery Item');
    expect(result.image_url).toEqual('https://example.com/minimal.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Validate nullable fields
    expect(result.description).toBeNull();
    expect(result.thumbnail_url).toBeNull();
    expect(result.category).toBeNull();
    expect(result.taken_at).toBeNull();
  });

  it('should save gallery item to database', async () => {
    const result = await createGalleryItem(testInput);

    // Query the database to verify the item was saved
    const galleryItems = await db.select()
      .from(galleryItemsTable)
      .where(eq(galleryItemsTable.id, result.id))
      .execute();

    expect(galleryItems).toHaveLength(1);
    const savedItem = galleryItems[0];

    expect(savedItem.title).toEqual('Test Gallery Item');
    expect(savedItem.description).toEqual('A test image for the gallery');
    expect(savedItem.image_url).toEqual('https://example.com/image.jpg');
    expect(savedItem.thumbnail_url).toEqual('https://example.com/thumbnail.jpg');
    expect(savedItem.category).toEqual('events');
    expect(savedItem.taken_at).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(savedItem.created_at).toBeInstanceOf(Date);
  });

  it('should handle date fields correctly', async () => {
    const testDate = new Date('2023-06-15T14:22:30Z');
    const dateInput: CreateGalleryItemInput = {
      ...testInput,
      taken_at: testDate
    };

    const result = await createGalleryItem(dateInput);

    expect(result.taken_at).toEqual(testDate);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const saved = await db.select()
      .from(galleryItemsTable)
      .where(eq(galleryItemsTable.id, result.id))
      .execute();

    expect(saved[0].taken_at).toEqual(testDate);
  });
});
