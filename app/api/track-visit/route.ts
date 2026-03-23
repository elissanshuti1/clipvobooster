import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, userId } = body;

    const client = await clientPromise;
    const db = client.db('clipvobooster');

    // Record visit
    await db.collection('visits').insertOne({
      path,
      userId: userId || null,
      timestamp: new Date(),
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    });

    // Record page view
    await db.collection('page_views').insertOne({
      path,
      userId: userId || null,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Track visit error:', error.message);
    return NextResponse.json(
      { error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}
