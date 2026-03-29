import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY
});

// POST - Generate keywords from user's profile
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
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
      { projection: { profile: 1 } }
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json(
        { error: 'Profile incomplete. Please describe your project first.' },
        { status: 400 }
      );
    }

    const { projectName, projectDescription, targetAudience } = user.profile;

    // Use AI to generate relevant keywords for Reddit search
    const completion = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.2-3b-instruct',
      messages: [
        {
          role: 'system',
          content: `You are a lead generation expert. Based on the product description, generate 10-15 specific search keywords/phrases that would help find potential customers on Reddit.
          
Focus on:
- Problems the product solves
- Questions potential customers ask
- "Looking for" type phrases
- Competitor alternatives
- Pain points

Return ONLY a JSON array of strings, nothing else.`
        },
        {
          role: 'user',
          content: `Product Name: ${projectName}
Product Description: ${projectDescription}
Target Audience: ${targetAudience || 'Not specified'}

Generate Reddit search keywords to find potential customers who need this product.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content || '[]';
    
    // Parse the AI response to extract keywords
    let keywords: string[] = [];
    try {
      // Try to parse as JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback: extract phrases that look like keywords
      keywords = aiResponse
        .split('\n')
        .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
        .filter(line => line.length > 2 && line.length < 50)
        .slice(0, 15);
    }

    // Ensure we have at least some keywords
    if (keywords.length === 0) {
      keywords = [
        projectName,
        projectDescription.split(' ').slice(0, 3).join(' '),
        'looking for',
        'recommendation',
        'alternative'
      ];
    }

    return NextResponse.json({
      success: true,
      keywords,
      profile: {
        projectName,
        projectDescription,
        targetAudience
      }
    });

  } catch (err: any) {
    console.error('Generate keywords error:', err.message);
    
    // Fallback keywords if AI fails
    return NextResponse.json({
      success: true,
      keywords: [
        'looking for tool',
        'recommendation',
        'alternative',
        'how to',
        'best software',
        'help with'
      ],
      fallback: true
    });
  }
}
