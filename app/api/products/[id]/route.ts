import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// DELETE a product and all its associated data
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    // Unwrap params Promise
    const { id } = await params;
    const productId = id;
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const products = db.collection('products');
    const campaigns = db.collection('campaigns');

    // Verify ownership
    const product = await products.findOne({
      _id: new ObjectId(productId),
      userId: String(payload.sub)
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete all campaigns for this product
    const campaignsResult = await campaigns.deleteMany({
      productId: new ObjectId(productId)
    });

    // Delete the product
    await products.deleteOne({
      _id: new ObjectId(productId)
    });

    console.log(`Deleted product ${product.name}: ${campaignsResult.deletedCount} campaigns`);

    return NextResponse.json({
      message: `Deleted "${product.name}" and all associated data`,
      deletedCampaigns: campaignsResult.deletedCount
    });
    
  } catch (err: any) {
    console.error('Delete product error:', err.message);
    return NextResponse.json({ error: 'Failed to delete product', details: err.message }, { status: 500 });
  }
}
