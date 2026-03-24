import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define types for blog posts
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  coverImage?: string;
  content: string;
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
}

const blogDirectory = path.join(process.cwd(), 'app/blog/[slug]');
const postsDirectory = path.join(process.cwd(), 'content/blog');

// Ensure content directory exists
if (!fs.existsSync(postsDirectory)) {
  fs.mkdirSync(postsDirectory, { recursive: true });
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      date: data.date || '',
      author: data.author || 'ClipVoBooster Team',
      category: data.category || 'General',
      tags: data.tags || [],
      readTime: data.readTime || 5,
      coverImage: data.coverImage || '/blog/default-cover.jpg',
      content,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return posts;
}

export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => 
    post.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): BlogCategory[] {
  const allPosts = getAllPosts();
  const categoryMap = new Map<string, { name: string; description: string; count: number }>();

  const categoryDescriptions: Record<string, string> = {
    'email-marketing': 'Tips and strategies for effective email marketing campaigns',
    'ai-automation': 'How AI is transforming email marketing and automation',
    'tutorials': 'Step-by-step guides and how-to articles',
    'business-growth': 'Strategies for growing your business with email',
    'product-updates': 'Latest features and improvements to ClipVoBooster',
    'case-studies': 'Real-world success stories from our users',
  };

  allPosts.forEach(post => {
    const slug = post.category.toLowerCase().replace(/\s+/g, '-');
    const existing = categoryMap.get(slug);
    categoryMap.set(slug, {
      name: post.category,
      description: categoryDescriptions[slug] || 'Articles about ' + post.category,
      count: (existing?.count || 0) + 1,
    });
  });

  return Array.from(categoryMap.entries()).map(([slug, data]) => ({
    slug,
    ...data,
  }));
}

export function getRelatedPosts(currentSlug: string, category: string, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter(post => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
