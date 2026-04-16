import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { Groq } from "groq-sdk";
import { ObjectId } from "mongodb";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const REDDIT_HEADERS = {
  "User-Agent": "ClipVoBooster/1.0 (contact support@clipvo.site)",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

async function authenticate(req: Request) {
  const cookie = (req as any).headers.get("cookie") || "";
  const m = cookie.split(";").map((s: string) => s.trim()).find((s: string) => s.startsWith("token="));
  const token = m ? m.split("=")[1] : null;

  if (!token) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    return { userId: String((payload as any).sub) };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

async function getJob(db: any, userId: string) {
  return await db.collection("lead_jobs").findOne({ userId });
}

async function updateJob(db: any, userId: string, data: any) {
  await db.collection("lead_jobs").updateOne(
    { userId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true },
  );
}

function extractSearchTerms(text: string): string[] {
  const terms: string[] = [];
  
  // Extract problem phrases
  const patterns = [
    /need\s+([a-z\s]+?)(?:\s+for|\s+to|\s+my|$)/gi,
    /looking\s+for\s+([a-z\s]+?)(?:\s+to|\s+my|$)/gi,
    /can't\s+find\s+([a-z\s]+?)(?:\s+to|\s+my|$)/gi,
    /struggling\s+(?:with|to)\s+([a-z\s]+?)(?:\s+to|\s+my|$)/gi,
    /how\s+(?:do\s+I|to)\s+([a-z\s]+?)(?:\s+for|$)/gi,
    /where\s+(?:can\s+I|to)\s+([a-z\s]+?)(?:\s+for|$)/gi,
    /find\s+([a-z\s]+?)(?:\s+for|\s+to|$)/gi,
    /get\s+([a-z\s]+?)(?:\s+for|\s+to|$)/gi,
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      terms.push(...matches.map(m => m.replace(/\s+/g, ' ').trim().toLowerCase()));
    }
  }
  
  // Extract key words (excluding common words)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my',
    'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same',
    'so', 'than', 'too', 'very', 'just', 'now', 'then', 'here', 'there',
    'product', 'service', 'business', 'company', 'startup', 'founder', 'owner',
    'help', 'need', 'want', 'looking', 'find', 'get', 'make', 'like', 'using'
  ]);
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w) && !terms.some(t => t.includes(w)));
  
  terms.push(...words);
  
  return [...new Set(terms)].slice(0, 15);
}

async function searchReddit(keyword: string, limit: number = 20): Promise<any[]> {
  try {
    const url = `https://old.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&restrict_sr=&limit=${limit}&raw_json=1`;
    console.log(`🔍 Searching Reddit: ${keyword}`);
    
    const response = await fetch(url, {
      headers: REDDIT_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    console.log(`📡 Reddit response status: ${response.status}`);

    if (!response.ok) {
      console.error(`❌ Reddit fetch failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const posts = data.data?.children || [];
    console.log(`✅ Found ${posts.length} posts for "${keyword}"`);

    return posts.map((child: any) => {
      const p = child.data;
      return {
        title: p.title || "",
        content: (p.selftext || "").slice(0, 600),
        author: p.author || "Anonymous",
        subreddit: p.subreddit || "unknown",
        url: `https://reddit.com${p.permalink || ""}`,
        publishedAt: new Date((p.created_utc || Date.now() / 1000) * 1000).toISOString(),
        score: p.score || 0,
        numComments: p.num_comments || 0,
      };
    });
  } catch (error: any) {
    console.error(`❌ Reddit search error for "${keyword}":`, error?.message || error);
    return [];
  }
}

function scorePost(post: any, searchTerms: string[]): number {
  const text = (post.title + " " + post.content).toLowerCase();
  let score = 0;
  
  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    if (text.includes(termLower)) {
      score += 3;
      if (post.title.toLowerCase().includes(termLower)) {
        score += 5; // Bonus if in title
      }
    }
  }
  
  // Boost posts with engagement
  score += Math.min(post.numComments / 10, 5);
  
  return score;
}

