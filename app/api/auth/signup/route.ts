import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, avatar } = body;
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const res = await users.insertOne({ name: name || '', email, password: hash, avatar: avatar || null, createdAt: new Date() });
    const user = await users.findOne({ _id: res.insertedId }, { projection: { password: 0 } });

    const token = signToken({ sub: String(res.insertedId), email });

    const response = NextResponse.json({ ok: true, user });
    // set httpOnly cookie (only set Secure in production)
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    
    // Set token cookie
    response.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`);
    
    // Set subscription status cookie for middleware (new users don't have subscription)
    response.headers.append('Set-Cookie', `has_subscription=false; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`);
    
    return response;
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 });
  }
}
