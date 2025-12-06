import HomePage from "@/app/[locale]/(public)/home-page-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PolyGo - Online Language & Cultural Exchange Platform",
  description:
    "Connect with language partners worldwide to practice speaking, enhance your skills, and explore new cultures together on PolyGo.",
  keywords: [
    "language exchange",
    "language learning",
    "cultural exchange",
    "language partners",
    "practice speaking",
    "learn languages online",
  ],
  authors: [{ name: "PolyGo Team" }],
  creator: "PolyGo",
  publisher: "PolyGo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://polygo-ivory.vercel.app",
    siteName: "PolyGo",
    title: "PolyGo - Online Language & Cultural Exchange Platform",
    description:
      "Connect with language partners worldwide to practice speaking, enhance your skills, and explore new cultures together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PolyGo - Language Exchange Platform",
      },
    ],
  },
  alternates: {
    canonical: "https://polygo-ivory.vercel.app",
    languages: {
      "en-US": "https://polygo-ivory.vercel.app/en",
      "vi-VN": "https://polygo-ivory.vercel.app/vi",
      "ja-JP": "https://polygo-ivory.vercel.app/ja",
    },
  },
  category: "Education",
};

export default async function Page() {
  return <HomePage />;
}
