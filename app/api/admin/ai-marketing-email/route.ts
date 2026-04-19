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
        subject: 'Welcome to ClipVoBooster - Your New Secret Weapon for Growing Your Business',
        focus: 'Welcome new users, excite them about the app, show them the key features that will help them find customers on Reddit and automate their outreach. Include a clear call-to-action to get started.'
      },
      upgrade: {
        subject: 'Unlock Full Potential - Upgrade Your ClipVoBooster Experience',
        focus: 'Persuade free users to upgrade to a paid plan. Highlight the benefits they are missing out on: more leads, more emails, advanced features. Create urgency and excitement.'
      },
      feature: {
        subject: 'New Feature Alert - {feature_name} Is Here!',
        focus: 'Announce a new feature or update. Explain how it helps them, why it matters, and how to use it. Make them feel they are missing out if they do not try it.'
      },
      reengage: {
        subject: 'We Miss You! Here Is Something Special Just for You',
        focus: 'Re-engage inactive users. Remind them what they are missing, offer an incentive to come back. Make them feel valued and wanted.'
      },
      custom: {
        subject: customPrompt || 'Important Update from ClipVoBooster',
        focus: customPrompt || 'Custom marketing email for ClipVoBooster users.'
      }
    };

    const emailConfig = emailTypes[type] || emailTypes.custom;

    const systemPrompt = `You are an expert email marketer for ClipVoBooster - an AI-powered tool designed for solo founders and marketers to find customers on Reddit, do email marketing, and automate outreach.

CLIPVOBOOSTER KEY FEATURES:
- Find customers on Reddit using AI - search and identify potential customers in relevant subreddits
- AI-powered email writer - generate personalized emails that convert
- Email automation - sequence and automate follow-ups
- Lead management - organize and track your leads
- Analytics - track open rates, clicks, and conversions

YOUR TASK: Write a HIGH-CONVERTING marketing email that makes users fall in love with ClipVoBooster and compel them to take action.

REQUIREMENTS:
1. Subject line should be compelling and curiosity-inducing
2. Email body should be 150-250 words - substantial but not overwhelming
3. Make it personal, warm, and conversational - like a founder reaching out
4. Focus on RESULTS and TRANSFORMATION - what they will achieve
5. Include social proof - success stories, metrics, testimonials
6. Clear call-to-action with button/link to https://clipvo.site
7. NO spammy phrases or pushy language
8. Make even non-paying users feel they NEED this app

Format as JSON:
{
  "subject": "compelling subject line",
  "body": "full email body with clear CTA link to https://clipvo.site",
  "cta": "text for call-to-action button"
}`;

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