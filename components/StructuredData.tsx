"use client";

import { useEffect } from "react";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getServiceSchema,
} from "@/lib/seo/structuredData";

export default function StructuredData() {
  useEffect(() => {
    const organizationSchema = getOrganizationSchema();
    const websiteSchema = getWebSiteSchema();
    const serviceSchema = getServiceSchema();

    // Create and inject Organization schema
    const orgScript = document.createElement("script");
    orgScript.type = "application/ld+json";
    orgScript.id = "organization-schema";
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Create and inject WebSite schema
    const websiteScript = document.createElement("script");
    websiteScript.type = "application/ld+json";
    websiteScript.id = "website-schema";
    websiteScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(websiteScript);

    // Create and inject Service schema
    const serviceScript = document.createElement("script");
    serviceScript.type = "application/ld+json";
    serviceScript.id = "service-schema";
    serviceScript.text = JSON.stringify(serviceSchema);
    document.head.appendChild(serviceScript);

    // Cleanup function
    return () => {
      const orgEl = document.getElementById("organization-schema");
      const websiteEl = document.getElementById("website-schema");
      const serviceEl = document.getElementById("service-schema");
      if (orgEl) orgEl.remove();
      if (websiteEl) websiteEl.remove();
      if (serviceEl) serviceEl.remove();
    };
  }, []);

  return null;
}

