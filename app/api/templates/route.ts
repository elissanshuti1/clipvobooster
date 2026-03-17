import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - List all templates for user
export async function GET(req: Request) {
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
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const templates = db.collection('templates');
    
    const userTemplates = await templates.find({ userId: String(payload.sub) }).sort({ createdAt: -1 }).toArray();
    
    // If no templates, create defaults
    if (userTemplates.length === 0) {
      const defaultTemplates = [
        {
          userId: String(payload.sub),
          name: 'Friendly Introduction',
          subject: 'Quick question about {{post_title}}',
          body: `Hi {{name}},\n\nI came across your post about {{post_topic}} and wanted to reach out.\n\nI actually built {{product_name}} that helps with exactly this - {{product_description}}\n\nWould love to hear your thoughts if you have time to check it out: {{product_url}}\n\nBest regards`,
          isDefault: true,
          createdAt: new Date()
        },
        {
          userId: String(payload.sub),
          name: 'Helpful Advice First',
          subject: 'Re: {{post_title}}',
          body: `Hey {{name}},\n\nSaw your question about {{post_topic}} and wanted to share what worked for me.\n\n[Add genuine advice here - 2-3 sentences]\n\nAlso, I should mention I built {{product_name}} that solves this exact problem - {{product_description}}\n\nCheck it out if you're interested: {{product_url}}\n\nCheers`,
          isDefault: true,
          createdAt: new Date()
        },
        {
          userId: String(payload.sub),
          name: 'Short & Direct',
          subject: '{{product_name}} for {{post_topic}}',
          body: `Hi {{name}},\n\nSaw you're looking for {{post_topic}}.\n\n{{product_name}} might be exactly what you need - {{one_sentence_description}}\n\n{{product_url}}\n\nLet me know if you have questions!`,
          isDefault: true,
          createdAt: new Date()
        }
      ];
      
      await templates.insertMany(defaultTemplates);
      return NextResponse.json(defaultTemplates);
    }
    
    return NextResponse.json(userTemplates);
  } catch (err: any) {
    console.error('Get templates error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch templates', details: err.message }, { status: 500 });
  }
}

// POST - Create new template
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
    const { name, subject, body: templateBody } = body;
    
    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const templates = db.collection('templates');
    
    const template = {
      userId: String(payload.sub),
      name,
      subject,
      body: templateBody,
      isDefault: false,
      createdAt: new Date()
    };
    
    const result = await templates.insertOne(template);
    
    return NextResponse.json({ 
      ...template, 
      _id: result.insertedId,
      message: 'Template created successfully'
    });
  } catch (err: any) {
    console.error('Create template error:', err.message);
    return NextResponse.json({ error: 'Failed to create template', details: err.message }, { status: 500 });
  }
}

// DELETE - Delete template
export async function DELETE(req: Request) {
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
    
    const url = new URL(req.url);
    const templateId = url.searchParams.get('id');
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const templates = db.collection('templates');
    
    // Don't allow deleting default templates
    const template = await templates.findOne({ 
      _id: new ObjectId(templateId),
      userId: String(payload.sub)
    });
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    if (template.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default templates' }, { status: 403 });
    }
    
    await templates.deleteOne({ 
      _id: new ObjectId(templateId),
      userId: String(payload.sub)
    });
    
    return NextResponse.json({ message: 'Template deleted' });
  } catch (err: any) {
    console.error('Delete template error:', err.message);
    return NextResponse.json({ error: 'Failed to delete template', details: err.message }, { status: 500 });
  }
}
