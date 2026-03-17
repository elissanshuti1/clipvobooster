import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import clientPromise from '@/lib/mongodb';

// Initialize OpenRouter client
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://clipvo.site',
    'X-OpenRouter-Title': 'ClipVo Email'
  }
});

export async function POST(req: Request) {
  try {
    // Verify user is logged in
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

    // Get user profile from database
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    
    const user = await users.findOne(
      { _id: new (require('mongodb').ObjectId)(payload.sub) },
      { projection: { profile: 1, name: 1, email: 1 } }
    );
    
    const profile = user?.profile || {};
    const senderName = user?.name || profile?.projectName || 'The Team';
    const senderEmail = user?.email;
    const senderWebsite = profile?.projectUrl;
    
    // Use profile data if not provided in request
    const body = await req.json();
    let {
      recipientName,
      recipientEmail,
      productName,
      productDescription,
      productUrl,
      tone
    } = body;
    
    // Auto-fill from profile if not provided
    if (!productName) productName = profile.projectName || 'Our Product';
    if (!productDescription) productDescription = profile.projectDescription || 'a solution that can help your business';
    if (!productUrl) productUrl = profile.projectUrl || senderWebsite;
    if (!tone) tone = 'friendly';

    console.log('Generating email with OpenRouter...');
    console.log('Product:', productName);
    console.log('Recipient:', recipientName || 'Unknown');
    console.log('Sender:', senderName);
    console.log('Website:', productUrl);

    // Create the prompt - Generate PROFESSIONAL, detailed email like a business letter
    const emailPrompt = `You are a professional business letter writer creating a DETAILED, ENGAGING cold outreach email.

SENDER:
- Name: ${senderName}
- Product/Service: ${productName}
- Website: ${productUrl || 'https://example.com'}
- Description: ${productDescription}

RECIPIENT: ${recipientName || 'Valued Professional'}
TONE: ${tone || 'professional'}

YOUR GOAL: Write a compelling, professional business letter that gets READ and RESPONSES.

STRUCTURE (FOLLOW EXACTLY):
1. Professional greeting (Dear [Name] or "Hello there" if unknown)
2. Opening paragraph (2-3 sentences): How you found them, genuine compliment about their work/business
3. Introduction paragraph (3-4 sentences): Who you are, what your company does, why you're reaching out
4. Value proposition paragraph (4-5 sentences): Detailed explanation of how your product solves their problems, include specific benefits and features
5. Social proof paragraph (2-3 sentences): Mention results other customers achieved, build credibility
6. Call-to-action paragraph (2-3 sentences): Clear, friendly invitation to learn more or visit website
7. Professional closing with signature

IMPORTANT RULES:
- Write like a FORMAL BUSINESS LETTER, not a casual note
- MINIMUM 200 words, make it substantial and detailed
- NO placeholders like [Name], [Company], [mention something specific]
- Include the website URL naturally in the text: "Visit us at ${productUrl || 'our website'}"
- Sound professional yet warm and approachable
- Use proper paragraph breaks for readability
- Make every sentence count - no fluff, but be thorough
- Include specific features, benefits, and outcomes
- End with a clear invitation to visit their website or respond

FORMAT: Write as plain text with proper paragraph breaks. Do NOT include "Subject:" line.

EXAMPLE STRUCTURE:
"Dear [Name],

I hope this message finds you well. I recently came across your impressive work at [Company] and was particularly struck by [specific observation]. Your dedication to excellence in your field is truly commendable.

My name is [Name] and I represent [Company], where we specialize in [detailed description]. We've been helping professionals and businesses like yourself achieve remarkable results through our innovative solutions...

[Continue with detailed value proposition, benefits, social proof, and call-to-action]

We would be honored to have you visit our website at [URL] to learn more about how we can help transform your workflow.

Warm regards,
[Name]
[Title]
[Company]"

Write a COMPLETE, PROFESSIONAL business letter. Make it detailed enough to be taken seriously.`;

    // Call OpenRouter API with a working free model
    const completion = await openrouter.chat.completions.create({
      model: 'google/gemma-2-9b-it',
      messages: [
        {
          role: 'user',
          content: emailPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    console.log('OpenRouter response:', completion);

    const emailContent = completion.choices[0].message?.content || '';

    // AGGRESSIVE CLEANUP - Remove placeholders, markdown, bullet points
    let cleanedEmail = emailContent
      .replace(/```/g, '')
      .replace(/\*\*/g, '')
      .replace(/^\s*Subject:.*$/im, '')
      .replace(/^\s*[-*•]\s*/gm, '')
      .replace(/\[mention[^\]]*\]/gi, '')
      .replace(/\[specific[^\]]*\]/gi, '')
      .replace(/\[platform[^\]]*\]/gi, '')
      .replace(/\[Name\]/gi, '')
      .trim();
    
    // If STILL has placeholders, use SAFE FALLBACK with better copy
    if (cleanedEmail.includes('[') || cleanedEmail.toLowerCase().includes('mention') || cleanedEmail.toLowerCase().includes('specific')) {
      cleanedEmail = `Hey there!

I've been following your work and I'm really impressed!

I'm reaching out because I think ${productName} could be a game-changer for your workflow. ${productDescription.substring(0, 150)}

Several creators using it are now producing 3x more content in half the time.

Would you be open to a quick 10-min demo this week?

Best,
${senderName}`;
    }
    
    // CATCHY subject lines - rotate between proven winners
    const subjectOptions = [
      `Quick question about your design workflow`,
      `Saw your work - had to reach out`,
      `This will save you hours on design`,
      `Love your work! Quick question`,
      `${recipientName || 'there'}, quick question`,
      `Re: Your creative workflow`,
      `Idea for your next project`,
      `This tool is perfect for creators like you`
    ];
    
    // Pick a random catchy subject
    const subjectLine = subjectOptions[Math.floor(Math.random() * subjectOptions.length)];

    console.log('Final email:', cleanedEmail.substring(0, 200));
    console.log('Subject:', subjectLine);

    return NextResponse.json({
      subject: subjectLine,
      body: cleanedEmail,
      message: 'Email generated!'
    });

  } catch (err: any) {
    console.error('Generate email error:', err.message);
    console.error('Error stack:', err.stack);
    
    // Fallback template
    const { recipientName, productName, productDescription } = await req.json().catch(() => ({}));
    
    return NextResponse.json({
      subject: `Quick question about ${productName || 'our product'}`,
      body: `Hi ${recipientName || 'there'},\n\nI hope you're doing well!\n\nI wanted to introduce you to ${productName || 'something'} - ${productDescription || 'a solution that might help your business'}.\n\nWould you be open to learning more?\n\nBest regards`,
      message: 'AI unavailable - using template',
      error: err.message
    });
  }
}
