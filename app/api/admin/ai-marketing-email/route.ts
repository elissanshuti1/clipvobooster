import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('admin_token='));
    const token = m ? m.split('=')[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, customPrompt } = body;

    const emailTypes: Record<string, { subject: string; focus: string }> = {
      welcome: {
        subject: 'Get your first Reddit customer today',
        focus: 'Welcome new users. Be direct: tell them exactly what to do to get customers. Give one specific action they can take right now. Make them feel they can get results fast.'
      },
      upgrade: {
        subject: 'Get more customers with paid features',
        focus: 'For free users. Be direct: tell them what they are missing. More leads, more emails, better outreach. Give them one reason to upgrade.'
      },
      feature: {
        subject: 'New feature to get more customers',
        focus: 'Announce a feature. Be direct: what it does, how it helps them get more customers or sales. Keep it short.'
      },
      reengage: {
        subject: 'Come back - you are missing customers',
        focus: 'For inactive users. Be direct: tell them what they are missing. Remind them what the tool does - gets customers on Reddit.'
      },
      custom: {
        subject: 'Get more customers with ClipVoBooster',
        focus: customPrompt || 'Write about getting customers, Reddit outreach, or email marketing.'
      }
    };

    const emailConfig = emailTypes[type] || emailTypes.custom;

    const systemPrompt = `You are writing an email from ClipVoBooster founder to users. Be DIRECT. Be USEFUL. Get to the point.

WHAT CLIPVOBOOSTER DOES:
- Find customers on Reddit
- Send outreach emails  
- Get more sales

YOUR JOB: Write an email that makes users want to use the app RIGHT NOW.

RULES:
1. NO spam trigger words: no "guarantee", no "secret", no "instant"
2. NO emojis
3. Be DIRECT - tell them what to do
4. Subject: 4-6 words, action-oriented
5. Body: 3-4 short paragraphs, 150-200 words total
6. Give ONE specific action they can take
7. Mention RESULTS they can get
8. NO brackets, NO placeholders
9. Sign off with name: "Alex" or "The ClipVoBooster Team"

BAD: "Hey [Name], check out our cool feature!!!"
GOOD: "Hey, want more customers? Here's how to find them on Reddit today."

Write email that makes them think "I should try that now" - not "another sales email."

Format as clean text, NOT JSON:
Subject: [your subject]

[your email body]

Button text: [2-4 words]`;

    const userPrompt = `Generate a ${type} marketing email for ClipVoBooster users. Focus: ${emailConfig.focus}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    let content = completion.choices[0]?.message?.content || '';

    // Parse the new format (Subject: ... \n\n Body... \n\n Button text: ...)
    let emailSubject = emailConfig.subject;
    let emailBody = content;
    let emailCta = 'Try It Free';

    // Try to extract subject
    const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
    if (subjectMatch) {
      emailSubject = subjectMatch[1].trim();
      emailBody = emailBody.replace(/Subject:\s*.+?\n*/i, '');
    }

    // Try to extract button text
    const ctaMatch = content.match(/Button text:\s*(.+?)(?:\n|$)/i);
    if (ctaMatch) {
      emailCta = ctaMatch[1].trim();
      emailBody = emailBody.replace(/Button text:\s*.+?\n*/i, '');
    }

    // Clean up body
    emailBody = emailBody.trim();

    return NextResponse.json({
      subject: emailSubject,
      body: emailBody,
      cta: emailCta,
      type
    });

  } catch (error: any) {
    console.error('AI marketing email error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}