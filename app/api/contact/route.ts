import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: Number(process.env.BREVO_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();

    // Send email to support
    await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || "ClipVoBooster"}" <${process.env.BREVO_SENDER_EMAIL || "noreply@clipvo.site"}>`,
      to: "trivora00@gmail.com",
      replyTo: email,
      subject: `[Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1; margin-bottom: 20px;">New Support Request</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">This message was sent from the ClipVoBooster support form.</p>
            <p style="margin: 5px 0 0 0;">Reply directly to this email to respond to ${email}</p>
          </div>
        </div>
      `,
      text: `
New Support Request

From: ${name}
Email: ${email}
Subject: ${subject}

---

${message}

---
This message was sent from the ClipVoBooster support form.
Reply to this email to respond to ${email}
      `,
    });

    // Send auto-reply to user
    try {
      await transporter.sendMail({
        from: `"${process.env.BREVO_SENDER_NAME || "ClipVoBooster"}" <${process.env.BREVO_SENDER_EMAIL || "noreply@clipvo.site"}>`,
        to: email,
        subject: "We received your message - ClipVoBooster Support",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1; margin-bottom: 20px;">Thanks for contacting us, ${name}!</h2>
            
            <p style="line-height: 1.6; color: #374151; margin-bottom: 20px;">
              We've received your message and our support team will get back to you within 24 hours.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 0;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p style="line-height: 1.6; color: #374151; margin-bottom: 20px;">
              In the meantime, you might find answers in our FAQ section or help documentation.
            </p>
            
            <div style="background: #6366f1; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px;">ClipVoBooster Support Team</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">trivora00@gmail.com</p>
            </div>
          </div>
        `,
        text: `
Hi ${name},

Thanks for contacting ClipVoBooster Support!

We've received your message about: ${subject}

Our team will get back to you within 24 hours.

In the meantime, you might find answers in our FAQ section or help documentation.

Best regards,
ClipVoBooster Support Team
trivora00@gmail.com
        `,
      });
    } catch (autoReplyError) {
      // Auto-reply failed, but main email was sent - log but don't fail
      console.error("Auto-reply email failed:", autoReplyError);
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
