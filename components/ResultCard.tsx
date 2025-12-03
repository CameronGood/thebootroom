"use client";

import { BootSummary, Region } from "@/types";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { useRegion } from "@/lib/region";
import { useAuth } from "@/lib/auth";

// Flag SVG URLs for regions (Twemoji CDN)
const regionFlags: Record<Region, { src: string; alt: string }> = {
  UK: {
    src: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ec-1f1e7.svg",
    alt: "UK Flag",
  },
  US: {
    src: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1fa-1f1f8.svg",
    alt: "US Flag",
  },
  EU: {
    src: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f1ea-1f1fa.svg",
    alt: "EU Flag",
  },
};

interface Props {
  boot: BootSummary;
  sessionId?: string;
  index?: number;
  recommendedSize?: string;
  footLength?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  isCompareMode?: boolean;
  onToggleCompareMode?: () => void;
  modelsVisible?: boolean;
  onToggleModelsVisibility?: () => void;
  selectedModels?: Set<number>;
  onUpdateSelectedModels?: (bootId: string, modelIndices: Set<number>) => void;
  onPurchaseComparison?: () => void;
}

export default function ResultCard({
  boot,
  sessionId,
  index = 0,
  recommendedSize,
  footLength,
  shoeSize,
  isCompareMode = false,
  onToggleCompareMode,
  modelsVisible: modelsVisibleProp,
  onToggleModelsVisibility,
  selectedModels: selectedModelsProp,
  onUpdateSelectedModels,
  onPurchaseComparison,
}: Props) {
  const { region, loading: regionLoading } = useRegion();
  const { user } = useAuth();
  const globalRegion: Region = region || "US";
  
  // Local region state for this card (can be different from global)
  // Initialize with global region, but allow user to override
  const [localRegion, setLocalRegion] = useState<Region | null>(null);
  
  // Update local region when global region is detected (only if not manually set)
  useEffect(() => {
    if (!regionLoading && globalRegion && localRegion === null) {
      setLocalRegion(globalRegion);
    }
  }, [globalRegion, regionLoading, localRegion]);
  
  // Initialize with global region if available, otherwise default to US
  const currentRegion = localRegion || globalRegion;
  
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  // Sort models and get the top model (highest flex, then alphabetical)
  const sortedModels = useMemo(() => {
    if (!boot.models || boot.models.length === 0) return [];
    return [...boot.models].sort((a, b) => {
      const flexA = Number(a.flex) || 0;
      const flexB = Number(b.flex) || 0;
      const flexDiff = flexB - flexA;
      if (flexDiff !== 0) return flexDiff;
      return (a.model || "").localeCompare(b.model || "");
    });
  }, [boot.models]);

  // Set the top model (first in sorted list) as default selected
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(
    sortedModels.length > 0 ? 0 : null
  );

  // Use local state for individual card's models visibility
  // Only use shared state when in compare mode
  const [localModelsVisible, setLocalModelsVisible] = useState(false);
  const modelsVisible = isCompareMode && modelsVisibleProp !== undefined 
    ? modelsVisibleProp 
    : localModelsVisible;
  
  // Use prop if provided, otherwise use local state
  const [localSelectedModels, setLocalSelectedModels] = useState<Set<number>>(() => {
    const initialSet = new Set<number>();
    sortedModels.forEach((_, i) => initialSet.add(i));
    return initialSet;
  });
  
  const selectedForCompare = selectedModelsProp !== undefined 
    ? selectedModelsProp 
    : localSelectedModels;
  
  const setSelectedForCompare = (newSet: Set<number>) => {
    if (onUpdateSelectedModels) {
      onUpdateSelectedModels(boot.bootId, newSet);
    } else {
      setLocalSelectedModels(newSet);
    }
  };

  // When compare mode is first activated, ensure all models are selected
  useEffect(() => {
    if (isCompareMode && sortedModels.length > 0) {
      const allSelected = new Set<number>();
      sortedModels.forEach((_, i) => allSelected.add(i));
      // Only update if not already all selected (check if any are missing)
      const hasAllSelected = allSelected.size === selectedForCompare.size && 
        Array.from(allSelected).every(i => selectedForCompare.has(i));
      if (!hasAllSelected) {
        setSelectedForCompare(allSelected);
      }
    }
    // Only run when compare mode is activated or models change, not when selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompareMode, sortedModels.length]);

  // Get affiliate links for the selected model
  const selectedModelLinks = useMemo(() => {
    if (selectedModelIndex === null) return [];
    
    const selectedModel = sortedModels[selectedModelIndex];
    if (!selectedModel) return [];

    // If the model has its own affiliateUrl (legacy), return empty array (we'll handle it separately)
    if (selectedModel.affiliateUrl) {
      return [];
    }

    // Otherwise, use the boot's links structure for the local region
    const regionToUse = localRegion || globalRegion;
    return boot.links?.[regionToUse] || boot.links?.US || [];
  }, [selectedModelIndex, sortedModels, boot.links, localRegion, globalRegion]);

  // Check if selected model has legacy affiliateUrl
  const selectedModelLegacyUrl = useMemo(() => {
    if (selectedModelIndex === null) return null;
    const selectedModel = sortedModels[selectedModelIndex];
    return selectedModel?.affiliateUrl || null;
  }, [selectedModelIndex, sortedModels]);

  // Handle affiliate link click
  const handleBuy = (vendor?: string, linkUrl?: string) => {
    const params = new URLSearchParams({ bootId: boot.bootId });
    if (sessionId) params.append("sessionId", sessionId);
    if (user) params.append("userId", user.uid);

    // If using new links structure
    if (vendor && currentRegion) {
      params.append("vendor", vendor);
      params.append("region", currentRegion);
    }

    // If direct URL provided (for legacy or single vendor)
    if (linkUrl) {
      window.open(linkUrl, "_blank");
      return;
    }

    window.open(`/api/redirect?${params.toString()}`, "_blank");
  };

  // Get the current image URL - use selected model's image if available, otherwise use boot's image
  const currentImageUrl = useMemo(() => {
    if (selectedModelIndex !== null && sortedModels[selectedModelIndex]?.imageUrl) {
      return sortedModels[selectedModelIndex].imageUrl;
    }
    return boot.imageUrl;
  }, [boot.imageUrl, selectedModelIndex, sortedModels]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="h-full"
      id={boot.bootId}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl border-[#F5E4D0]/20 transition-all duration-300 bg-[#2B2D30]/70">
        {/* 1. Image with Match Score Overlay */}
        {currentImageUrl && (
          <motion.div
            className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative border-b border-gray-200"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              key={currentImageUrl}
              src={currentImageUrl}
              alt={`${boot.brand} ${boot.model}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Match Score - Top Right Overlay */}
            <div className="absolute top-3 right-3">
              <Badge 
                variant="default" 
                onClick={() => {
                  const breakdownSection = document.getElementById('fitting-breakdown');
                  if (breakdownSection) {
                    const headerHeight = 120; // Header height with padding to ensure full visibility
                    const elementPosition = breakdownSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className="text-sm font-semibold px-3 py-1.5 shadow-lg bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 rounded-md text-[#F5E4D0] cursor-pointer hover:bg-[#2B2D30] transition-colors"
              >
                Match: {Math.floor(boot.score)}
              </Badge>
            </div>
          </motion.div>
        )}
        
        <CardHeader className="px-8 py-6">
          {/* Brand and Range - Primary hierarchy, grouped together */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-[#F5E4D0] leading-tight mb-1">
              <EncryptedText 
                text={boot.brand}
                duration={800}
                revealDelay={200}
                className="text-4xl font-bold"
              />
            </p>
            <p className="text-2xl font-bold text-[#F5E4D0]/80 leading-tight">
              <EncryptedText 
                text={boot.model}
                duration={1000}
                revealDelay={600}
                className="text-2xl font-bold"
              />
            </p>
          </div>

          {/* Size - Secondary information */}
          {recommendedSize && (
            <div className="mb-6 flex justify-between items-center">
              <span className="text-base font-semibold text-white">
                Recommended Size:
              </span>
              <span className="text-base font-bold text-[#F5E4D0]">
                <EncryptedText 
                  text={recommendedSize}
                  duration={600}
                  revealDelay={1200}
                  className="text-base font-bold"
                />
              </span>
            </div>
          )}

          {/* Models - Tertiary information */}
          {sortedModels.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    // Only use local state for individual card toggle
                    // Shared state is only used when in compare mode
                    if (!isCompareMode) {
                      setLocalModelsVisible(!localModelsVisible);
                    } else if (onToggleModelsVisibility) {
                      onToggleModelsVisibility();
                    }
                  }}
                  className="text-base font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
                >
                  View Models:
                </button>
                <button
                  onClick={() => {
                    // Only use local state for individual card toggle
                    // Shared state is only used when in compare mode
                    if (!isCompareMode) {
                      setLocalModelsVisible(!localModelsVisible);
                    } else if (onToggleModelsVisibility) {
                      onToggleModelsVisibility();
                    }
                  }}
                  className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
                  title={modelsVisible ? "Hide models" : "Show models"}
                >
                  {modelsVisible ? (
                    <ChevronUp className="w-5 h-5 text-[#F5E4D0]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#F5E4D0]" />
                  )}
                </button>
              </div>
              {modelsVisible && (
                <ul className="space-y-2 mb-4">
                  {sortedModels.map((m, i) => {
                    const isSelected = selectedModelIndex === i;
                    const isSelectedForCompare = selectedForCompare.has(i);
                    return (
                      <li key={i}>
                        <Badge 
                          variant="secondary" 
                          onClick={() => setSelectedModelIndex(i)}
                          className={`text-base px-3 py-1.5 cursor-pointer rounded-md relative ${
                            isSelected
                              ? "bg-[#F5E4D0]/70 text-[#2B2D30] border-[#F5E4D0]/70 font-bold hover:bg-[#F5E4D0]/70 hover:text-[#2B2D30] hover:border-[#F5E4D0]/70"
                              : "text-[#F4F4F4] bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors"
                          }`}
                        >
                          <span className={isCompareMode ? "pr-6" : ""}>{m.model}</span>
                          {/* Compare Mode Checkbox - Inside badge, aligned right */}
                          {isCompareMode && (
                            <input
                              type="checkbox"
                              checked={isSelectedForCompare}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newSet = new Set(selectedForCompare);
                                if (e.target.checked) {
                                  newSet.add(i);
                                } else {
                                  newSet.delete(i);
                                }
                                setSelectedForCompare(newSet);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded border-[#F5E4D0] bg-[#2B2D30] text-[#F5E4D0] focus:ring-[#F5E4D0] focus:ring-2 cursor-pointer"
                            />
                          )}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Available at section - shown when a model is selected */}
              {selectedModelIndex !== null && (selectedModelLinks.length > 0 || selectedModelLegacyUrl) && (
                <div className="mt-4 pt-4 border-t border-[#F5E4D0]/10">
                  <div className="flex items-center justify-between mb-3 relative">
                    <h4 className="text-base font-semibold text-white">
                      Available at:
                    </h4>
                    <button
                      onClick={() => setShowRegionSelector(!showRegionSelector)}
                      className="hover:opacity-70 transition-opacity cursor-pointer flex items-center"
                      title={`Change region (currently ${currentRegion})`}
                    >
                      <img
                        src={regionFlags[currentRegion]?.src}
                        alt={regionFlags[currentRegion]?.alt || `${currentRegion} Flag`}
                        className="inline w-5 h-5 align-text-bottom"
                      />
                    </button>
                    {/* Region Selector Dropdown */}
                    {showRegionSelector && (
                      <div className="absolute top-full right-0 mt-2 bg-[#2B2D30] border border-[#F5E4D0]/20 rounded-md shadow-lg z-10 p-2 flex flex-col gap-1">
                        {(["UK", "US", "EU"] as Region[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setLocalRegion(r);
                              setShowRegionSelector(false);
                            }}
                            className={`px-3 py-2 text-sm rounded-md transition flex items-center gap-2 ${
                              currentRegion === r
                                ? "bg-[#F5E4D0]/20 text-[#F5E4D0]"
                                : "text-[#F4F4F4] hover:bg-[#F5E4D0]/10"
                            }`}
                          >
                            <img
                              src={regionFlags[r]?.src}
                              alt={regionFlags[r]?.alt || `${r} Flag`}
                              className="inline w-5 h-5 align-text-bottom"
                            />
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* Multiple vendor links */}
                    {selectedModelLinks.length > 0 && selectedModelLinks
                      .filter((link: { available?: boolean }) => link.available !== false)
                      .map((link: { store: string; url: string; available?: boolean }, i: number) => (
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
                          className="text-base px-3 py-1.5 rounded-md bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 text-[#F4F4F4] hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors text-left"
                        >
                          {link.store}
                        </motion.a>
                      ))}
                    
                    {/* Legacy single affiliate URL */}
                    {selectedModelLegacyUrl && (
                      <motion.a
                        href={selectedModelLegacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleBuy(undefined, selectedModelLegacyUrl);
                        }}
                        whileHover={{ scale: 1.02 }}
                        className="text-base px-3 py-1.5 rounded-md bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 text-[#F4F4F4] hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors text-left"
                      >
                        View Product
                      </motion.a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-grow flex flex-col justify-end pt-0 pb-6 px-8">
          {/* Fit Breakdown & Comparison Section - shown when in compare mode */}
          {isCompareMode && (
            <div className="mb-4 pb-4 border-b border-[#F5E4D0]/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">
                  Comparison Includes:
                </h4>
                <button
                  onClick={() => {
                    if (onToggleCompareMode) {
                      onToggleCompareMode();
                    }
                  }}
                  className="w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer text-white"
                  title="Exit compare mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-0.5 text-sm text-[#F4F4F4]/80 leading-relaxed">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Breakdown of your Match Score</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Boot-to-Boot Comparison</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Help selecting the correct Flex</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Fitting Advise to get the most out your boots.</span>
                </li>
              </ul>
            </div>
          )}
          
          <div className="flex items-center gap-6">
            <Button
              onClick={() => {
                if (isCompareMode && onPurchaseComparison) {
                  // In compare mode, trigger purchase comparison
                  onPurchaseComparison();
                } else if (onToggleCompareMode) {
                  // Not in compare mode, toggle compare mode
                  onToggleCompareMode();
                }
              }}
              variant="outline"
              size="lg"
              className={`${isCompareMode ? 'flex-1' : 'w-full'} border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10`}
            >
              {isCompareMode ? "Purchase Comparison" : "Compare"}
            </Button>
            {isCompareMode && (
              <div className="text-base font-bold text-white whitespace-nowrap">
                Price: £ 2.99
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
