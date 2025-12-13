import type { Metadata } from "next";
import { Suspense } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export const metadata: Metadata = {
  title: "Your Ski Boot Matches",
  description:
    "View your personalized ski boot recommendations. Compare top matches, see detailed fitting information, and find the best prices from trusted retailers.",
  openGraph: {
    title: "Your Ski Boot Matches | TheBootRoom",
    description:
      "View your personalized ski boot recommendations. Compare top matches and find the best prices.",
    url: `${siteUrl}/results`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ski Boot Matches - TheBootRoom",
      },
    ],
  },
  twitter: {
    title: "Your Ski Boot Matches | TheBootRoom",
    description:
      "View your personalized ski boot recommendations. Compare top matches and find the best prices.",
  },
  alternates: {
    canonical: `${siteUrl}/results`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

