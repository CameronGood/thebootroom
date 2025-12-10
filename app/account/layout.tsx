import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Access your saved ski boot results, view fitting breakdowns, and manage your account settings.",
  openGraph: {
    title: "My Account | TheBootRoom",
    description:
      "Access your saved ski boot results and view detailed fitting breakdowns.",
    url: `${siteUrl}/account`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Account - TheBootRoom",
      },
    ],
  },
  twitter: {
    title: "My Account | TheBootRoom",
    description: "Access your saved ski boot results and fitting breakdowns.",
  },
  alternates: {
    canonical: `${siteUrl}/account`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

