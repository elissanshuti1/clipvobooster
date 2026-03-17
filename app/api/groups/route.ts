import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get all groups for user
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
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
    const groups = db.collection('groups');
    
    const userGroups = await groups.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(userGroups);
    
  } catch (err: any) {
    console.error('Get groups error:', err.message);
    return NextResponse.json({ error: 'Failed to get groups', details: err.message }, { status: 500 });
  }
}

// POST - Create new group
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
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
    
    const body = await req.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Group name required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const groups = db.collection('groups');
    
    const group = {
      userId: String(payload.sub),
      name,
      contactCount: 0,
      createdAt: new Date()
    };
    
    const result = await groups.insertOne(group);
    
    return NextResponse.json({ 
      ...group, 
      _id: result.insertedId,
      message: 'Group created successfully'
    });
    
  } catch (err: any) {
    console.error('Create group error:', err.message);
    return NextResponse.json({ error: 'Failed to create group', details: err.message }, { status: 500 });
  }
}

// DELETE - Delete group
export async function DELETE(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
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
    
    const url = new URL(req.url);
    const groupId = url.searchParams.get('id');
    
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const groups = db.collection('groups');
    const contacts = db.collection('contacts');
    
    // Delete group and remove group reference from contacts
    await groups.deleteOne({ _id: new (require('mongodb').ObjectId)(groupId), userId: String(payload.sub) });
    await contacts.updateMany(
      { groupId: new (require('mongodb').ObjectId)(groupId), userId: String(payload.sub) },
      { $unset: { groupId: '' } }
    );
    
    return NextResponse.json({ message: 'Group deleted successfully' });
    
  } catch (err: any) {
    console.error('Delete group error:', err.message);
    return NextResponse.json({ error: 'Failed to delete group', details: err.message }, { status: 500 });
  }
}
