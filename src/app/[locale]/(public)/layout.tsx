import { Footer, Header } from "@/components";
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL("https://polygo-ivory.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "vi-VN": "/vi",
      "ja-JP": "/ja",
    },
  },
  category: "Education",
};

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4 py-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
