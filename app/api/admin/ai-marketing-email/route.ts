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
        subject: 'Quick start with ClipVoBooster',
        focus: 'Welcome new users. Keep it simple: thank them, briefly mention one key thing they can do, wish them well. Very short, genuine.'
      },
      upgrade: {
        subject: 'About your plan',
        focus: 'For free trial users. Keep it simple: let them know their trial is ending, mention one feature they might miss, genuine offer to help.'
      },
      feature: {
        subject: 'New in ClipVoBooster',
        focus: 'Announce one feature. Brief: what it is, who its for, how to use. No hype.'
      },
      reengage: {
        subject: 'Checking in',
        focus: 'For inactive users. Keep it simple: we miss you, one update, offer to help if needed. Genuine, not pushy.'
      },
      custom: {
        subject: 'Update from ClipVoBooster',
        focus: customPrompt || 'Your message to users.'
      }
    };

    const emailConfig = emailTypes[type] || emailTypes.custom;

    const systemPrompt = `You are writing a PERSONAL email from the founder of ClipVoBooster to your existing users.

ClipVoBooster helps you find customers on Reddit and send outreach emails.

YOUR TASK: Write a genuine email that feels real. Not salesy. Not spammy.

CRITICAL RULES:
1. NO spam words: "game-changer", "lifesaver", "secret", "guarantee", "3x", "breakthrough", "amazing", "proven", "exclusive", "instant"
2. NO hype: "revolutionized", "totally", "you must", "don't miss"
3. NO emojis
4. Write like you genuinely care about your users
5. Subject: short, specific, UNDER 50 chars
6. Body: 80-150 words, 2-3 short paragraphs
7. NO exclamation marks anywhere
8. One real benefit or update
9. Sign off: "Thanks" or "Best" only
10. NO brackets, NO placeholders
11. No fancy formatting - plain and simple
12. Tone: "checking in", "quick update", not "exciting news!"

Format ONLY as JSON:
{"subject":"short subject","body":"email body","cta":"button text"}`;

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

    let emailData = { subject: emailConfig.subject, body: content, cta: 'Get Started' };

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      emailData.body = content;
    }

    return NextResponse.json({
      subject: emailData.subject,
      body: emailData.body,
      cta: emailData.cta || 'Try It Free',
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