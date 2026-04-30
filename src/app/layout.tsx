import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShaadiStyle AI - AI-Powered Wedding Outfit Finder",
  description: "Find the perfect outfit for every wedding function. AI-powered styling, price comparison, and personalized recommendations for Haldi, Mehendi, Sangeet, Wedding & Reception.",
  keywords: ["wedding outfits", "fashion styling", "price comparison", "AI recommendations", "Indian wedding"],
  authors: [{ name: "ShaadiStyle AI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#a855f7" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
