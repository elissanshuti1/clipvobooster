import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Get user notifications
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
    const notifications = db.collection('notifications');
    
    const userNotifications = await notifications.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).limit(50).toArray();
    
    // Count unread
    const unreadCount = await notifications.countDocuments({ 
      userId: String(payload.sub), 
      read: false 
    });
    
    return NextResponse.json({
      notifications: userNotifications,
      unreadCount
    });
    
  } catch (err: any) {
    console.error('Get notifications error:', err.message);
    return NextResponse.json({ error: 'Failed to get notifications', details: err.message }, { status: 500 });
  }
}

// POST - Mark notification as read OR create notification
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
    const { notificationId, markAllRead, type, title, message } = body;
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const notifications = db.collection('notifications');
    
    // If type, title, message provided, create new notification
    if (type && title && message) {
      const result = await notifications.insertOne({
        userId: String(payload.sub),
        type,
        title,
        message,
        read: false,
        createdAt: new Date()
      });
      return NextResponse.json({ message: 'Notification created', id: result.insertedId });
    }
    
    // Otherwise mark as read
    if (markAllRead) {
      await notifications.updateMany(
        { userId: String(payload.sub), read: false },
        { $set: { read: true } }
      );
    } else if (notificationId) {
      await notifications.updateOne(
        { _id: new ObjectId(notificationId), userId: String(payload.sub) },
        { $set: { read: true } }
      );
    }
    
    return NextResponse.json({ message: 'Notifications marked as read' });
    
  } catch (err: any) {
    console.error('Notification error:', err.message);
    return NextResponse.json({ error: 'Failed to process notification', details: err.message }, { status: 500 });
  }
}
