import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET() {
  // Only request non-sensitive scopes - NO verification required
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: scopes,
    prompt: 'select_account',
  });

  return NextResponse.redirect(url);
}
