import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// POST - SMART customer discovery (industry-aware, finds relevant leads for ANY product)
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

    await leads.deleteMany({ userId });
    updateProgress(userId, {
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 1,
      matchesFound: 0,
    });

    // Analyze product to determine industry
    const descLower = (
      projectDescription +
      " " +
      (targetAudience || "")
    ).toLowerCase();

    // Detect industry and select relevant subreddits + keywords
    const subreddits = [];
    let industry = "general";
    let industryLabel = "business";

    // SaaS/Software
    if (
      descLower.includes("saas") ||
      descLower.includes("software") ||
      descLower.includes("app") ||
      descLower.includes("platform") ||
      descLower.includes("founder")
    ) {
      subreddits.push(
        "SaaS",
        "entrepreneur",
        "startups",
        "indiehackers",
        "sideproject",
      );
      industry = "saas";
      industryLabel = "SaaS founder";
    }
    // E-commerce/Retail/Stock/Inventory
    if (
      descLower.includes("ecommerce") ||
      descLower.includes("shopify") ||
      descLower.includes("retail") ||
      descLower.includes("shop") ||
      descLower.includes("stock") ||
      descLower.includes("inventory") ||
      descLower.includes("seller") ||
      descLower.includes("warehouse")
    ) {
      subreddits.push(
        "ecommerce",
        "shopify",
        "smallbusiness",
        "entrepreneur",
        "retail",
      );
      industry = "ecommerce";
      industryLabel = "seller or retailer";
    }
    // Marketing/Sales/Email
    if (
      descLower.includes("marketing") ||
      descLower.includes("sales") ||
      descLower.includes("email") ||
      descLower.includes("lead") ||
      descLower.includes("outreach")
    ) {
      subreddits.push(
        "marketing",
        "sales",
        "smallbusiness",
        "entrepreneur",
        "digitalmarketing",
      );
      industry = "marketing";
      industryLabel = "marketer or sales professional";
    }
    // Content Creators
    if (
      descLower.includes("creator") ||
      descLower.includes("youtube") ||
      descLower.includes("content") ||
      descLower.includes("influencer") ||
      descLower.includes("tiktok")
    ) {
      subreddits.push(
        "NewTubers",
        "youtube",
        "ContentCreators",
        "entrepreneur",
        "socialmedia",
      );
      industry = "creator";
      industryLabel = "content creator";
    }
    // Real Estate
    if (
      descLower.includes("real estate") ||
      descLower.includes("property") ||
      descLower.includes("realtor") ||
      descLower.includes("rental")
    ) {
      subreddits.push(
        "realtors",
        "realestate",
        "smallbusiness",
        "entrepreneur",
      );
      industry = "realestate";
      industryLabel = "real estate professional";
    }
    // Finance/Accounting
    if (
      descLower.includes("finance") ||
      descLower.includes("accounting") ||
      descLower.includes("invoice") ||
      descLower.includes("tax") ||
      descLower.includes("bookkeeping")
    ) {
      subreddits.push(
        "smallbusiness",
        "entrepreneur",
        "accounting",
        "personalfinance",
      );
      industry = "finance";
      industryLabel = "finance professional";
    }
    // Health/Fitness
    if (
      descLower.includes("health") ||
      descLower.includes("fitness") ||
      descLower.includes("gym") ||
      descLower.includes("wellness") ||
      descLower.includes("nutrition")
    ) {
      subreddits.push("smallbusiness", "entrepreneur", "fitness", "nutrition");
      industry = "health";
      industryLabel = "health or fitness professional";
    }
    // Education/Courses
    if (
      descLower.includes("education") ||
      descLower.includes("course") ||
      descLower.includes("teaching") ||
      descLower.includes("training") ||
      descLower.includes("coach")
    ) {
      subreddits.push(
        "entrepreneur",
        "smallbusiness",
        "onlinebusiness",
        "teaching",
      );
      industry = "education";
      industryLabel = "educator or coach";
    }

    // Default - general business
    if (subreddits.length === 0) {
      subreddits.push("smallbusiness", "entrepreneur");
      industry = "general";
      industryLabel = "business owner";
    }

    // Remove duplicates and limit to 5
    const uniqueSubreddits = [...new Set(subreddits)].slice(0, 5);
    console.log(`📊 Industry detected: ${industry} (${industryLabel})`);
    console.log(`📊 Searching subreddits: ${uniqueSubreddits.join(", ")}`);

    // Industry-specific keywords for matching
    const industryKeywords: Record<string, string[]> = {
      saas: [
        "saas",
        "software",
        "app",
        "platform",
        "startup",
        "founder",
        "mvp",
        "launch",
      ],
      ecommerce: [
        "ecommerce",
        "shopify",
        "inventory",
        "stock",
        "retail",
        "seller",
        "warehouse",
        "order",
      ],
      marketing: [
        "marketing",
        "sales",
        "email",
        "lead",
        "outreach",
        "campaign",
        "conversion",
      ],
      creator: [
        "creator",
        "youtube",
        "content",
        "influencer",
        "tiktok",
        "audience",
        "subscriber",
      ],
      realestate: [
        "real estate",
        "property",
        "realtor",
        "rental",
        "investment",
        "listing",
      ],
      finance: [
        "finance",
        "accounting",
        "invoice",
        "tax",
        "bookkeeping",
        "payment",
      ],
      health: ["health", "fitness", "gym", "wellness", "nutrition", "workout"],
      education: [
        "education",
        "course",
        "teaching",
        "training",
        "coach",
        "student",
      ],
      general: [
        "business",
        "startup",
        "entrepreneur",
        "company",
        "product",
        "customer",
      ],
    };

    const productKeywords =
      industryKeywords[industry] || industryKeywords.general;

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

    // Score and filter posts with industry-aware matching
    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();

    console.log("🔍 Analyzing posts for relevance...");

    for (const post of recentPosts) {
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const text = title + " " + content;

      let score = 0;
      let bestMatch = null;

      // Check for problem keywords
      for (const kw of problemKeywords) {
        if (text.includes(kw)) {
          score += 3;
          if (!bestMatch || kw.length > (bestMatch || "").length) {
            bestMatch = kw;
          }
        }
      }

      // Check for industry-specific keywords
      for (const kw of productKeywords) {
        if (text.includes(kw)) {
          score += 2;
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

      // Bonus for asking questions
      if (title.includes("?") || content.includes("?")) {
        score += 1;
      }

      // Filter out spam/self-promo
      const isSelfPromo =
        text.includes("check out my") ||
        text.includes("visit my website") ||
        text.includes("click here") ||
        text.includes("buy my");

      // Filter out irrelevant industries
      const isIrrelevant =
        (industry === "ecommerce" &&
          (text.includes("saas") || text.includes("software app"))) ||
        (industry === "saas" &&
          (text.includes("lawn care") ||
            text.includes("clothing brand") ||
            text.includes("restaurant")));

      if (
        score >= 3 &&
        !isSelfPromo &&
        !isIrrelevant &&
        !seenUrls.has(post.url)
      ) {
        seenUrls.add(post.url);

        // Generate industry-specific AI explanation
        let aiExplanation = "";

        if (
          text.includes("launch") ||
          text.includes("launched") ||
          text.includes("just released")
        ) {
          aiExplanation = `This ${industryLabel} just launched and needs their first customers - perfect for ${projectName} to get early adopters`;
        } else if (
          text.includes("first customer") ||
          text.includes("first 100") ||
          text.includes("get customers") ||
          text.includes("find customers")
        ) {
          aiExplanation = `This ${industryLabel} is actively looking for customers RIGHT NOW - they need ${projectName} to find leads immediately`;
        } else if (
          text.includes("MRR") ||
          text.includes("revenue") ||
          text.includes("grow") ||
          text.includes("scale")
        ) {
          aiExplanation = `This ${industryLabel} is focused on growth - ${projectName} can help them find qualified leads to boost revenue`;
        } else if (
          text.includes("idea") ||
          text.includes("validate") ||
          text.includes("validation")
        ) {
          aiExplanation = `This ${industryLabel} is validating their idea - they need ${projectName} to find potential customers for feedback`;
        } else if (
          text.includes("struggling") ||
          text.includes("stuck") ||
          text.includes("lost") ||
          text.includes("don't know")
        ) {
          aiExplanation = `This ${industryLabel} is struggling with growth - ${projectName} can give them a proven system to find customers`;
        } else if (
          text.includes("sales funnel") ||
          text.includes("conversion") ||
          text.includes("churn")
        ) {
          aiExplanation = `This ${industryLabel} is optimizing their funnel - they need ${projectName} to bring in more qualified leads`;
        } else if (
          text.includes("marketing") ||
          text.includes("promotion") ||
          text.includes("advertise")
        ) {
          aiExplanation = `This ${industryLabel} needs marketing help - ${projectName} provides targeted lead discovery`;
        } else if (
          text.includes("feedback") ||
          text.includes("users") ||
          text.includes("beta")
        ) {
          aiExplanation = `This ${industryLabel} is looking for user feedback - ${projectName} can help them find engaged people to try their product`;
        } else if (
          text.includes("how to") ||
          text.includes("advice") ||
          text.includes("recommend")
        ) {
          aiExplanation = `This ${industryLabel} is seeking advice - they're open to trying new solutions like ${projectName}`;
        } else {
          aiExplanation = `This ${industryLabel} is discussing ${industry} challenges - ${projectName} can help them find customers and grow`;
        }

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
