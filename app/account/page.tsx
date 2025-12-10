"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import ResultCard from "@/components/ResultCard";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/lib/auth";
import {
  getUserDoc,
  deleteSavedResult,
  upsertSavedResult,
} from "@/lib/firestore/users";
import { User, SavedResult, QuizSession, FittingBreakdown } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import BreakdownDisplay from "@/components/BreakdownDisplay";
import ResultsCarousel from "@/components/ResultsCarousel";
import {
  calculateRecommendedMondo,
  shoeSizeToMondo,
} from "@/lib/mondo-conversions";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResults, setSavingResults] = useState(false);
  const [sessions, setSessions] = useState<Map<string, QuizSession>>(new Map());
  const [breakdowns, setBreakdowns] = useState<Map<string, FittingBreakdown>>(
    new Map()
  );
  // Per-quizId state (like results page)
  const [isFlipped, setIsFlipped] = useState<Map<string, boolean>>(new Map());
  const [isCompareMode, setIsCompareMode] = useState<Map<string, boolean>>(new Map());
  const [modelsVisible, setModelsVisible] = useState<Map<string, boolean>>(new Map());
  const [selectedModels, setSelectedModels] = useState<Map<string, Record<string, Set<number>>>>(new Map());
  const [generatingBreakdown, setGeneratingBreakdown] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const hasAutoSavedRef = useRef(false);
  const showSaveMessage = searchParams.get("saveResults") === "true";
  const sessionId = searchParams.get("sessionId");

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserData();
      // If user just logged in and came from saveResults, automatically save the results
      // Only run once when user becomes available
      if (showSaveMessage && sessionId && !hasAutoSavedRef.current) {
        const handleAutoSaveResults = async () => {
          if (!user || !sessionId || hasAutoSavedRef.current) return;

          hasAutoSavedRef.current = true;
          setSavingResults(true);
          try {
            // Fetch the session via API
            const sessionResponse = await fetch(`/api/sessions/${sessionId}`);
            if (!sessionResponse.ok) {
              toast.error("Session not found or incomplete");
              router.replace("/account");
              return;
            }
            const session: QuizSession = await sessionResponse.json();

            if (!session || !session.recommendedBoots) {
              toast.error("Session not found or incomplete");
              router.replace("/account");
              return;
            }

            // Save results to user's account
            await upsertSavedResult(user.uid, {
              quizId: sessionId,
              completedAt: session.completedAt || new Date(),
              recommendedBoots: session.recommendedBoots,
            }, user.email || undefined);

            // Link the anonymous session to the user via API
            await fetch(`/api/sessions/${sessionId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user.uid }),
            });

            toast.success("Results saved successfully!");

            // Refresh user data to show the new saved result
            await fetchUserData();

            // Clean up URL params after a brief delay to show success message
            setTimeout(() => {
              router.replace("/account");
            }, 1000);
          } catch (error) {
            console.error("Error saving results:", error);
            toast.error("Failed to save results. Please try again.");
            hasAutoSavedRef.current = false; // Allow retry on error
          } finally {
            setSavingResults(false);
          }
        };

        handleAutoSaveResults();
      }
    } else if (!authLoading && !user) {
      setLoading(false);
      // Reset auto-save flag when user logs out
      hasAutoSavedRef.current = false;
    }
  }, [user, authLoading, showSaveMessage, sessionId, router]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const data = await getUserDoc(user.uid);
      setUserData(data);

      // Fetch quiz sessions and breakdowns for all saved results via API
      if (data?.savedResults) {
        const sessionsMap = new Map<string, QuizSession>();
        const breakdownsMap = new Map<string, FittingBreakdown>();

        for (const result of data.savedResults) {
          try {
            // Fetch session
            const sessionResponse = await fetch(
              `/api/sessions/${result.quizId}`
            );
            if (sessionResponse.ok) {
              const session: QuizSession = await sessionResponse.json();
              if (session) {
                sessionsMap.set(result.quizId, session);
              }
            }

            // Fetch breakdown if user is logged in
            if (user) {
              try {
                // Get auth token to pass to API (though Admin SDK now bypasses rules)
                const token = await user.getIdToken();
                const breakdownResponse = await fetch(
                  `/api/breakdowns/${user.uid}/${result.quizId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (breakdownResponse.ok) {
                  const breakdown: FittingBreakdown =
                    await breakdownResponse.json();
                  if (breakdown) {
                    breakdownsMap.set(result.quizId, breakdown);
                    console.log(`Loaded breakdown for quiz ${result.quizId}`);
                  }
                } else if (breakdownResponse.status === 404) {
                  // Breakdown doesn't exist yet - this is fine, it will be created when user generates it
                  console.log(`No breakdown found for quiz ${result.quizId} - breakdown must be generated on results page first`);
                } else {
                  console.warn(`Failed to fetch breakdown for ${result.quizId}:`, breakdownResponse.status, breakdownResponse.statusText);
                }
              } catch (error) {
                // Breakdown might not exist, which is fine
                console.warn(`Error fetching breakdown for ${result.quizId}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error fetching data for ${result.quizId}:`, error);
          }
        }
        setSessions(sessionsMap);
        setBreakdowns(breakdownsMap);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResult = async (quizId: string) => {
    if (!user) return;

    // Show confirmation dialog
    setShowDeleteConfirm(quizId);
  };

  const confirmDelete = async () => {
    if (!user || !showDeleteConfirm) return;

    const quizIdToDelete = showDeleteConfirm;
    setShowDeleteConfirm(null);
    setDeletingQuizId(quizIdToDelete);

    try {
      await deleteSavedResult(user.uid, quizIdToDelete);
      toast.success("Result removed successfully");
      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error("Error deleting result:", error);
      toast.error("Failed to remove result");
    } finally {
      setDeletingQuizId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  if (authLoading || (user && (loading || savingResults))) {
    return (
      <div className="min-h-screen flex flex-col bg-[#040404]">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-[#040404] pt-[120px]">
          <div className="text-center">
            <Spinner size="lg" />
            {savingResults && (
              <p className="mt-4 text-[#F4F4F4]/80">Saving your results...</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#040404]">
        <Header />
        <main className="flex-grow bg-[#040404] py-8 pt-[120px]">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            {showSaveMessage && (
              <Card className="bg-[#F5E4D0]/20 border-[#F5E4D0]/40 mb-6">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#F4F4F4] text-center leading-tight">
                    Create an Account to Save Results
                  </h2>
                </CardContent>
              </Card>
            )}
            <LoginForm />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const savedResults = userData?.savedResults || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#040404]">
      <div className="sticky top-0 z-50 bg-[#040404] pt-2 pb-0">
        <Header />
      </div>
      <main className="flex-grow bg-[#040404] pb-8">
        <div className="w-full px-4 md:px-[50px] pt-24 sm:pt-28 md:pt-32">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F4F4F4]">My Account</h1>
            <Link
              href="/quiz"
              className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8]"
            >
              Re-run Quiz
            </Link>
          </div>

          {savedResults.length === 0 ? (
            <div className="bg-[#2B2D30] rounded-lg shadow-md p-12 text-center border border-[#F5E4D0]/20">
              <h2 className="text-xl font-semibold mb-4 text-[#F4F4F4]">
                No saved results yet
              </h2>
              <p className="text-[#F4F4F4]/80 mb-6">
                Complete a quiz and save your results to see them here.
              </p>
              <Link
                href="/quiz"
                className="inline-block px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8]"
              >
                Take Quiz
              </Link>
            </div>
          ) : (
            <>
              {/* Delete Confirmation Dialog */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                  <Card className="bg-[#2B2D30] border-[#F5E4D0]/20 max-w-md w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold text-[#F4F4F4] mb-4">
                        Confirm Deletion
                      </h3>
                      <p className="text-[#F4F4F4]/80 mb-6">
                        Are you sure you want to delete this saved result? This action cannot be undone.
                      </p>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 text-sm text-[#F4F4F4] hover:bg-[#F5E4D0]/10 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            <div className="space-y-16">
              {savedResults.map((result, index) => {
                const session = sessions.get(result.quizId);
                const answers = session?.answers;
                const breakdown = breakdowns.get(result.quizId);
                const quizId = result.quizId;
                
                // Create unique key using quizId, index, and completedAt timestamp
                const uniqueKey = `${result.quizId}-${index}-${result.completedAt.getTime()}`;
                
                // Per-quizId state getters
                const getIsFlipped = () => isFlipped.get(quizId) || false;
                const getIsCompareMode = () => isCompareMode.get(quizId) || false;
                const getModelsVisible = () => modelsVisible.get(quizId) || false;
                const getSelectedModels = () => selectedModels.get(quizId) || {};
                
                // Per-quizId state setters
                const setIsFlippedForQuiz = (value: boolean) => {
                  setIsFlipped(prev => {
                    const next = new Map(prev);
                    next.set(quizId, value);
                    return next;
                  });
                };
                const setIsCompareModeForQuiz = (value: boolean) => {
                  setIsCompareMode(prev => {
                    const next = new Map(prev);
                    next.set(quizId, value);
                    return next;
                  });
                  if (value) {
                    setModelsVisible(prev => {
                      const next = new Map(prev);
                      next.set(quizId, true);
                      return next;
                    });
                  }
                };
                const setModelsVisibleForQuiz = (value: boolean) => {
                  setModelsVisible(prev => {
                    const next = new Map(prev);
                    next.set(quizId, value);
                    return next;
                  });
                };
                const setSelectedModelsForQuiz = (bootId: string, modelIndices: Set<number>) => {
                  setSelectedModels(prev => {
                    const next = new Map(prev);
                    const current = next.get(quizId) || {};
                    next.set(quizId, {
                      ...current,
                      [bootId]: modelIndices,
                    });
                    return next;
                  });
                };
                
                // Handlers (like results page - can view or generate breakdown)
                const handleFlipBack = () => {
                  setIsFlippedForQuiz(false);
                };
                const handleViewComparison = () => {
                  if (breakdown) {
                    setIsFlippedForQuiz(true);
                  } else {
                    // If no breakdown, generate it
                    handleGetBreakdown();
                  }
                };
                
                // Generate breakdown (same as results page)
                const handleGetBreakdown = async () => {
                  if (!user) {
                    toast.error("Please log in to get a breakdown");
                    return;
                  }

                  if (!session) {
                    toast.error("Session data not loaded");
                    return;
                  }

                  setGeneratingBreakdown(true);
                  toast.loading("Generating your breakdown...", { id: "breakdown" });

                  try {
                    // Convert selected models to a serializable format
                    const modelsToInclude: Record<string, number[]> = {};
                    const currentSelected = getSelectedModels();
                    
                    Object.entries(currentSelected).forEach(([bootId, modelIndices]) => {
                      if (modelIndices.size > 0) {
                        modelsToInclude[bootId] = Array.from(modelIndices);
                      }
                    });

                    // Call breakdown generation endpoint
                    const response = await fetch("/api/breakdowns/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        quizId: quizId,
                        userId: user.uid,
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
                      throw new Error(errorMessage);
                    }

                    const result = await response.json();
                    
                    if (result.success && result.breakdown) {
                      // Update breakdown in state
                      setBreakdowns(prev => {
                        const next = new Map(prev);
                        next.set(quizId, result.breakdown);
                        return next;
                      });
                      
                      // Auto-flip to show breakdown
                      setIsFlippedForQuiz(true);
                      setIsCompareModeForQuiz(false);
                      setModelsVisibleForQuiz(false);
                      
                      toast.success("Breakdown generated successfully!", { id: "breakdown" });
                    } else {
                      throw new Error(result.error || "Failed to generate breakdown");
                    }
                  } catch (error: any) {
                    console.error("Error generating breakdown:", error);
                    toast.error(
                      error.message || "Failed to generate breakdown. Please try again.",
                      { id: "breakdown" }
                    );
                  } finally {
                    setGeneratingBreakdown(false);
                  }
                };
                
                // Calculate recommended mondo
                let recommendedMondo = "N/A";
                if (answers) {
                  if (answers.footLengthMM) {
                    const smallerFoot = Math.min(
                      answers.footLengthMM.left,
                      answers.footLengthMM.right
                    );
                    recommendedMondo = calculateRecommendedMondo(smallerFoot);
                  } else if (answers.shoeSize) {
                    const { system, value } = answers.shoeSize;
                    recommendedMondo = shoeSizeToMondo(system, value);
                  }
                }

                // Format answer summary
                const formatAnswerSummary = () => {
                  if (!answers) return "Quiz Result";

                  const parts: string[] = [];

                  // Gender
                  parts.push(answers.gender);

                  // Ability
                  parts.push(answers.ability);

                  // Weight
                  parts.push(`${answers.weightKG}kg`);

                  // Boot Type
                  if (answers.bootType) {
                    parts.push(answers.bootType);
                  }

                  // Features
                  if (answers.features && answers.features.length > 0) {
                    parts.push(answers.features.join(", "));
                  }

                  return parts.join(" • ");
                };

                return (
                  <div key={uniqueKey} className="w-full">
                    {/* Header info - separate from cards */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-1 text-[#F4F4F4]">
                          {formatAnswerSummary()}
                        </h2>
                        <p className="text-sm text-[#F4F4F4]/80">
                          Completed: {result.completedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteResult(result.quizId)}
                        disabled={deletingQuizId === result.quizId}
                        className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingQuizId === result.quizId ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    {/* Mobile Carousel */}
                    <div className={`md:hidden ${getIsFlipped() ? 'mb-2' : 'mb-8'}`}>
                      <ResultsCarousel
                        boots={result.recommendedBoots}
                        sessionId={quizId}
                        recommendedMondo={recommendedMondo}
                        footLength={answers?.footLengthMM}
                        shoeSize={answers?.shoeSize}
                        isCompareMode={getIsCompareMode()}
                        onToggleCompareMode={() => setIsCompareModeForQuiz(!getIsCompareMode())}
                        modelsVisible={getModelsVisible()}
                        onToggleModelsVisibility={() => setModelsVisibleForQuiz(!getModelsVisible())}
                        selectedModels={getSelectedModels()}
                        onUpdateSelectedModels={setSelectedModelsForQuiz}
                        onPurchaseComparison={() => handleGetBreakdown()}
                        resetToFirst={!!breakdown}
                        isFlipped={getIsFlipped()}
                        breakdown={breakdown || undefined}
                        onFlipBack={handleFlipBack}
                        onViewComparison={handleViewComparison}
                      />
                    </div>

                    {/* Desktop Grid */}
                    <div className={`hidden md:grid md:grid-cols-3 gap-6 ${getIsFlipped() ? 'mb-2' : 'mb-8'}`}>
                      {result.recommendedBoots.map((boot, bootIndex) => {
                        // Find the breakdown section for this boot
                        const breakdownSection = breakdown?.sections.find(s => s.bootId === boot.bootId);
                        const bootScore = boot.score;
                        
                        return (
                          <ResultCard
                            key={boot.bootId}
                            boot={boot}
                            sessionId={quizId}
                            index={bootIndex}
                            recommendedSize={recommendedMondo}
                            footLength={answers?.footLengthMM}
                            shoeSize={answers?.shoeSize}
                            isCompareMode={getIsCompareMode()}
                            onToggleCompareMode={() => setIsCompareModeForQuiz(!getIsCompareMode())}
                            modelsVisible={getModelsVisible()}
                            onToggleModelsVisibility={() => setModelsVisibleForQuiz(!getModelsVisible())}
                            selectedModels={getSelectedModels()[boot.bootId] || new Set()}
                            onUpdateSelectedModels={setSelectedModelsForQuiz}
                            onPurchaseComparison={() => handleGetBreakdown()}
                            isFlipped={getIsFlipped()}
                            breakdownSection={breakdownSection}
                            bootScore={bootScore}
                            onFlipBack={handleFlipBack}
                            onViewComparison={handleViewComparison}
                            hasBreakdown={!!breakdown}
                          />
                        );
                      })}
                    </div>

                    {/* Breakdown Display - Only show comparison sections below flipped cards */}
                    {getIsFlipped() && session && (
                      <div className="mt-12">
                        <BreakdownDisplay
                          breakdown={breakdown || null}
                          loading={false}
                          generating={generatingBreakdown}
                          error={false}
                          sessionBoots={session.recommendedBoots.map(boot => ({
                            bootId: boot.bootId,
                            brand: boot.brand,
                            model: boot.model,
                          }))}
                          userAnswers={session.answers}
                          recommendedBoots={session.recommendedBoots}
                          selectedModels={getSelectedModels()}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
