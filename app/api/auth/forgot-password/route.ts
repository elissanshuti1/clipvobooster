import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    
    const user = await users.findOne({ email });
    
    // Always return success to prevent email enumeration
    // In production, you would send a real email here
    // For now, we'll just simulate the process
    
    if (user) {
      // Generate reset token (in production, save this to DB and send via email)
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour
      
      // Save reset token to user (in production)
      await users.updateOne(
        { email },
        { 
          $set: { 
            resetToken,
            resetTokenExpiry
          } 
        }
      );
      
      // In production: Send email with reset link
      // For demo: Just return success
      console.log(`Password reset requested for ${email}. Token: ${resetToken}`);
    }
    
    return NextResponse.json({ 
      message: 'If an account exists with that email, we\'ve sent password reset instructions',
      demo: process.env.NODE_ENV === 'development' ? 'Check console for reset token' : undefined
    });
    
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
