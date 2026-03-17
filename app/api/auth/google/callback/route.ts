import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    
    console.log('Google callback received code:', code ? 'Yes' : 'No');
    
    if (!code) {
      console.error('No code in callback');
      return NextResponse.redirect(new URL('/login?error=no_code', req.url));
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Got tokens from Google');
    
    // Set credentials
    oauth2Client.setCredentials(tokens);
    
    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log('Got user info:', userInfo.data.email);
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    
    // Find or create user
    let user = await users.findOne({ email: userInfo.data.email });
    
    if (!user) {
      // Create new user with Gmail already connected
      console.log('Creating new user:', userInfo.data.email);
      const result = await users.insertOne({
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        googleId: userInfo.data.id,
        gmailTokens: tokens,
        hasGmail: true,  // Gmail is connected by default
        createdAt: new Date(),
      });
      
      user = {
        _id: result.insertedId,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      };
    } else {
      // Update tokens and mark Gmail as connected
      console.log('Updating existing user:', userInfo.data.email);
      await users.updateOne(
        { email: userInfo.data.email },
        { $set: { 
          gmailTokens: tokens,
          hasGmail: true,  // Ensure Gmail is marked as connected
          lastLogin: new Date()
        }}
      );
    }
    
    // Create JWT token for our app
    const appToken = jwt.sign(
      { 
        sub: String(user._id), 
        email: user.email,
        hasGmail: true 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );
    
    console.log('Created JWT token, redirecting to dashboard');

    // Redirect to dashboard overview with token in URL (for first login)
    const redirectUrl = new URL('/dashboard/overview', req.url);
    redirectUrl.searchParams.set('token', appToken);

    const response = NextResponse.redirect(redirectUrl);
    
    // Set HTTP-only cookie
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const secure = process.env.NODE_ENV === 'production';
    
    response.cookies.set('token', appToken, {
      httpOnly: true,
      secure: secure,
      path: '/',
      maxAge: maxAge,
      sameSite: 'lax'
    });
    
    return response;
    
  } catch (err: any) {
    console.error('Google OAuth error:', err.message, err.stack);
    const errorUrl = new URL('/login', req.url);
    errorUrl.searchParams.set('error', 'google_auth_failed');
    errorUrl.searchParams.set('message', err.message);
    return NextResponse.redirect(errorUrl);
  }
}
