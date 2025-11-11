"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import ResultCard from "@/components/ResultCard";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/lib/auth";
import { getUserDoc, deleteSavedResult, upsertSavedResult } from "@/lib/firestore/users";
import { User, SavedResult, QuizSession, FittingBreakdown } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingResults, setSavingResults] = useState(false);
  const [sessions, setSessions] = useState<Map<string, QuizSession>>(new Map());
  const [breakdowns, setBreakdowns] = useState<Map<string, FittingBreakdown>>(new Map());
  const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null);
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
            });

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
            const sessionResponse = await fetch(`/api/sessions/${result.quizId}`);
            if (sessionResponse.ok) {
              const session: QuizSession = await sessionResponse.json();
              if (session) {
                sessionsMap.set(result.quizId, session);
              }
            }
            
            // Fetch breakdown if user is logged in
            if (user) {
              try {
                const breakdownResponse = await fetch(`/api/breakdowns/${user.uid}/${result.quizId}`);
                if (breakdownResponse.ok) {
                  const breakdown: FittingBreakdown = await breakdownResponse.json();
                  if (breakdown) {
                    breakdownsMap.set(result.quizId, breakdown);
                  }
                }
              } catch (error) {
                // Breakdown might not exist, which is fine
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
    
    if (!confirm("Are you sure you want to remove this saved result?")) {
      return;
    }

    try {
      await deleteSavedResult(user.uid, quizId);
      toast.success("Result removed successfully");
      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error("Error deleting result:", error);
      toast.error("Failed to remove result");
    }
  };

  if (authLoading || (user && (loading || savingResults))) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" />
            {savingResults && (
              <p className="mt-4 text-gray-600">Saving your results...</p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-8">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            {showSaveMessage && (
              <Card className="bg-blue-50 border-blue-200 mb-6">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-blue-900 text-center leading-tight">
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Account</h1>
            <Link
              href="/quiz"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Re-run Quiz
            </Link>
          </div>

          {savedResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <h2 className="text-xl font-semibold mb-4">
                No saved results yet
              </h2>
              <p className="text-gray-600 mb-6">
                Complete a quiz and save your results to see them here.
              </p>
              <Link
                href="/quiz"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Take Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {savedResults.map((result, index) => {
                const session = sessions.get(result.quizId);
                const answers = session?.answers;
                
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
                  
                  // Touring
                  if (answers.touring === "Yes") {
                    parts.push("Touring");
                  }
                  
                  // Features
                  if (answers.features && answers.features.length > 0) {
                    parts.push(answers.features.join(", "));
                  }
                  
                  return parts.join(" • ");
                };
                
                // Create unique key using quizId and index, plus completedAt timestamp for extra uniqueness
                const uniqueKey = `${result.quizId}-${index}-${result.completedAt.getTime()}`;
                
                return (
                  <div key={uniqueKey} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold mb-1">
                          {formatAnswerSummary()}
                        </h2>
                        <p className="text-sm text-gray-600">
                          Completed: {result.completedAt.toLocaleDateString()}
                        </p>
                        {answers && (
                          <div className="mt-2 text-sm text-gray-500">
                            {answers.toeShape} toe • {answers.instepHeight} instep • {answers.calfVolume} calf
                            {answers.footWidth && (
                              <>
                                {" • "}
                                {("category" in answers.footWidth && answers.footWidth.category) 
                                  ? answers.footWidth.category + " width"
                                  : ("left" in answers.footWidth || "right" in answers.footWidth)
                                  ? `${Math.max(answers.footWidth.left || 0, answers.footWidth.right || 0)}mm width`
                                  : ""}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteResult(result.quizId)}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition ml-4"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {result.recommendedBoots.map((boot) => (
                        <ResultCard key={boot.bootId} boot={boot} />
                      ))}
                    </div>
                    
                    {/* Breakdown Section */}
                    {breakdowns.has(result.quizId) && (
                      <div className="mt-6 border-t pt-6">
                        <button
                          onClick={() =>
                            setExpandedBreakdown(
                              expandedBreakdown === result.quizId
                                ? null
                                : result.quizId
                            )
                          }
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <span>
                            {expandedBreakdown === result.quizId
                              ? "Hide"
                              : "View"}{" "}
                            Detailed Fitting Breakdown
                          </span>
                          <span className="text-sm">
                            {expandedBreakdown === result.quizId ? "▲" : "▼"}
                          </span>
                        </button>
                        {expandedBreakdown === result.quizId && (
                          <div className="mt-4 space-y-6">
                            {breakdowns.get(result.quizId)?.sections.map(
                              (section) => {
                                const boot = result.recommendedBoots.find(
                                  (b) => b.bootId === section.bootId
                                );
                                return (
                                  <div
                                    key={section.bootId}
                                    className="border-b border-gray-200 pb-4 last:border-b-0"
                                  >
                                    <h3 className="text-lg font-semibold mb-2">
                                      {section.heading}
                                    </h3>
                                    {boot && (
                                      <p className="text-sm text-gray-600 mb-2">
                                        {boot.brand} {boot.model} • Flex {boot.flex} • Match
                                        Score: {boot.score.toFixed(1)}/100
                                      </p>
                                    )}
                                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                      {section.body}
                                    </p>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

