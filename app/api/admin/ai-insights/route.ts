import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import OpenAI from 'openai';

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

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    
    const users = db.collection('users');
    const sentEmails = db.collection('sent_emails');
    const emailClicks = db.collection('email_clicks');
    const pageViews = db.collection('page_views');

    // Gather data
    const totalUsers = await users.countDocuments();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await users.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });
    const totalEmails = await sentEmails.countDocuments();
    const totalClicks = await emailClicks.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await users.countDocuments({ createdAt: { $gte: today } });

    const returningUsers = await users.countDocuments({ lastLogin: { $exists: true, $ne: null } });

    // Get popular pages
    const popularPages = await pageViews.aggregate([
      { $group: { _id: '$path', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Prepare data for AI
    const dataSummary = `
    Platform Statistics:
    - Total Users: ${totalUsers}
    - Active Users (7 days): ${activeUsers}
    - New Users Today: ${newUsersToday}
    - Total Emails Sent: ${totalEmails}
    - Total Link Clicks: ${totalClicks}
    - Returning Users: ${returningUsers}
    
    Most Visited Pages:
    ${popularPages.map((p: any) => `- ${p._id}: ${p.views} views`).join('\n')}
    `;

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `You are an expert business analyst for a SaaS email marketing platform called ClipVoBooster.
          Analyze the platform data and provide actionable insights and recommendations.
          
          Return your response as a JSON object with these fields:
          - recommendations: array of 3-5 specific actionable recommendations
          - improvementAreas: array of 3-5 areas for improvement
          - userBehaviorSummary: a brief paragraph summarizing user behavior patterns
          `
        },
        {
          role: 'user',
          content: `Analyze this ClipVoBooster platform data and provide insights:\n\n${dataSummary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON from response
    let insights = {
      recommendations: [
        'Add more email templates to improve user experience',
        'Implement A/B testing for email subject lines',
        'Create onboarding tutorials for new users'
      ],
      improvementAreas: [
        'Email deliverability could be improved',
        'Contact segmentation features',
        'Advanced analytics dashboard'
      ],
      userBehaviorSummary: `Based on the data, your platform has ${totalUsers} users with ${activeUsers} active in the last week. Users are actively sending emails and engaging with links. The most visited pages indicate strong engagement with core features.`
    };
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = { ...insights, ...JSON.parse(jsonMatch[0]) };
      }
    } catch (e) {
      console.log('Could not parse AI response as JSON, using defaults');
    }

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      avgEmailsPerUser: totalUsers > 0 ? (totalEmails / totalUsers).toFixed(1) : 0,
      clickThroughRate: totalEmails > 0 ? ((totalClicks / totalEmails) * 100).toFixed(1) : 0,
      returningUsers,
      userGrowth: totalUsers > 0 ? ((newUsersToday / totalUsers) * 100).toFixed(1) : 0,
      popularFeatures: [
        'Email Composition',
        'Contact Management', 
        'Analytics Dashboard',
        'Email Templates'
      ],
      ...insights
    });

  } catch (error: any) {
    console.error('AI insights error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}
