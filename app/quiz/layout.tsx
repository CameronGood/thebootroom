import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export const metadata: Metadata = {
  title: "Ski Boot Fitting Quiz",
  description:
    "Take our 10-step ski boot fitting quiz to find your perfect match. Answer questions about your foot measurements, skiing ability, and preferences to get personalized boot recommendations.",
  openGraph: {
    title: "Ski Boot Fitting Quiz | TheBootRoom",
    description:
      "Take our 10-step quiz to find your perfect ski boots. Get personalized recommendations based on your foot measurements and skiing ability.",
    url: `${siteUrl}/quiz`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ski Boot Fitting Quiz - TheBootRoom",
      },
    ],
  },
  twitter: {
    title: "Ski Boot Fitting Quiz | TheBootRoom",
    description:
      "Take our 10-step quiz to find your perfect ski boots. Get personalized recommendations in minutes.",
  },
  alternates: {
    canonical: `${siteUrl}/quiz`,
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

