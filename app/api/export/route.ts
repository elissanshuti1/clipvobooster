import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Export leads as CSV
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
    
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    
    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const leads = db.collection('leads');
    
    const query: any = { userId: String(payload.sub) };
    if (productId) {
      query.productId = new ObjectId(productId);
    }
    
    const userLeads = await leads.find(query).sort({ createdAt: -1 }).toArray();
    
    // Convert to CSV
    const csvRows = [];
    
    // Header
    csvRows.push('Name,Email,Company,Role,Source,Location,Post URL,Status,Created At,Need');
    
    // Data rows
    for (const lead of userLeads) {
      const row = [
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        `"${(lead.role || '').replace(/"/g, '""')}"`,
        `"${(lead.source || '').replace(/"/g, '""')}"`,
        `"${(lead.location || '').replace(/"/g, '""')}"`,
        `"${(lead.postUrl || '').replace(/"/g, '""')}"`,
        `"${(lead.status || 'new').replace(/"/g, '""')}"`,
        `"${lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}"`,
        `"${(lead.need || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="clipvo-leads.csv"'
      }
    });
    
  } catch (err: any) {
    console.error('Export error:', err.message);
    return NextResponse.json({ error: 'Failed to export leads', details: err.message }, { status: 500 });
  }
}
