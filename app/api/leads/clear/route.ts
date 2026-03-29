import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE - Clear all auto-discovered leads (for testing or fresh start)
export async function DELETE(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const leads = db.collection('leads');

    // Delete only auto-discovered leads (not manually saved ones)
    const result = await leads.deleteMany({
      userId: String(payload.sub),
      isAutoDiscovered: true
    });

    return NextResponse.json({
      message: `Cleared ${result.deletedCount} auto-discovered leads`,
      deletedCount: result.deletedCount
    });

  } catch (err: any) {
    console.error('Clear leads error:', err.message);
    return NextResponse.json(
      { error: 'Failed to clear leads', details: err.message },
      { status: 500 }
    );
  }
}
