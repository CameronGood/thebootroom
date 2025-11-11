"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import { QuizAnswers } from "@/types";
import {
  createOrUpdateSession,
  getSession,
} from "@/lib/firestore/quizSessions";
import { useAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuizStepGender from "@/components/quiz/QuizStepGender";
import QuizStepFootLength from "@/components/quiz/QuizStepFootLength";
import QuizStepFootWidth from "@/components/quiz/QuizStepFootWidth";
import QuizStepToeShape from "@/components/quiz/QuizStepToeShape";
import QuizStepInstepHeight from "@/components/quiz/QuizStepInstepHeight";
import QuizStepCalfVolume from "@/components/quiz/QuizStepCalfVolume";
import QuizStepWeight from "@/components/quiz/QuizStepWeight";
import QuizStepAbility from "@/components/quiz/QuizStepAbility";
import QuizStepTouring from "@/components/quiz/QuizStepTouring";
import QuizStepFeatures from "@/components/quiz/QuizStepFeatures";

const TOTAL_STEPS = 10;

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    const loadExistingAnswers = async () => {
      // Check if we're editing an existing session
      const editSessionId = searchParams.get("editSessionId");

      if (editSessionId) {
        // Try to load answers from sessionStorage first (faster)
        const storedAnswers = sessionStorage.getItem("editQuizAnswers");
        if (storedAnswers) {
          try {
            const parsedAnswers = JSON.parse(storedAnswers);
            setAnswers(parsedAnswers);
            sessionStorage.removeItem("editQuizAnswers"); // Clear after use
            // Use the existing sessionId for editing
            setSessionId(editSessionId);
            localStorage.setItem("quizSessionId", editSessionId); // Update localStorage

            // Initialize session
            if (editSessionId && user) {
              createOrUpdateSession(editSessionId, { userId: user.uid });
            } else if (editSessionId) {
              createOrUpdateSession(editSessionId, {});
            }

            // Clear URL parameter after a brief delay to avoid re-render issues
            setTimeout(() => {
              if (window.location.search.includes("editSessionId")) {
                router.replace("/quiz");
              }
            }, 100);
            return;
          } catch (error) {
            console.error("Error parsing stored answers:", error);
          }
        }

        // If not in sessionStorage, fetch from Firestore
        setLoadingAnswers(true);
        try {
          const session = await getSession(editSessionId);
          if (session && session.answers) {
            setAnswers(session.answers);
            setSessionId(editSessionId);
            localStorage.setItem("quizSessionId", editSessionId); // Update localStorage

            // Initialize session
            if (editSessionId && user) {
              createOrUpdateSession(editSessionId, { userId: user.uid });
            } else if (editSessionId) {
              createOrUpdateSession(editSessionId, {});
            }
          } else {
            // Session not found, create new one
            const newId = uuidv4();
            setSessionId(newId);
            localStorage.setItem("quizSessionId", newId);
            if (user) {
              createOrUpdateSession(newId, { userId: user.uid });
            } else {
              createOrUpdateSession(newId, {});
            }
          }
        } catch (error) {
          console.error("Error loading session:", error);
          // Fall through to create new session
          const newId = uuidv4();
          setSessionId(newId);
          localStorage.setItem("quizSessionId", newId);
          if (user) {
            createOrUpdateSession(newId, { userId: user.uid });
          } else {
            createOrUpdateSession(newId, {});
          }
        } finally {
          setLoadingAnswers(false);
          // Clear URL parameter after loading
          setTimeout(() => {
            if (window.location.search.includes("editSessionId")) {
              router.replace("/quiz");
            }
          }, 100);
        }
      } else {
        // Normal flow - get or create session ID
        let id = localStorage.getItem("quizSessionId");
        if (!id) {
          id = uuidv4();
          localStorage.setItem("quizSessionId", id);
        }
        setSessionId(id);

        // Initialize session
        if (id && user) {
          createOrUpdateSession(id, { userId: user.uid });
        } else if (id) {
          createOrUpdateSession(id, {});
        }
      }
    };

    loadExistingAnswers();
  }, [user, searchParams]);

  const updateAnswers = (stepAnswers: Partial<QuizAnswers>) => {
    const newAnswers = { ...answers, ...stepAnswers };
    setAnswers(newAnswers);

    // Autosave to Firestore
    if (sessionId) {
      createOrUpdateSession(sessionId, {
        userId: user?.uid,
        answers: newAnswers as QuizAnswers,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;

    // Ensure features is always an array
    const completeAnswers: QuizAnswers = {
      ...answers,
      features: answers.features || [],
    } as QuizAnswers;

    // Validate required fields before submitting
    if (
      !completeAnswers.gender ||
      !completeAnswers.toeShape ||
      !completeAnswers.instepHeight ||
      !completeAnswers.calfVolume ||
      !completeAnswers.weightKG ||
      !completeAnswers.ability ||
      !completeAnswers.touring
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting quiz with answers:", completeAnswers);
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answers: completeAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Server error: ${response.status}`;
        console.error("Match API error:", errorMessage, errorData);
        console.error("Quiz answers sent:", answers);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Check if we got any boots back
      if (!data.boots || data.boots.length === 0) {
        toast.error(
          "No matching boots found. Please try adjusting your answers."
        );
        return;
      }

      router.push(`/results?sessionId=${sessionId}`);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      const errorMessage =
        error.message || "Failed to submit quiz. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <QuizStepGender
            value={answers.gender}
            onChange={(value) => updateAnswers({ gender: value })}
            onNext={(value) => {
              updateAnswers({ gender: value });
              handleNext();
            }}
          />
        );
      case 2:
        return (
          <QuizStepFootLength
            footLengthMM={answers.footLengthMM}
            shoeSize={answers.shoeSize}
            onNext={(value) => {
              updateAnswers(value);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <QuizStepFootWidth
            footWidth={answers.footWidth}
            onNext={(value) => {
              updateAnswers({ footWidth: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <QuizStepToeShape
            value={answers.toeShape}
            onChange={(value) => updateAnswers({ toeShape: value })}
            onNext={(value) => {
              updateAnswers({ toeShape: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <QuizStepInstepHeight
            value={answers.instepHeight}
            onChange={(value) => updateAnswers({ instepHeight: value })}
            onNext={(value) => {
              updateAnswers({ instepHeight: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <QuizStepCalfVolume
            value={answers.calfVolume}
            onChange={(value) => updateAnswers({ calfVolume: value })}
            onNext={(value) => {
              updateAnswers({ calfVolume: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <QuizStepWeight
            value={answers.weightKG}
            onNext={(value) => {
              updateAnswers({ weightKG: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 8:
        return (
          <QuizStepAbility
            value={answers.ability}
            onChange={(value) => updateAnswers({ ability: value })}
            onNext={(value) => {
              updateAnswers({ ability: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 9:
        return (
          <QuizStepTouring
            value={answers.touring}
            onChange={(value) => updateAnswers({ touring: value })}
            onNext={(value) => {
              updateAnswers({ touring: value });
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 10:
        return (
          <QuizStepFeatures
            value={answers.features || []}
            onNext={(value) => {
              updateAnswers({ features: value });
              handleSubmit();
            }}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Show loading spinner while loading answers from session
  if (loadingAnswers) {
    return (
      <div
        className="min-h-screen flex flex-col bg-gray-50"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div
          className="sticky top-0 z-50 bg-gray-50 pt-4"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <Header />
        </div>
        <main
          className="flex-grow flex items-center justify-center bg-gray-50"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ backgroundColor: "#f9fafb" }}
    >
      <div
        className="sticky top-0 z-50 bg-gray-50 pt-4"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <Header />
      </div>
      <main
        className="flex-grow bg-gray-50 pb-8"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 md:p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Step {currentStep} of {TOTAL_STEPS}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
