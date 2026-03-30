import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// POST - SMART customer discovery (finds relevant leads for ANY product)
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

    // Analyze product to determine target subreddits and keywords
    const descLower = (
      projectDescription +
      " " +
      (targetAudience || "")
    ).toLowerCase();

    // Determine relevant subreddits based on product
    const subreddits = [];

    // SaaS/Software products
    if (
      descLower.includes("saas") ||
      descLower.includes("software") ||
      descLower.includes("app") ||
      descLower.includes("startup") ||
      descLower.includes("founder")
    ) {
      subreddits.push(
        "SaaS",
        "entrepreneur",
        "startups",
        "indiehackers",
        "sideproject",
      );
    }
    // E-commerce/Retail
    if (
      descLower.includes("ecommerce") ||
      descLower.includes("shopify") ||
      descLower.includes("retail") ||
      descLower.includes("store") ||
      descLower.includes("shop")
    ) {
      subreddits.push("ecommerce", "shopify", "smallbusiness", "entrepreneur");
    }
    // Marketing/Sales tools
    if (
      descLower.includes("marketing") ||
      descLower.includes("sales") ||
      descLower.includes("lead") ||
      descLower.includes("email")
    ) {
      subreddits.push("marketing", "sales", "smallbusiness", "entrepreneur");
    }
    // Inventory/Stock management
    if (
      descLower.includes("stock") ||
      descLower.includes("inventory") ||
      descLower.includes("warehouse")
    ) {
      subreddits.push("smallbusiness", "entrepreneur", "logistics");
    }
    // Content creators
    if (
      descLower.includes("creator") ||
      descLower.includes("youtube") ||
      descLower.includes("content") ||
      descLower.includes("influencer")
    ) {
      subreddits.push(
        "NewTubers",
        "youtube",
        "ContentCreators",
        "entrepreneur",
      );
    }
    // Real estate
    if (
      descLower.includes("real estate") ||
      descLower.includes("property") ||
      descLower.includes("realtor")
    ) {
      subreddits.push("realtors", "realestate", "smallbusiness");
    }
    // Finance/Accounting
    if (
      descLower.includes("finance") ||
      descLower.includes("accounting") ||
      descLower.includes("invoice") ||
      descLower.includes("tax")
    ) {
      subreddits.push("smallbusiness", "entrepreneur", "accounting");
    }
    // Health/Fitness
    if (
      descLower.includes("health") ||
      descLower.includes("fitness") ||
      descLower.includes("gym") ||
      descLower.includes("wellness")
    ) {
      subreddits.push("smallbusiness", "entrepreneur", "fitness");
    }
    // Default - general business
    if (subreddits.length === 0) {
      subreddits.push("smallbusiness", "entrepreneur");
    }

    // Remove duplicates and limit to 5
    const uniqueSubreddits = [...new Set(subreddits)].slice(0, 5);
    console.log(`📊 Searching subreddits: ${uniqueSubreddits.join(", ")}`);

    // Extract keywords from product description
    const productKeywords =
      descLower.match(
        /\b(saas|software|app|tool|platform|service|product|solution|system|inventory|stock|marketing|sales|email|lead|customer|client|business|startup|founder|creator|ecommerce|shop|store)\b/gi,
      ) || [];

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

    // Score and filter posts
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

      // Check for product-related keywords
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

      // Filter out irrelevant industries based on product
      const isIrrelevant =
        (descLower.includes("saas") &&
          (text.includes("lawn care") ||
            text.includes("clothing") ||
            text.includes("restaurant"))) ||
        (descLower.includes("ecommerce") && text.includes("saas")) ||
        false;

      if (
        score >= 3 &&
        !isSelfPromo &&
        !isIrrelevant &&
        !seenUrls.has(post.url)
      ) {
        seenUrls.add(post.url);

        // Generate SPECIFIC AI explanation based on what they're actually asking
        let aiExplanation = "";

        // Check for specific scenarios
        if (
          text.includes("launch") ||
          text.includes("launched") ||
          text.includes("just released")
        ) {
          aiExplanation = `This founder just launched their SaaS and needs their first customers - perfect for slip's Reddit discovery to get early adopters`;
        } else if (
          text.includes("first customer") ||
          text.includes("first 100") ||
          text.includes("get customers") ||
          text.includes("find customers")
        ) {
          aiExplanation = `This person is actively looking for customers RIGHT NOW - they need slip to find leads on Reddit immediately`;
        } else if (
          text.includes("MRR") ||
          text.includes("revenue") ||
          text.includes("grow") ||
          text.includes("scale")
        ) {
          aiExplanation = `This SaaS is focused on growth and revenue - slip can help them find qualified leads to boost MRR`;
        } else if (
          text.includes("idea") ||
          text.includes("validate") ||
          text.includes("validation")
        ) {
          aiExplanation = `This founder is validating their idea - they need slip to find potential customers for feedback and early sales`;
        } else if (
          text.includes("quit my job") ||
          text.includes("full-time") ||
          text.includes("all-in")
        ) {
          aiExplanation = `This founder went all-in on their SaaS - they're motivated and need slip to find customers fast`;
        } else if (
          text.includes("struggling") ||
          text.includes("stuck") ||
          text.includes("lost") ||
          text.includes("don't know")
        ) {
          aiExplanation = `This founder is struggling with growth - slip can give them a proven system to find customers on Reddit`;
        } else if (
          text.includes("sales funnel") ||
          text.includes("conversion") ||
          text.includes("churn")
        ) {
          aiExplanation = `This SaaS is optimizing their funnel - they need slip to bring in more qualified leads to test with`;
        } else if (
          text.includes("marketing") ||
          text.includes("promotion") ||
          text.includes("advertise")
        ) {
          aiExplanation = `This founder needs marketing help - slip provides targeted lead discovery that's more effective than ads`;
        } else if (
          text.includes("feedback") ||
          text.includes("users") ||
          text.includes("beta")
        ) {
          aiExplanation = `This SaaS is looking for user feedback - slip can help them find engaged Reddit users to try their product`;
        } else if (
          text.includes("how to") ||
          text.includes("advice") ||
          text.includes("recommend")
        ) {
          aiExplanation = `This person is seeking business advice - they're open to trying new solutions like slip for customer discovery`;
        } else {
          aiExplanation = `This person is discussing SaaS/business challenges - slip can help them find customers and grow their user base`;
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
