import { getAllPosts, getAllCategories } from '@/lib/blog/utils';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react';

export const metadata = {
  title: "Blog - Email Marketing Tips, AI Automation & Growth Strategies | ClipVoBooster",
  description: "Expert insights on email marketing, AI automation, Gmail tips, and business growth. Learn how to create high-converting email campaigns with ClipVoBooster.",
  keywords: ["email marketing blog", "AI email tips", "email automation guide", "Gmail automation", "email marketing strategies", "business growth tips"],
  openGraph: {
    title: "ClipVoBooster Blog - Email Marketing & AI Automation",
    description: "Expert insights on email marketing, AI automation, and business growth.",
    url: "https://clipvo.site/blog",
    type: "website",
  },
  alternates: {
    canonical: "https://clipvo.site/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-[#08090d]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ClipVoBooster Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Expert insights on email marketing, AI automation, and business growth
            </p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/blog"
              className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              All Posts
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/categories/${category.slug}`}
                className="px-6 py-2 rounded-full bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {posts.length > 0 && (
        <section className="py-12 px-4 border-b border-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-gray-100">Featured Article</h2>
            <Link href={`/blog/${posts[0].slug}`} className="block group">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-700 hover:border-indigo-500 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-medium">
                        {posts[0].category}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock size={14} />
                        {posts[0].readTime} min read
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                      {posts[0].title}
                    </h3>
                    <p className="text-gray-300 text-lg mb-6">
                      {posts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User size={16} />
                        <span>{posts[0].author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span>{new Date(posts[0].date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <ArrowRight size={64} className="text-indigo-500 group-hover:translate-x-4 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Categories Overview */}
      <section className="py-12 px-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-100">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/categories/${category.slug}`}
                className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-indigo-500 hover:bg-gray-800 transition-all group"
              >
                <h3 className="font-semibold text-gray-100 group-hover:text-indigo-400 transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400">{category.count} posts</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-gray-100">Latest Articles</h2>
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
                    <ArrowRight size={16} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-12 border border-indigo-500/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Email Marketing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses using ClipVoBooster to create, send, and track high-converting email campaigns.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors text-lg border border-gray-700"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
