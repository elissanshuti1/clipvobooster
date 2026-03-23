import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - List all products for user
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
    
    // Check if products collection exists, create if not
    const collections = await db.listCollections({ name: 'products' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('products');
      console.log('Created products collection');
    }
    
    const products = db.collection('products');

    const userProducts = await products.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(userProducts || []);
  } catch (err: any) {
    console.error('Get products error:', err.message);
    // Check if it's a MongoDB connection error
    if (err.message?.includes('timed out') || err.message?.includes('connect')) {
      return NextResponse.json({ 
        error: 'Database connection timeout. Please check your MongoDB connection and try again.',
        details: 'MongoDB Atlas may be unreachable. Check your network connection and MongoDB cluster status.'
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Failed to fetch products', details: err.message }, { status: 500 });
  }
}

// POST - Create new product
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
    const { name, description, category, targetAudience, url, price, features, painPoints, uniqueSellingPoint } = body;
    
    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    
    // Check if products collection exists, create if not
    const collections = await db.listCollections({ name: 'products' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('products');
      console.log('Created products collection');
    }
    
    const products = db.collection('products');
    
    const product = {
      userId: String(payload.sub),
      name,
      description,
      category,
      targetAudience: targetAudience || '',
      url: url || '',
      price: price || null,
      features: features || [],
      painPoints: painPoints || [],
      uniqueSellingPoint: uniqueSellingPoint || '',
      status: 'active',
      creditsSpent: 0,
      emailsSent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await products.insertOne(product);
    
    return NextResponse.json({ 
      ...product, 
      _id: result.insertedId,
      message: 'Product created successfully'
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
