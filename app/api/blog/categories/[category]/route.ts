import { NextResponse } from 'next/server';
import { getPostsByCategory } from '@/lib/blog/utils';

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const posts = getPostsByCategory(decodeURIComponent(params.category));
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
