import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');

    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('admin_token='));
    const adminToken = m ? m.split('=')[1] : null;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(adminToken, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');

    if (conversationId) {
      const conversationMessages = await messages
        .find({ conversationId: conversationId })
        .sort({ createdAt: 1 })
        .toArray();

      return NextResponse.json({ messages: conversationMessages });
    }

    const allConversations = await conversations
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();

    return NextResponse.json({ conversations: allConversations });

  } catch (err: any) {
    console.error('Get admin chats error:', err.message);
    return NextResponse.json({ error: 'Failed to get chats', details: err.message }, { status: 500 });
  }
}

// POST - Admin reply to conversation
export async function POST(req: Request) {
  try {
    // Verify admin
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('admin_token='));
    const adminToken = m ? m.split('=')[1] : null;

    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(adminToken, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    }

    const { conversationId, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');

    // Save message
    await messages.insertOne({
      conversationId,
      sender: 'admin',
      message,
      read: false,
      createdAt: new Date(),
    });

    // Update conversation
    await conversations.updateOne(
      { _id: new (require('mongodb').ObjectId)(conversationId) },
      {
        $set: {
          lastMessage: message,
          lastMessageAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: 'Message sent' });

  } catch (err: any) {
    console.error('Admin send message error:', err.message);
    return NextResponse.json({ error: 'Failed to send message', details: err.message }, { status: 500 });
  }
}
