import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import clientPromise from "@/lib/mongodb";

// GET - Get all templates for user
export async function GET(req: Request) {
  try {
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("token="));
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

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const templates = db.collection("templates");

    // Get user's templates + system presets
    const [userTemplates, systemTemplates] = await Promise.all([
      templates.find({ userId: payload.sub }).toArray(),
      templates.find({ isPreset: true }).toArray(),
    ]);

    return NextResponse.json({
      templates: [...systemTemplates, ...userTemplates],
    });
  } catch (err: any) {
    console.error("Get templates error:", err.message);
    return NextResponse.json(
      { error: "Failed to get templates", details: err.message },
      { status: 500 },
    );
  }
}

// POST - Create new template
export async function POST(req: Request) {
  try {
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("token="));
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

    const { name, subject, body } = await req.json();

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const templates = db.collection("templates");
    const users = db.collection("users");

    // Get user's plan
    const user = await users.findOne(
      { _id: new (require("mongodb").ObjectId)(payload.sub) },
      { projection: { subscription: 1 } },
    );

    const plan = user?.subscription?.plan || "free";

    // Check template limit based on plan
    const templateLimits: Record<string, number> = {
      free: 0,
      starter: 5,
      professional: 999999, // unlimited
      business: 999999,
    };

    const limit = templateLimits[plan] || 0;
    const currentCount = await templates.countDocuments({
      userId: payload.sub,
      isPreset: false,
    });

    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: `Template limit reached for ${plan} plan. Upgrade to save more templates.`,
        },
        { status: 403 },
      );
    }

    await templates.insertOne({
      userId: payload.sub,
      name,
      subject,
      body,
      isPreset: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Template saved successfully" });
  } catch (err: any) {
    console.error("Save template error:", err.message);
    return NextResponse.json(
      { error: "Failed to save template", details: err.message },
      { status: 500 },
    );
  }
}

// DELETE - Delete template
export async function DELETE(req: Request) {
  try {
    const cookie = (req as any).headers.get("cookie") || "";
    const m = cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("token="));
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

    const url = new URL(req.url);
    const templateId = url.searchParams.get("id");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const templates = db.collection("templates");

    await templates.deleteOne({
      _id: new (require("mongodb").ObjectId)(templateId),
      userId: payload.sub,
    });

    return NextResponse.json({ message: "Template deleted" });
  } catch (err: any) {
    console.error("Delete template error:", err.message);
    return NextResponse.json(
      { error: "Failed to delete template", details: err.message },
      { status: 500 },
    );
  }
}
