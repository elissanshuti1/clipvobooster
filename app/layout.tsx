import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNav from "@/app/components/ConditionalNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ClipVoBooster - AI Marketing & Growth Platform",
  description: "Automate marketing, launch ads, and track revenue with our AI-powered platform. The all-in-one solution for business growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" style={{ background: '#08090d' }}>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#08090d] text-[#dde1e9] min-h-screen flex flex-col`}
        style={{ background: '#08090d', color: '#dde1e9' }}
      >
        <ConditionalNav />
        {/* The flex-grow ensures the footer stays at bottom if content is short */}
        <main className="flex-grow w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
