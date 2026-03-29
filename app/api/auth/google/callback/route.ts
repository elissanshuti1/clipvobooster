import { google } from "googleapis";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    console.log("Google callback received code:", code ? "Yes" : "No");

    if (!code) {
      console.error("No code in callback");
      return NextResponse.redirect(new URL("/login?error=no_code", req.url));
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Got tokens from Google");

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log("Got user info:", userInfo.data.email);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("clipvobooster");
    const users = db.collection("users");

    // Find or create user
    let user = await users.findOne({ email: userInfo.data.email });

    if (!user) {
      // Create new user
      console.log("Creating new user:", userInfo.data.email);
      const result = await users.insertOne({
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        googleId: userInfo.data.id,
        createdAt: new Date(),
      });

      user = {
        _id: result.insertedId,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      };
    } else {
      // Update last login
      console.log("Updating existing user:", userInfo.data.email);
      await users.updateOne(
        { email: userInfo.data.email },
        {
          $set: {
            lastLogin: new Date(),
          },
        },
      );

      // Check if user is suspended
      if (user.isSuspended) {
        console.log("🚫 User is suspended:", userInfo.data.email);
        // Set token but redirect to suspended page
        const appToken = jwt.sign(
          { sub: String(user._id), email: user.email },
          process.env.JWT_SECRET as string,
          { expiresIn: "30d" },
        );

        const response = NextResponse.redirect(
          new URL("/account-suspended", req.url),
        );
        const maxAge = 30 * 24 * 60 * 60;

        response.cookies.set("token", appToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: maxAge,
          sameSite: "lax",
        });
        response.cookies.set("is_suspended", "true", {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60,
          sameSite: "lax",
        });

        return response;
      }
    }

    // Create JWT token for our app
    const appToken = jwt.sign(
      {
        sub: String(user._id),
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" },
    );

    console.log("Created JWT token, checking subscription");

    // Check if user has subscription
    const hasSubscription = !!user.subscription;

    // If user doesn't have subscription, mark them as free plan
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

    console.log("User has subscription:", hasSubscription);

    // Redirect based on subscription status
    const redirectPath = hasSubscription ? "/dashboard/overview" : "/pricing";
    const redirectUrl = new URL(redirectPath, req.url);
    redirectUrl.search = ""; // Clear any existing query params

    const response = NextResponse.redirect(redirectUrl);

    // Set HTTP-only cookie
    const maxAge = 30 * 24 * 60 * 60; // 30 days

    // Set cookie without domain restriction for localhost
    response.cookies.set("token", appToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAge,
      sameSite: "lax",
    });

    // Set subscription status cookie for middleware
    response.cookies.set("has_subscription", String(hasSubscription), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAge,
      sameSite: "lax",
    });

    console.log("Cookies set, redirecting to:", redirectPath);

    return response;
  } catch (err: any) {
    console.error("Google OAuth error:", err.message, err.stack);
    const errorUrl = new URL("/login", req.url);
    errorUrl.searchParams.set("error", "google_auth_failed");
    errorUrl.searchParams.set("message", err.message);
    return NextResponse.redirect(errorUrl);
  }
}
