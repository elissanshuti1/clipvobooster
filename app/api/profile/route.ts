import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';

// GET - Get user profile
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
    const users = db.collection('users');
    
    const user = await users.findOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { projection: { password: 0, gmailTokens: 0 } }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      name: user.name,
      email: user.email,
      profile: user.profile || null,
      hasProfile: !!(user.profile && user.profile.projectName)
    });
    
  } catch (err: any) {
    console.error('Get profile error:', err.message);
    return NextResponse.json({ error: 'Failed to get profile', details: err.message }, { status: 500 });
  }
}

// POST - Create/Update user profile
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
    const { projectName, projectUrl, projectDescription, targetAudience } = body;
    
    if (!projectName || !projectDescription) {
      return NextResponse.json({ error: 'Project name and description required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    
    const profile = {
      projectName,
      projectUrl: projectUrl || '',
      projectDescription,
      targetAudience: targetAudience || '',
      updatedAt: new Date()
    };
    
    await users.updateOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { $set: { profile } }
    );
    
    return NextResponse.json({ 
      message: 'Profile saved successfully',
      profile 
    });
    
  } catch (err: any) {
    console.error('Save profile error:', err.message);
    return NextResponse.json({ error: 'Failed to save profile', details: err.message }, { status: 500 });
  }
}
