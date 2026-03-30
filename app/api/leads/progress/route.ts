import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getProgress } from "@/lib/progress-store";

// Encouraging messages based on progress stage
const progressMessages: Record<string, string[]> = {
  idle: ["Getting ready to find your perfect customers..."],
  fetching: [
    "Searching Reddit for potential customers...",
    "Scanning relevant communities...",
    "Finding posts from the last 5 days...",
    "Almost done fetching posts...",
  ],
  analyzing: [
    "🤖 AI is reading each post carefully...",
    "Analyzing post content for relevance...",
    "Checking if each post matches your product...",
    "Our AI is being very selective (only the best leads)...",
    "Found some promising matches! Analyzing more...",
    "Quality over quantity - finding perfect matches...",
    "AI is comparing posts with your product description...",
    "Almost done analyzing...",
  ],
  saving: [
    "Saving your new potential customers...",
    "Adding leads to your dashboard...",
    "Almost ready! Just saving...",
    "Finalizing your leads...",
  ],
  complete: [
    "✅ Done! Found great customers for you!",
    "Success! Your leads are ready!",
    "Perfect! Check out your new leads!",
  ],
};

// GET - Get current generation progress for user
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
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(payload.sub);
    const progress = getProgress(userId);

    if (!progress) {
      return NextResponse.json({
        stage: "idle",
        postsFound: 0,
        batchesAnalyzed: 0,
        totalBatches: 0,
        matchesFound: 0,
        message: "Getting ready to find your perfect customers...",
      });
    }

    // Calculate progress percentage
    let progressPercent = 0;
    if (progress.stage === "fetching") {
      progressPercent = 20;
    } else if (progress.stage === "analyzing" && progress.totalBatches > 0) {
      progressPercent =
        20 + (progress.batchesAnalyzed / progress.totalBatches) * 70;
    } else if (progress.stage === "saving") {
      progressPercent = 90;
    } else if (progress.stage === "complete") {
      progressPercent = 100;
    }

    // Get encouraging message based on progress
    const messages = progressMessages[progress.stage] || ["Working on it..."];
    const messageIndex = Math.min(
      Math.floor(progressPercent / 10),
      messages.length - 1,
    );
    const message = messages[messageIndex];

    return NextResponse.json({
      ...progress,
      progressPercent: Math.round(progressPercent),
      message: message,
    });
  } catch (err: any) {
    console.error("Get progress error:", err.message);
    return NextResponse.json(
      { error: "Failed to get progress", details: err.message },
      { status: 500 },
    );
  }
}
