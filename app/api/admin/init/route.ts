import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// This endpoint initializes the admin account
// Only works if no admin exists yet
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const admins = db.collection('admins');

    // Check if admin already exists
    const existingAdmin = await admins.findOne({});

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Nyamata123', 10);

    // Create admin
    const result = await admins.insertOne({
      username: 'nshuti',
      name: 'Nshuti Elissa',
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date(),
      lastLogin: null,
      isActive: true
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      username: 'nshuti',
      password: 'Nyamata123'
    });

  } catch (error: any) {
    console.error('Init admin error:', error.message);
    return NextResponse.json(
      { error: 'Failed to initialize admin' },
      { status: 500 }
    );
  }
}

// Check if admin exists
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const admins = db.collection('admins');

    const existingAdmin = await admins.findOne({});

    return NextResponse.json({
      adminExists: !!existingAdmin
    });

  } catch (error: any) {
    console.error('Check admin error:', error.message);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
