import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(req: Request) {
  try {
    // Verify admin authentication
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s: string) => s.trim())
      .find((s: string) => s.startsWith("admin_token="));
    const token = m ? m.split("=")[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from URL
    const url = new URL(req.url);
    const userId = url.pathname.split("/").slice(-2)[0];

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const ObjectId = require("mongodb").ObjectId;

    // Get user email before deleting
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add email to blocked list to prevent re-registration
    await db.collection("blocked_emails").updateOne(
      { email: user.email },
      {
        $set: {
          email: user.email,
          blockedAt: new Date(),
          blockedBy: payload.sub,
          reason: "deleted_by_admin",
        },
      },
      { upsert: true },
    );

    // Delete user and all related data
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
    await db.collection("sent_emails").deleteMany({ userId });
    await db.collection("email_clicks").deleteMany({ userId });
    await db.collection("notifications").deleteMany({ userId });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    console.error("Admin delete user error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
