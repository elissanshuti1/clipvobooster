import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const marketingEmails = db.collection('admin_marketing_emails');

    try {
      await marketingEmails.updateOne(
        { 'trackingIds.id': id },
        { 
          $inc: { 'trackingIds.$.opens': 1 },
          $set: { 'trackingIds.$.openedAt': new Date() }
        },
        { upsert: false }
      );
    } catch (e) {
      // Silently fail - just return 1x1 pixel
    }

    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0',
      },
    });
  } catch (error) {
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return new NextResponse(pixel, {
      headers: { 'Content-Type': 'image/png' },
    });
  }
}