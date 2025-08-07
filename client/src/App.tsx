
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/utils/trpc';
import type { NewsArticle, GalleryItem, InformationPage, ContactInfo } from '../../server/src/schema';

type Section = 'home' | 'news' | 'gallery' | 'services' | 'contact';

function App() {
  // State management
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsArticle[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [informationPages, setInformationPages] = useState<InformationPage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Load all data
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [newsResult, featuredResult, galleryResult, pagesResult, contactResult] = await Promise.all([
        trpc.getNewsArticles.query(),
        trpc.getFeaturedNews.query(),
        trpc.getGalleryItems.query(),
        trpc.getInformationPages.query(),
        trpc.getContactInfo.query()
      ]);
      
      setNewsArticles(newsResult);
      setFeaturedNews(featuredResult);
      setGalleryItems(galleryResult);
      setInformationPages(pagesResult);
      setContactInfo(contactResult);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filter news by category
  const filteredNews = selectedNewsCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter((article: NewsArticle) => article.category === selectedNewsCategory);

  // Group contact info by department
  const groupedContactInfo = contactInfo.reduce((acc: Record<string, ContactInfo[]>, info: ContactInfo) => {
    if (!acc[info.department]) {
      acc[info.department] = [];
    }
    acc[info.department].push(info);
    return acc;
  }, {});

  // Group information pages by type
  const pagesByType = informationPages.reduce((acc: Record<string, InformationPage[]>, page: InformationPage) => {
    if (!acc[page.page_type]) {
      acc[page.page_type] = [];
    }
    acc[page.page_type].push(page);
    return acc;
  }, {});

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      'news': 'General News',
      'announcement': 'Announcements',
      'regulation': 'Regulations',
      'service_update': 'Service Updates'
    };
    return categoryMap[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'news': 'bg-blue-100 text-blue-800',
      'announcement': 'bg-green-100 text-green-800',
      'regulation': 'bg-red-100 text-red-800',
      'service_update': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const getContactIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'phone': '📞',
      'email': '✉️',
      'address': '📍',
      'hours': '🕒'
    };
    return iconMap[type] || '📄';
  };

  const renderNavigation = () => (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🏛️</div>
            <h1 className="text-xl font-bold">Government Information Portal</h1>
          </div>
          <div className="flex space-x-1">
            {[
              { key: 'home', label: 'Home' },
              { key: 'news', label: 'News & Announcements' },
              { key: 'gallery', label: 'Photo Gallery' },
              { key: 'services', label: 'Services & Information' },
              { key: 'contact', label: 'Contact Us' }
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={currentSection === key ? 'secondary' : 'ghost'}
                className={currentSection === key ? 'bg-white text-blue-900' : 'text-white hover:bg-blue-800'}
                onClick={() => setCurrentSection(key as Section)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHomeSection = () => (
    <div className="space-y-8">
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <h2 className="text-4xl font-bold text-blue-900 mb-4">Welcome to Our Information Portal</h2>
        <p className="text-xl text-blue-700 max-w-2xl mx-auto">
          Your gateway to government services, news, and important information. 
          Stay informed and connected with your community.
        </p>
      </div>

      {featuredNews.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            ⭐ Featured News
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNews.slice(0, 3).map((article: NewsArticle) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      {getCategoryDisplay(article.category)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {article.published_at.toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">
                    {article.summary || article.content.substring(0, 150) + '...'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button onClick={() => setCurrentSection('news')} className="bg-blue-600 hover:bg-blue-700">
              View All News & Announcements
            </Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => setCurrentSection('services')}>
          <CardHeader>
            <div className="text-4xl mb-2">📋</div>
            <CardTitle>Services</CardTitle>
            <CardDescription>Access government services and regulations</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setCurrentSection('gallery')}>
          <CardHeader>
            <div className="text-4xl mb-2">📸</div>
            <CardTitle>Photo Gallery</CardTitle>
            <CardDescription>View community events and activities</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setCurrentSection('contact')}>
          <CardHeader>
            <div className="text-4xl mb-2">📞</div>
            <CardTitle>Contact</CardTitle>
            <CardDescription>Get in touch with our departments</CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setCurrentSection('news')}>
          <CardHeader>
            <div className="text-4xl mb-2">📰</div>
            <CardTitle>Latest News</CardTitle>
            <CardDescription>Stay updated with announcements</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderNewsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">📰 News & Announcements</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedNewsCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedNewsCategory('all')}
          >
            All
          </Button>
          {['news', 'announcement', 'regulation', 'service_update'].map((category: string) => (
            <Button
              key={category}
              variant={selectedNewsCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedNewsCategory(category)}
            >
              {getCategoryDisplay(category)}
            </Button>
          ))}
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl text-gray-500">No news articles available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredNews.map((article: NewsArticle) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getCategoryColor(article.category)}>
                    {getCategoryDisplay(article.category)}
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Published: {article.published_at.toLocaleDateString()}
                    </div>
                    {article.is_featured && (
                      <Badge variant="secondary" className="mt-1">⭐ Featured</Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {article.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="font-medium text-blue-900">{article.summary}</p>
                  </div>
                )}
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Last updated: {article.updated_at.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderGallerySection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">📸 Photo Gallery</h2>
      
      {galleryItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl text-gray-500">No photos available in the gallery yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item: GalleryItem) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full text-6xl">🖼️</div>';
                  }}
                />
                {item.category && (
                  <Badge className="absolute top-2 right-2 bg-black bg-opacity-75 text-white">
                    {item.category}
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-500 space-y-1">
                  {item.taken_at && (
                    <div>📅 Taken: {item.taken_at.toLocaleDateString()}</div>
                  )}
                  <div>➕ Added: {item.created_at.toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">📋 Services & Information</h2>
      
      {informationPages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl text-gray-500">Information pages will be available soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(pagesByType).map(([type, pages]) => (
            <div key={type}>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4 capitalize flex items-center">
                {type === 'service' && '🔧'} 
                {type === 'regulation' && '⚖️'} 
                {type === 'about' && 'ℹ️'} 
                {type === 'general' && '📋'} 
                <span className="ml-2">{type} Information</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {pages.map((page: InformationPage) => (
                  <Card key={page.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {page.title}
                        <Badge variant="outline">/{page.slug}</Badge>
                      </CardTitle>
                      {page.meta_description && (
                        <CardDescription>{page.meta_description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">{page.content.substring(0, 200)}...</p>
                        </div>
                      </ScrollArea>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                        <span>Updated: {page.updated_at.toLocaleDateString()}</span>
                        <Badge variant={page.is_published ? 'secondary' : 'destructive'}>
                          {page.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">📞 Contact Information</h2>
      
      {contactInfo.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📞</div>
            <p className="text-xl text-gray-500">Contact information will be available soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedContactInfo).map(([department, contacts]) => (
            <Card key={department} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  🏢 {department}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts
                    .sort((a: ContactInfo, b: ContactInfo) => {
                      if (a.is_primary && !b.is_primary) return -1;
                      if (!a.is_primary && b.is_primary) return 1;
                      return a.display_order - b.display_order;
                    })
                    .map((contact: ContactInfo) => (
                    <div 
                      key={contact.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        contact.is_primary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-lg">{getContactIcon(contact.contact_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{contact.label}</span>
                          {contact.is_primary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {contact.contact_type === 'email' ? (
                            <a href={`mailto:${contact.value}`} className="text-blue-600 hover:underline">
                              {contact.value}
                            </a>
                          ) : contact.contact_type === 'phone' ? (
                            <a href={`tel:${contact.value}`} className="text-blue-600 hover:underline">
                              {contact.value}
                            </a>
                          ) : (
                            <span className="whitespace-pre-wrap">{contact.value}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCurrentSection = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-500">Loading information...</p>
        </div>
      );
    }

    switch (currentSection) {
      case 'home':
        return renderHomeSection();
      case 'news':
        return renderNewsSection();
      case 'gallery':
        return renderGallerySection();
      case 'services':
        return renderServicesSection();
      case 'contact':
        return renderContactSection();
      default:
        return renderHomeSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      <main className="container mx-auto px-4 py-8">
        {renderCurrentSection()}
      </main>
      
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏛️</div>
            <h3 className="text-lg font-semibold mb-2">Government Information Portal</h3>
            <p className="text-gray-300">Serving our community with transparency and accessibility</p>
            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                © 2024 Government Agency. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
