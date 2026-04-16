import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { Groq } from "groq-sdk";
import { ObjectId } from "mongodb";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

async function updateJob(db: any, userId: string, data: any) {
  await db.collection("lead_jobs").updateOne(
    { userId },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true },
  );
}

function extractSearchTerms(text: string): string[] {
  const terms: string[] = [];
  
  const keywords = [
    "saas", "startup", "founder", "marketer", "marketing", "cold email",
    "outreach", "lead generation", "customer acquisition", "b2b",
    "solopreneur", "developer", "app", "tool", "automation", "automate",
    "finding customers", "get users", "find users", "growth",
    "email marketing", "reddit", "linkedin", "social media", "content",
    "funnel", "conversion", "mrr", "revenue", "churn", "retention",
    "solo", "indie", "bootstrapped", "product hunt", "launch", "beta",
    "validation", "idea", "mvp", "build", "monetize", "pricing",
    "pricing page", "landing page", "copywriting", "personalization",
    "warmup", "email deliverability", "spam", "open rate", "click rate"
  ];

  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      terms.push(keyword);
    }
  }

  if (terms.length < 5) {
    const words = lowerText.split(/\s+/).filter(w => w.length > 4);
    terms.push(...words.slice(0, 8));
  }

  return [...new Set(terms)].slice(0, 15);
}

function scorePost(post: any, searchTerms: string[]): number {
  const text = (post.title + " " + post.content).toLowerCase();
  let score = 0;
  
  for (const term of searchTerms) {
    const termLower = term.toLowerCase();
    if (text.includes(termLower)) {
      score += 3;
      if (post.title.toLowerCase().includes(termLower)) {
        score += 5;
      }
    }
  }
  
  score += Math.min(post.numComments / 10, 5);
  
  return score;
}

function isGoodLead(post: any): boolean {
  const text = (post.title + " " + post.content).toLowerCase();
  const subreddit = post.subreddit?.toLowerCase() || "";
  const title = post.title?.toLowerCase() || "";
  
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
  
  if ((text.includes("i launched") || text.includes("just launched") || 
       text.includes("we built") || text.includes("i built") ||
       text.includes("analyzed how") || text.includes("here's my") ||
       text.includes("what are people using") || text.includes("what's people using") ||
       text.includes("this is one of the most") || text.includes("reduced our"))) {
    return false;
  }
  
  if (subreddit.includes("indiegaming") || subreddit.includes("indiedev") ||
      subreddit.includes("gaming") || subreddit.includes("cyberpunk") ||
      subreddit.includes("webtoon") || subreddit.includes("games") ||
      subreddit.includes("steampunk") || subreddit.includes("webgames") ||
      subreddit.includes("android") || subreddit.includes("ios") ||
      subreddit.includes("apple") || subreddit.includes("google") ||
      subreddit.includes("3dprinting") || subreddit.includes("3dprint") ||
      subreddit.includes("referral") || subreddit.includes("dubai") ||
      subreddit.includes("canada") || subreddit.includes("compare") ||
      subreddit.includes("claw")) {
    return false;
  }
  
  if (text.includes("crypto") || text.includes("nft") || 
      text.includes("flat hunting") || text.includes("game dev") ||
      text.includes("flipping ") || text.includes("investing") ||
      text.includes("resin print") || text.includes("3d print") ||
      text.includes("cloud cost") || text.includes("devops")) {
    return false;
  }
  
  if (title.includes("what's working") || title.includes("whats working") ||
      title.includes("discussion") || title.includes("design advice") ||
      title.includes("directory") || title.includes("wrapper") ||
      title.includes("control which senders") || title.includes("how to control")) {
    return false;
  }
  
  if (post.title.length < 15) return false;
  if (post.content.length < 50 && post.numComments < 2) return false;
  
  return true;
}

export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if ("error" in auth) return auth.error;
    const { userId } = auth;

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");
    const leads = db.collection("leads");

    const body = await req.json();
    const { posts: browserPosts, searchTerms } = body;

    if (!browserPosts || !Array.isArray(browserPosts)) {
      return NextResponse.json({ error: "No posts provided" }, { status: 400 });
    }

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { profile: 1 } }
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json({ error: "Complete profile first" }, { status: 400 });
    }

    const { projectName, projectDescription, targetAudience } = user.profile;

    console.log(`🎯 [${userId}] Processing ${browserPosts.length} posts from browser`);

    await updateJob(db, userId, {
      stage: "analyzing",
      progressPercent: 5,
      progressMessage: "Processing posts...",
      progressEmoji: "🔍",
    });

    // Score and filter posts
    const scoredPosts = browserPosts
      .map((post: any) => ({ ...post, relevanceScore: scorePost(post, searchTerms || []) }))
      .filter((post: any) => isGoodLead(post) && post.relevanceScore >= 4)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
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
          content: scoredPosts.map((p: any) => 
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

    console.log(`🎯 AI selected ${selectedUrls.length} posts`);

    await updateJob(db, userId, {
      progressPercent: 80,
      progressMessage: `Saving ${selectedUrls.length} customers...`,
    });

    const existingLeads = await leads.find({ userId }).toArray();
    const existingUrls = new Set(existingLeads.map((l: any) => l.url));
    const existingTitles = new Set(existingLeads.map((l: any) => l.title?.toLowerCase()));

    const newLeads: any[] = [];
    for (const selected of selectedUrls) {
      if (existingUrls.has(selected.url)) continue;
      
      const post = scoredPosts.find((p: any) => p.url === selected.url);
      if (!post) continue;
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
        { $inc: { totalLeadsFound: newLeads.length } }
      );
    }

    await db.collection("lead_jobs").deleteOne({ userId });

    const elapsed = Date.now() - (req as any)._startTime || 0;
    console.log(`✅ [${userId}] Done! ${newLeads.length} leads in ${elapsed}ms`);

    return NextResponse.json({
      step: "complete",
      message: `Found ${newLeads.length} potential customers!`,
      newLeadsCount: newLeads.length,
      totalToday: newLeads.length,
    });

  } catch (error: any) {
    console.error("Lead generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate leads" },
      { status: 500 }
    );
  }
}
