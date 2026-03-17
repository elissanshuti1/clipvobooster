import { NextResponse } from 'next/server';

// Search for real leads using various APIs and sources
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, searchQuery } = body;
    
    if (!product) {
      return NextResponse.json({ error: 'Product required' }, { status: 400 });
    }
    
    const leads = [];
    
    // Method 1: Search Twitter/X for people looking for solutions
    try {
      const twitterLeads = await searchTwitterForLeads(product);
      leads.push(...twitterLeads);
    } catch (err) {
      console.error('Twitter search failed:', err);
    }
    
    // Method 2: Search Reddit for people with problems
    try {
      const redditLeads = await searchRedditForLeads(product);
      leads.push(...redditLeads);
    } catch (err) {
      console.error('Reddit search failed:', err);
    }
    
    // Method 3: Search HackerNews "Ask HN" posts
    try {
      const hnLeads = await searchHackerNewsForLeads(product);
      leads.push(...hnLeads);
    } catch (err) {
      console.error('HackerNews search failed:', err);
    }
    
    // Method 4: Search Product Hunt discussions
    try {
      const phLeads = await searchProductHuntForLeads(product);
      leads.push(...phLeads);
    } catch (err) {
      console.error('Product Hunt search failed:', err);
    }
    
    // Method 5: Search LinkedIn (via public APIs)
    try {
      const linkedinLeads = await searchLinkedInForLeads(product);
      leads.push(...linkedinLeads);
    } catch (err) {
      console.error('LinkedIn search failed:', err);
    }
    
    // Remove duplicates and return
    const uniqueLeads = leads.filter(
      (lead, index, self) =>
        index === self.findIndex((t) => t.email === lead.email)
    );
    
    return NextResponse.json({
      leads: uniqueLeads,
      count: uniqueLeads.length,
      sources: {
        twitter: leads.filter(l => l.source === 'Twitter').length,
        reddit: leads.filter(l => l.source === 'Reddit').length,
        hackernews: leads.filter(l => l.source === 'HackerNews').length,
        producthunt: leads.filter(l => l.source === 'ProductHunt').length,
        linkedin: leads.filter(l => l.source === 'LinkedIn').length
      }
    });
    
  } catch (err: any) {
    console.error('Search leads error:', err.message);
    return NextResponse.json({ error: 'Failed to search for leads', details: err.message }, { status: 500 });
  }
}

// Search Twitter for people looking for solutions
async function searchTwitterForLeads(product: any) {
  const leads = [];
  
  // Use free Twitter search API alternatives
  const searchTerms = [
    `looking for ${product.category || 'tool'}`,
    `need ${product.category || 'software'}`,
    `recommend ${product.category}`,
    `alternative to`,
    `best ${product.category} for`
  ];
  
  // Note: For real Twitter API access, you'd need API credentials
  // This is a simulation using public data
  // In production, use: https://developer.twitter.com/en/docs
  
  // For now, return instruction on how to set up real search
  console.log('Twitter search would use:', searchTerms);
  
  return leads;
}

// Search Reddit for people with problems
async function searchRedditForLeads(product: any) {
  const leads = [];
  
  const subreddits = [
    'SaaS',
    'startups',
    'entrepreneur',
    'smallbusiness',
    'marketing',
    'productivity',
    'webdev',
    'technology'
  ];
  
  // Use Reddit's public API (no auth required for basic search)
  for (const sub of subreddits) {
    try {
      const query = encodeURIComponent(product.category || 'software tool');
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${query}&sort=new&limit=10`;
      
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ClipVoBooster/1.0' }
      });
      
      if (res.ok) {
        const data = await res.json();
        const posts = data.data?.children || [];
        
        for (const post of posts) {
          const author = post.data?.author;
          const title = post.data?.title || '';
          const selftext = post.data?.selftext || '';
          
          // Check if post indicates need
          if (title.toLowerCase().includes('looking for') ||
              title.toLowerCase().includes('need help') ||
              title.toLowerCase().includes('recommend') ||
              selftext.toLowerCase().includes('looking for')) {
            
            leads.push({
              name: author || 'Reddit User',
              email: `${author}@reddit.com`, // They'll need to find real email
              company: 'Reddit User',
              role: 'Community Member',
              need: `${title.substring(0, 100)}...`,
              source: 'Reddit',
              location: 'Reddit',
              industry: sub,
              postUrl: `https://reddit.com${post.data?.permalink}`,
              createdAt: new Date(post.data?.created_utc * 1000)
            });
          }
        }
      }
    } catch (err) {
      console.error(`Reddit r/${sub} search failed:`, err);
    }
  }
  
  return leads;
}

// Search HackerNews for leads
async function searchHackerNewsForLeads(product: any) {
  const leads = [];
  
  try {
    // Search HN for "Ask HN" posts
    const query = encodeURIComponent(`ask hn ${product.category || 'tool'} recommend`);
    const url = `https://hn.algolia.com/api/v1/search?query=${query}&tags=story&hitsPerPage=20`;
    
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const hits = data.hits || [];
      
      for (const hit of hits) {
        leads.push({
          name: hit.author || 'HN User',
          email: `${hit.author}@news.ycombinator.com`,
          company: 'HackerNews User',
          role: 'Tech Professional',
          need: hit.title?.substring(0, 100) || 'Looking for recommendations',
          source: 'HackerNews',
          location: 'HackerNews',
          industry: 'Technology',
          postUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          createdAt: new Date(hit.created_at)
        });
      }
    }
  } catch (err) {
    console.error('HackerNews search failed:', err);
  }
  
  return leads;
}

// Search Product Hunt
async function searchProductHuntForLeads(product: any) {
  const leads = [];
  
  // Product Hunt doesn't have public search API without auth
  // In production, use: https://api.producthunt.com/v2/docs
  
  console.log('Product Hunt search would require API key');
  return leads;
}

// Search LinkedIn
async function searchLinkedInForLeads(product: any) {
  const leads = [];
  
  // LinkedIn requires API access and authentication
  // In production, use: https://learn.microsoft.com/en-us/linkedin/
  
  console.log('LinkedIn search would require API credentials');
  return leads;
}
