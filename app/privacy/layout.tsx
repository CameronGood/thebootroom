import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "TheBootRoom Privacy Policy - Learn how we collect, use, and protect your personal information when you use our ski boot matching service.",
  openGraph: {
    title: "Privacy Policy | TheBootRoom",
    description:
      "Learn how we collect, use, and protect your personal information when you use our ski boot matching service.",
    url: `${siteUrl}/privacy`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Privacy Policy - TheBootRoom",
      },
    ],
  },
  twitter: {
    title: "Privacy Policy | TheBootRoom",
    description:
      "Learn how we collect, use, and protect your personal information.",
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

