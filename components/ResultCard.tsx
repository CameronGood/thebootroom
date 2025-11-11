"use client";

import { BootSummary, Region } from "@/types";
import { useAuth } from "@/lib/auth";
import { useRegion } from "@/lib/region";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

interface Props {
  boot: BootSummary;
  sessionId?: string;
  index?: number;
  recommendedSize?: string;
  footLength?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
}

export default function ResultCard({
  boot,
  sessionId,
  index = 0,
  recommendedSize,
  footLength,
  shoeSize,
}: Props) {
  const { user } = useAuth();
  const { region, setRegion } = useRegion();
  const [saving, setSaving] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  // Get available links for current region, or fallback to US
  const currentRegion: Region = region || "US";
  const availableLinks = boot.links?.[currentRegion] || boot.links?.US || [];
  const hasMultipleVendors = availableLinks.length > 1;
  const hasLegacyUrl = !availableLinks.length && boot.affiliateUrl;

  const handleBuy = (vendor?: string, linkUrl?: string) => {
    const params = new URLSearchParams({ bootId: boot.bootId });
    if (sessionId) params.append("sessionId", sessionId);
    if (user) params.append("userId", user.uid);

    // If using new links structure
    if (vendor && region) {
      params.append("vendor", vendor);
      params.append("region", region);
    }

    // If direct URL provided (for legacy or single vendor)
    if (linkUrl) {
      window.open(linkUrl, "_blank");
      return;
    }

    window.open(`/api/redirect?${params.toString()}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        {boot.imageUrl && (
          <motion.div
            className="aspect-square bg-gray-100 overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={boot.imageUrl}
              alt={`${boot.brand} ${boot.model}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{boot.brand}</h3>
              <p className="text-lg text-gray-700">{boot.model}</p>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <Badge variant="default" className="text-xs">
              Match: {boot.score.toFixed(1)}/100
            </Badge>
            {recommendedSize && (
              <div className="pt-1">
                <div className="text-lg font-medium text-gray-700">
                  Recommended Size:{" "}
                  <span className="text-blue-600 font-bold">
                    {recommendedSize}
                  </span>
                </div>
                {footLength && (
                  <div className="text-xs text-gray-500 mt-1">
                    Foot Length: {footLength.left}mm (left) • {footLength.right}
                    mm (right)
                  </div>
                )}
                {shoeSize && !footLength && (
                  <div className="text-xs text-gray-500 mt-1">
                    Shoe Size: {shoeSize.system} {shoeSize.value}
                  </div>
                )}
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  {boot.bootType && (
                    <div>
                      Type: <span className="font-medium">{boot.bootType}</span>
                    </div>
                  )}
                  {boot.lastWidthMM && boot.lastWidthMM > 0 && (
                    <div>
                      Width:{" "}
                      <span className="font-medium">{boot.lastWidthMM}mm</span>
                    </div>
                  )}
                  <div>
                    Flex: <span className="font-medium">{boot.flex}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          {/* Region Selector */}
          {hasMultipleVendors && (
            <div className="mb-4">
              <button
                onClick={() => setShowRegionSelector(!showRegionSelector)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <Globe className="w-4 h-4" />
                <span>Shopping from: {currentRegion}</span>
              </button>
              {showRegionSelector && (
                <div className="mt-2 flex gap-2">
                  {(["UK", "US", "EU"] as Region[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRegion(r);
                        setShowRegionSelector(false);
                      }}
                      className={`px-3 py-1 text-xs rounded-lg transition ${
                        currentRegion === r
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {/* Multiple Vendor Links */}
          {hasMultipleVendors ? (
            <div className="w-full space-y-2">
              {availableLinks
                .filter((link) => link.available !== false)
                .map((link, i) => (
                  <motion.a
                    key={i}
                    href={`/api/redirect?bootId=${boot.bootId}&region=${currentRegion}&vendor=${encodeURIComponent(link.store)}${sessionId ? `&sessionId=${sessionId}` : ""}${user ? `&userId=${user.uid}` : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleBuy(link.store);
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full"
                  >
                    {link.logo && (
                      <img
                        src={link.logo}
                        alt={link.store}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span className="font-medium">Buy from {link.store}</span>
                  </motion.a>
                ))}
            </div>
          ) : hasLegacyUrl ? (
            // Legacy single affiliate URL
            <Button
              onClick={() => handleBuy(undefined, boot.affiliateUrl)}
              className="w-full"
              size="lg"
            >
              Buy Now
            </Button>
          ) : (
            // No affiliate links available
            <Button disabled className="w-full" size="lg">
              No retailers available
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
