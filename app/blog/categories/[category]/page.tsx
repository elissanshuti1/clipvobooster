import { getAllCategories, getPostsByCategory } from '@/lib/blog/utils';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: { category: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.category).replace(/-/g, ' ');
  const posts = getPostsByCategory(categoryName);
  
  return {
    title: `${categoryName} Articles | ClipVoBooster Blog`,
    description: `Expert insights on ${categoryName}. ${posts.length} articles to help you master email marketing and grow your business.`,
    alternates: {
      canonical: `https://clipvo.site/blog/categories/${params.category}`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = decodeURIComponent(params.category).replace(/-/g, ' ');
  const posts = getPostsByCategory(categoryName);
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-[#08090d]">
      {/* Header */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-8">
            <ArrowLeft size={20} />
            <span>Back to Blog</span>
          </Link>
          
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {categoryName}
            </h1>
            <p className="text-xl text-gray-300">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/blog"
              className="px-6 py-2 rounded-full bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
            >
              All Posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/categories/${category.slug}`}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  category.slug === params.category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-300 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={12} />
                        {post.readTime} min
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <Calendar size={12} />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">No articles found in this category yet.</p>
              <Link href="/blog" className="text-indigo-400 hover:text-indigo-300">
                Browse all articles →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 border border-indigo-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want More {categoryName} Insights?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Subscribe to our newsletter and get the latest tips delivered to your inbox.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-lg"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
