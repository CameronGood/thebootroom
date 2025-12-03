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
  // Brutalist mode
  brutalistMode?: boolean;
  // Custom border styling
  removeQuestionBottomBorder?: boolean;
  addInputTopBorder?: boolean;
  // Toggle section (between question and inputs)
  toggleContent?: ReactNode;
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
  brutalistMode = false,
  removeQuestionBottomBorder = false,
  addInputTopBorder = false,
  toggleContent,
}: QuizStepLayoutProps) {
  // Brutalist mode - simplified layout without outer container
  if (brutalistMode) {
    return (
      <div className="w-full border-[3px] border-[#F5E4D0]/10 bg-transparent">
        {/* Header Section */}
        <div className="px-6 py-4 border-b-[3px] border-[#F5E4D0]/10">
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold uppercase text-[#F4F4F4] pr-8">
              {title}
            </h2>
            {helpContent && (
              <div className="absolute top-0 right-0">
                {helpContent}
              </div>
            )}
          </div>
        </div>

        {/* Question/Description Section */}
        <div className={`px-6 py-4 border-r-[3px] border-[#F5E4D0]/10 w-fit ${removeQuestionBottomBorder && !toggleContent ? '' : 'border-b-[3px]'}`}>
          <p className="text-[#F4F4F4] text-base lg:text-lg xl:text-xl text-left leading-relaxed">
            {description}
          </p>
        </div>

        {/* Toggle Section */}
        {toggleContent && (
          <div className="px-6 py-4 border-r-[3px] border-[#F5E4D0]/10 w-fit">
            {toggleContent}
          </div>
        )}

        {/* Content/Input Section */}
        <div className={`px-6 py-4 border-r-[3px] border-[#F5E4D0]/10 ${toggleContent || addInputTopBorder ? 'border-t-[3px]' : ''} w-fit`}>
          <div className={`${noContentSpacing ? '' : 'max-h-[60vh] overflow-y-auto'}`}>
            {children}
          </div>
        </div>

        {/* Button Section */}
        <div className="px-6 py-4 border-t-[3px] border-[#F5E4D0]/10">
          <div className="flex justify-between items-center">
            {showBackButton && onBack ? (
              <button
                onClick={onBack}
                className="px-4 py-2 lg:px-6 lg:py-3 border-[3px] border-[#F5E4D0]/10 text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 font-bold uppercase min-h-[40px] lg:min-h-[44px] transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={onNext}
              disabled={!isValid}
              className="px-4 py-2 lg:px-6 lg:py-3 bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] border-[3px] border-[#F5E4D0]/10 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-bold uppercase min-h-[40px] lg:min-h-[44px] transition-colors ml-auto"
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen flex flex-col bg-[#040404]">
        {/* Top Header */}
        <div className="bg-[#040404] border-b border-[#F5E4D0]/10 px-4 py-2 safe-area-top mt-[50px] border border-[#F5E4D0]/15">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#F4F4F4] flex-1 text-center">
              {title}
            </h1>
            <div className="flex-shrink-0 w-8 flex justify-center">
              {helpContent || <div className="w-6"></div>}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6 min-h-0 border border-[#F5E4D0]/15">
          <p className="text-[#F4F4F4] text-base leading-relaxed text-center mb-10">
              {description}
            </p>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="w-full max-w-sm">
              {children}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="bg-[#040404] border-t border-[#F5E4D0]/10 px-4 py-4 safe-area-bottom border border-[#F5E4D0]/15">
          <div className="flex gap-3 justify-end">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="px-6 py-3 border border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 rounded-lg font-medium min-h-[44px] flex-1 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!isValid}
              className="px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] border border-[#F5E4D0] disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-medium min-h-[44px] flex-1 transition-colors"
            >
              {nextButtonText}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Viewport Optimized */}
      <div className="hidden md:flex h-screen flex-col bg-[#040404]">
        <div className="flex-1 flex items-start justify-center px-[200px] pt-[120px]">
          <div className="w-[90%] border border-[#F5E4D0]/15 px-6 lg:px-10 py-8">
            {/* Header Section - Bracketed Title and Question */}
            <div className="mb-8">
              <div className="relative mb-4">
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-left">
                <span className="text-3xl lg:text-4xl xl:text-5xl">[</span> {title} <span className="text-3xl lg:text-4xl xl:text-5xl">]</span>
              </h2>
              {helpContent && (
                <div className="absolute top-0 right-0">
                  {helpContent}
                </div>
              )}
            </div>
        {/* Body Text/Question Section */}
              <p className="text-[#F4F4F4] text-base lg:text-lg xl:text-xl text-left leading-relaxed max-w-2xl">
              {description}
            </p>
        </div>

            {/* Content Section */}
            <div className={`${noContentSpacing ? 'mt-6' : 'mt-10'} ${noContentSpacing ? 'h-fit' : 'max-h-[60vh] overflow-y-auto'}`}>
              {children}
        </div>

            {/* Button Section */}
            <div className="mt-10">
            <div className="flex gap-3 lg:gap-4">
              {showBackButton && onBack && (
                <button
                  onClick={onBack}
                    className="px-4 py-2 lg:px-6 lg:py-3 border border-[#F5E4D0] text-[#F5E4D0] bg-transparent hover:bg-[#F5E4D0]/10 rounded-lg font-medium min-h-[40px] lg:min-h-[44px] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                disabled={!isValid}
                  className="px-4 py-2 lg:px-6 lg:py-3 bg-[#F5E4D0] text-[#2B2D30] rounded-lg hover:bg-[#E8D4B8] border border-[#F5E4D0] disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed font-medium min-h-[40px] lg:min-h-[44px] transition-colors"
              >
                {nextButtonText}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
