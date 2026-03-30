import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import clientPromise from "@/lib/mongodb";

// Initialize OpenRouter client
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://clipvo.site",
    "X-OpenRouter-Title": "ClipVo Email",
  },
});

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
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new (require("mongodb").ObjectId)(payload.sub) },
      { projection: { profile: 1, name: 1, email: 1 } },
    );

    const profile = user?.profile || {};
    const senderName = user?.name || profile?.projectName || "The Team";
    const senderEmail = user?.email;
    const senderWebsite = profile?.projectUrl;

    const body = await req.json();
    let {
      recipientName,
      recipientEmail,
      productName,
      productDescription,
      productUrl,
      tone,
    } = body;

    // Auto-fill from profile
    if (!productName) productName = profile.projectName || "Our Product";
    if (!productDescription)
      productDescription =
        profile.projectDescription || "a solution for your business";
    if (!productUrl) productUrl = profile.projectUrl || senderWebsite;

    console.log("📧 Generating email for:", productName);
    console.log("📝 Product:", productDescription);

    // Extract key benefits from product description
    const descLower = productDescription.toLowerCase();
    let benefit = "save time and grow your business";
    if (descLower.includes("stock") || descLower.includes("inventory")) {
      benefit = "cut inventory management time by 60% and eliminate stockouts";
    } else if (descLower.includes("sell") || descLower.includes("sales")) {
      benefit = "increase sales by 40% with better customer tracking";
    } else if (descLower.includes("email") || descLower.includes("marketing")) {
      benefit = "generate 3x more leads with personalized outreach";
    }

    // Create prompt for PROFESSIONAL, persuasive email
    const emailPrompt = `You are writing a PROFESSIONAL COLD OUTREACH EMAIL that gets REPLIES.

SENDER:
- Name: ${senderName}
- Product: ${productName}
- Description: ${productDescription}
- Website: ${productUrl}

RECIPIENT: ${recipientName || "Valued Professional"}

YOUR GOAL: Write a compelling, professional email that makes the recipient WANT to respond.

RULES:
1. 150-200 words (substantial but not overwhelming)
2. Professional yet warm tone
3. Focus on THEIR pain points and how you solve them
4. Include specific benefits and outcomes
5. Add social proof (results others achieved)
6. Clear, low-pressure call-to-action
7. NO spammy phrases ("I hope this finds you well", "I came across your company")
8. NO placeholders like [Name] or [Company]

Write a COMPLETE, PROFESSIONAL email that sounds human and gets results.`;

    // Call OpenRouter API
    const completion = await openrouter.chat.completions.create({
      model: "google/gemma-2-9b-it",
      messages: [{ role: "user", content: emailPrompt }],
      max_tokens: 400,
      temperature: 0.7,
    });

    let emailContent = completion.choices[0].message?.content || "";

    // Clean up
    emailContent = emailContent
      .replace(/```/g, "")
      .replace(/^\s*Subject:.*$/im, "")
      .replace(/\[Name\]/gi, recipientName || "there")
      .replace(/\[Company\]/gi, "your company")
      .trim();

    // If has placeholders or too short, use fallback
    if (emailContent.includes("[") || emailContent.length < 100) {
      emailContent = `Dear ${recipientName || "Valued Professional"},

I hope you're having a great week!

I'm reaching out because I believe ${productName} could be a game-changer for your business. ${productDescription}

Here's how we help businesses like yours:
• ${benefit}
• Streamlined operations that free up your time
• Real-time insights to make better decisions

Several of our users have already seen remarkable results - one business owner told us they "couldn't imagine running their business without it."

I'd love to show you how ${productName} can help you achieve similar results. Would you be open to a quick 10-minute chat this week?

Alternatively, feel free to explore our features at ${productUrl}.

Looking forward to connecting!

Warm regards,
${senderName}
${senderWebsite ? "Founder, " + productName : ""}`;
    }

    // Generate subject line based on product type
    let subjectContext = "grow your business";
    if (descLower.includes("stock") || descLower.includes("inventory")) {
      subjectContext = "manage inventory better";
    } else if (descLower.includes("sell") || descLower.includes("sales")) {
      subjectContext = "increase sales";
    } else if (descLower.includes("email") || descLower.includes("marketing")) {
      subjectContext = "generate more leads";
    }

    const subjectOptions = [
      `Quick question about your business`,
      `Idea to help you ${subjectContext}`,
      `${productName} - might be perfect for you`,
      `Saw what you're doing - had to reach out`,
      `This could save you 10+ hours/week`,
    ];

    const subjectLine =
      subjectOptions[Math.floor(Math.random() * subjectOptions.length)];

    console.log("✅ Generated email:", emailContent.substring(0, 150));
    console.log("📧 Subject:", subjectLine);

    return NextResponse.json({
      subject: subjectLine,
      body: emailContent,
      message: "Email generated!",
    });
  } catch (err: any) {
    console.error("Generate email error:", err.message);

    const body = await req.json().catch(() => ({}));
    const { recipientName, productName, productDescription } = body;

    // Fallback template
    return NextResponse.json({
      subject: `Quick question about ${productName || "our product"}`,
      body: `Hi ${recipientName || "there"},

I hope you're doing well!

I wanted to introduce you to ${productName || "our solution"} - ${productDescription || "a tool that helps businesses like yours grow faster"}.

Would you be open to a quick 10-min chat to see if we can help?

Best regards`,
      message: "AI unavailable - using template",
      error: err.message,
    });
  }
}
