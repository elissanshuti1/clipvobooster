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
    const { prompt, type } = body;

    const typeInstructions: Record<string, string> = {
      advertising: 'Write a promotional email advertising ClipVoBooster features. Be persuasive but professional.',
      tutorial: 'Write an educational email explaining how to use ClipVoBooster effectively. Include step-by-step instructions.',
      'social-proof': 'Write an email showcasing success stories and testimonials from ClipVoBooster users.',
      custom: 'Write a professional email for ClipVoBooster users.',
    };

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an email marketing expert. ${typeInstructions[type] || typeInstructions.custom}
          
          Format the response as JSON with "subject" and "body" fields.
          The body should be HTML-friendly but plain text is fine.
          Keep it concise, engaging, and professional.`
        },
        {
          role: 'user',
          content: prompt || `Generate a ${type} email for ClipVoBooster users.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON from response
    let email = { subject: 'ClipVoBooster Update', body: content };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        email = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Use raw content if not JSON
      email.body = content;
    }

    return NextResponse.json({
      subject: email.subject,
      email: email.body
    });

  } catch (error: any) {
    console.error('AI generate error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    );
  }
}
