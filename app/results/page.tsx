"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultCard from "@/components/ResultCard";
import Spinner from "@/components/Spinner";
import PaymentForm from "@/components/PaymentForm";
import { QuizSession, BootSummary, FittingBreakdown, Region } from "@/types";
import { useAuth } from "@/lib/auth";
import { useRegion } from "@/lib/region";
import { upsertSavedResult } from "@/lib/firestore/users";
import {
  calculateRecommendedMondo,
  shoeSizeToMondo,
} from "@/lib/mondo-conversions";
import { v4 as uuidv4 } from "uuid";
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
  const paymentSuccess = searchParams.get("payment") === "success";
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [recommendedMondo, setRecommendedMondo] = useState<string>("N/A");
  const [saving, setSaving] = useState(false);
  const [breakdown, setBreakdown] = useState<FittingBreakdown | null>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [generatingBreakdown, setGeneratingBreakdown] = useState(false);
  const [selectedPriceTab, setSelectedPriceTab] = useState<number>(0);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [modelsVisible, setModelsVisible] = useState(false);
  // Track selected models for each boot (bootId -> Set of model indices)
  const [selectedModels, setSelectedModels] = useState<Record<string, Set<number>>>({});
  const { region, setRegion } = useRegion();

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

  // Fetch breakdown if user is logged in
  useEffect(() => {
    if (user && sessionId && session) {
      fetchBreakdown();
    }
  }, [user, sessionId, session]);

  // Poll for breakdown after payment success
  useEffect(() => {
    if (paymentSuccess && user && sessionId) {
      setGeneratingBreakdown(true);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/breakdowns/${user.uid}/${sessionId}`
          );
          if (response.ok) {
            const breakdownData: FittingBreakdown = await response.json();
            setBreakdown(breakdownData);
            setGeneratingBreakdown(false);
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Error polling for breakdown:", error);
        }
      }, 2000); // Poll every 2 seconds

      // Stop polling after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setGeneratingBreakdown(false);
      }, 60000);

      return () => clearInterval(pollInterval);
    }
  }, [paymentSuccess, user, sessionId]);

  const fetchBreakdown = async () => {
    if (!user || !sessionId) return;

    setLoadingBreakdown(true);
    try {
      const response = await fetch(`/api/breakdowns/${user.uid}/${sessionId}`);
      if (response.ok) {
        const breakdownData: FittingBreakdown = await response.json();
        setBreakdown(breakdownData);
      }
    } catch (error) {
      console.error("Error fetching breakdown:", error);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleGetBreakdown = async (selectedModelsForBreakdown?: Record<string, Set<number>>) => {
    if (!user) {
      toast.error("Please log in to purchase a breakdown");
      router.push(`/account?saveResults=true&sessionId=${sessionId}`);
      return;
    }

    if (!sessionId) {
      toast.error("Session ID missing");
      return;
    }

    setShowPaymentForm(true);
    try {
      // Convert selected models to a serializable format
      const modelsToInclude: Record<string, number[]> = {};
      const modelsToUse = selectedModelsForBreakdown || selectedModels;
      
      Object.entries(modelsToUse).forEach(([bootId, modelIndices]) => {
        if (modelIndices.size > 0) {
          modelsToInclude[bootId] = Array.from(modelIndices);
        }
      });

      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: sessionId,
          userId: user.uid,
          selectedModels: modelsToInclude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Server error: ${response.status}`;
        console.error("Payment intent API error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const { clientSecret: secret } = await response.json();
      if (!secret) {
        throw new Error("No client secret returned from server");
      }
      setClientSecret(secret);
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      toast.error(
        error.message ||
          "Failed to initialize payment. Please check your Stripe configuration."
      );
      setShowPaymentForm(false);
    }
  };

  const handlePaymentSuccess = (quizId: string) => {
    setShowPaymentForm(false);
    setClientSecret(null);
    setGeneratingBreakdown(true);
    // Start polling for breakdown
    const pollInterval = setInterval(async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/breakdowns/${user.uid}/${quizId}`);
        if (response.ok) {
          const breakdownData: FittingBreakdown = await response.json();
          setBreakdown(breakdownData);
          setGeneratingBreakdown(false);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling for breakdown:", error);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(pollInterval);
      setGeneratingBreakdown(false);
    }, 60000);
  };

  const handleSaveResult = async () => {
    // If not logged in, redirect to account page with message and sessionId
    if (!user) {
      const redirectUrl = sessionId
        ? `/account?saveResults=true&sessionId=${sessionId}`
        : "/account?saveResults=true";
      router.push(redirectUrl);
      return;
    }

    if (!session || !session.recommendedBoots) return;

    setSaving(true);
    try {
      await upsertSavedResult(user.uid, {
        quizId: sessionId || uuidv4(),
        completedAt: session.completedAt || new Date(),
        recommendedBoots: session.recommendedBoots,
      });
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
          <Spinner size="lg" />
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

  return (
    <div
      className="min-h-screen flex flex-col bg-[#040404]"
    >
      <div
        className="sticky top-0 z-50 bg-[#040404] pt-4 pb-0"
      >
        <Header />
      </div>
        <main
        className="flex-grow bg-[#040404] pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Header with Save/Login Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex justify-between items-center"
          >
            <Button
              onClick={() => {
                const breakdownSection = document.getElementById('fitting-breakdown');
                if (breakdownSection) {
                  const headerHeight = 120;
                  const elementPosition = breakdownSection.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              }}
              variant="outline"
              size="lg"
              className="border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10"
            >
              COMPARE RESULTS
            </Button>
            <div className="flex gap-3">
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
                className="border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10"
              >
                EDIT ANSWERS
              </Button>
              <Button
                onClick={handleSaveResult}
                disabled={saving}
                variant="outline"
                size="lg"
                className="bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[#F5E4D0]"
              >
                {saving ? "SAVING..." : "SAVE RESULTS"}
              </Button>
            </div>
          </motion.div>

          {/* Results Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {session.recommendedBoots.map((boot, index) => (
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
                onPurchaseComparison={() => handleGetBreakdown(selectedModels)}
              />
            ))}
          </div>

          {/* Custom Fitting Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Custom Fitting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[#F4F4F4] text-lg">
                  Fine-tune your boots for the perfect fit.
                </p>
                <p className="text-[#F4F4F4]/80">
                  Once you've picked your boots, a quick visit to a local ski
                  shop can make a big difference. A boot fitter can:
                </p>
                <ul className="space-y-3 text-[#F4F4F4]">
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🔥</span>
                    <span>
                      <strong>Heat-mould the liners</strong> for a glove-like
                      feel.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🛠</span>
                    <span>
                      <strong>Adjust or stretch the shell</strong> to relieve
                      pressure points.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <span>
                      <strong>Add custom footbeds</strong> to improve comfort,
                      balance, and control.
                    </span>
                  </li>
                </ul>
                <p className="text-[#F4F4F4]/70 italic">
                  Even the right boot straight out of the box can feel better
                  after a little personal tuning.
                </p>
                <p className="text-[#F4F4F4] font-medium">
                  A custom fit = better performance, less fatigue, and happier
                  feet.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Affiliate Disclosure Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Affiliate Disclosure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#F4F4F4]">
                  Some links on this site are affiliate links, meaning The Boot
                  Room may earn a small commission if you purchase through them
                  — at no extra cost to you. We only recommend products we
                  genuinely believe in.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