function isGoodLead(post: any): boolean {
  const text = (post.title + " " + post.content).toLowerCase();
  const subreddit = post.subreddit?.toLowerCase() || "";
  const title = post.title?.toLowerCase() || "";
  
  // Skip if promotional
  if (text.includes("check out my") || text.includes("visit my website") ||
      text.includes("click here") || text.includes("buy my") ||
      text.includes("hire me") || text.includes("my product") ||
      text.includes("my service") || text.includes("i made this") ||
      text.includes("feedback on my") || text.includes("shameless") ||
      text.includes("follow my journey") || text.includes("here's what i built") ||
      text.includes("need testers") || text.includes("test my app") ||
      text.includes("referral code") || text.includes("refer a friend") ||
      text.includes("sign up bonus")) {
    return false;
  }
  
  // Skip if just sharing/announcing without a question
  if ((text.includes("i launched") || text.includes("just launched") || 
       text.includes("we built") || text.includes("i built") ||
       text.includes("analyzed how") || text.includes("here's my") ||
       text.includes("what are people using") || text.includes("what's people using") ||
       text.includes("this is one of the most") || text.includes("reduced our"))) {
    return false;
  }
  
  // Skip wrong subreddit topics
  if (subreddit.includes("indiegaming") || subreddit.includes("indiedev") ||
      subreddit.includes("gaming") || subreddit.includes("cyberpunk") ||
      subreddit.includes("webtoon") || subreddit.includes("games") ||
      subreddit.includes("steampunk") || subreddit.includes("webgames") ||
      subreddit.includes("android") || subreddit.includes("ios") ||
      subreddit.includes("apple") || subreddit.includes("google") ||
      subreddit.includes("3dprinting") || subreddit.includes("3dprint") ||
      subreddit.includes("referral") || subreddit.includes("dubai") ||
      subreddit.includes("dubai") || subreddit.includes("canada") ||
      subreddit.includes("compare") || subreddit.includes("claw")) {
    return false;
  }
  
  // Skip wrong industries
  if (text.includes("crypto") || text.includes("nft") || 
      text.includes("flat hunting") || text.includes("game dev") ||
      text.includes("flipping ") || text.includes("investing") ||
      text.includes("resin print") || text.includes("3d print") ||
      text.includes("cloud cost") || text.includes("devops")) {
    return false;
  }
  
  // Skip general discussions not seeking help
  if (title.includes("what's working") || title.includes("whats working") ||
      title.includes("discussion") || title.includes("design advice") ||
      title.includes("directory") || title.includes("wrapper") ||
      title.includes("control which senders") || title.includes("how to control")) {
    return false;
  }
  
  // Must have minimum content
  if (post.title.length < 15) return false;
  
  // Must have some substance
  if (post.content.length < 50 && post.numComments < 2) return false;
  
  return true;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");
    const leads = db.collection("leads");

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { step } = body;

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { profile: 1 } },
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json(
        { error: "Complete profile first", hasProfile: false },
        { status: 400 },
      );
    }

    const { projectName, projectDescription, targetAudience } = user.profile;

    // STEP 1: Analyze product and search
    if (step === "start" || !step) {
      console.log(`🎯 [${userId}] Starting lead gen for: ${projectName}`);
      
      await updateJob(db, userId, {
        stage: "analyzing",
        progressPercent: 5,
        progressMessage: "Analyzing your product...",
        progressEmoji: "🔍",
        postsFound: 0,
        matchesFound: 0,
      });

      // Extract search terms from product description
      const searchTerms = extractSearchTerms(projectDescription + " " + (targetAudience || ""));
      
      console.log(`📝 Search terms: ${searchTerms.slice(0, 8).join(", ")}`);

      await updateJob(db, userId, {
        progressPercent: 15,
        progressMessage: `Searching for customers...`,
        searchTerms,
      });

      // Search by all terms
      const allPosts = new Map<string, any>();
      const maxTerms = 15;
      const postsPerTerm = 35;
      
      for (let i = 0; i < Math.min(searchTerms.length, maxTerms); i++) {
        const term = searchTerms[i];
        
        await updateJob(db, userId, {
          progressPercent: 15 + Math.round((i / Math.min(searchTerms.length, maxTerms)) * 30),
          progressMessage: `Searching Reddit: "${term}"...`,
        });
        
        const posts = await searchReddit(term, postsPerTerm);
        
        for (const post of posts) {
          if (!allPosts.has(post.url)) {
            allPosts.set(post.url, post);
          }
        }
        
        await new Promise(r => setTimeout(r, 200));
      }

      console.log(`📊 Found ${allPosts.size} posts from searches`);

      // Score and filter posts
      const scoredPosts = Array.from(allPosts.values())
        .map(post => ({ ...post, relevanceScore: scorePost(post, searchTerms) }))
        .filter(post => isGoodLead(post) && post.relevanceScore >= 4)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 40);

      console.log(`📊 Scored ${scoredPosts.length} relevant posts`);

      await updateJob(db, userId, {
        progressPercent: 50,
        progressMessage: `Found ${scoredPosts.length} potential matches. AI analyzing...`,
        posts: scoredPosts,
        postsFound: scoredPosts.length,
      });

      if (scoredPosts.length === 0) {
        await db.collection("lead_jobs").deleteOne({ userId });
        return NextResponse.json({
          step: "complete",
          message: "No matching posts found",
          newLeadsCount: 0,
        });
      }

      // Use AI to select best matches (single call for all posts)
      await updateJob(db, userId, {
        progressPercent: 60,
        progressMessage: "AI selecting best matches...",
      });

      const aiAnalysis = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are finding REAL customers for: ${projectName}
