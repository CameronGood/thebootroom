"use client";

import { ReactNode } from "react";

interface QuizStepLayoutProps {
  title: string;
  description: string;
  helpContent?: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  isValid: boolean;
  nextButtonText?: string;
  showBackButton?: boolean;
  children: ReactNode;
  // Mobile layout props
  currentStep?: number;
  totalSteps?: number;
  // Spacing control
  noContentSpacing?: boolean;
}

export default function QuizStepLayout({
  title,
  description,
  helpContent,
  onBack,
  onNext,
  isValid,
  nextButtonText = "Next",
  showBackButton = true,
  children,
  currentStep,
  totalSteps,
  noContentSpacing = false,
}: QuizStepLayoutProps) {
  const progressPercentage = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen flex flex-col bg-[#040404]">
        {/* Top Header with Progress Bar, Title, and Help Icon */}
        <div className="bg-[#040404] border-b border-[#F5E4D0]/10 px-4 py-2 safe-area-top">
          <div className="flex items-center gap-2">
            {/* Progress Bar */}
            {currentStep && totalSteps && (
              <div className="flex-shrink-0 w-20">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#F5E4D0] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-[#F4F4F4]/60 mt-0.5 text-center">
                  {currentStep}/{totalSteps}
                </div>
              </div>
            )}
            
            {/* Step Title */}
            <h1 className="text-lg font-bold text-[#F4F4F4] flex-1 text-center">
              {title}
            </h1>
            
            {/* Help Icon */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {helpContent || <div className="w-6"></div>}
            </div>
          </div>
        </div>

        {/* Centered Content Area */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6 min-h-0">
          {/* Description */}
          <div className="text-center mb-8">
            <p className="text-[#F4F4F4] text-base leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Main Content - Truly Centered */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-sm">
              {children}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="bg-[#040404] border-t border-[#F5E4D0]/10 px-4 py-4 safe-area-bottom">
          <div className="flex gap-3 justify-end">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium min-h-[44px] flex-1 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!isValid}
              className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-300 disabled:cursor-not-allowed font-medium min-h-[44px] flex-1 transition-colors"
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Viewport Optimized */}
      <div className="hidden md:flex h-screen flex-col bg-[#040404]">
        {/* Header Section - Bracketed Title */}
        <div className="flex-shrink-0 w-full max-w-4xl mx-auto px-4 lg:px-8 pt-3 md:-mt-[40px] md:pt-4">
          <div className="flex flex-col justify-center">
            <div className="relative mb-2 lg:mb-3">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-center md:text-left md:-ml-[200px]">
                <span className="text-3xl lg:text-4xl xl:text-5xl">[</span> {title} <span className="text-3xl lg:text-4xl xl:text-5xl">]</span>
              </h2>
              {helpContent && (
                <div className="absolute top-0 right-0">
                  {helpContent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body Text/Question Section */}
        <div className="flex-shrink-0 w-full max-w-4xl mx-auto px-4 lg:px-8 md:mt-[50px] relative z-10">
          <div className="flex flex-col justify-center">
            <p className="text-[#F4F4F4] text-sm lg:text-base xl:text-lg text-center max-w-2xl mx-auto leading-relaxed bg-[#040404] px-4 py-2 rounded">
              {description}
            </p>
          </div>
        </div>

        {/* Content Section - ~60-70vh (flexible) */}
        <div className={`w-full max-w-4xl mx-auto px-4 lg:px-8 min-h-0 ${noContentSpacing ? '' : 'md:mt-[50px]'}`}>
          <div className="flex flex-col justify-start py-2">
            <div className="w-full max-w-3xl mx-auto max-h-[60vh] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>

        {/* Button Section - 50px below inputs */}
        <div className="flex-shrink-0 w-full max-w-4xl mx-auto px-4 lg:px-8 pb-3 md:pb-4 md:mt-[50px]">
          <div className="flex items-center justify-end">
            <div className="flex gap-3 lg:gap-4">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 lg:px-6 lg:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium min-h-[40px] lg:min-h-[44px] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                disabled={!isValid}
                className="px-4 py-2 lg:px-6 lg:py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] disabled:bg-gray-300 disabled:cursor-not-allowed font-medium min-h-[40px] lg:min-h-[44px] transition-colors"
              >
                {nextButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
