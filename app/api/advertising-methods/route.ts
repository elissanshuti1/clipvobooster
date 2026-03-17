import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET - List all advertising methods
export async function GET(req: Request) {
  try {
    const methods = [
      { id: 1, name: 'AI Lead Generation', icon: '🤖', description: 'Use AI to find potential customers', credits: 10, category: 'AI' },
      { id: 2, name: 'Email Outreach', icon: '📧', description: 'Send personalized emails to leads', credits: 5, category: 'Email' },
      { id: 3, name: 'Social Media Posts', icon: '📱', description: 'Generate viral social media content', credits: 8, category: 'Social' },
      { id: 4, name: 'LinkedIn Automation', icon: '💼', description: 'Connect with professionals on LinkedIn', credits: 15, category: 'Social' },
      { id: 5, name: 'Twitter/X Threads', icon: '🐦', description: 'Create engaging thread sequences', credits: 8, category: 'Social' },
      { id: 6, name: 'SEO Optimization', icon: '🔍', description: 'Optimize content for search engines', credits: 20, category: 'Content' },
      { id: 7, name: 'Blog Post Generator', icon: '📝', description: 'AI-written blog posts about your product', credits: 12, category: 'Content' },
      { id: 8, name: 'Press Release', icon: '📰', description: 'Generate and distribute press releases', credits: 25, category: 'PR' },
      { id: 9, name: 'Influencer Outreach', icon: '🌟', description: 'Find and contact relevant influencers', credits: 30, category: 'Influencer' },
      { id: 10, name: 'Reddit Marketing', icon: '📢', description: 'Promote in relevant subreddits', credits: 10, category: 'Social' },
      { id: 11, name: 'Product Hunt Launch', icon: '🚀', description: 'Prepare for Product Hunt launch', credits: 20, category: 'Launch' },
      { id: 12, name: 'Google Ads Copy', icon: '📊', description: 'Generate high-converting ad copy', credits: 15, category: 'Ads' },
      { id: 13, name: 'Facebook Ads', icon: '📘', description: 'Create Facebook ad campaigns', credits: 15, category: 'Ads' },
      { id: 14, name: 'Landing Page Copy', icon: '🎯', description: 'Optimize landing page content', credits: 18, category: 'Content' },
      { id: 15, name: 'Video Script', icon: '🎬', description: 'Write video scripts for promos', credits: 15, category: 'Content' },
      { id: 16, name: 'Testimonial Generator', icon: '⭐', description: 'Create testimonial templates', credits: 8, category: 'Content' },
      { id: 17, name: 'Competitor Analysis', icon: '📈', description: 'Analyze competitor strategies', credits: 20, category: 'Research' },
      { id: 18, name: 'Market Research', icon: '🔬', description: 'Deep dive into your market', credits: 25, category: 'Research' },
      { id: 19, name: 'Cold DM Templates', icon: '💬', description: 'Create DM templates for outreach', credits: 10, category: 'Social' },
      { id: 20, name: 'Webinar Planning', icon: '🎤', description: 'Plan and script webinars', credits: 25, category: 'Events' },
      { id: 21, name: 'Podcast Pitching', icon: '🎙️', description: 'Pitch to relevant podcasts', credits: 20, category: 'PR' },
      { id: 22, name: 'Community Building', icon: '👥', description: 'Strategies for building communities', credits: 15, category: 'Social' },
      { id: 23, name: 'Referral Program', icon: '🎁', description: 'Design referral programs', credits: 18, category: 'Growth' },
      { id: 24, name: 'Partnership Outreach', icon: '🤝', description: 'Find and contact partners', credits: 20, category: 'Growth' },
      { id: 25, name: 'Retargeting Campaign', icon: '🎯', description: 'Set up retargeting strategies', credits: 22, category: 'Ads' },
    ];
    
    return NextResponse.json(methods);
  } catch (err: any) {
    console.error('Get methods error:', err);
    return NextResponse.json({ error: 'Failed to fetch methods' }, { status: 500 });
  }
}

// POST - Execute advertising method
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get('cookie') || '';
    const m = cookie.split(';').map((s: string) => s.trim()).find((s: string) => s.startsWith('token='));
    const token = m ? m.split('=')[1] : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const body = await req.json();
    
    const { methodId, productId, data } = body;
    
    // Get method details
    const methods = [
      { id: 1, name: 'AI Lead Generation', credits: 10 },
      { id: 2, name: 'Email Outreach', credits: 5 },
      { id: 3, name: 'Social Media Posts', credits: 8 },
      { id: 4, name: 'LinkedIn Automation', credits: 15 },
      { id: 5, name: 'Twitter/X Threads', credits: 8 },
      { id: 6, name: 'SEO Optimization', credits: 20 },
      { id: 7, name: 'Blog Post Generator', credits: 12 },
      { id: 8, name: 'Press Release', credits: 25 },
      { id: 9, name: 'Influencer Outreach', credits: 30 },
      { id: 10, name: 'Reddit Marketing', credits: 10 },
      { id: 11, name: 'Product Hunt Launch', credits: 20 },
      { id: 12, name: 'Google Ads Copy', credits: 15 },
      { id: 13, name: 'Facebook Ads', credits: 15 },
      { id: 14, name: 'Landing Page Copy', credits: 18 },
      { id: 15, name: 'Video Script', credits: 15 },
      { id: 16, name: 'Testimonial Generator', credits: 8 },
      { id: 17, name: 'Competitor Analysis', credits: 20 },
      { id: 18, name: 'Market Research', credits: 25 },
      { id: 19, name: 'Cold DM Templates', credits: 10 },
      { id: 20, name: 'Webinar Planning', credits: 25 },
      { id: 21, name: 'Podcast Pitching', credits: 20 },
      { id: 22, name: 'Community Building', credits: 15 },
      { id: 23, name: 'Referral Program', credits: 18 },
      { id: 24, name: 'Partnership Outreach', credits: 20 },
      { id: 25, name: 'Retargeting Campaign', credits: 22 },
    ];
    
    const method = methods.find(m => m.id === methodId);
    if (!method) {
      return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    }
    
    // Here you would:
    // 1. Check user has enough credits
    // 2. Deduct credits
    // 3. Execute the method using AI
    // 4. Save results to database
    
    // For now, return success with method info
    return NextResponse.json({
      message: `${method.name} executed successfully`,
      creditsUsed: method.credits,
      result: {
        status: 'completed',
        data: data || {}
      }
    });
    
  } catch (err: any) {
    console.error('Execute method error:', err);
    return NextResponse.json({ error: 'Failed to execute method' }, { status: 500 });
  }
}
