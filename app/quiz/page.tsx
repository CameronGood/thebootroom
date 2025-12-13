"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
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
import BrutalistQuizForm from "@/components/quiz/BrutalistQuizForm";

// Import all quiz step components directly (no dynamic loading to prevent delays)
import QuizStepGender from "@/components/quiz/QuizStepGender";
import QuizStepFootLength from "@/components/quiz/QuizStepFootLength";
import QuizStepFootWidth from "@/components/quiz/QuizStepFootWidth";
import QuizStepToeShape from "@/components/quiz/QuizStepToeShape";
import QuizStepInstepHeight from "@/components/quiz/QuizStepInstepHeight";
import QuizStepCalfVolume from "@/components/quiz/QuizStepCalfVolume";
import QuizStepWeight from "@/components/quiz/QuizStepWeight";
import QuizStepAbility from "@/components/quiz/QuizStepAbility";
import QuizStepBootType from "@/components/quiz/QuizStepBootType";
import QuizStepAnkleVolume from "@/components/quiz/QuizStepAnkleVolume";

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const loadExistingAnswers = async () => {
      // Check if we're editing an existing session
      const editSessionId = searchParams.get("editSessionId");
      const stepParam = searchParams.get("step");

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

            // Set step if provided
            if (stepParam) {
              const stepNum = parseInt(stepParam, 10);
              if (stepNum >= 1 && stepNum <= TOTAL_STEPS) {
                setCurrentStep(stepNum);
              }
            }

            // Initialize session
            if (editSessionId && user) {
              createOrUpdateSession(editSessionId, { userId: user.uid });
            } else if (editSessionId) {
              createOrUpdateSession(editSessionId, {});
            }

            // Clear URL parameter after a brief delay to avoid re-render issues
            setTimeout(() => {
              router.replace("/quiz");
            }, 100);
            setInitialized(true);
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

            // Set step if provided
            if (stepParam) {
              const stepNum = parseInt(stepParam, 10);
              if (stepNum >= 1 && stepNum <= TOTAL_STEPS) {
                setCurrentStep(stepNum);
              }
            }

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
            router.replace("/quiz");
          }, 100);
          setInitialized(true);
        }
      } else {
        // Normal flow - always generate a new session ID for a new quiz
        // Clear any existing session ID to ensure each quiz gets a unique ID
        localStorage.removeItem("quizSessionId");
        const newId = uuidv4();
        localStorage.setItem("quizSessionId", newId);
        setSessionId(newId);

        // Reset answers and step for new quiz
        setAnswers({});
        setCurrentStep(1);

        // Initialize session
        if (newId && user) {
          createOrUpdateSession(newId, { userId: user.uid });
        } else if (newId) {
          createOrUpdateSession(newId, {});
        }

        setInitialized(true);
      }
    };

    loadExistingAnswers();
  }, [user, searchParams, initialized]);

  const updateAnswers = (stepAnswers: Partial<QuizAnswers>) => {
    const newAnswers = { ...answers };
    
    // Update with new values, and delete keys that are explicitly set to undefined
    Object.keys(stepAnswers).forEach((key) => {
      const value = stepAnswers[key as keyof QuizAnswers];
      if (value === undefined) {
        delete newAnswers[key as keyof QuizAnswers];
      } else {
        (newAnswers as any)[key] = value;
      }
    });
    setAnswers(newAnswers);

    // Autosave to Firestore
    if (sessionId) {
      // Ensure features is always an array when saving
      const answersToSave = {
        ...newAnswers,
        features: (newAnswers as any).features || [],
      } as QuizAnswers;
      
      createOrUpdateSession(sessionId, {
        userId: user?.uid,
        answers: answersToSave,
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

  const handleSubmitWithAnswers = async (answersToSubmit: Partial<QuizAnswers> = answers) => {
    if (!sessionId) return;

    // Ensure features is always an array
    const completeAnswers: QuizAnswers = {
      ...answersToSubmit,
      features: answersToSubmit.features || [],
    } as QuizAnswers;

    // Validate required fields before submitting
    if (
      !completeAnswers.gender ||
      !completeAnswers.toeShape ||
      !completeAnswers.instepHeight ||
      !completeAnswers.ankleVolume ||
      !completeAnswers.calfVolume ||
      !completeAnswers.weightKG ||
      !completeAnswers.ability ||
      !completeAnswers.bootType
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
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

      // Clear localStorage session ID before redirecting to results
      // This ensures the next quiz will get a fresh session ID
      localStorage.removeItem("quizSessionId");
      
      router.push(`/results?sessionId=${sessionId}`);
    } catch (error: unknown) {
      console.error("Error submitting quiz:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit quiz. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStepComponent = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        // Anatomy (Gender)
        return (
          <QuizStepGender
            value={answers.gender}
            onChange={(value) => updateAnswers({ gender: value })}
            onNext={(value) => {
              updateAnswers({ gender: value });
              handleNext();
            }}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 2:
        // Ski Boot Type
        return (
          <QuizStepBootType
            value={answers.bootType}
            onChange={(value) => updateAnswers({ bootType: value })}
            onNext={(value) => {
              updateAnswers({ bootType: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 3:
        // Skiing Ability
        return (
          <QuizStepAbility
            value={answers.ability}
            onChange={(value) => updateAnswers({ ability: value })}
            onNext={(value) => {
              updateAnswers({ ability: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 4:
        // Weight
        return (
          <QuizStepWeight
            value={answers.weightKG}
            gender={answers.gender}
            onNext={(value) => {
              updateAnswers({ weightKG: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 5:
        // Foot Length
        return (
          <QuizStepFootLength
            footLengthMM={answers.footLengthMM}
            shoeSize={answers.shoeSize}
            gender={answers.gender}
            onNext={(value) => {
              updateAnswers(value);
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 6:
        // Foot Width
        return (
          <QuizStepFootWidth
            footWidth={answers.footWidth}
            onNext={(value) => {
              updateAnswers({ footWidth: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 7:
        // Toe Box
        return (
          <QuizStepToeShape
            value={answers.toeShape}
            onChange={(value) => updateAnswers({ toeShape: value })}
            onNext={(value) => {
              updateAnswers({ toeShape: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 8:
        // Instep
        return (
          <QuizStepInstepHeight
            value={answers.instepHeight}
            onChange={(value) => updateAnswers({ instepHeight: value })}
            onNext={(value) => {
              updateAnswers({ instepHeight: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 9:
        // Ankle
        return (
          <QuizStepAnkleVolume
            value={answers.ankleVolume}
            onChange={(value) => updateAnswers({ ankleVolume: value })}
            onNext={(value) => {
              updateAnswers({ ankleVolume: value });
              handleNext();
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      case 10:
        // Calf
        return (
          <QuizStepCalfVolume
            value={answers.calfVolume}
            onChange={(value) => updateAnswers({ calfVolume: value })}
            onNext={(value) => {
              // Update answers with calf volume and ensure features is empty array
              const updatedAnswers = { ...answers, calfVolume: value, features: [] };
              updateAnswers({ calfVolume: value, features: [] });
              
              // Submit directly after calf step
              handleSubmitWithAnswers(updatedAnswers);
            }}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        return "Anatomy";
      case 2:
        return "Boot Type";
      case 3:
        return "Ability";
      case 4:
        return "Weight";
      case 5:
        return "Foot Length";
      case 6:
        return "Foot Width";
      case 7:
        return "Toe Shape";
      case 8:
        return "Instep Height";
      case 9:
        return "Ankle Volume";
      case 10:
        return "Calf Volume";
      default:
        return "";
    }
  };

  const getStepDescription = (stepNum: number): string => {
    switch (stepNum) {
      case 1:
        return "Select the anatomy that best matches your lower leg and foot shape.";
      case 2:
        return "Select the type of Ski Boot you are looking for.";
      case 3:
        return "Select an option that best matches your ability.";
      case 4:
        return "Please input your weight. This will be used to help select the boot flex.";
      case 5:
        return "Please input your foot length.";
      case 6:
        return "Please input your foot width.";
      case 7:
        return "Select the toe shape that best matches your foot.";
      case 8:
        return "Select the instep height that best matches your foot.";
      case 9:
        return "Select the ankle volume that best matches your foot.";
      case 10:
        return "Select the calf volume that best matches your leg.";
      default:
        return "";
    }
  };

  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((stepNum) => ({
    stepNumber: stepNum,
    title: getStepTitle(stepNum),
    description: getStepDescription(stepNum),
    component: getStepComponent(stepNum),
    isCompleted: false, // Will be calculated in BrutalistQuizForm
  }));


  // Show loading spinner while loading answers from session
  if (loadingAnswers) {
    return (
      <div
        className="min-h-screen flex flex-col bg-[#040404]"
      >
        <div
          className="sticky top-0 z-[9999] bg-[#040404] pt-4"
        >
          <Header />
        </div>
        <main
          className="flex-grow flex items-center justify-center bg-[#040404]"
        >
          <Spinner size="lg" />
        </main>
      </div>
    );
  }

  return (
    <>
      <div
        className="sticky top-0 z-[9999] bg-[#040404] pt-4 pb-0"
      >
        <Header />
      </div>
      <BrutalistQuizForm
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
        answers={answers}
        steps={steps}
        onStepClick={(stepNum) => {
          // Allow navigating to any completed step
          const isStepCompleted = (stepNum: number): boolean => {
            switch (stepNum) {
              case 1:
                return !!answers.gender;
              case 2:
                return !!answers.bootType;
              case 3:
                return !!answers.ability;
              case 4:
                return !!answers.weightKG;
              case 5:
                return !!(answers.footLengthMM || answers.shoeSize);
              case 6:
                return !!answers.footWidth;
              case 7:
                return !!answers.toeShape;
              case 8:
                return !!answers.instepHeight;
              case 9:
                return !!answers.ankleVolume;
              case 10:
                return !!answers.calfVolume;
              default:
                return false;
            }
          };
          
          if (isStepCompleted(stepNum) || stepNum <= currentStep) {
            setCurrentStep(stepNum);
          }
        }}
      />
    </>
  );
}
