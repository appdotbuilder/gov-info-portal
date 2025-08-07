
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createNewsArticleInputSchema,
  getNewsArticlesByTypeInputSchema,
  updateNewsArticleInputSchema,
  createGalleryItemInputSchema,
  createInformationPageInputSchema,
  getInformationPageBySlugInputSchema,
  updateInformationPageInputSchema,
  createContactInfoInputSchema
} from './schema';

// Import handlers
import { createNewsArticle } from './handlers/create_news_article';
import { getNewsArticles } from './handlers/get_news_articles';
import { getFeaturedNews } from './handlers/get_featured_news';
import { updateNewsArticle } from './handlers/update_news_article';
import { createGalleryItem } from './handlers/create_gallery_item';
import { getGalleryItems } from './handlers/get_gallery_items';
import { createInformationPage } from './handlers/create_information_page';
import { getInformationPages } from './handlers/get_information_pages';
import { getInformationPageBySlug } from './handlers/get_information_page_by_slug';
import { updateInformationPage } from './handlers/update_information_page';
import { createContactInfo } from './handlers/create_contact_info';
import { getContactInfo } from './handlers/get_contact_info';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // News article routes
  createNewsArticle: publicProcedure
    .input(createNewsArticleInputSchema)
    .mutation(({ input }) => createNewsArticle(input)),
  
  getNewsArticles: publicProcedure
    .input(getNewsArticlesByTypeInputSchema.optional())
    .query(({ input }) => getNewsArticles(input)),
  
  getFeaturedNews: publicProcedure
    .query(() => getFeaturedNews()),
  
  updateNewsArticle: publicProcedure
    .input(updateNewsArticleInputSchema)
    .mutation(({ input }) => updateNewsArticle(input)),

  // Gallery routes
  createGalleryItem: publicProcedure
    .input(createGalleryItemInputSchema)
    .mutation(({ input }) => createGalleryItem(input)),
  
  getGalleryItems: publicProcedure
    .query(() => getGalleryItems()),

  // Information page routes
  createInformationPage: publicProcedure
    .input(createInformationPageInputSchema)
    .mutation(({ input }) => createInformationPage(input)),
  
  getInformationPages: publicProcedure
    .query(() => getInformationPages()),
  
  getInformationPageBySlug: publicProcedure
    .input(getInformationPageBySlugInputSchema)
    .query(({ input }) => getInformationPageBySlug(input)),
  
  updateInformationPage: publicProcedure
    .input(updateInformationPageInputSchema)
    .mutation(({ input }) => updateInformationPage(input)),

  // Contact information routes
  createContactInfo: publicProcedure
    .input(createContactInfoInputSchema)
    .mutation(({ input }) => createContactInfo(input)),
  
  getContactInfo: publicProcedure
    .query(() => getContactInfo()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
