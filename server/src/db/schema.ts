
import { serial, text, pgTable, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enum definitions
export const newsArticleCategoryEnum = pgEnum('news_article_category', ['news', 'announcement', 'regulation', 'service_update']);
export const informationPageTypeEnum = pgEnum('information_page_type', ['service', 'regulation', 'about', 'general']);
export const contactTypeEnum = pgEnum('contact_type', ['phone', 'email', 'address', 'hours']);

// News articles table
export const newsArticlesTable = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'), // Nullable by default
  published_at: timestamp('published_at').defaultNow().notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  category: newsArticleCategoryEnum('category').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Photo gallery table
export const galleryItemsTable = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  image_url: text('image_url').notNull(),
  thumbnail_url: text('thumbnail_url'), // Nullable by default
  category: text('category'), // Nullable by default
  taken_at: timestamp('taken_at'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Information pages table
export const informationPagesTable = pgTable('information_pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  page_type: informationPageTypeEnum('page_type').notNull(),
  is_published: boolean('is_published').default(true).notNull(),
  meta_description: text('meta_description'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Contact information table
export const contactInfoTable = pgTable('contact_info', {
  id: serial('id').primaryKey(),
  department: text('department').notNull(),
  contact_type: contactTypeEnum('contact_type').notNull(),
  label: text('label').notNull(),
  value: text('value').notNull(),
  is_primary: boolean('is_primary').default(false).notNull(),
  display_order: integer('display_order').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the tables
export type NewsArticle = typeof newsArticlesTable.$inferSelect;
export type NewNewsArticle = typeof newsArticlesTable.$inferInsert;

export type GalleryItem = typeof galleryItemsTable.$inferSelect;
export type NewGalleryItem = typeof galleryItemsTable.$inferInsert;

export type InformationPage = typeof informationPagesTable.$inferSelect;
export type NewInformationPage = typeof informationPagesTable.$inferInsert;

export type ContactInfo = typeof contactInfoTable.$inferSelect;
export type NewContactInfo = typeof contactInfoTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  newsArticles: newsArticlesTable,
  galleryItems: galleryItemsTable,
  informationPages: informationPagesTable,
  contactInfo: contactInfoTable
};
