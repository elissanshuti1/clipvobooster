import { getPostBySlug, getAllPosts } from "@/lib/blog/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
} from "lucide-react";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${post.title} | ClipVoBooster Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const shareUrl = encodeURIComponent(`https://clipvo.site/blog/${post.slug}`);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <article className="min-h-screen bg-[#08090d]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>Back to Blog</span>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-medium">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Clock size={14} />
              {post.readTime} min read
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-300 mb-8">{post.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} />
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={`mailto:?subject=${shareTitle}&body=Check out this article: ${shareUrl}`}
                className="p-2 rounded-full bg-gray-800 hover:bg-indigo-600 transition-colors"
                aria-label="Share via Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg prose-invert max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-2
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-indigo-400 prose-a:hover:text-indigo-300
            prose-strong:text-white
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-400
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700
            prose-table:border prose-table:border-gray-700 prose-table:my-8
            prose-th:border prose-th:border-gray-700 prose-th:bg-gray-800 prose-th:text-white prose-th:p-3
            prose-td:border prose-td:border-gray-700 prose-td:p-3
            prose-img:rounded-xl prose-img:border prose-img:border-gray-700"
        >
          {renderContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={18} className="text-gray-400" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm hover:bg-indigo-600/20 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border border-indigo-500/30">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Put These Insights into Practice?
          </h3>
          <p className="text-gray-300 mb-6">
            Start creating high-converting email campaigns with ClipVoBooster's
            AI-powered platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/features"
              className="px-6 py-3 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

// Helper function to render markdown content
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = "";
  let listItems: string[] = [];
  let inList = false;
  let tableRows: string[] = [];
  let inTable = false;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`}>
          {listItems.map((item, i) => {
            // Check for bold text
            const boldMatch = item.match(/\*\*(.+?)\*\*/);
            return (
              <li key={i}>
                {boldMatch ? (
                  <>
                    <strong>{boldMatch[1]}</strong>
                    {item.replace(boldMatch[0], "").replace("- ", "").trim()}
                  </>
                ) : (
                  item.replace("- ", "")
                )}
              </li>
            );
          })}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 1) {
      const headers = tableRows[0]
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => cell.trim());
      const dataRows = tableRows.slice(2).map((row) =>
        row
          .split("|")
          .filter((cell) => cell.trim())
          .map((cell) => cell.trim()),
      );

      elements.push(
        <table key={`table-${elements.length}`}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    // Code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLanguage = line.slice(3);
        codeContent = [];
      } else {
        elements.push(
          <pre key={index}>
            <code>{codeContent.join("\n")}</code>
          </pre>,
        );
        inCodeBlock = false;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Tables
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line);
      if (!line.includes("---")) {
        flushList();
      }
      return;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={index}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={index}>{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={index}>{line.slice(2)}</h1>);
    }
    // List items
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.slice(2));
    }
    // Regular paragraph
    else {
      flushList();
      // Check for bold text in paragraph
      const parts = line.split(/(\*\*.*?\*\*)/g);
      elements.push(
        <p key={index}>
          {parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>,
      );
    }
  });

  flushList();
  flushTable();

  return elements;
}
