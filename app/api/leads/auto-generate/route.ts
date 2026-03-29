import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import OpenAI from "openai";
import Parser from "rss-parser";
import { updateProgress } from "@/lib/progress-store";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const parser = new Parser();

// Target subreddits for B2B lead generation
const TARGET_SUBREDDITS = [
  "sales",
  "marketing",
  "entrepreneur",
  "smallbusiness",
  "SaaS",
  "B2B",
  "coldemail",
  "digitalmarketing",
  "growthhacking",
  "startup",
];

// POST - AI-powered customer discovery
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
      { projection: { profile: 1, email: 1 } },
    );

    if (!user?.profile?.projectDescription) {
      return NextResponse.json(
        {
          error: "Profile incomplete. Please complete your profile first.",
          hasProfile: false,
        },
        { status: 400 },
      );
    }

    const { projectName, projectDescription, targetAudience } = user.profile;

    console.log(`🎯 Finding customers for: ${projectName}`);
    console.log(`📝 Product: ${projectDescription.slice(0, 100)}...`);

    // Clear old leads before generating new ones (fresh start each day)
    console.log("🗑️ Clearing old leads...");
    await leads.deleteMany({ userId });
    console.log("✅ Old leads cleared");

    // Update progress: fetching
    updateProgress(userId, {
      stage: "fetching",
      postsFound: 0,
      batchesAnalyzed: 0,
      totalBatches: 0,
      matchesFound: 0,
    });

    // Get recent posts from Reddit (broad search)
    const recentPosts: any[] = [];

    for (const subreddit of TARGET_SUBREDDITS.slice(0, 6)) {
      try {
        const rssUrl = `https://www.reddit.com/r/${subreddit}/new.rss?limit=50`;

        const rssResponse = await fetch(rssUrl, {
          headers: {
            "User-Agent": "ClipVoBooster/1.0 (customer discovery tool)",
          },
        });

        if (!rssResponse.ok) continue;

        const rssText = await rssResponse.text();
        const feed = await parser.parseString(rssText);

        for (const item of feed.items.slice(0, 30)) {
          const postDate = new Date(
            item.pubDate || (item as any)["dc:date"] || Date.now(),
          );
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

          // Only posts from last 48 hours
          if (postDate >= twoDaysAgo) {
            recentPosts.push({
              title: item.title,
              content: (
                item.content ||
                item.summary ||
                (item as any).description ||
                ""
              ).slice(0, 1000),
              author: item.author || (item as any)["dc:creator"] || "Unknown",
              subreddit,
              url: item.link || item.guid,
              publishedAt: postDate.toISOString(),
            });
          }
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to fetch r/${subreddit}:`, err);
      }
    }

    console.log(`📊 Found ${recentPosts.length} recent posts to analyze`);

    // If no posts found, return error with details
    if (recentPosts.length === 0) {
      console.log("⚠️ No recent posts found in target subreddits");
      return NextResponse.json({
        error:
          "No recent posts found. Reddit might be rate limiting. Try again in a few minutes.",
        newLeadsCount: 0,
      });
    }

    // Update progress: found posts
    const totalBatches = Math.ceil(recentPosts.length / 10);
    updateProgress(userId, {
      stage: "analyzing",
      postsFound: recentPosts.length,
      totalBatches,
      batchesAnalyzed: 0,
      matchesFound: 0,
    });

    // Use AI to analyze posts and find potential customers
    const potentialCustomers: any[] = [];
    const seenUrls = new Set<string>();
    let totalAnalyzed = 0;
    let totalMatched = 0;

    // Analyze posts in batches of 10
    for (let i = 0; i < recentPosts.length; i += 10) {
      const batch = recentPosts.slice(i, i + 10);
      totalAnalyzed += batch.length;
      const batchNum = Math.floor(i / 10) + 1;

      console.log(
        `🔍 Analyzing batch ${batchNum}/${totalBatches} (${batch.length} posts)`,
      );

      try {
        const completion = await openai.chat.completions.create({
          model: "meta-llama/llama-3.2-3b-instruct",
          messages: [
            {
              role: "system",
              content: `Analyze the product description to understand what it does, then find Reddit posts where people need THIS TYPE of product.

Return JSON format:
{
  "posts": [
    {
      "url": "post url",
      "reason": "why this person needs this type of product"
    }
  ]
}

If no posts match, return: {"posts": []}`,
            },
            {
              role: "user",
              content: `PRODUCT:
Name: ${projectName}
Description: ${projectDescription}
Target: ${targetAudience || "Not specified"}

Find people who need this product:

${batch
  .map(
    (post, idx) => `
POST ${idx + 1}:
Title: ${post.title}
Content: ${post.content.slice(0, 500)}
URL: ${post.url}
---
`,
  )
  .join("\n")}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        });

        const aiResponse =
          completion.choices[0].message.content || '{"posts": []}';

        console.log(
          `🤖 AI Response for batch ${batchNum}:`,
          aiResponse.slice(0, 200),
        );

        try {
          // Extract JSON from markdown code blocks
          let jsonStr = aiResponse;
          const codeBlockMatch = aiResponse.match(
            /```(?:json)?\s*([\s\S]*?)```/,
          );
          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
          }

          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            console.log(`📊 Parsed AI response:`, parsed);

            if (Array.isArray(parsed.posts)) {
              for (const match of parsed.posts) {
                // Try to find matching post by URL
                let post = batch.find((p) => p.url === match.url);

                // If not found by exact URL, try partial match
                if (!post && match.url) {
                  const matchId = match.url.split("/").pop();
                  post = batch.find((p) => p.url.includes(matchId));
                }

                if (post && !seenUrls.has(post.url)) {
                  seenUrls.add(post.url);

                  // Check if already in database
                  const existing = await leads.findOne({ url: post.url });
                  if (!existing) {
                    const lead = {
                      userId,
                      title: post.title,
                      author: post.author,
                      subreddit: post.subreddit,
                      url: post.url,
                      content: post.content,
                      publishedAt: post.publishedAt,
                      notes: `AI Match: ${match.reason}`,
                      aiMatchReason: match.reason,
                      status: "new",
                      isAutoDiscovered: true,
                      matchScore: 1,
                      createdAt: new Date(),
                    };

                    await leads.insertOne(lead);
                    potentialCustomers.push(lead);
                    totalMatched++;
                    console.log(`✅ Matched: ${post.title.slice(0, 50)}...`);
                  }
                }
              }
            }
          }
        } catch (parseErr) {
          console.error("Failed to parse AI response:", parseErr);
        }
      } catch (aiError) {
        console.error("AI analysis failed for batch:", aiError);
      }

      // Update progress after each batch
      updateProgress(userId, {
        stage: "analyzing",
        batchesAnalyzed: batchNum,
        matchesFound: potentialCustomers.length,
      });

      // Rate limiting between batches
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`📊 Total posts analyzed: ${totalAnalyzed}`);
    console.log(`🎯 Total matches found: ${totalMatched}`);
    console.log(
      `✅ Saved ${potentialCustomers.length} new potential customers`,
    );

    // Fallback: If AI found nothing, try simple keyword matching from product description
    if (potentialCustomers.length === 0 && recentPosts.length > 0) {
      console.log(
        "🔄 AI found no matches, trying keyword fallback from product description...",
      );

      // Extract keywords from product description dynamically
      const descWords = projectDescription
        .toLowerCase()
        .split(/[\s,.-]+/)
        .filter(
          (w) =>
            w.length > 4 &&
            ![
              "about",
              "which",
              "their",
              "there",
              "where",
              "being",
              "having",
              "using",
              "would",
              "could",
              "should",
            ].includes(w),
        )
        .slice(0, 10);

      // Add "looking for" phrases
      const intentPhrases = [
        "looking for",
        "need help",
        "recommendation",
        "alternative",
        "how to",
      ];
      const fallbackKeywords = [...descWords, ...intentPhrases];

      console.log("🔑 Using fallback keywords:", fallbackKeywords);

      for (const post of recentPosts.slice(0, 50)) {
        const titleLower = post.title.toLowerCase();
        const contentLower = post.content.toLowerCase();

        // Check if post contains product-related keywords
        const hasKeyword = fallbackKeywords.some(
          (kw) => titleLower.includes(kw) || contentLower.includes(kw),
        );

        if (hasKeyword && !seenUrls.has(post.url)) {
          const existing = await leads.findOne({ url: post.url });
          if (!existing) {
            const lead = {
              userId,
              title: post.title,
              author: post.author,
              subreddit: post.subreddit,
              url: post.url,
              content: post.content,
              publishedAt: post.publishedAt,
              notes: "Keyword match fallback",
              aiMatchReason: `Post mentions: ${fallbackKeywords.slice(0, 3).join(", ")}`,
              status: "new",
              isAutoDiscovered: true,
              createdAt: new Date(),
            };
            await leads.insertOne(lead);
            potentialCustomers.push(lead);
            console.log(`🔄 Fallback matched: ${post.title.slice(0, 50)}...`);
          }
        }
      }
      console.log(`🔄 Fallback found ${potentialCustomers.length} total leads`);

      // Update progress
      updateProgress(userId, { matchesFound: potentialCustomers.length });
    }

    // Update progress: saving
    updateProgress(userId, {
      stage: "saving",
      matchesFound: potentialCustomers.length,
    });

    // Get total leads count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await leads.countDocuments({
      userId,
      createdAt: { $gte: today },
    });

    console.log(
      `✅ Found ${potentialCustomers.length} new potential customers`,
    );

    // Clear progress after completion
    setTimeout(() => {
      updateProgress(userId, {
        stage: "complete",
        matchesFound: potentialCustomers.length,
      });
    }, 2000);

    return NextResponse.json({
      success: true,
      newLeadsCount: potentialCustomers.length,
      totalLeadsToday: todayCount,
      postsAnalyzed: recentPosts.length,
      message:
        potentialCustomers.length > 0
          ? `Found ${potentialCustomers.length} high-quality potential customers!`
          : "No matching customers found in recent posts - try again later",
    });
  } catch (err: any) {
    console.error("AI customer discovery error:", err.message);
    return NextResponse.json(
      { error: "Failed to discover customers", details: err.message },
      { status: 500 },
    );
  }
}

// GET - Trigger customer discovery and return results
export async function GET(req: Request) {
  return POST(req);
}
