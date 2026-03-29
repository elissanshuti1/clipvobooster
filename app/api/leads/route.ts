import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Get all leads for user
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

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const leads = db.collection("leads");

    // Get user's leads sorted by date
    const userLeads = await leads
      .find({ userId: String(payload.sub) })
      .sort({ createdAt: -1 })
      .toArray();

    // Group by date for "today's leads" feature
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leadsWithTodayFlag = userLeads.map((lead) => ({
      ...lead,
      isToday: new Date(lead.createdAt) >= today,
    }));

    return NextResponse.json(leadsWithTodayFlag);
  } catch (err: any) {
    console.error("Get leads error:", err.message);
    return NextResponse.json(
      { error: "Failed to get leads", details: err.message },
      { status: 500 },
    );
  }
}

// POST - Add new lead (save from Reddit search)
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

    const body = await req.json();
    const { title, author, subreddit, url, content, publishedAt, notes } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const leads = db.collection("leads");

    // Check if lead already exists (by URL or Reddit ID)
    const existing = await leads.findOne({
      url,
      userId: String(payload.sub),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Lead already saved", lead: existing },
        { status: 409 },
      );
    }

    const lead = {
      userId: String(payload.sub),
      title,
      author: author || "Unknown",
      subreddit: subreddit || "",
      url,
      content: content || "",
      publishedAt: publishedAt || null,
      notes: notes || "",
      status: "new", // new, contacted, converted, ignored
      contactedAt: null,
      convertedAt: null,
      createdAt: new Date(),
    };

    const result = await leads.insertOne(lead);

    return NextResponse.json({
      ...lead,
      _id: result.insertedId,
      message: "Lead saved successfully",
    });
  } catch (err: any) {
    console.error("Add lead error:", err.message);
    return NextResponse.json(
      { error: "Failed to save lead", details: err.message },
      { status: 500 },
    );
  }
}

// DELETE - Delete lead(s)
export async function DELETE(req: Request) {
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

    const url = new URL(req.url);
    const leadId = url.searchParams.get("id");
    const deleteAll = url.searchParams.get("all");

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const leads = db.collection("leads");

    if (deleteAll === "true") {
      // Delete ALL leads for this user
      await leads.deleteMany({ userId: String(payload.sub) });
      return NextResponse.json({ message: "All leads deleted successfully" });
    }

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    // Delete single lead
    await leads.deleteOne({
      _id: new ObjectId(leadId),
      userId: String(payload.sub),
    });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (err: any) {
    console.error("Delete lead error:", err.message);
    return NextResponse.json(
      { error: "Failed to delete lead", details: err.message },
      { status: 500 },
    );
  }
}

// PATCH - Update lead status
export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const leads = db.collection("leads");

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === "contacted") updateData.contactedAt = new Date();
    if (status === "converted") updateData.convertedAt = new Date();

    await leads.updateOne(
      { _id: new ObjectId(id), userId: String(payload.sub) },
      { $set: updateData },
    );

    return NextResponse.json({ message: "Lead updated successfully" });
  } catch (err: any) {
    console.error("Update lead error:", err.message);
    return NextResponse.json(
      { error: "Failed to update lead", details: err.message },
      { status: 500 },
    );
  }
}
