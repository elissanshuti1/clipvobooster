import { Metadata } from 'next';

interface SchemaProps {
  type?: 'article' | 'website' | 'organization' | 'product' | 'faq' | 'breadcrumb';
  title: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; url: string }[];
  price?: string;
  rating?: { value: number; count: number };
}

export function generateSchema({
  type = 'website',
  title,
  description,
  url,
  image = 'https://clipvo.site/og-image.png',
  author = 'ClipVoBooster Team',
  publishedTime,
  modifiedTime,
  category,
  tags,
  faqs,
  breadcrumbs,
  price,
  rating,
}: SchemaProps) {
  const schemas: any[] = [];

  // Organization Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ClipVoBooster",
    "url": "https://clipvo.site",
    "logo": "https://clipvo.site/favicon.png",
    "description": "AI-powered email marketing platform with real-time tracking and automation.",
    "founder": {
      "@type": "Person",
      "name": "ClipVoBooster Team"
    },
    "sameAs": [
      "https://twitter.com/clipvobooster",
      "https://www.linkedin.com/company/clipvobooster",
      "https://www.facebook.com/clipvobooster"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@clipvo.site"
    }
  });

  // Software Application Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ClipVoBooster",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "description": "AI-powered email marketing platform with real-time tracking, automation, and analytics.",
    "offers": {
      "@type": "Offer",
      "price": "15.00",
      "priceCurrency": "USD",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "AI Email Writing",
      "Real-time Email Tracking",
      "Marketing Automation",
      "Contact Management",
      "Analytics Dashboard",
      "Gmail Integration"
    ]
  });

  // Article Schema (for blog posts)
  if (type === 'article' && publishedTime) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "url": url,
      "image": image,
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "ClipVoBooster",
        "logo": {
          "@type": "ImageObject",
          "url": "https://clipvo.site/favicon.png"
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "articleSection": category,
      "keywords": tags?.join(', ') || ''
    });
  }

  // FAQ Schema
  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // Breadcrumb Schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    });
  }

  // Product Schema (for pricing page)
  if (type === 'product' && price) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "ClipVoBooster Email Marketing Platform",
      "description": "AI-powered email marketing platform with advanced tracking and automation.",
      "brand": {
        "@type": "Organization",
        "name": "ClipVoBooster"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter Plan",
          "price": "15.00",
          "priceCurrency": "USD",
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Professional Plan",
          "price": "29.00",
          "priceCurrency": "USD",
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Lifetime Plan",
          "price": "60.00",
          "priceCurrency": "USD",
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          "availability": "https://schema.org/InStock"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "500"
      }
    });
  }

  return schemas;
}

// Component for rendering schema in pages
export function SchemaMarkup(props: SchemaProps) {
  const schemas = generateSchema(props);
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}

// Helper function for page metadata with schema
export function createMetadata({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.png',
}: {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}): Metadata {
  return {
    title,
    description,
    keywords: keywords || [],
    authors: [{ name: 'ClipVoBooster Team' }],
    creator: 'ClipVoBooster',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical || 'https://clipvo.site',
      siteName: 'ClipVoBooster',
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@clipvobooster',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonical || 'https://clipvo.site',
    },
  };
}
