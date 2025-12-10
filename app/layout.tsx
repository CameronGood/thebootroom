import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { RegionProvider } from "@/lib/region";
import { Toaster } from "react-hot-toast";
import StructuredData from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TheBootRoom - Find Your Perfect Ski Boots",
    template: "%s | TheBootRoom",
  },
  description:
    "Match with the best-fitting ski boots via our quick fitting form. Get personalized ski boot recommendations based on your foot measurements, skiing ability, and preferences. Find your perfect fit in minutes.",
  keywords: [
    "ski boot fitting",
    "find ski boots",
    "ski boot matcher",
    "ski boot quiz",
    "ski boot recommendations",
    "ski boot finder",
    "ski boot sizing",
    "ski boot guide",
  ],
  authors: [{ name: "TheBootRoom" }],
  creator: "TheBootRoom",
  publisher: "TheBootRoom",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TheBootRoom",
    title: "TheBootRoom - Find Your Perfect Ski Boots",
    description:
      "Match with the best-fitting ski boots via our quick fitting form. Get personalized recommendations based on your foot measurements and skiing ability.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TheBootRoom - Find Your Perfect Ski Boots",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheBootRoom - Find Your Perfect Ski Boots",
    description:
      "Match with the best-fitting ski boots via our quick fitting form. Get personalized recommendations in minutes.",
    images: ["/og-image.jpg"],
    creator: "@thebootroom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        <AuthProvider>
          <RegionProvider>
            {children}
            <Toaster position="top-right" />
          </RegionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
