import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('admin_token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const admins = db.collection('admins');

    await admins.updateOne(
      { _id: new require('mongodb').ObjectId(payload.sub) },
      { $set: { name } }
    );

    return NextResponse.json({ success: true, name });

  } catch (error: any) {
    console.error('Update name error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update name' },
      { status: 500 }
    );
  }
}
