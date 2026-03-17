import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;
    if (!token) return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const client = await clientPromise;
    const user = await client.db().collection('users').findOne({ _id: new (require('mongodb').ObjectId)(payload.sub) }, { projection: { password: 0, subscription: 1 } });
    if (!user) return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    
    const hasSubscription = !!user.subscription;
    const response = NextResponse.json({ 
      name: user.name, 
      email: user.email, 
      avatar: user.avatar,
      subscription: user.subscription || null
    }, { headers: { 'Cache-Control': 'no-store' } });
    
    // Set cookie for middleware to check subscription status
    response.cookies.set('has_subscription', String(hasSubscription), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 3, // 3 days
      path: '/'
    });
    
    return response;
  } catch (err) {
    return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
}
