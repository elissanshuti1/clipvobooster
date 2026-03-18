import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    console.log('Cookies received:', cookie.substring(0, 100));
    
    const m = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;
    
    console.log('Token extracted:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const payload: any = verifyToken(token);
    if (!payload) {
      console.log('Invalid token');
      return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const client = await clientPromise;
    const user = await client.db().collection('users').findOne({ 
      _id: new (require('mongodb').ObjectId)(payload.sub) 
    }, { 
      projection: { password: 0, subscription: 1, name: 1, email: 1, avatar: 1, picture: 1 } 
    });
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    console.log('User found:', user.email);

    const hasSubscription = !!user.subscription;
    const response = NextResponse.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar || user.picture,
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
    console.error('/api/auth/me error:', err);
    return NextResponse.json(null, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
}
