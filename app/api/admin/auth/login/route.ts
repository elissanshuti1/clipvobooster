import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    console.log('Admin login attempt:', { username, passwordLength: password?.length });

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const admins = db.collection('admins');

    // Find admin by username (case-insensitive)
    const admin = await admins.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });

    console.log('Admin found:', admin ? { username: admin.username, name: admin.name } : 'NOT FOUND');

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials. Admin account may not exist yet.' },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await admins.updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    );

    // Create JWT token
    const token = signToken(
      { 
        sub: admin._id.toString(),
        username: admin.username,
        role: admin.role,
        isAdmin: true
      },
      '7d' // Admin tokens last 7 days
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Admin login error:', error.message);
    return NextResponse.json(
      { error: 'Login failed: ' + error.message },
      { status: 500 }
    );
  }
}
