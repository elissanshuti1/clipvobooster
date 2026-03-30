import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// POST - SMART customer discovery (industry-aware, strict quality, no duplicates)
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
    console.log(`👥 Target: ${targetAudience || "Not specified"}`);

    updateProgress(userId, {
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 1,
      matchesFound: 0,
    });

    // Get existing lead URLs to prevent duplicates
    const existingLeads = await leads.find({ userId }).toArray();
    const existingUrlSet = new Set(existingLeads.map((l: any) => l.url));
    console.log(`📋 Existing leads in DB: ${existingLeads.length}`);

    // Analyze product to determine industry
    const descLower = (
      projectDescription +
      " " +
      (targetAudience || "")
    ).toLowerCase();

    // Industry detection with comprehensive keyword lists
    const industryConfig: Record<
      string,
      { subreddits: string[]; keywords: string[]; label: string }
    > = {
      saas: {
        subreddits: [
          "SaaS",
          "entrepreneur",
          "startups",
          "indiehackers",
          "sideproject",
        ],
        keywords: [
          "saas",
          "software",
          "app",
          "platform",
          "tool",
          "product",
          "startup",
          "founder",
          "mvp",
          "launch",
        ],
        label: "SaaS founder or developer",
      },
      ecommerce: {
        subreddits: [
          "ecommerce",
          "shopify",
          "retail",
          "smallbusiness",
          "entrepreneur",
        ],
        keywords: [
          "inventory",
          "stock",
          "shopify",
          "warehouse",
          "order",
          "shipping",
          "product",
          "seller",
          "retail",
          "oversell",
          "restock",
          "sku",
        ],
        label: "seller or retailer",
      },
      marketing: {
        subreddits: [
          "marketing",
          "sales",
          "digitalmarketing",
          "smallbusiness",
          "entrepreneur",
        ],
        keywords: [
          "marketing",
          "campaign",
          "email",
          "lead",
          "conversion",
          "funnel",
          "outreach",
          "prospect",
          "client",
        ],
        label: "marketer or sales professional",
      },
      creator: {
        subreddits: [
          "NewTubers",
          "youtube",
          "ContentCreators",
          "socialmedia",
          "entrepreneur",
        ],
        keywords: [
          "youtube",
          "content",
          "video",
          "audience",
          "subscriber",
          "tiktok",
          "creator",
          "influencer",
          "channel",
        ],
        label: "content creator",
      },
      realestate: {
        subreddits: [
          "realtors",
          "realestate",
          "realestateinvesting",
          "smallbusiness",
        ],
        keywords: [
          "property",
          "real estate",
          "rental",
          "listing",
          "buyer",
          "tenant",
          "agent",
          "broker",
        ],
        label: "real estate professional",
      },
      finance: {
        subreddits: [
          "accounting",
          "personalfinance",
          "smallbusiness",
          "entrepreneur",
        ],
        keywords: [
          "invoice",
          "payment",
          "accounting",
          "tax",
          "billing",
          "bookkeeping",
          "finance",
          "expense",
        ],
        label: "finance professional",
      },
      health: {
        subreddits: [
          "fitness",
          "nutrition",
          "health",
          "smallbusiness",
          "entrepreneur",
        ],
        keywords: [
          "fitness",
          "health",
          "workout",
          "nutrition",
          "gym",
          "diet",
          "wellness",
          "training",
          "coach",
        ],
        label: "health or fitness professional",
      },
      education: {
        subreddits: ["onlinebusiness", "teaching", "edtech", "entrepreneur"],
        keywords: [
          "course",
          "teaching",
          "student",
          "learning",
          "training",
          "coach",
          "education",
          "curriculum",
        ],
        label: "educator or coach",
      },
    };

    // Detect industry
    let industry = "general";
    let config = {
      subreddits: ["smallbusiness", "entrepreneur"],
      keywords: [
        "business",
        "customer",
        "product",
        "service",
        "company",
        "startup",
      ],
      label: "business owner",
    };

    if (
      descLower.includes("saas") ||
      descLower.includes("software") ||
      descLower.includes("app") ||
      descLower.includes("platform") ||
      descLower.includes("founder")
    ) {
      industry = "saas";
      config = industryConfig.saas;
    } else if (
      descLower.includes("ecommerce") ||
      descLower.includes("shopify") ||
      descLower.includes("retail") ||
      descLower.includes("shop") ||
      descLower.includes("stock") ||
      descLower.includes("inventory") ||
      descLower.includes("seller") ||
      descLower.includes("warehouse")
    ) {
      industry = "ecommerce";
      config = industryConfig.ecommerce;
    } else if (
      descLower.includes("marketing") ||
      descLower.includes("sales") ||
      descLower.includes("email") ||
      descLower.includes("lead") ||
      descLower.includes("outreach")
    ) {
      industry = "marketing";
      config = industryConfig.marketing;
    } else if (
      descLower.includes("creator") ||
      descLower.includes("youtube") ||
      descLower.includes("content") ||
      descLower.includes("influencer") ||
      descLower.includes("tiktok")
    ) {
      industry = "creator";
      config = industryConfig.creator;
    } else if (
      descLower.includes("real estate") ||
      descLower.includes("property") ||
      descLower.includes("realtor") ||
      descLower.includes("rental")
    ) {
      industry = "realestate";
      config = industryConfig.realestate;
    } else if (
      descLower.includes("finance") ||
      descLower.includes("accounting") ||
      descLower.includes("invoice") ||
      descLower.includes("tax") ||
      descLower.includes("bookkeeping")
    ) {
      industry = "finance";
      config = industryConfig.finance;
    } else if (
      descLower.includes("health") ||
      descLower.includes("fitness") ||
      descLower.includes("gym") ||
      descLower.includes("wellness") ||
      descLower.includes("nutrition")
    ) {
      industry = "health";
      config = industryConfig.health;
    } else if (
      descLower.includes("education") ||
      descLower.includes("course") ||
      descLower.includes("teaching") ||
      descLower.includes("training") ||
      descLower.includes("coach")
    ) {
      industry = "education";
      config = industryConfig.education;
    }

    const uniqueSubreddits = [...new Set(config.subreddits)].slice(0, 5);
    const productKeywords = config.keywords;
    console.log(`📊 Industry: ${industry} (${config.label})`);
    console.log(`📊 Subreddits: ${uniqueSubreddits.join(", ")}`);

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

    // Fetch posts from relevant subreddits
    const recentPosts: any[] = [];

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

    // Score and filter posts with strict quality control
    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();

    console.log("🔍 Analyzing posts with strict quality matching...");

    for (const post of recentPosts) {
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const text = title + " " + content;

      let score = 0;
      let matchedKeywords: string[] = [];
      let matchedProblems: string[] = [];

      // Check for REQUIRED industry keywords (must match at least 1)
      for (const kw of productKeywords) {
        if (text.includes(kw)) {
          score += 5;
          matchedKeywords.push(kw);
        }
      }

      // If no required keywords, skip this post
      if (matchedKeywords.length === 0) {
        continue;
      }

      // Check for problem keywords
      for (const kw of problemKeywords) {
        if (text.includes(kw)) {
          score += 3;
          matchedProblems.push(kw);
        }
      }

      // Check for target audience keywords
      if (targetAudience) {
        const audienceLower = targetAudience.toLowerCase();
        const audienceWords = audienceLower.split(/[\s,]+/);
        for (const word of audienceWords) {
          if (word.length > 3 && text.includes(word)) {
            score += 5;
          }
        }
      }

      // Bonus for asking questions
      if (title.includes("?") || content.includes("?")) {
        score += 2;
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

      // Filter out spam/self-promo
      const isSelfPromo =
        text.includes("check out my") ||
        text.includes("visit my website") ||
        text.includes("click here") ||
        text.includes("buy my") ||
        text.includes("hire me");

      // Skip if self-promo or already seen
      if (
        isSelfPromo ||
        seenUrls.has(post.url) ||
        existingUrlSet.has(post.url)
      ) {
        continue;
      }

      // STRICT THRESHOLD: Must score >= 8
      if (score >= 8) {
        seenUrls.add(post.url);

        // Generate DYNAMIC AI explanation based on actual post content
        const aiExplanation = generateAIExplanation(
          post,
          matchedKeywords,
          matchedProblems,
          projectName,
          config.label,
        );

        potentialCustomers.push({
          userId,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          content: post.content.slice(0, 800),
          publishedAt: post.publishedAt,
          notes: `Match Score: ${score}/10 | Keywords: ${matchedKeywords.join(", ")}`,
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

// Dynamic AI explanation generator - analyzes actual post content
function generateAIExplanation(
  post: any,
  matchedKeywords: string[],
  matchedProblems: string[],
  projectName: string,
  industryLabel: string,
): string {
  const title = post.title;
  const content = post.content.slice(0, 300);

  // Analyze what specific problem the person has
  let problemType = "";
  let needType = "";

  if (title.includes("?") || title.toLowerCase().includes("how")) {
    problemType = "asking for help";
  } else if (
    matchedProblems.some(
      (p) => p.includes("struggling") || p.includes("need help"),
    )
  ) {
    problemType = "struggling with a challenge";
  } else if (
    matchedProblems.some(
      (p) => p.includes("looking for") || p.includes("want to"),
    )
  ) {
    problemType = "actively looking for a solution";
  } else if (
    matchedProblems.some(
      (p) => p.includes("first customer") || p.includes("get customers"),
    )
  ) {
    problemType = "needs their first customers";
  } else {
    problemType = "discussing industry challenges";
  }

  // Generate specific explanation based on matched keywords
  const keywordContext = matchedKeywords.slice(0, 2).join(" and ");

  const explanations = [
    `This ${industryLabel} is ${problemType} related to ${keywordContext}. They mentioned "${title.substring(0, 50)}..." - ${projectName} can help them solve this specific challenge.`,

    `Found this ${industryLabel} discussing ${keywordContext}. Their post "${title.substring(0, 50)}..." shows they need help with this exact problem - ${projectName} is designed for this use case.`,

    `This ${industryLabel} is ${problemType}. They're talking about ${keywordContext} and said "${content.substring(0, 80)}..." - ${projectName} directly addresses this pain point.`,

    `Perfect match! This ${industryLabel} needs help with ${keywordContext}. Their post "${title.substring(0, 50)}..." indicates they're ready for a solution like ${projectName}.`,

    `This ${industryLabel} is ${problemType} involving ${keywordContext}. From their post "${title.substring(0, 50)}...", they need exactly what ${projectName} provides.`,
  ];

  // Pick explanation based on post characteristics
  if (problemType.includes("asking for help")) {
    return explanations[0];
  } else if (problemType.includes("actively looking")) {
    return explanations[3];
  } else if (problemType.includes("first customers")) {
    return explanations[3];
  } else {
    return explanations[1];
  }
}
