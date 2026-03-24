'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Format the path name
      let label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Special cases
      if (path === 'blog') label = 'Blog';
      if (path === 'pricing') label = 'Pricing';
      if (path === 'features') label = 'Features';
      if (path === 'about') label = 'About';
      if (path === 'login') label = 'Login';
      if (path === 'signup') label = 'Sign Up';
      if (path === 'dashboard') label = 'Dashboard';
      if (path === 'categories') label = 'Categories';
      if (path === 'secure') return; // Don't show admin paths
      if (path === 'admin') return;
      
      // Don't add the last item if it's the current page (we'll show it separately)
      if (index < paths.length - 1) {
        breadcrumbs.push({ label, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null;

  // Don't show breadcrumbs for admin pages
  if (pathname.includes('/secure/') || pathname.includes('/dashboard/')) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center space-x-2 text-sm text-gray-400">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight size={14} className="mx-2 text-gray-600" />
            )}
            <Link
              href={crumb.href}
              className="hover:text-indigo-400 transition-colors"
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
