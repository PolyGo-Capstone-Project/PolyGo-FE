import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProvider, ThemeProvider, Toaster } from "@/components";
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
  title: "PolyGo",
  description: "Online Language & Cultural Exchange Platform",
  icons: {
    icon: "/public/globe.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppProvider>{children}</AppProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
