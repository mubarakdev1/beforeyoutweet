import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BeforeYouTweet — Analyze & Improve Your Tweets",
  description:
    "Paste your tweet, get a viral potential score, and improve it with AI before you post.",
  metadataBase: new URL("https://beforeyoutweet.app"),
  openGraph: {
    title: "BeforeYouTweet — Analyze & Improve Your Tweets",
    description:
      "Paste your tweet, get a viral potential score, and improve it with AI before you post.",
    url: "https://beforeyoutweet.app",
    siteName: "BeforeYouTweet",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeforeYouTweet — Analyze & Improve Your Tweets",
    description:
      "Score your tweet before you post it. Get AI-powered analysis and smart rewrites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
