import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    // Get token from cookie
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    const { name, email } = await req.json();
    
    if (!name && !email) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    await users.updateOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { $set: updateData }
    );
    
    return NextResponse.json({ message: 'Profile updated successfully', user: { name, email } });
    
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
