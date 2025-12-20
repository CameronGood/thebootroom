"use client";

import { BootSummary, Region, FittingBreakdown } from "@/types";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown, ChevronUp, X, ShoppingBag, Search, Loader2 } from "lucide-react";
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
  isFlipped?: boolean;
  breakdownSection?: FittingBreakdown['sections'][0];
  onFlipBack?: () => void;
  onViewComparison?: () => void;
  hasBreakdown?: boolean; // Indicates if a breakdown exists (even if this boot doesn't have a section)
  generatingBreakdown?: boolean;
  hasPaidForComparison?: boolean;
  isCreatingPayment?: boolean;
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
  isFlipped = false,
  breakdownSection,
  onFlipBack,
  onViewComparison,
  hasBreakdown = false,
  generatingBreakdown = false,
  hasPaidForComparison = false,
  isCreatingPayment = false,
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
  
  // Check if this is a single-model boot (no models array)
  const isSingleModelBoot = !boot.models || boot.models.length === 0;
  
  // Use prop if provided, otherwise use local state
  const [localSelectedModels, setLocalSelectedModels] = useState<Set<number>>(() => {
    const initialSet = new Set<number>();
    if (isSingleModelBoot) {
      // For single-model boots, use index 0 to represent the single model
      initialSet.add(0);
    } else {
      sortedModels.forEach((_, i) => initialSet.add(i));
    }
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

  // When compare mode is first activated, ensure all models (or single model) are selected
  useEffect(() => {
    if (isCompareMode) {
      const allSelected = new Set<number>();
      if (isSingleModelBoot) {
        // For single-model boots, use index 0
        allSelected.add(0);
      } else if (sortedModels.length > 0) {
        sortedModels.forEach((_, i) => allSelected.add(i));
      }
      // Only update if not already all selected (check if any are missing)
      const hasAllSelected = allSelected.size === selectedForCompare.size && 
        Array.from(allSelected).every(i => selectedForCompare.has(i));
      if (!hasAllSelected && allSelected.size > 0) {
        setSelectedForCompare(allSelected);
      }
    }
    // Only run when compare mode is activated or models change, not when selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompareMode, sortedModels.length, isSingleModelBoot]);

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

  const comparisonSectionRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  // Scroll to comparison section when it becomes visible
  useEffect(() => {
    if (isCompareMode && shouldScrollRef.current) {
      // Use requestAnimationFrame for better timing
      const scrollToElement = () => {
        const element = comparisonSectionRef.current || document.getElementById(`comparison-section-${boot.bootId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          const headerOffset = 150; // Account for sticky header
          const targetY = scrollY + rect.top - headerOffset;
          
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: "smooth"
          });
          
          shouldScrollRef.current = false;
          return true;
        }
        return false;
      };
      
      // Try immediately
      if (!scrollToElement()) {
        // If element not found, try after a delay
        requestAnimationFrame(() => {
          if (!scrollToElement()) {
            setTimeout(() => scrollToElement(), 100);
          }
        });
      }
    }
  }, [isCompareMode, boot.bootId]);


  // Render breakdown content for back side
  const renderBreakdownContent = () => {
    const headingParts = breakdownSection?.heading?.split(" ") ?? [];
    const brand = headingParts[0] || boot.brand;
    const model = headingParts.slice(1).join(" ") || boot.model;

    if (generatingBreakdown) {
      return (
        <>
          <CardHeader className="px-8 py-8 !pb-4 !mb-0 relative flex-shrink-0" style={{ marginBottom: 0 }}>
            {onFlipBack && (
              <button
                onClick={onFlipBack}
                className="absolute top-8 right-8 w-6 h-6 flex items-center justify-center text-[#F4F4F4] hover:text-[#F5E4D0] transition-colors z-10"
                aria-label="Close breakdown"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            )}
            
            <div className="mb-6">
              <p className="text-4xl font-bold text-[#F5E4D0] leading-tight mb-1">
                {brand}
              </p>
              {model && (
                <p className="text-2xl font-bold text-[#F5E4D0]/80 leading-tight">
                  {model}
                </p>
              )}
            </div>
          </CardHeader>
          <div className="px-8 pt-3 pb-6 mb-0 flex-1 flex items-center justify-center" style={{ paddingBottom: '1.5rem', marginBottom: 0 }}>
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-base text-[#F4F4F4]">Generating your comparison...</p>
              <span className="text-lg text-[#F5E4D0] font-mono dots-loading">. . . .</span>
            </div>
          </div>
        </>
      );
    }

    // Only show "Not Included" if:
    // 1. A breakdown exists (hasBreakdown is true)
    // 2. AND this boot doesn't have a breakdown section (meaning it wasn't included in the breakdown)
    // This handles the case where a breakdown was generated with only some boots selected
    const shouldShowNotIncluded = hasBreakdown && breakdownSection === undefined;
    
    // If boot is not included in the breakdown, show "Not Included" message
    if (shouldShowNotIncluded) {
      return (
        <>
          <CardHeader className="px-8 py-8 !pb-4 !mb-0 relative flex-shrink-0" style={{ marginBottom: 0 }}>
            {/* Close button */}
            {onFlipBack && (
              <button
                onClick={onFlipBack}
                className="absolute top-8 right-8 w-6 h-6 flex items-center justify-center text-[#F4F4F4] hover:text-[#F5E4D0] transition-colors z-10"
                aria-label="Close breakdown"
              >
                <X className="w-6 h-6" strokeWidth={2.5} />
              </button>
            )}
            
            {/* Brand and Model */}
            <div className="mb-4">
              <p className="text-4xl font-bold text-[#F5E4D0] leading-tight mb-1">
                {boot.brand}
              </p>
              <p className="text-2xl font-bold text-[#F5E4D0]/80 leading-tight">
                {boot.model}
              </p>
            </div>
          </CardHeader>
          <div className="px-8 pt-2 pb-6 mb-0 flex-1 flex items-center justify-center" style={{ paddingBottom: '1.5rem', marginBottom: 0, minHeight: '200px' }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#F4F4F4]/50 mb-2">
                Not Included
              </p>
              <p className="text-base text-[#F4F4F4]/40">
                This boot was not selected for comparison
              </p>
            </div>
          </div>
        </>
      );
    }

    // If boot is selected but no breakdown section, return null
    if (!breakdownSection) return null;

    return (
      <>
        <CardHeader className="px-8 py-8 !pb-4 !mb-0 relative flex-shrink-0" style={{ marginBottom: 0 }}>
          {/* Close button */}
          {onFlipBack && (
            <button
              onClick={onFlipBack}
              className="absolute top-8 right-8 w-6 h-6 flex items-center justify-center text-[#F4F4F4] hover:text-[#F5E4D0] transition-colors z-10"
              aria-label="Close breakdown"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          )}
          
          {/* Brand and Model */}
          <div className="mb-6">
            <p className="text-4xl font-bold text-[#F5E4D0] leading-tight mb-1">
              {brand}
            </p>
            {model && (
              <p className="text-2xl font-bold text-[#F5E4D0]/80 leading-tight">
                {model}
              </p>
            )}
          </div>
        </CardHeader>
        <div className="px-8 pt-3 pb-6 mb-0 flex-1" style={{ paddingBottom: '1.5rem', marginBottom: 0 }}>
          <div className="text-[#F4F4F4] text-base leading-[1.8] [&>*:last-child]:!mb-0">
            {(() => {
              const normalizedBody = breakdownSection.body.replace(/\s+[-\u2013\u2014]\s+/g, "\n- ");
              const lines = normalizedBody.split(/\r?\n/);
              const nodes: React.ReactNode[] = [];
              let bulletBuffer: string[] = [];

              const flushBullets = (keyBase: string) => {
                if (bulletBuffer.length === 0) return;
                nodes.push(
                  <ul
                    key={`ul-${keyBase}`}
                    className="list-disc list-outside pl-6 space-y-2 text-base leading-relaxed"
                  >
                    {bulletBuffer.map((item, idx) => (
                      <li key={`li-${keyBase}-${idx}`} className="text-[#F4F4F4]">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
                bulletBuffer = [];
              };

              lines.forEach((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                  flushBullets(`gap-${lineIndex}`);
                  return;
                }

                // Match bullets like -, •, *, en/em dash, or numbered lists "1." / "1)"
                const bulletMatch = trimmedLine.match(/^(?:[-•*]|\u2013|\u2014)\s*(.+)$/);
                const numberedMatch = trimmedLine.match(/^\d+[.)]\s*(.+)$/);

                // Some AI outputs cram multiple bullets into one line separated by " - " or en/em dashes
                const hyphenSplit = trimmedLine
                  .split(/\s*[-\u2013\u2014]\s*/g)
                  .filter(Boolean);

                const pushClean = (text: string) => {
                  const cleaned = text.replace(/^(?:[-•*]|\u2013|\u2014)\s*/, "").trim();
                  if (cleaned) bulletBuffer.push(cleaned);
                };

                if (bulletMatch) {
                  pushClean(bulletMatch[1]);
                  return;
                }
                if (numberedMatch) {
                  pushClean(numberedMatch[1]);
                  return;
                }

                if (hyphenSplit.length > 1) {
                  hyphenSplit.forEach(pushClean);
                  return;
                }

                flushBullets(`p-${lineIndex}`);
                nodes.push(
                  <p key={`p-${lineIndex}`} className="mb-3.5 text-base leading-relaxed">
                    {trimmedLine}
                  </p>
                );
              });

              flushBullets(`end`);
              return nodes;
            })()}
          </div>
        </div>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
      whileHover={!isFlipped ? { y: -8 } : {}}
      id={boot.bootId}
      data-boot-id={boot.bootId}
      className="relative h-full"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.6s ease-in-out",
        }}
      >
        {/* Front Side */}
        <div
          className="w-full h-full"
          style={{
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <Card className="flex flex-col overflow-hidden hover:shadow-xl border-[#F5E4D0]/20 transition-all duration-300 bg-[#2B2D30] h-full">
        {/* 1. Boot Image */}
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
          {(sortedModels.length > 0 || (isCompareMode && isSingleModelBoot)) && (
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
                  className="flex items-baseline gap-2 text-base font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Search className="w-5 h-5 text-[#F5E4D0] flex-shrink-0" />
                  <span>{isSingleModelBoot ? "Boot Selection:" : "View Models:"}</span>
                </button>
                {!isSingleModelBoot && (
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
                )}
              </div>
              {/* Single model boot selection in compare mode */}
              {isCompareMode && isSingleModelBoot && (
                <div className="mb-4">
                  <Badge 
                    variant="secondary" 
                    onClick={() => {
                      const newSet = new Set(selectedForCompare);
                      if (selectedForCompare.has(0)) {
                        newSet.delete(0);
                      } else {
                        newSet.add(0);
                      }
                      setSelectedForCompare(newSet);
                    }}
                    className={`text-base px-3 py-1.5 cursor-pointer rounded-[4px] ${
                      selectedForCompare.has(0)
                        ? "bg-[#F5E4D0]/70 text-[#2B2D30] border-[#F5E4D0]/70 font-bold hover:bg-[#F5E4D0]/70 hover:text-[#2B2D30] hover:border-[#F5E4D0]/70"
                        : "text-[#F4F4F4] bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors"
                    }`}
                  >
                    {boot.model} {boot.flex && `• Flex ${boot.flex}`}
                  </Badge>
                </div>
              )}
              {/* Multiple models list */}
              {sortedModels.length > 0 && modelsVisible && (
                <ul className="space-y-2 mb-4">
                  {sortedModels.map((m, i) => {
                    const isSelected = selectedModelIndex === i;
                    const isSelectedForCompare = selectedForCompare.has(i);
                    return (
                      <li key={i}>
                        <Badge 
                          variant="secondary" 
                          onClick={() => {
                            if (isCompareMode) {
                              const newSet = new Set(selectedForCompare);
                              if (isSelectedForCompare) {
                                newSet.delete(i);
                              } else {
                                newSet.add(i);
                              }
                              setSelectedForCompare(newSet);
                            } else {
                              setSelectedModelIndex(i);
                            }
                          }}
                          className={`text-base px-3 py-1.5 cursor-pointer rounded-[4px] ${
                            (isCompareMode ? isSelectedForCompare : isSelected)
                              ? "bg-[#F5E4D0]/70 text-[#2B2D30] border-[#F5E4D0]/70 font-bold hover:bg-[#F5E4D0]/70 hover:text-[#2B2D30] hover:border-[#F5E4D0]/70"
                              : "text-[#F4F4F4] bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors"
                          }`}
                        >
                          {m.model}
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
                    <div className="flex items-baseline gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#F5E4D0] flex-shrink-0" />
                      <h4 className="text-base font-semibold text-white m-0">
                      Available at:
                    </h4>
                    </div>
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
                          className="text-base px-3 py-1.5 rounded-[4px] bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 text-[#F4F4F4] hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors text-left"
                        >
                          {link.store}
                        </motion.a>
                      ))}
                    
                    {/* Legacy single affiliate URL */}
                      {selectedModelLegacyUrl && (
                        <div className="flex flex-col gap-1">
                        <motion.a
                          href={selectedModelLegacyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            handleBuy(undefined, selectedModelLegacyUrl);
                          }}
                          whileHover={{ scale: 1.02 }}
                          className="text-base px-3 py-1.5 rounded-[4px] bg-[#2B2D30]/90 backdrop-blur-md border border-[#F5E4D0]/20 text-[#F4F4F4] hover:bg-[#F5E4D0]/20 hover:border-[#F5E4D0]/40 hover:shadow-lg font-normal transition-colors text-left"
                        >
                          View Product
                        </motion.a>
                        <Link
                          href="/affiliate-disclosure"
                          prefetch={true}
                          className="text-xs text-[#F5E4D0] self-end text-right hover:text-[#E8D4B8] transition-colors"
                        >
                          <span className="underline underline-offset-2">Affiliate Disclosure</span> *
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-col pt-0 pb-6 px-8">
          <div className="pt-4 border-t border-[#F5E4D0]/10">
            {/* Fit Breakdown & Comparison Section - shown when in compare mode */}
            {isCompareMode && (
              <div 
                ref={comparisonSectionRef}
                id={`comparison-section-${boot.bootId}`} 
                className="mb-6 pb-6 border-b border-[#F5E4D0]/20"
              >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-[#F5E4D0]">
                  Comparison Includes:
                </h4>
                <button
                  onClick={() => {
                    if (onToggleCompareMode) {
                      onToggleCompareMode();
                    }
                  }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-[#F5E4D0]/10 rounded-[4px] transition-colors cursor-pointer text-[#F4F4F4] -mt-0.5"
                  title="Exit compare mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2.5 text-base text-[#F4F4F4] leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="text-[#F5E4D0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Detailed Fit Analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F5E4D0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Boot-to-Boot Comparison</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F5E4D0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Help selecting the correct Flex</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F5E4D0] mt-0.5 flex-shrink-0">✓</span>
                  <span>Fitting Advice to get the most out of your boots</span>
                </li>
              </ul>
              </div>
            )}
            
            {!hasPaidForComparison && !breakdownSection ? (
              <button
                onClick={() => {
                  if (onPurchaseComparison) {
                    onPurchaseComparison();
                  }
                }}
                disabled={isCreatingPayment}
                className="w-full bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border border-[#F5E4D0] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold text-base p-4 rounded-[4px] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isCreatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Payment...
                  </>
                ) : (
                  "PURCHASE COMPARISON £2.99"
                )}
              </button>
            ) : (
              <Button
              onClick={() => {
                if (onViewComparison) {
                  onViewComparison();
                }
              }}
              variant="outline"
              size="lg"
              className="w-full border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 rounded-[4px]"
            >
              View Comparison
            </Button>
            )}
          </div>
        </CardContent>
      </Card>
        </div>
        
        {/* Back Side */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="flex flex-col overflow-hidden border-[#F5E4D0]/20 bg-[#2B2D30] h-full justify-start" style={{ paddingBottom: 0 }}>
            {renderBreakdownContent()}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
