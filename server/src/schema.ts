
import { z } from 'zod';

// News article schema
export const newsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  summary: z.string().nullable(),
  published_at: z.coerce.date(),
  is_featured: z.boolean(),
  category: z.enum(['news', 'announcement', 'regulation', 'service_update']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;

// Photo gallery item schema
export const galleryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  thumbnail_url: z.string().nullable(),
  category: z.string().nullable(),
  taken_at: z.coerce.date().nullable(),
  created_at: z.coerce.date()
});

export type GalleryItem = z.infer<typeof galleryItemSchema>;

// Informational page schema
export const informationPageSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  page_type: z.enum(['service', 'regulation', 'about', 'general']),
  is_published: z.boolean(),
  meta_description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type InformationPage = z.infer<typeof informationPageSchema>;

// Contact information schema
export const contactInfoSchema = z.object({
  id: z.number(),
  department: z.string(),
  contact_type: z.enum(['phone', 'email', 'address', 'hours']),
  label: z.string(),
  value: z.string(),
  is_primary: z.boolean(),
  display_order: z.number().int(),
  created_at: z.coerce.date()
});

export type ContactInfo = z.infer<typeof contactInfoSchema>;

// Input schemas for creating content
export const createNewsArticleInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().nullable(),
  published_at: z.coerce.date().optional(),
  is_featured: z.boolean().default(false),
  category: z.enum(['news', 'announcement', 'regulation', 'service_update'])
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleInputSchema>;

export const createGalleryItemInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  image_url: z.string().url(),
  thumbnail_url: z.string().url().nullable(),
  category: z.string().nullable(),
  taken_at: z.coerce.date().nullable()
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemInputSchema>;

export const createInformationPageInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  page_type: z.enum(['service', 'regulation', 'about', 'general']),
  is_published: z.boolean().default(true),
  meta_description: z.string().nullable()
});

export type CreateInformationPageInput = z.infer<typeof createInformationPageInputSchema>;

export const createContactInfoInputSchema = z.object({
  department: z.string().min(1),
  contact_type: z.enum(['phone', 'email', 'address', 'hours']),
  label: z.string().min(1),
  value: z.string().min(1),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().nonnegative().default(0)
});

export type CreateContactInfoInput = z.infer<typeof createContactInfoInputSchema>;

// Update schemas
export const updateNewsArticleInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  summary: z.string().nullable().optional(),
  published_at: z.coerce.date().optional(),
  is_featured: z.boolean().optional(),
  category: z.enum(['news', 'announcement', 'regulation', 'service_update']).optional()
});

export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleInputSchema>;

export const updateInformationPageInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  page_type: z.enum(['service', 'regulation', 'about', 'general']).optional(),
  is_published: z.boolean().optional(),
  meta_description: z.string().nullable().optional()
});

export type UpdateInformationPageInput = z.infer<typeof updateInformationPageInputSchema>;

// Query schemas
export const getNewsArticlesByTypeInputSchema = z.object({
  category: z.enum(['news', 'announcement', 'regulation', 'service_update']).optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0)
});

export type GetNewsArticlesByTypeInput = z.infer<typeof getNewsArticlesByTypeInputSchema>;

export const getInformationPageBySlugInputSchema = z.object({
  slug: z.string().min(1)
});

export type GetInformationPageBySlugInput = z.infer<typeof getInformationPageBySlugInputSchema>;
