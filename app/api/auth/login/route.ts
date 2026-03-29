import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    // Check if user is suspended
    if (user.isSuspended) {
      return NextResponse.json(
        {
          error: "Account suspended",
          isSuspended: true,
          suspendedAt: user.suspendedAt,
        },
        { status: 403 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    // Set token expiration based on remember me
    const expiresIn = rememberMe ? "30d" : "3d";
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 3 * 24 * 60 * 60;

    const token = signToken(
      { sub: String(user._id), email: user.email },
      expiresIn,
    );

    // Check if user has subscription
    const hasSubscription = !!user.subscription;

    // If user doesn't have subscription, mark them as free plan (no subscription)
    if (!user.subscription) {
      await users.updateOne(
        { email: user.email },
        {
          $set: {
            plan: "free",
            updatedAt: new Date(),
          },
        },
      );
    }

    const resp = NextResponse.json({
      ok: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      hasSubscription,
    });
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    // Set token cookie
    resp.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`,
    );

    // Set subscription status cookie for middleware
    resp.headers.append(
      "Set-Cookie",
      `has_subscription=${hasSubscription}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`,
    );

    return resp;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 500 },
    );
  }
}
