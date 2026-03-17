import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Save leads found from internet search
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
    const { productId, leads } = body;
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const leadsCollection = db.collection('leads');
    const products = db.collection('products');
    
    // Verify product exists and belongs to user
    const product = await products.findOne({
      _id: new ObjectId(productId),
      userId: String(payload.sub)
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Save leads
    const leadsToInsert = (leads || []).map((lead: any) => ({
      userId: String(payload.sub),
      productId: new ObjectId(productId),
      name: lead.name || 'Unknown',
      email: lead.email || '',
      company: lead.company || '',
      role: lead.role || '',
      need: lead.need || '',
      source: lead.source || 'Internet Search',
      location: lead.location || '',
      industry: lead.industry || '',
      postUrl: lead.postUrl || '',
      status: 'new',
      contacted: false,
      responded: false,
      notes: '',
      contactCount: 0,
      lastContactedAt: null,
      createdAt: new Date()
    }));
    
    if (leadsToInsert.length > 0) {
      await leadsCollection.insertMany(leadsToInsert);
      
      await products.updateOne(
        { _id: new ObjectId(productId) },
        { 
          $inc: { leadsGenerated: leadsToInsert.length },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    return NextResponse.json({ 
      leads: leadsToInsert,
      count: leadsToInsert.length,
      message: `Saved ${leadsToInsert.length} leads from internet search`
    });
    
  } catch (err: any) {
    console.error('Save found leads error:', err.message);
    return NextResponse.json({ error: 'Failed to save leads', details: err.message }, { status: 500 });
  }
}
