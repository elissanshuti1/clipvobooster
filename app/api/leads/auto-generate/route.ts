import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// POST - FAST customer discovery with SMART AI explanations (20-30 seconds)
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

    await leads.deleteMany({ userId });
    updateProgress(userId, {
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 1,
      matchesFound: 0,
    });

    // Fetch from 3 subreddits (FAST)
    const recentPosts: any[] = [];
    const subreddits = ["entrepreneur", "smallbusiness", "SaaS"];

    for (const subreddit of subreddits) {
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

        for (const item of feed.items?.slice(0, 20) || []) {
          const postDate = new Date(item.pubDate || Date.now());
          const fiveDaysAgo = new Date();
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

          if (postDate >= fiveDaysAgo) {
            recentPosts.push({
              title: item.title || "",
              content: (item.content || item.summary || "").slice(0, 1000),
              author: item.author || "Unknown",
              subreddit,
              url: item.link || "",
              publishedAt: postDate.toISOString(),
            });
          }
        }
      } catch (err) {
        console.error(`Failed r/${subreddit}:`, err);
      }
    }

    console.log(`📊 Found ${recentPosts.length} posts`);
    updateProgress(userId, {
      stage: "analyzing",
      postsFound: recentPosts.length,
      totalBatches: 1,
      batchesAnalyzed: 0,
      matchesFound: 0,
    });

    if (recentPosts.length === 0) {
      return NextResponse.json({ error: "No posts found", newLeadsCount: 0 });
    }

    // Analyze product description for smart matching
    const descLower = (
      projectDescription +
      " " +
      (targetAudience || "")
    ).toLowerCase();

    // Detect what the product does
    const productType = {
      isInventory:
        descLower.includes("stock") || descLower.includes("inventory"),
      isSales:
        descLower.includes("sell") ||
        descLower.includes("sales") ||
        descLower.includes("seller"),
      isCRM: descLower.includes("crm") || descLower.includes("customer"),
      isAccounting:
        descLower.includes("account") ||
        descLower.includes("invoice") ||
        descLower.includes("payment"),
      isMarketing:
        descLower.includes("marketing") || descLower.includes("promot"),
    };

    // Problem patterns with AI explanations
    const problemPatterns = [
      {
        keywords: ["spreadsheet", "excel", "google sheets"],
        reason:
          "Currently using manual spreadsheets to manage their business - your app can automate this process and save them hours of work",
      },
      {
        keywords: [
          "managing inventory",
          "track stock",
          "inventory management",
          "stock management",
        ],
        reason:
          "Explicitly looking for inventory/stock management solution - this is exactly what your app does",
      },
      {
        keywords: [
          "accounts payable",
          "invoice",
          "billing",
          "payment tracking",
        ],
        reason:
          "Needs help with financial tracking and payment management - your app can streamline this",
      },
      {
        keywords: [
          "looking for customers",
          "find customers",
          "get customers",
          "customer acquisition",
        ],
        reason:
          "Actively searching for ways to find and acquire customers - your app helps sellers focus on this",
      },
      {
        keywords: ["lead generation", "find leads", "get leads"],
        reason:
          "Needs help generating and tracking business leads - core functionality of your platform",
      },
      {
        keywords: [
          "struggling",
          "having trouble",
          "difficulty",
          "challenge",
          "problem",
        ],
        reason:
          "Expressing specific business challenges that your product is designed to solve",
      },
      {
        keywords: ["how to", "advice", "recommend", "suggestions", "tips"],
        reason:
          "Seeking business advice and recommendations - they're open to trying new solutions like yours",
      },
      {
        keywords: [
          "first customer",
          "first client",
          "first sale",
          "new business",
        ],
        reason:
          "New business owner who needs foundational tools to get started - perfect early adopter",
      },
      {
        keywords: ["scale", "growing", "expand", "growth", "increasing"],
        reason:
          "Growing business that needs better systems to handle increased volume",
      },
      {
        keywords: [
          "switch from",
          "migrating",
          "looking for alternative",
          "better solution",
        ],
        reason:
          "Actively looking to switch from their current solution - high intent to buy",
      },
      {
        keywords: [
          "waste time",
          "time consuming",
          "manual process",
          "automate",
          "tedious",
        ],
        reason:
          "Spending too much time on manual tasks - your automation can free up their time",
      },
      {
        keywords: [
          "lost money",
          "losing money",
          "costly mistake",
          "expensive error",
        ],
        reason:
          "Experiencing financial losses from poor systems - your app can prevent these losses",
      },
      {
        keywords: ["crm", "customer management", "client management"],
        reason:
          "Looking for customer relationship management - your app helps manage seller-customer relationships",
      },
      {
        keywords: ["report", "analytics", "dashboard", "insights"],
        reason:
          "Needs better visibility into their business performance - your app provides this",
      },
    ];

    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();

    console.log("🔍 Analyzing posts with smart matching...");

    for (const post of recentPosts) {
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const text = title + " " + content;

      // Score the post
      let score = 0;
      let bestMatch = null;

      // Check each problem pattern
      for (const pattern of problemPatterns) {
        for (const kw of pattern.keywords) {
          if (text.includes(kw)) {
            score += 3;
            if (
              !bestMatch ||
              pattern.keywords.length > bestMatch.keywords.length
            ) {
              bestMatch = pattern;
            }
          }
        }
      }

      // Bonus for business context
      if (
        text.includes("business") ||
        text.includes("startup") ||
        text.includes("company") ||
        text.includes("product") ||
        text.includes("service")
      ) {
        score += 2;
      }

      // Bonus for asking questions (shows they want help)
      if (title.includes("?") || content.includes("?")) {
        score += 1;
      }

      // Bonus if matches product type
      if (
        productType.isInventory &&
        (text.includes("inventory") || text.includes("stock"))
      )
        score += 5;
      if (
        productType.isSales &&
        (text.includes("sell") || text.includes("sales"))
      )
        score += 5;
      if (
        productType.isCRM &&
        (text.includes("customer") || text.includes("client"))
      )
        score += 5;
      if (
        productType.isAccounting &&
        (text.includes("invoice") || text.includes("payment"))
      )
        score += 5;
      if (
        productType.isMarketing &&
        (text.includes("marketing") || text.includes("promot"))
      )
        score += 5;

      // Filter out spam/self-promo
      const isSelfPromo =
        text.includes("check out my") ||
        text.includes("visit my website") ||
        text.includes("click here") ||
        text.includes("buy my");

      if (score >= 3 && !isSelfPromo && !seenUrls.has(post.url)) {
        seenUrls.add(post.url);

        // Generate AI explanation
        const aiExplanation = bestMatch
          ? `This person is ${bestMatch.reason}. Your ${projectName} app ${descLower.includes("stock") ? "for stock management" : descLower.includes("sell") ? "for sellers" : "can help them"} by solving this specific pain point.`
          : `This person is discussing business challenges that your ${projectName} app could potentially help with.`;

        potentialCustomers.push({
          userId,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          content: post.content.slice(0, 800),
          publishedAt: post.publishedAt,
          notes: `Match Score: ${score}/10`,
          aiMatchReason: aiExplanation,
          status: "new",
          isAutoDiscovered: true,
          createdAt: new Date(),
        });

        if (potentialCustomers.length >= 20) break;
      }
    }

    console.log(`🎯 Found ${potentialCustomers.length} qualified leads`);
    updateProgress(userId, {
      stage: "saving",
      matchesFound: potentialCustomers.length,
    });

    if (potentialCustomers.length > 0) {
      await leads.insertMany(potentialCustomers);
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

    console.log(`✅ Saved ${todayCount} leads`);

    setTimeout(
      () => updateProgress(userId, { stage: "complete", clear: true }),
      5000,
    );

    return NextResponse.json({
      message: "Customer discovery complete",
      newLeadsCount: potentialCustomers.length,
      totalToday: todayCount,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed", details: error.message },
      { status: 500 },
    );
  }
}
