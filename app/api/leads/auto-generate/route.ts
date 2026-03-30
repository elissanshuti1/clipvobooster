import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import OpenAI from "openai";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// Initialize OpenRouter for AI analysis
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// POST - AI-POWERED customer discovery (AI analyzes product & finds relevant leads)
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s: string) => s.trim())
      .find((s: string) => s.startsWith("token="));
    const token = m ? m.split("=")[1] : null;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(payload.sub);
    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");
    const leads = db.collection("leads");

    const user = await users.findOne(
      { _id: new (require("mongodb").ObjectId)(payload.sub) },
      { projection: { profile: 1 } },
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json(
        { error: "Complete profile first", hasProfile: false },
        { status: 400 },
      );
    }

    const { projectName, projectDescription, targetAudience } = user.profile;
    console.log(`🎯 Finding customers for: ${projectName}`);
    console.log(`📝 Description: ${projectDescription}`);

    updateProgress(userId, {
      stage: "analyzing",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 1,
      matchesFound: 0,
    });

    // Get existing lead URLs to prevent duplicates
    const existingLeads = await leads.find({ userId }).toArray();
    const existingUrlSet = new Set(existingLeads.map((l: any) => l.url));
    console.log(`📋 Existing leads in DB: ${existingLeads.length}`);

    // STEP 1: Use AI to analyze product and extract relevant keywords/subreddits
    console.log("🤖 AI: Analyzing product description...");

    const aiAnalysis = await openrouter.chat.completions.create({
      model: "google/gemma-2-9b-it",
      messages: [
        {
          role: "system",
          content: `You are an expert at matching products with potential customers on Reddit.

Analyze the product description and return:
1. Industry type (one of: saas, ecommerce, marketing, creator, realestate, finance, health, education, general)
2. 10-15 specific keywords that potential customers would use when discussing problems this product solves
3. 5 relevant subreddits where these people hang out
4. What problems this product solves

Return JSON format:
{
  "industry": "industry_name",
  "industryLabel": "description of target user (e.g., 'seller or retailer')",
  "keywords": ["keyword1", "keyword2", ...],
  "subreddits": ["subreddit1", "subreddit2", ...],
  "problemsSolved": ["problem1", "problem2", ...]
}`,
        },
        {
          role: "user",
          content: `Product Name: ${projectName}
Product Description: ${projectDescription}
Target Audience: ${targetAudience || "Not specified"}

Analyze this product and tell me what keywords to search for and which subreddits to find potential customers.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const aiResponse = aiAnalysis.choices[0].message?.content || "{}";
    console.log("🤖 AI Response:", aiResponse);

    // Parse AI response
    let aiData;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      aiData = null;
    }

    // Fallback if AI fails
    if (!aiData) {
      aiData = {
        industry: "general",
        industryLabel: "business owner",
        keywords: [
          "business",
          "customer",
          "product",
          "service",
          "company",
          "startup",
          "help",
          "need",
          "looking for",
        ],
        subreddits: ["smallbusiness", "entrepreneur"],
        problemsSolved: ["business challenges"],
      };
    }

    const { industry, industryLabel, keywords, subreddits, problemsSolved } =
      aiData;
    console.log(`📊 Industry: ${industry} (${industryLabel})`);
    console.log(`📊 Keywords: ${keywords.join(", ")}`);
    console.log(`📊 Subreddits: ${subreddits.join(", ")}`);
    console.log(`📊 Problems solved: ${problemsSolved.join(", ")}`);

    // Problem keywords (what people struggle with)
    const problemKeywords = [
      "looking for",
      "need help",
      "struggling",
      "how to",
      "advice",
      "recommend",
      "suggestions",
      "trying to",
      "want to",
      "need to",
      "can't find",
      "can't get",
      "don't know how",
      "where to find",
      "first customer",
      "first client",
      "get customers",
      "find customers",
      "get leads",
      "find leads",
      "get clients",
      "find clients",
      "customer acquisition",
      "lead generation",
      "marketing strategy",
      "grow my business",
      "scale my business",
      "promote my",
      "market my",
      "waste time",
      "time consuming",
      "manual process",
      "automate",
      "spreadsheet",
      "excel",
      "google sheets",
      "hiring",
      "looking for",
      "best software",
      "best tool",
      "what software",
      "what tool",
      "recommendation",
    ];

    // Fetch posts from AI-selected subreddits (limit to 50 posts for faster results)
    const recentPosts: any[] = [];
    const uniqueSubreddits = [...new Set(subreddits)].slice(0, 5);
    const maxPostsPerSubreddit = 10; // Reduced from 20 to 10 for speed

    for (const subreddit of uniqueSubreddits) {
      try {
        const redditUrl = `https://www.reddit.com/r/${subreddit}/new.rss?limit=25`;
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(redditUrl)}`;

        const response = await fetch(proxyUrl, {
          headers: { Accept: "application/rss+xml" },
          cache: "no-store",
        });

        if (!response.ok) continue;

        const rssText = await response.text();
        const feed = await parser.parseString(rssText);

        // Limit posts per subreddit for faster results
        let postCount = 0;
        for (const item of feed.items?.slice(0, maxPostsPerSubreddit) || []) {
          const postDate = new Date(item.pubDate || Date.now());
          const fiveDaysAgo = new Date();
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

          if (postDate >= fiveDaysAgo && postCount < maxPostsPerSubreddit) {
            recentPosts.push({
              title: item.title || "",
              content: (item.content || item.summary || "").slice(0, 1000),
              author: item.author || "Unknown",
              subreddit,
              url: item.link || "",
              publishedAt: postDate.toISOString(),
            });
            postCount++;
          }
        }
      } catch (err) {
        console.error(`Failed r/${subreddit}:`, err);
      }
    }

    console.log(`📊 Found ${recentPosts.length} posts to analyze`);
    updateProgress(userId, {
      stage: "analyzing",
      postsFound: recentPosts.length,
      totalBatches: 1,
      batchesAnalyzed: 0,
      matchesFound: 0,
    });

    if (recentPosts.length === 0) {
      return NextResponse.json({
        message: "No recent posts found. Check back in a few days!",
        newLeadsCount: 0,
        totalToday: existingLeads.length,
      });
    }

    // STEP 2: Use AI to analyze each post and determine relevance
    console.log("🤖 AI: Analyzing posts for relevance...");

    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();

    // Batch posts for AI analysis (5 at a time to save API calls)
    const batchSize = 5;
    for (let i = 0; i < recentPosts.length; i += batchSize) {
      const batch = recentPosts.slice(i, i + batchSize);

      // Use AI to analyze this batch
      const aiPostAnalysis = await openrouter.chat.completions.create({
        model: "google/gemma-2-9b-it",
        messages: [
          {
            role: "system",
            content: `You are analyzing Reddit posts to find potential customers for a product.

Product: ${projectName}
Description: ${projectDescription}
Target: ${targetAudience || "businesses who need this"}
Problems it solves: ${problemsSolved.join(", ")}

For each post, determine:
1. Is this person potentially needing this product? (yes/no)
2. Score 1-10 (10 = perfect match)
3. Why is it relevant or not relevant?
4. What specific problem do they have that this product solves?

Return JSON array:
[
  {
    "title": "post title",
    "url": "post url",
    "isRelevant": true/false,
    "score": 8,
    "reason": "explanation of why relevant or not",
    "problemTheyHave": "specific problem this product solves for them"
  }
]

Be STRICT - only mark as relevant if the post clearly shows they need this type of product.`,
          },
          {
            role: "user",
            content: `Analyze these ${batch.length} Reddit posts:

${batch
  .map(
    (post, idx) => `
Post ${idx + 1}:
Title: ${post.title}
Content: ${post.content.substring(0, 500)}
URL: ${post.url}
---`,
  )
  .join("\n")}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const aiPostResponse = aiPostAnalysis.choices[0].message?.content || "[]";
      console.log(`🤖 AI analyzed batch ${Math.floor(i / batchSize) + 1}`);

      // Parse AI response
      let postAnalyses;
      try {
        const jsonMatch = aiPostResponse.match(/\[[\s\S]*\]/);
        postAnalyses = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        postAnalyses = [];
      }

      // Process relevant posts
      for (const analysis of postAnalyses) {
        const post = batch.find((p) => p.url === analysis.url);
        if (!post) continue;

        // Skip if not relevant, low score, duplicate, or self-promo
        if (!analysis.isRelevant || analysis.score < 7) continue;
        if (seenUrls.has(post.url) || existingUrlSet.has(post.url)) continue;
        if (
          post.content.toLowerCase().includes("check out my") ||
          post.content.toLowerCase().includes("visit my website") ||
          post.content.toLowerCase().includes("click here") ||
          post.content.toLowerCase().includes("buy my") ||
          post.content.toLowerCase().includes("hire me")
        )
          continue;

        seenUrls.add(post.url);

        // Generate dynamic AI explanation
        const aiExplanation = `This ${industryLabel} ${analysis.problemTheyHave}. ${analysis.reason} ${projectName} can help them solve this specific challenge.`;

        potentialCustomers.push({
          userId,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          content: post.content.slice(0, 800),
          publishedAt: post.publishedAt,
          notes: `AI Score: ${analysis.score}/10`,
          aiMatchReason: aiExplanation,
          status: "new",
          isAutoDiscovered: true,
          createdAt: new Date(),
        });

        // Limit to 10 high-quality leads per search
        if (potentialCustomers.length >= 10) {
          break;
        }
      }

      if (potentialCustomers.length >= 10) {
        break;
      }
    }

    console.log(`🎯 Found ${potentialCustomers.length} qualified leads`);
    updateProgress(userId, {
      stage: "saving",
      matchesFound: potentialCustomers.length,
    });

    if (potentialCustomers.length > 0) {
      await leads.insertMany(potentialCustomers);

      // Update user's usage count
      await users.updateOne(
        { _id: new (require("mongodb").ObjectId)(payload.sub) },
        {
          $inc: { leadsFoundThisMonth: potentialCustomers.length },
          $set: {
            usageResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      );
    }

    updateProgress(userId, {
      stage: "complete",
      matchesFound: potentialCustomers.length,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await leads.countDocuments({
      userId,
      createdAt: { $gte: today },
    });

    console.log(
      `✅ Saved ${potentialCustomers.length} new leads. Total today: ${todayCount}`,
    );

    setTimeout(
      () => updateProgress(userId, { stage: "complete", clear: true }),
      5000,
    );

    // Return appropriate message
    if (potentialCustomers.length === 0) {
      return NextResponse.json({
        message:
          "No new quality leads found this week. We searched " +
          recentPosts.length +
          "+ recent posts but all relevant matches are already in your list. Check back in 2-3 days for new posts!",
        newLeadsCount: 0,
        totalToday: todayCount,
      });
    }

    return NextResponse.json({
      message: `Found ${potentialCustomers.length} new potential customers!`,
      newLeadsCount: potentialCustomers.length,
      totalToday: todayCount,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to find customers", details: error.message },
      { status: 500 },
    );
  }
}
