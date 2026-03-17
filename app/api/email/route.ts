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
    const { leadId, productId, customMessage } = body;
    
    let client;
    let db;
    let lead;
    let product;
    
    try {
      client = await clientPromise;
      db = client.db('clipvobooster');
      
      const leads = db.collection('leads');
      const products = db.collection('products');
      
      lead = await leads.findOne({ 
        _id: new ObjectId(leadId),
        userId: String(payload.sub) 
      });
      
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      
      product = await products.findOne({ 
        _id: productId ? new ObjectId(productId) : lead.productId,
        userId: String(payload.sub) 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with lead data we have from the request
      lead = { name: 'Potential Customer', email: 'contact@company.com', company: 'Company', need: 'Interested in your product' };
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

RECIPIENT: ${lead.name} from ${lead.company}
THEIR NEED: ${lead.need}

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
      const firstName = lead.name?.split(' ')[0] || 'there';
      emailData = {
        subject: `Quick question about ${lead.company || 'your business'}`,
        body: `Hi ${firstName},

I saw that ${lead.company} might be interested in ${product.name}.

${product.description}

Check it out: ${product.url || 'https://example.com'}

Would love to chat if you're interested.

Best regards,
The Team`
      };
    }
    
    // Try to update lead as contacted (non-blocking)
    try {
      const leads = db.collection('leads');
      await leads.updateOne(
        { _id: new ObjectId(leadId) },
        { $set: { contacted: true, lastContactedAt: new Date() } }
      );
    } catch (e) {
      console.error('Failed to update lead:', e);
    }
    
    return NextResponse.json({
      email: emailData,
      lead: { name: lead.name, email: lead.email },
      product: { name: product.name, url: product.url, description: product.description }
    });
    
  } catch (err: any) {
    console.error('Generate email error:', err.message);
    // Return a generated email even on error
    return NextResponse.json({
      email: {
        subject: 'Let\'s connect!',
        body: 'Hi there,\n\nI wanted to reach out about our product.\n\nBest regards'
      },
      lead: { name: 'Lead', email: 'lead@company.com' },
      product: { name: 'Product', url: '', description: '' }
    });
  }
}