Product: ${projectDescription}

A PERFECT customer post must have ALL:
1. Person is ASKING for a SOLUTION (direct question)
2. Person has a BUSINESS/STARTUP need
3. Problem relates to: getting customers, marketing, outreach, cold email, finding leads

EXCLUDE (NOT customers):
- Developers building AI agents (not looking for customers)
- General "what are people using" discussions
- Sharing their own products/projects
- Referral codes, spam

Select EXACTLY 12-15 posts. Return JSON:
[{"url": "post url", "reason": "exact problem needing solution"}]`
          },
          {
            role: "user",
            content: scoredPosts.map(p => 
              `Post: ${p.title}\nContent: ${p.content.slice(0, 200)}\nURL: ${p.url}\nScore: ${p.relevanceScore}`
            ).join("\n\n---\n\n")
          }
        ],
        max_tokens: 1500,
        temperature: 0.4,
      });

      const aiResponse = aiAnalysis.choices[0]?.message?.content || "[]";
      
      let selectedUrls: {url: string, reason: string}[] = [];
      const match = aiResponse.match(/\[[\s\S]*\]/);
      if (match) {
        selectedUrls = JSON.parse(match[0]);
      }

      // Deduplicate selected posts by URL
      const seenUrls = new Set<string>();
      selectedUrls = selectedUrls.filter(s => {
        if (seenUrls.has(s.url)) return false;
        seenUrls.add(s.url);
        return true;
      });

      console.log(`🎯 AI selected ${selectedUrls.length} unique posts`);

      await updateJob(db, userId, {
        progressPercent: 80,
        progressMessage: `Saving ${selectedUrls.length} customers...`,
      });

      // Get existing leads to avoid duplicates
      const existingLeads = await leads.find({ userId }).toArray();
      const existingUrls = new Set(existingLeads.map((l: any) => l.url));
      const existingTitles = new Set(existingLeads.map((l: any) => l.title?.toLowerCase()));

      // Save selected leads
      const newLeads: any[] = [];
      for (const selected of selectedUrls) {
        if (existingUrls.has(selected.url)) continue;
        
        const post = scoredPosts.find(p => p.url === selected.url);
        if (!post) continue;

        // Skip if same title already exists
        if (existingTitles.has(post.title?.toLowerCase())) continue;
        existingTitles.add(post.title?.toLowerCase());

        newLeads.push({
          userId,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          content: post.content,
          publishedAt: post.publishedAt,
          notes: `AI Match`,
          aiMatchReason: selected.reason,
          source: "reddit",
          status: "new",
          isAutoDiscovered: true,
          createdAt: new Date(),
        });
      }

      if (newLeads.length > 0) {
        await leads.insertMany(newLeads);
        
        await users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $inc: { leadsFoundThisMonth: newLeads.length },
            $set: { usageResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          },
        );
      }

      await db.collection("lead_jobs").deleteOne({ userId });

      const elapsed = Date.now() - startTime;
      console.log(`✅ [${userId}] Done! ${newLeads.length} leads in ${elapsed}ms`);

      return NextResponse.json({
        step: "complete",
        message: "Complete!",
        newLeadsCount: newLeads.length,
        totalToday: newLeads.length,
        elapsedMs: elapsed,
      });
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (error: any) {
    console.error("Lead generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to find customers" },
      { status: 500 },
    );
  }
}
