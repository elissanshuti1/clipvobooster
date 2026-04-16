import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

// Encouraging messages based on progress stage
const progressMessages: Record<string, string[]> = {
  idle: ["Getting ready to find your perfect customers..."],
  fetching: [
    "🔍 Searching Reddit for potential customers...",
    "🔍 Scanning relevant communities...",
  ],
  analyzing: [
    "🤖 AI is reading each post carefully...",
    "🤖 Analyzing posts for relevance to your product...",
    "🤖 Finding perfect matches only (quality over quantity)...",
    "🤖 Almost done analyzing...",
  ],
  saving: [
    "💾 Saving your new potential customers...",
    "💾 Finalizing your leads...",
  ],
  complete: [
    "✅ Done! Found great customers for you!",
    "✅ Success! Your leads are ready!",
  ],
};

// GET - Get current generation progress for user (reads from MongoDB)
export async function GET(req: Request) {
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
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(payload.sub);
    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const jobs = db.collection("lead_jobs");

    const job = await jobs.findOne({ userId });

    if (!job) {
      return NextResponse.json({
        stage: "idle",
        postsFound: 0,
        batchesAnalyzed: 0,
        totalBatches: 0,
        matchesFound: 0,
        progressPercent: 0,
        message: "Getting ready to find your perfect customers...",
      });
    }

    // Get encouraging message
    const messages = progressMessages[job.stage] || ["Working on it..."];
    const msgIndex = Math.min(
      Math.floor((job.progressPercent || 0) / 25),
      messages.length - 1,
    );
    const message = job.message || messages[msgIndex];

    return NextResponse.json({
      stage: job.stage,
      postsFound: job.postsFound || 0,
      batchesAnalyzed: job.currentBatch || 0,
      totalBatches: job.totalBatches || 0,
      matchesFound: job.matchesFound || 0,
      progressPercent: Math.round(job.progressPercent || 0),
      message: job.progressMessage || message,
      emoji: job.progressEmoji || "✨",
    });
  } catch (err: any) {
    console.error("Get progress error:", err.message);
    return NextResponse.json(
      { error: "Failed to get progress", details: err.message },
      { status: 500 },
    );
  }
}
