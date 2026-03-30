import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const parser = new Parser();

// POST - FAST customer discovery with REAL Reddit RSS (10-15 seconds)
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s: string) => s.trim())
      .find((s: string) => s.startsWith("token="));
    const token = m ? m.split("=")[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(payload.sub);
    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");
    const leads = db.collection("leads");

    // Get user profile
    const user = await users.findOne(
      { _id: new (require("mongodb").ObjectId)(payload.sub) },
      { projection: { profile: 1 } },
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json(
        { error: "Complete your profile first", hasProfile: false },
        { status: 400 },
      );
    }

    const { projectName, projectDescription, targetAudience } = user.profile;
    console.log(`🎯 Finding customers for: ${projectName}`);

    // Clear old leads
    await leads.deleteMany({ userId });
    updateProgress(userId, {
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 1,
      matchesFound: 0,
    });

    // Fetch Reddit posts via CORS proxy (bypasses IP blocking)
    const recentPosts: any[] = [];
    const subreddits = [
      "SaaS",
      "entrepreneur",
      "smallbusiness",
      "startup",
      "sideproject",
      "indiehackers",
    ];

    // Use multiple proxies for reliability
    const proxies = [
      (url: string) =>
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      (url: string) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];

    for (const subreddit of subreddits) {
      try {
        const redditUrl = `https://www.reddit.com/r/${subreddit}/search.rss?q=finding+customers+OR+need+customers+OR+looking+for+customers+OR+get+customers+OR+customer+acquisition+OR+lead+generation&sort=new&limit=20`;

        // Try each proxy until one works
        let rssText = "";
        for (const proxyFn of proxies) {
          const proxyUrl = proxyFn(redditUrl);
          console.log(`📡 Trying proxy for r/${subreddit}...`);

          const response = await fetch(proxyUrl, {
            headers: { Accept: "application/rss+xml" },
            cache: "no-store",
          });

          if (response.ok) {
            rssText = await response.text();
            console.log(`✅ Proxy worked for r/${subreddit}`);
            break;
          }
        }

        if (!rssText) {
          console.log(`⚠️ All proxies failed for r/${subreddit}`);
          continue;
        }

        const feed = await parser.parseString(rssText);
        console.log(
          `📦 Parsed ${feed.items?.length || 0} items from r/${subreddit}`,
        );

        for (const item of feed.items?.slice(0, 15) || []) {
          const postDate = new Date(item.pubDate || Date.now());
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          if (postDate >= sevenDaysAgo) {
            recentPosts.push({
              title: item.title || "",
              content: (item.content || item.summary || "").slice(0, 800),
              author: item.author || "Unknown",
              subreddit,
              url: item.link || "",
              publishedAt: postDate.toISOString(),
            });
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
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
        error: "No posts found. Try again.",
        newLeadsCount: 0,
      });
    }

    // Keyword matching for customer-seeking posts
    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();

    const customerKeywords = [
      "looking for customers",
      "need customers",
      "find customers",
      "get customers",
      "customer acquisition",
      "lead generation",
      "get leads",
      "find leads",
      "struggling to find customers",
      "how to get customers",
      "where to find customers",
      "first customers",
      "get my first customer",
      "need more clients",
      "looking for clients",
      "find clients",
    ];

    console.log("🔍 Matching posts with customer keywords...");

    for (const post of recentPosts) {
      const text = (post.title + " " + post.content).toLowerCase();

      const matched = customerKeywords.find((kw) => text.includes(kw));
      if (matched && !seenUrls.has(post.url)) {
        seenUrls.add(post.url);
        potentialCustomers.push({
          userId,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          url: post.url,
          content: post.content.slice(0, 800),
          publishedAt: post.publishedAt,
          notes: `Looking for customers`,
          aiMatchReason: `Post mentions: ${matched}`,
          status: "new",
          isAutoDiscovered: true,
          createdAt: new Date(),
        });
        console.log(`✅ Match: ${post.title.slice(0, 50)}...`);
      }
    }

    console.log(`🎯 Total leads found: ${potentialCustomers.length}`);
    updateProgress(userId, {
      stage: "saving",
      matchesFound: potentialCustomers.length,
    });

    // Save leads
    if (potentialCustomers.length > 0) {
      await leads.insertMany(potentialCustomers);
      console.log(`✅ Saved ${potentialCustomers.length} leads`);
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

    console.log(`✅ Found ${todayCount} leads today`);

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
      { error: "Failed to find customers", details: error.message },
      { status: 500 },
    );
  }
}
