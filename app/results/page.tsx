"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultCard from "@/components/ResultCard";
import Spinner from "@/components/Spinner";
import PaymentForm from "@/components/PaymentForm";
import { QuizSession, BootSummary, FittingBreakdown } from "@/types";
import { useAuth } from "@/lib/auth";
import { upsertSavedResult } from "@/lib/firestore/users";
import { calculateRecommendedMondo, shoeSizeToMondo } from "@/lib/mondo-conversions";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

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
          const largerFoot = Math.max(
            sessionData.answers.footLengthMM.left,
            sessionData.answers.footLengthMM.right
          );
          setRecommendedMondo(calculateRecommendedMondo(largerFoot));
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
          const response = await fetch(`/api/breakdowns/${user.uid}/${sessionId}`);
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

  const handleGetBreakdown = async () => {
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
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: sessionId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || `Server error: ${response.status}`;
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
      toast.error(error.message || "Failed to initialize payment. Please check your Stripe configuration.");
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
            <h2 className="text-2xl font-bold mb-4">No results found</h2>
            <button
              onClick={() => router.push("/quiz")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      <div className="sticky top-0 z-50 bg-gray-50 pt-4" style={{ backgroundColor: '#f9fafb' }}>
        <Header />
      </div>
      <main className="flex-grow bg-gray-50 pb-8" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          {/* Header with Save/Login Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-4"
          >
             <h1 className="text-3xl font-bold text-gray-900">
               Your Best Boot Matches
             </h1>
            <div className="flex-shrink-0 flex gap-3">
              <Button
                onClick={() => {
                  if (sessionId && session?.answers) {
                    // Store answers in sessionStorage to pre-fill quiz
                    sessionStorage.setItem("editQuizAnswers", JSON.stringify(session.answers));
                    router.push(`/quiz?editSessionId=${sessionId}`);
                  } else {
                    router.push("/quiz");
                  }
                }}
                variant="outline"
                size="lg"
                className="border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
              >
                Edit Answers
              </Button>
              <Button
                onClick={handleSaveResult}
                disabled={saving}
                variant="outline"
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700 border-green-600"
              >
                {saving ? "Saving..." : "Save Results"}
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
              />
            ))}
          </div>

          {/* Fitting Breakdown Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            {showPaymentForm && clientSecret ? (
              <PaymentForm
                clientSecret={clientSecret}
                quizId={sessionId || ""}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setShowPaymentForm(false);
                  setClientSecret(null);
                }}
              />
            ) : generatingBreakdown ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      Generating your AI fitting breakdown...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This usually takes 3-6 seconds
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : breakdown ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-2xl">
                      Detailed Fitting Breakdown
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {breakdown.sections.map((section) => {
                    const boot = session.recommendedBoots.find(
                      (b) => b.bootId === section.bootId
                    );
                    return (
                      <motion.div
                        key={section.bootId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                      >
                        <h3 className="text-xl font-semibold mb-3 text-gray-900">
                          {section.heading}
                        </h3>
                        {boot && (
                          <p className="text-sm text-gray-600 mb-3">
                            {boot.brand} {boot.model} • Flex {boot.flex} • Match
                            Score: {boot.score.toFixed(1)}/100
                          </p>
                        )}
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {section.body}
                        </p>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Get Detailed AI Fitting Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Get a professional, AI-generated analysis of why each boot
                    matches your profile. Includes detailed fit characteristics,
                    feature alignment, and practical fitting advice.
                  </p>
                  <Button
                    onClick={handleGetBreakdown}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Breakdown – £2.99
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

