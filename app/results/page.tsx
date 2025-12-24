"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultCard from "@/components/ResultCard";
import ResultsCarousel from "@/components/ResultsCarousel";
import DelayedSpinner from "@/components/DelayedSpinner";
import BreakdownDisplay from "@/components/BreakdownDisplay";
import PaymentForm from "@/components/PaymentForm";
import { QuizSession, BootSummary, FittingBreakdown, Region } from "@/types";
import { useAuth } from "@/lib/auth";
import { useRegion } from "@/lib/region";
import { upsertSavedResult } from "@/lib/firestore/users";
import {
  calculateRecommendedMondo,
  shoeSizeToMondo,
} from "@/lib/mondo-conversions";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";
import { User } from "firebase/auth";

interface PriceComparisonContentProps {
  boot: BootSummary;
  sessionId?: string;
  user: User | null;
  region: Region;
}

function PriceComparisonContent({
  boot,
  sessionId,
  user,
  region,
}: PriceComparisonContentProps) {
  const currentRegion: Region = region || "US";
  const availableLinks = boot.links?.[currentRegion] || boot.links?.US || [];
  const hasLegacyUrl = !availableLinks.length && boot.affiliateUrl;

  const handleBuy = (bootId: string, vendor?: string, linkUrl?: string) => {
    const params = new URLSearchParams({ bootId });
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

  // Collect all models to display - only show actual boot models, not family name
  const allModels: Array<{
    model: string;
    flex: number;
    bootId: string;
    links?: typeof availableLinks;
    affiliateUrl?: string;
  }> = [];

  // If this is a family (has models array), only show the actual models
  if (boot.models && boot.models.length > 0) {
    boot.models.forEach((m) => {
      // For family models, use their own affiliateUrl if available,
      // otherwise use the main boot's links structure
      const modelLinks = m.affiliateUrl ? [] : availableLinks;
      allModels.push({
        model: m.model,
        flex: m.flex,
        bootId: boot.bootId, // Using main bootId for tracking
        links: modelLinks,
        affiliateUrl: m.affiliateUrl || boot.affiliateUrl,
      });
    });
  } else {
    // If no family models, show the main boot (it's an actual model, not a family)
    allModels.push({
      model: boot.model,
      flex: boot.flex,
      bootId: boot.bootId,
      links: availableLinks,
      affiliateUrl: boot.affiliateUrl,
    });
  }

  return (
    <div className="space-y-6">
      {allModels.map((model, modelIndex) => {
        const modelLinks = model.links || [];
        const modelHasLinks = modelLinks.length > 0 || model.affiliateUrl;

        return (
          <div key={modelIndex} className="border-b border-[#F5E4D0]/20 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-semibold text-lg text-[#F4F4F4]">
                {model.model} {model.flex && `• Flex ${model.flex}`}
              </h4>

              {modelHasLinks ? (
                <div className="flex flex-col items-end gap-1">
                  {/* Multiple Vendor Links */}
                  {modelLinks.length > 0 ? (
                    modelLinks
                      .filter((link) => link.available !== false)
                      .map((link, i) => {
                        const affiliateText = "Affiliate Link. Help support TBR 🤙";
                        return (
                          <div key={i} className="flex flex-col items-end">
                            {/* Wrapper div - text determines width, button fills it */}
                            <div className="inline-flex flex-col items-end">
                              <motion.a
                                href={`/api/redirect?bootId=${model.bootId}&region=${currentRegion}&vendor=${encodeURIComponent(link.store)}${sessionId ? `&sessionId=${sessionId}` : ""}${user ? `&userId=${user.uid}` : ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleBuy(model.bootId, link.store);
                                }}
                                whileHover={{ scale: 1.02 }}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] transition-colors text-sm w-full"
                              >
                                {link.logo && (
                                  <img
                                    src={link.logo}
                                    alt={link.store}
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display =
                                        "none";
                                    }}
                                  />
                                )}
                                <span className="font-medium">
                                  Buy from {link.store}
                                </span>
                              </motion.a>
                              <p className="text-xs text-[#F4F4F4]/60 whitespace-nowrap mt-1 w-full text-right">
                                {affiliateText}
                              </p>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    // Legacy single affiliate URL
                    <div className="flex flex-col items-end">
                      <div className="inline-flex flex-col items-end">
                        <Button
                          onClick={() =>
                            handleBuy(model.bootId, undefined, model.affiliateUrl)
                          }
                          className="text-sm w-full"
                          size="sm"
                        >
                          Buy Now
                        </Button>
                        <p className="text-xs text-[#F4F4F4]/60 whitespace-nowrap mt-1 w-full text-right">
                          Affiliate Link. Help support TBR 🤙
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#F4F4F4]/60 italic">
                  No retailers available
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const sessionId = searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [recommendedMondo, setRecommendedMondo] = useState<string>("N/A");
  const [saving, setSaving] = useState(false);
  const [breakdown, setBreakdown] = useState<FittingBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [generatingBreakdown, setGeneratingBreakdown] = useState(false);
  const [breakdownError, setBreakdownError] = useState(false);
  const [selectedPriceTab, setSelectedPriceTab] = useState<number>(0);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [modelsVisible, setModelsVisible] = useState(false);
  // Track selected models for each boot (bootId -> Set of model indices)
  const [selectedModels, setSelectedModels] = useState<Record<string, Set<number>>>({});
  const { region, setRegion } = useRegion();
  const [hasPaidForComparison, setHasPaidForComparison] = useState(false);
  const [comparisonStatus, setComparisonStatus] = useState<'pending' | 'generating' | 'completed' | 'failed' | null>(null);

  // Clear breakdown when sessionId changes
  useEffect(() => {
    setBreakdown(null);
    setBreakdownError(false);
    setGeneratingBreakdown(false);
  }, [sessionId]);

  // Flip state management
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Reset result cards to default state when breakdown appears
  const [previousBreakdown, setPreviousBreakdown] = useState<FittingBreakdown | null>(null);
  useEffect(() => {
    // Only reset when breakdown transitions from null/undefined to having a value
    if (breakdown && !previousBreakdown) {
      setIsCompareMode(false);
      setModelsVisible(false);
      setIsFlipped(true); // Automatically flip cards when breakdown is generated
    }
    setPreviousBreakdown(breakdown);
  }, [breakdown, previousBreakdown]);

  // Handle flipping cards back to front
  const handleFlipBack = () => {
    setIsFlipped(false);
    // Optionally clear breakdown if you want to hide comparison sections
    // setBreakdown(null); // Commented out - keep breakdown so "View Comparison" button works
  };

  // Handle viewing comparison (flip to back)
  const handleViewComparison = () => {
    if (breakdown) {
      setIsFlipped(true);
    } else {
      // If no breakdown exists yet, generate it
      handleGetBreakdown(selectedModels);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      router.push("/quiz");
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          router.push("/quiz");
          return;
        }
        const sessionData: QuizSession = await response.json();
        if (!sessionData || !sessionData.recommendedBoots) {
          router.push("/quiz");
          return;
        }
        setSession(sessionData);

        // Check if user paid for comparison
        const paidForComparison = sessionData.answers?.paidForComparison === true;
        setHasPaidForComparison(paidForComparison);
        setComparisonStatus(sessionData.comparisonStatus || null);

        // Use mondo from session if available, otherwise calculate from answers
        if (sessionData.recommendedMondo) {
          setRecommendedMondo(sessionData.recommendedMondo);
        } else if (sessionData.answers.footLengthMM) {
          // Use minimum foot length - easier to create space than make boot smaller
          const smallerFoot = Math.min(
            sessionData.answers.footLengthMM.left,
            sessionData.answers.footLengthMM.right
          );
          setRecommendedMondo(calculateRecommendedMondo(smallerFoot));
        } else if (sessionData.answers.shoeSize) {
          const { system, value } = sessionData.answers.shoeSize;
          setRecommendedMondo(shoeSizeToMondo(system, value));
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        router.push("/quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  // Poll for comparison status if paid and generating (only for authenticated users)
  // Anonymous users who paid will need to manually generate breakdown via button click
  useEffect(() => {
    if (!hasPaidForComparison || !sessionId || !user) return;
    
    // If comparison is completed, try to fetch it
    if (comparisonStatus === 'completed' && !breakdown) {
      const fetchBreakdown = async () => {
        try {
          const response = await fetch("/api/breakdowns/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quizId: sessionId,
              userId: user.uid,
              selectedModels: {},
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.breakdown) {
              setBreakdown(result.breakdown);
              setBreakdownError(false);
            }
          }
        } catch (error) {
          console.error("Error fetching breakdown:", error);
        }
      };
      
      fetchBreakdown();
    }

    // If comparison is generating, poll for updates
    if (comparisonStatus === 'generating') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/sessions/${sessionId}`);
          if (response.ok) {
            const sessionData: QuizSession = await response.json();
            const newStatus = sessionData.comparisonStatus;
            
            // Only update if status actually changed
            if (newStatus && newStatus !== 'generating') {
              // If completed, fetch the breakdown
              if (newStatus === 'completed') {
                const breakdownResponse = await fetch("/api/breakdowns/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    quizId: sessionId,
                    userId: user.uid,
                    selectedModels: {},
                  }),
                });

                if (breakdownResponse.ok) {
                  const result = await breakdownResponse.json();
                  if (result.success && result.breakdown) {
                    setBreakdown(result.breakdown);
                    setBreakdownError(false);
                    setGeneratingBreakdown(false);
                    toast.success("Comparison generated successfully!", { id: "payment-breakdown" });
                  }
                } else {
                  toast.error("Failed to fetch comparison", { id: "payment-breakdown" });
                }
                
                // Update status AFTER handling to avoid re-triggering effect
                setComparisonStatus(newStatus);
              } else if (newStatus === 'failed') {
                setBreakdownError(true);
                setGeneratingBreakdown(false);
                toast.error("Comparison generation failed. Please try again.", { id: "payment-breakdown" });
                // Update status AFTER handling to avoid re-triggering effect
                setComparisonStatus(newStatus);
              }
            }
          }
        } catch (error) {
          console.error("Error polling comparison status:", error);
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [hasPaidForComparison, sessionId, user, breakdown, comparisonStatus]);

  // Don't fetch breakdown automatically - only generate when user clicks button
  // Breakdowns are not persisted, so we don't fetch them on load

  const handlePurchaseComparison = async () => {
    if (!sessionId) {
      toast.error("Session ID missing");
      return;
    }

    setIsCreatingPayment(true);
    try {
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: sessionId,
          userId: user?.uid, // Optional - allows anonymous purchases
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize payment");
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success("Payment successful!");
    setShowPaymentForm(false);
    setClientSecret(null);
    setHasPaidForComparison(true);
    
    // Refresh session data to get updated payment status
    if (sessionId) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (response.ok) {
          const sessionData: QuizSession = await response.json();
          setSession(sessionData);
          
          // For authenticated users, the breakdown is generated automatically by the webhook
          // For anonymous users, show a message that they can now generate the breakdown
          if (!user) {
            toast.success("You can now generate your detailed comparison!", { duration: 5000 });
          } else {
            toast.loading("Generating your comparison...", { id: "payment-breakdown" });
          }
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
      }
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
  };

  const handleGetBreakdown = async (selectedModelsForBreakdown?: Record<string, Set<number>>) => {
    // Free users can now generate breakdowns without logging in
    // They'll need to log in to SAVE, but can view the comparison
    
    if (!sessionId) {
      toast.error("Session ID missing");
      return;
    }

    if (!session) {
      toast.error("Session data not loaded");
      return;
    }

    // Prep UI: flip cards, show generating state, clear previous breakdown
    setIsFlipped(true);
    setIsCompareMode(true);
    setModelsVisible(true);
    setBreakdown(null);
    setBreakdownError(false);

    setGeneratingBreakdown(true);
    toast.loading("Generating your breakdown...", { id: "breakdown" });

    try {
      // Convert selected models to a serializable format
      const modelsToInclude: Record<string, number[]> = {};
      const modelsToUse = selectedModelsForBreakdown || selectedModels;
      
      Object.entries(modelsToUse).forEach(([bootId, modelIndices]) => {
        if (modelIndices.size > 0) {
          modelsToInclude[bootId] = Array.from(modelIndices);
        }
      });

      // Call breakdown generation endpoint
      // userId is optional - if not provided, breakdown won't be saved but will still be generated
      const response = await fetch("/api/breakdowns/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: sessionId,
          userId: user?.uid, // Optional - allows anonymous users to generate breakdowns
          selectedModels: modelsToInclude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.details ||
          errorData.message ||
          `Server error: ${response.status}`;
        console.error("Breakdown generation API error:", errorMessage, errorData);
        console.error("Full error response:", { status: response.status, errorData });
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Breakdown is returned directly in the response
      if (result.success && result.breakdown) {
        setBreakdown(result.breakdown);
        setBreakdownError(false);
        setGeneratingBreakdown(false);
        
        if (user) {
          toast.success("Breakdown generated and saved successfully!", { id: "breakdown" });
        } else {
          // Anonymous user - show message about needing to log in to save
          toast.success("Breakdown generated! Create an account to save your results.", { 
            id: "breakdown",
            duration: 5000,
          });
        }
      } else {
        throw new Error(result.error || "Failed to generate breakdown");
      }

    } catch (error: unknown) {
      console.error("Error generating breakdown:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate breakdown. Please try again.",
        { id: "breakdown" }
      );
      setGeneratingBreakdown(false);
      setBreakdownError(true);
    }
  };

  // handlePaymentSuccess removed - payment wall temporarily disabled for testing

  const handleSaveResult = async () => {
    // If not logged in, redirect to account page with message and sessionId
    if (!user) {
      const redirectUrl = sessionId
        ? `/account?saveResults=true&sessionId=${sessionId}`
        : "/account?saveResults=true";
      router.push(redirectUrl);
      return;
    }

    // Ensure we have a valid sessionId before saving
    if (!sessionId) {
      toast.error("Session ID is missing. Cannot save results.");
      console.error("Attempted to save result without sessionId");
      return;
    }

    if (!session || !session.recommendedBoots) {
      toast.error("Session data is incomplete. Cannot save results.");
      return;
    }

    setSaving(true);
    try {
      await upsertSavedResult(user.uid, {
        quizId: sessionId, // Use the sessionId from URL - should always be present
        completedAt: session.completedAt || new Date(),
        recommendedBoots: session.recommendedBoots,
      }, user.email || undefined);
      toast.success("Result saved successfully!");
    } catch (error) {
      console.error("Error saving result:", error);
      toast.error("Failed to save result. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <DelayedSpinner size="lg" isLoading={loading} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session || !session.recommendedBoots) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#F4F4F4]">No results found</h2>
            <button
              onClick={() => router.push("/quiz")}
              className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8]"
            >
              Take Quiz Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasAffiliateLinks = session.recommendedBoots.some((boot) => {
    const hasLinksObject =
      boot.links &&
      Object.values(boot.links).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
    const hasAffiliateUrl = !!boot.affiliateUrl;
    const hasModelAffiliate = boot.models?.some((m) => !!m.affiliateUrl);
    return hasLinksObject || hasAffiliateUrl || hasModelAffiliate;
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-[#040404]"
    >
      <div
        className="sticky top-0 z-50 bg-[#040404] pt-2 pb-0"
      >
        <Header />
      </div>
        <main
        className="flex-grow bg-[#040404] pb-8"
      >
        <div className="w-full px-4 md:px-[50px] pt-24 sm:pt-28 md:pt-32">
          {/* Mobile Carousel */}
          <div className={`md:hidden ${isFlipped ? 'mb-2' : 'mb-8'}`}>
            <ResultsCarousel
              boots={session.recommendedBoots}
              sessionId={sessionId || undefined}
              recommendedMondo={recommendedMondo}
              footLength={session.answers?.footLengthMM}
              shoeSize={session.answers?.shoeSize}
              isCompareMode={isCompareMode}
              onToggleCompareMode={() => {
                const newCompareMode = !isCompareMode;
                setIsCompareMode(newCompareMode);
                // If entering compare mode, open models dropdown in all cards
                if (newCompareMode) {
                  setModelsVisible(true);
                }
              }}
              modelsVisible={modelsVisible}
              onToggleModelsVisibility={() => setModelsVisible(!modelsVisible)}
              selectedModels={selectedModels}
              onUpdateSelectedModels={(bootId, modelIndices) => {
                setSelectedModels(prev => ({
                  ...prev,
                  [bootId]: modelIndices,
                }));
              }}
              onPurchaseComparison={handlePurchaseComparison}
              resetToFirst={!!breakdown}
              isFlipped={isFlipped}
              generatingBreakdown={generatingBreakdown || comparisonStatus === 'generating'}
              breakdown={breakdown || undefined}
              onFlipBack={handleFlipBack}
              onViewComparison={handleViewComparison}
              hasPaidForComparison={hasPaidForComparison}
              isCreatingPayment={isCreatingPayment}
            />
          </div>

          {/* Desktop Grid */}
          <div className={`hidden md:grid md:grid-cols-3 gap-6 ${isFlipped ? 'mb-2' : 'mb-8'}`}>
            {session.recommendedBoots.map((boot, index) => {
              // Find the breakdown section for this boot
              const breakdownSection = breakdown?.sections.find(s => s.bootId === boot.bootId);
              
              return (
                <ResultCard
                  key={boot.bootId}
                  boot={boot}
                  sessionId={sessionId || undefined}
                  index={index}
                  recommendedSize={recommendedMondo}
                  footLength={session.answers?.footLengthMM}
                  shoeSize={session.answers?.shoeSize}
                  isCompareMode={isCompareMode}
                  onToggleCompareMode={() => {
                    const newCompareMode = !isCompareMode;
                    setIsCompareMode(newCompareMode);
                    // If entering compare mode, open models dropdown in all cards
                    if (newCompareMode) {
                      setModelsVisible(true);
                    }
                  }}
                  modelsVisible={modelsVisible}
                  onToggleModelsVisibility={() => setModelsVisible(!modelsVisible)}
                  selectedModels={selectedModels[boot.bootId] || new Set()}
                  onUpdateSelectedModels={(bootId, modelIndices) => {
                    setSelectedModels(prev => ({
                      ...prev,
                      [bootId]: modelIndices,
                    }));
                  }}
                  onPurchaseComparison={handlePurchaseComparison}
                  isFlipped={isFlipped}
                generatingBreakdown={generatingBreakdown || comparisonStatus === 'generating'}
                  breakdownSection={breakdownSection}
                  onFlipBack={handleFlipBack}
                  onViewComparison={handleViewComparison}
                  hasBreakdown={!!breakdown}
                  hasPaidForComparison={hasPaidForComparison}
                  isCreatingPayment={isCreatingPayment}
                />
              );
            })}
          </div>

          {/* Breakdown Display - Only show comparison sections below flipped cards */}
          {isFlipped && (
            <div className="mt-12">
            <BreakdownDisplay
              breakdown={breakdown}
              loading={loadingBreakdown}
              generating={generatingBreakdown}
              error={breakdownError}
              sessionBoots={session.recommendedBoots.map(boot => ({
                bootId: boot.bootId,
                brand: boot.brand,
                model: boot.model,
              }))}
              userAnswers={session.answers}
              recommendedBoots={session.recommendedBoots}
              selectedModels={selectedModels}
            />
            </div>
          )}

          {/* Header with Save/Login Button */}
          <div className="hidden md:block mt-8 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:grid md:grid-cols-3 gap-6 w-full"
            >
              <Button
                onClick={() => {
                  if (sessionId && session?.answers) {
                    // Store answers in sessionStorage to pre-fill quiz
                    sessionStorage.setItem(
                      "editQuizAnswers",
                      JSON.stringify(session.answers)
                    );
                    router.push(`/quiz?editSessionId=${sessionId}`);
                  } else {
                    router.push("/quiz");
                  }
                }}
                variant="outline"
                size="lg"
                disabled={!!breakdown}
                className="border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base px-4 sm:px-8 p-4"
              >
                {breakdown ? "EDIT UNAVAILABLE AFTER COMPARISON" : "EDIT ANSWERS"}
              </Button>
              <div></div>
              <Button
                onClick={handleSaveResult}
                disabled={saving}
                variant="outline"
                size="lg"
                className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0] text-sm sm:text-base px-4 sm:px-8 p-4"
              >
                {saving ? "SAVING..." : "SAVE RESULTS"}
              </Button>
            </motion.div>
          </div>
          
          {/* Mobile Buttons */}
          <div className="md:hidden mt-8 mb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center items-center w-full"
            >
              <div className="flex flex-row gap-3 w-full">
                <Button
                  onClick={() => {
                    if (sessionId && session?.answers) {
                      sessionStorage.setItem(
                        "editQuizAnswers",
                        JSON.stringify(session.answers)
                      );
                      router.push(`/quiz?editSessionId=${sessionId}`);
                    } else {
                      router.push("/quiz");
                    }
                  }}
                  variant="outline"
                  size="lg"
                  disabled={!!breakdown}
                  className="border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full px-4 sm:px-8 p-4"
                >
                  {breakdown ? "EDIT UNAVAILABLE" : "EDIT ANSWERS"}
                </Button>
                <Button
                  onClick={handleSaveResult}
                  disabled={saving}
                  variant="outline"
                  size="lg"
                  className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0] text-sm sm:text-base w-full px-4 sm:px-8 p-4"
                >
                  {saving ? "SAVING..." : "SAVE RESULTS"}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Affiliate Disclosure Card */}
        </div>
      </main>
      <Footer />

      {/* Payment Form Modal */}
      <AnimatePresence>
        {showPaymentForm && clientSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={handlePaymentCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PaymentForm
                clientSecret={clientSecret}
                quizId={sessionId || ""}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
