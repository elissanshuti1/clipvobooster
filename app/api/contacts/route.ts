import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Get all contacts for user
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
    const contacts = db.collection('contacts');
    
    // Get user's own contacts ONLY (no directory - legal compliance)
    const userContacts = await contacts.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(userContacts);
    
  } catch (err: any) {
    console.error('Get contacts error:', err.message);
    return NextResponse.json({ error: 'Failed to get contacts', details: err.message }, { status: 500 });
  }
}

// POST - Add new contact
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
    const { email, name, group, groupId } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const contacts = db.collection('contacts');
    
    // Check if contact already exists
    const existing = await contacts.findOne({ 
      email, 
      userId: String(payload.sub) 
    });
    
    if (existing) {
      return NextResponse.json({ error: 'Contact already exists', contact: existing }, { status: 409 });
    }
    
    const contact = {
      userId: String(payload.sub),
      email,
      name: name || '',
      group: group || 'General',
      groupId: groupId || null,
      openedEmails: 0,
      clickedLinks: 0,
      lastOpenedAt: null,
      createdAt: new Date()
    };
    
    const result = await contacts.insertOne(contact);
    
    // Update group contact count
    if (groupId) {
      await db.collection('groups').updateOne(
        { _id: new ObjectId(groupId), userId: String(payload.sub) },
        { $inc: { contactCount: 1 } }
      );
    }
    
    return NextResponse.json({ 
      ...contact, 
      _id: result.insertedId,
      message: 'Contact added successfully'
    });
    
  } catch (err: any) {
    console.error('Add contact error:', err.message);
    return NextResponse.json({ error: 'Failed to add contact', details: err.message }, { status: 500 });
  }
}

// DELETE - Delete contact
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
    const contactId = url.searchParams.get('id');
    
    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const contacts = db.collection('contacts');
    
    const contact = await contacts.findOne({ 
      _id: new ObjectId(contactId), 
      userId: String(payload.sub) 
    });
    
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    await contacts.deleteOne({ _id: new ObjectId(contactId), userId: String(payload.sub) });
    
    // Update group contact count
    if (contact.groupId) {
      await db.collection('groups').updateOne(
        { _id: new ObjectId(contact.groupId), userId: String(payload.sub) },
        { $inc: { contactCount: -1 } }
      );
    }
    
    return NextResponse.json({ message: 'Contact deleted successfully' });
    
  } catch (err: any) {
    console.error('Delete contact error:', err.message);
    return NextResponse.json({ error: 'Failed to delete contact', details: err.message }, { status: 500 });
  }
}
