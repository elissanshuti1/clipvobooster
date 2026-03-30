import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get user's conversations
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
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');

    // Get or create conversation for this user
    let conversation = await conversations.findOne({ userId: payload.sub });

    if (!conversation) {
      // Get user info
      const users = db.collection('users');
      const user = await users.findOne(
        { _id: new (require('mongodb').ObjectId)(payload.sub) },
        { projection: { name: 1, email: 1, subscription: 1 } }
      );

      // Create new conversation
      const result = await conversations.insertOne({
        userId: payload.sub,
        userName: user?.name || user?.email?.split('@')[0] || 'User',
        userEmail: user?.email || '',
        userPlan: user?.subscription?.plan || 'free',
        status: 'open',
        lastMessage: '',
        lastMessageAt: new Date(),
        createdAt: new Date(),
      });

      conversation = { _id: result.insertedId };
    }

    // Get messages for this conversation
    const conversationMessages = await messages
      .find({ conversationId: conversation._id.toString() })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({
      conversationId: conversation._id,
      messages: conversationMessages,
    });

  } catch (err: any) {
    console.error('Get chat error:', err.message);
    return NextResponse.json({ error: 'Failed to get chat', details: err.message }, { status: 500 });
  }
}

// POST - Send message
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
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const conversations = db.collection('conversations');
    const messages = db.collection('messages');

    // Get conversation
    const conversation = await conversations.findOne({ 
      _id: new (require('mongodb').ObjectId)(conversationId) 
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save message
    await messages.insertOne({
      conversationId,
      sender: 'user',
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
          status: 'open',
        },
      }
    );

    return NextResponse.json({ message: 'Message sent' });

  } catch (err: any) {
    console.error('Send message error:', err.message);
    return NextResponse.json({ error: 'Failed to send message', details: err.message }, { status: 500 });
  }
}
