const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thebootroom.com";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TheBootRoom",
    url: siteUrl,
    logo: `${siteUrl}/og-image.jpg`,
    description:
      "TheBootRoom helps you find the perfect ski boots through our data-driven fitting quiz. Get personalized recommendations based on your foot measurements, skiing ability, and preferences.",
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/thebootroom",
      // "https://facebook.com/thebootroom",
      // "https://instagram.com/thebootroom",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      // Add email when available
      // email: "support@thebootroom.com",
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TheBootRoom",
    url: siteUrl,
    description:
      "Find your perfect ski boots with our data-driven fitting quiz. Get personalized recommendations in minutes.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/quiz`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Ski Boot Fitting Service",
    provider: {
      "@type": "Organization",
      name: "TheBootRoom",
    },
    areaServed: {
      "@type": "Country",
      name: ["US", "UK", "EU"],
    },
    description:
      "Personalized ski boot matching service that analyzes your foot measurements, skiing ability, and preferences to recommend the best-fitting ski boots.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

