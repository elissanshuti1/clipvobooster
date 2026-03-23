import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Generate email draft using AI
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
    const { contactId, productId, customMessage, recipientName, recipientEmail, recipientCompany } = body;

    let client;
    let db;
    let contact;
    let product;

    try {
      client = await clientPromise;
      db = client.db('clipvobooster');

      const contacts = db.collection('contacts');
      const products = db.collection('products');

      if (contactId) {
        contact = await contacts.findOne({
          _id: new ObjectId(contactId),
          userId: String(payload.sub)
        });
      }

      if (productId) {
        product = await products.findOne({
          _id: new ObjectId(productId),
          userId: String(payload.sub)
        });
      }

      if (!contact) {
        contact = { 
          name: recipientName || 'there', 
          email: recipientEmail || '', 
          company: recipientCompany || '' 
        };
      }
      
      if (!product) {
        product = { name: 'Product', description: 'Great product', url: 'https://example.com' };
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      contact = { name: recipientName || 'there', email: recipientEmail || '', company: recipientCompany || '' };
      product = { name: 'Product', description: 'Great product', url: 'https://example.com' };
    }

    // Generate email using AI
    let emailData = { subject: '', body: '' };

    try {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://clipvobooster.com',
          'X-Title': 'ClipVoBooster'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `You are a professional email copywriter. Write personalized, effective outreach emails.`
            },
            {
              role: 'user',
              content: `Write a personalized outreach email:

RECIPIENT: ${contact.name} from ${contact.company || 'their company'}

PRODUCT: ${product.name}
DESCRIPTION: ${product.description}
URL: ${product.url || 'https://example.com'}

Format as JSON: {"subject": "...", "body": "..."}`
            }
          ],
          max_tokens: 600,
          temperature: 0.7
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content || '';

        try {
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            emailData = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.error('AI parse error:', e);
        }
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError);
    }

    // Fallback: Generate email without AI if AI fails
    if (!emailData.subject || !emailData.body) {
      const firstName = contact.name?.split(' ')[0] || 'there';
      emailData = {
        subject: `Quick question about ${contact.company || 'your business'}`,
        body: `Hi ${firstName},

I wanted to reach out about ${product.name}.

${product.description}

Check it out: ${product.url || 'https://example.com'}

Would love to chat if you're interested.

Best regards,
The Team`
      };
    }

    return NextResponse.json({
      email: emailData,
      contact: { name: contact.name, email: contact.email },
      product: { name: product.name, url: product.url, description: product.description }
    });

  } catch (err: any) {
    console.error('Generate email error:', err.message);
    return NextResponse.json({
      email: {
        subject: 'Let\'s connect!',
        body: 'Hi there,\n\nI wanted to reach out about our product.\n\nBest regards'
      },
      contact: { name: 'Contact', email: 'contact@company.com' },
      product: { name: 'Product', url: '', description: '' }
    });
  }
}
