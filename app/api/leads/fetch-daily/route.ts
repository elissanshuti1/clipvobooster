import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Parser from 'rss-parser';

const parser = new Parser();

// Target subreddits for B2B lead generation
const TARGET_SUBREDDITS = [
  'sales',
  'marketing',
  'entrepreneur',
  'smallbusiness',
  'startup',
  'SaaS',
  'B2B',
  'coldemail',
  'digitalmarketing',
  'growthhacking'
];

// Keywords that indicate potential leads
const LEAD_KEYWORDS = [
  'looking for',
  'recommendation',
  'alternative to',
  'how to',
  'best tool',
  'best software',
  'help with',
  'need a tool',
  'suggestion',
  'trying to'
];

// POST - Trigger daily lead generation for all users
export async function POST(req: Request) {
  try {
    // Verify cron secret if provided
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('clipvobooster');
    const users = db.collection('users');
    const leads = db.collection('leads');

    // Get all users with complete profiles
    const usersWithProfiles = await users.find({
      'profile.projectName': { $exists: true, $ne: '' },
      'profile.projectDescription': { $exists: true, $ne: '' }
    }).toArray();

    console.log(`📊 Found ${usersWithProfiles.length} users with profiles`);

    let totalNewLeads = 0;

    // Process each user
    for (const user of usersWithProfiles) {
      try {
        const { projectName, projectDescription, targetAudience } = user.profile;
        const userId = user._id.toString();

        // Generate keywords from profile
        const keywords = generateKeywordsFromProfile(projectDescription, targetAudience);
        
        // Search Reddit for each keyword
        for (const keyword of keywords.slice(0, 3)) { // Limit to 3 keywords per user
          for (const subreddit of TARGET_SUBREDDITS.slice(0, 5)) { // Limit to 5 subreddits
            try {
              const rssUrl = `https://www.reddit.com/r/${subreddit}/search?q=${encodeURIComponent(keyword)}.rss?sort=new&limit=10`;
              const feed = await parser.parseURL(rssUrl);

              // Process each post
              for (const item of feed.items.slice(0, 5)) { // Limit to 5 posts per search
                const postUrl = item.link as string;
                
                // Check if lead already exists
                const existing = await leads.findOne({ url: postUrl });
                
                if (!existing) {
                  // Check if post is recent (last 7 days)
                  const postDate = new Date(item.pubDate || '');
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                  if (postDate >= sevenDaysAgo) {
                    await leads.insertOne({
                      userId,
                      title: item.title,
                      author: item.author || 'Unknown',
                      subreddit,
                      url: postUrl,
                      content: item.content || item.summary || '',
                      publishedAt: item.pubDate,
                      notes: `Auto-discovered via keyword: ${keyword}`,
                      status: 'new',
                      isAutoDiscovered: true,
                      createdAt: new Date()
                    });
                    totalNewLeads++;
                  }
                }
              }
            } catch (err) {
              console.error(`Failed to search r/${subreddit} for "${keyword}":`, err);
            }
            
            // Rate limiting delay
            await sleep(500);
          }
        }

        console.log(`✅ Processed user: ${user.email}`);
      } catch (err) {
        console.error(`Failed to process user ${user.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${totalNewLeads} new leads`,
      totalNewLeads,
      usersProcessed: usersWithProfiles.length
    });

  } catch (err: any) {
    console.error('Daily leads fetch error:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch daily leads', details: err.message },
      { status: 500 }
    );
  }
}

// Generate keywords from user profile
function generateKeywordsFromProfile(description: string, targetAudience?: string): string[] {
  const keywords = new Set<string>();
  
  // Extract key terms from description
  const words = description.toLowerCase().split(/\s+/);
  const importantWords = words.filter(w => 
    w.length > 4 && 
    !['about', 'which', 'their', 'there', 'where', 'being', 'having', 'using'].includes(w)
  );
  
  // Add important words as keywords
  importantWords.slice(0, 5).forEach(w => keywords.add(w));
  
  // Add lead-indicating phrases
  LEAD_KEYWORDS.forEach(kw => keywords.add(kw));
  
  // Add target audience terms
  if (targetAudience) {
    targetAudience.split(/[,\s]+/).forEach(term => {
      if (term.length > 3) keywords.add(term.toLowerCase());
    });
  }
  
  return Array.from(keywords).slice(0, 10);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// GET - Show info about the endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Daily Leads Fetch Endpoint',
    description: 'POST to this endpoint to fetch new leads for all users with profiles',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET || 'not configured'}`
    }
  });
}
