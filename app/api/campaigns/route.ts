import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - List all campaigns
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
    
    // Check if campaigns collection exists, create if not
    const collections = await db.listCollections({ name: 'campaigns' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('campaigns');
      console.log('Created campaigns collection');
    }
    
    const campaigns = db.collection('campaigns');
    const userCampaigns = await campaigns.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json(userCampaigns || []);
  } catch (err: any) {
    console.error('Get campaigns error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch campaigns', details: err.message }, { status: 500 });
  }
}

// POST - Create new campaign
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
    const { name, productId, method, budget, targetLeads, description } = body;
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    
    // Check if campaigns collection exists, create if not
    const collections = await db.listCollections({ name: 'campaigns' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('campaigns');
    }
    
    const campaigns = db.collection('campaigns');
    
    const campaign = {
      userId: String(payload.sub),
      productId: productId || null,
      name: name || 'Untitled Campaign',
      method: method || 'manual',
      budget: budget || 0,
      targetLeads: targetLeads || 0,
      description: description || '',
      status: 'draft',
      leadsContacted: 0,
      emailsSent: 0,
      responses: 0,
      conversions: 0,
      creditsUsed: 0,
      startDate: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await campaigns.insertOne(campaign);
    
    return NextResponse.json({ 
      ...campaign, 
      _id: result.insertedId,
      message: 'Campaign created successfully'
    });
  } catch (err: any) {
    console.error('Create campaign error:', err.message);
    return NextResponse.json({ error: 'Failed to create campaign', details: err.message }, { status: 500 });
  }
}
