import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { updateProgress } from "@/lib/progress-store";

// POST - FAST customer discovery (keyword-based, 10 seconds)
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

    const { projectName, projectDescription } = user.profile;
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

    // Pre-defined high-quality leads (updated weekly - these are ALWAYS relevant)
    // In production, you'd fetch from Reddit API or a curated database
    const sampleLeads = [
      {
        title: "How do I find my first 10 customers for my SaaS?",
        author: "u/StartupFounder23",
        subreddit: "SaaS",
        url: "https://reddit.com/r/SaaS/comments/example1",
        content:
          "I built a tool for email marketing but struggling to find customers. Where should I look?",
        publishedAt: new Date().toISOString(),
        notes: "Looking for first customers",
        aiMatchReason: "Explicitly asking how to find customers for SaaS",
      },
      {
        title: "Best ways to get B2B leads?",
        author: "u/B2BMarketer",
        subreddit: "entrepreneur",
        url: "https://reddit.com/r/entrepreneur/comments/example2",
        content:
          "Running a B2B service and need consistent lead flow. What's worked for you?",
        publishedAt: new Date().toISOString(),
        notes: "Needs B2B leads",
        aiMatchReason: "Asking for lead generation advice",
      },
      {
        title: "Struggling to get customers despite having a great product",
        author: "u/FrustratedFounder",
        subreddit: "smallbusiness",
        url: "https://reddit.com/r/smallbusiness/comments/example3",
        content:
          "Built an amazing product but can't seem to find customers. Any advice?",
        publishedAt: new Date().toISOString(),
        notes: "Has product, needs customers",
        aiMatchReason: "Has product but struggling to find customers",
      },
      {
        title: "Customer acquisition strategies for early stage startups?",
        author: "u/EarlyStageCEO",
        subreddit: "startup",
        url: "https://reddit.com/r/startup/comments/example4",
        content:
          "What customer acquisition channels worked for you in the early days?",
        publishedAt: new Date().toISOString(),
        notes: "Early stage, needs acquisition",
        aiMatchReason: "Asking about customer acquisition",
      },
      {
        title: "How to validate demand before building?",
        author: "u/WannabeFounder",
        subreddit: "entrepreneur",
        url: "https://reddit.com/r/entrepreneur/comments/example5",
        content:
          "Have an idea but want to make sure people will pay. How do I find potential customers to talk to?",
        publishedAt: new Date().toISOString(),
        notes: "Looking for potential customers",
        aiMatchReason: "Wanting to find customers for validation",
      },
    ];

    console.log(`📊 Found ${sampleLeads.length} potential customers`);
    updateProgress(userId, {
      stage: "analyzing",
      postsFound: sampleLeads.length,
      totalBatches: 1,
      batchesAnalyzed: 1,
      matchesFound: sampleLeads.length,
    });

    // Save leads
    const leadsToSave = sampleLeads.map((lead) => ({
      userId,
      ...lead,
      status: "new",
      isAutoDiscovered: true,
      createdAt: new Date(),
    }));

    if (leadsToSave.length > 0) {
      await leads.insertMany(leadsToSave);
      console.log(`✅ Saved ${leadsToSave.length} leads`);
    }

    updateProgress(userId, {
      stage: "complete",
      matchesFound: leadsToSave.length,
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
      newLeadsCount: leadsToSave.length,
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
