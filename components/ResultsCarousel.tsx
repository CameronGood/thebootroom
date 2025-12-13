"use client";

import { useState, useEffect, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { BootSummary, FittingBreakdown } from "@/types";
import ResultCard from "@/components/ResultCard";

interface ResultsCarouselProps {
  boots: BootSummary[];
  sessionId?: string;
  recommendedMondo: string;
  footLength?: { left: number; right: number };
  shoeSize?: { system: "UK" | "US" | "EU"; value: number };
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  modelsVisible: boolean;
  onToggleModelsVisibility: () => void;
  selectedModels: Record<string, Set<number>>;
  onUpdateSelectedModels: (bootId: string, modelIndices: Set<number>) => void;
  onPurchaseComparison: () => void;
  resetToFirst?: boolean; // Prop to reset carousel to first card
  isFlipped?: boolean;
  breakdown?: FittingBreakdown;
  generatingBreakdown?: boolean;
  onFlipBack?: () => void;
  onViewComparison?: () => void;
}

const CARD_OFFSET = 60; // How much of the next/prev card is visible (in pixels)
const OPACITY_BEHIND = 0.35; // Opacity for cards behind current
const OPACITY_ADJACENT = 0.85; // Opacity for adjacent cards

export default function ResultsCarousel({
  boots,
  sessionId,
  recommendedMondo,
  footLength,
  shoeSize,
  isCompareMode,
  onToggleCompareMode,
  modelsVisible,
  onToggleModelsVisibility,
  selectedModels,
  onUpdateSelectedModels,
  onPurchaseComparison,
  resetToFirst,
  isFlipped,
  breakdown,
  generatingBreakdown,
  onFlipBack,
  onViewComparison,
}: ResultsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to first card when resetToFirst prop changes from false to true
  const prevResetToFirst = useRef(false);
  useEffect(() => {
    if (resetToFirst && !prevResetToFirst.current) {
      setCurrentIndex(0);
    }
    prevResetToFirst.current = resetToFirst || false;
  }, [resetToFirst]);

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Calculate the transform for each card
  const getCardX = (index: number) => {
    return (index - currentIndex) * (containerWidth - CARD_OFFSET);
  };

  const getCardStyle = (index: number) => {
    const distance = Math.abs(index - currentIndex);
    const zIndex = boots.length - distance;
    
    let opacity = 1;
    if (index === currentIndex) {
      opacity = 1;
    } else if (index === currentIndex - 1 || index === currentIndex + 1) {
      opacity = OPACITY_ADJACENT;
    } else {
      opacity = OPACITY_BEHIND;
    }

    const scale = index === currentIndex ? 1 : 0.96;

    return {
      x: getCardX(index),
      zIndex,
      opacity,
      scale,
    };
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = containerWidth * 0.2; // 20% of card width to trigger swipe
    const velocityThreshold = 500; // Minimum velocity to trigger swipe

    if ((info.offset.x > threshold || info.velocity.x > velocityThreshold) && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if ((info.offset.x < -threshold || info.velocity.x < -velocityThreshold) && currentIndex < boots.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Get drag constraints based on current index
  const getDragConstraints = () => {
    if (currentIndex === 0) {
      return { left: 0, right: boots.length > 1 ? containerWidth * 0.3 : 0 };
    } else if (currentIndex === boots.length - 1) {
      return { left: -containerWidth * 0.3, right: 0 };
    } else {
      return { left: -containerWidth * 0.3, right: containerWidth * 0.3 };
    }
  };

  if (containerWidth === 0) {
    return (
      <div ref={containerRef} className="relative w-full md:hidden">
          {boots[0] && (
            <ResultCard
              boot={boots[0]}
              sessionId={sessionId}
              index={0}
              recommendedSize={recommendedMondo}
              footLength={footLength}
              shoeSize={shoeSize}
              isCompareMode={isCompareMode}
              onToggleCompareMode={onToggleCompareMode}
              modelsVisible={modelsVisible}
              onToggleModelsVisibility={onToggleModelsVisibility}
              selectedModels={selectedModels[boots[0].bootId] || new Set()}
              onUpdateSelectedModels={onUpdateSelectedModels}
              onPurchaseComparison={onPurchaseComparison}
              hasBreakdown={!!breakdown}
              generatingBreakdown={!!generatingBreakdown}
            />
          )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full md:hidden overflow-visible"
      style={{ 
        perspective: "1000px"
      }}
    >
      {boots.map((boot, index) => {
        const isCurrent = index === currentIndex;
        const style = getCardStyle(index);

        return (
          <motion.div
            key={boot.bootId}
            className={`w-full ${isCurrent ? 'relative' : 'absolute top-0 left-0'}`}
            initial={false}
            animate={isCurrent ? {
              x: style.x,
              opacity: style.opacity,
              scale: style.scale,
            } : {
              x: style.x,
              opacity: style.opacity,
              scale: style.scale,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 35,
            }}
            style={isCurrent ? {
              zIndex: style.zIndex,
            } : {
              zIndex: style.zIndex,
              maxHeight: "100%",
            }}
            drag={isCurrent ? "x" : false}
            dragConstraints={isCurrent ? getDragConstraints() : undefined}
            dragElastic={0.1}
            onDragEnd={isCurrent ? handleDragEnd : undefined}
            whileDrag={isCurrent ? { cursor: "grabbing" } : {}}
            dragPropagation={false}
          >
              {(() => {
                const breakdownSection = breakdown?.sections.find(s => s.bootId === boot.bootId);
                const bootScore = boot.score;
                return (
              <ResultCard
                boot={boot}
                sessionId={sessionId}
                index={index}
                recommendedSize={recommendedMondo}
                footLength={footLength}
                shoeSize={shoeSize}
                isCompareMode={isCompareMode}
                onToggleCompareMode={onToggleCompareMode}
                modelsVisible={modelsVisible}
                onToggleModelsVisibility={onToggleModelsVisibility}
                selectedModels={selectedModels[boot.bootId] || new Set()}
                onUpdateSelectedModels={onUpdateSelectedModels}
                onPurchaseComparison={onPurchaseComparison}
                isFlipped={isFlipped}
                generatingBreakdown={!!generatingBreakdown}
                breakdownSection={breakdownSection}
                bootScore={bootScore}
                onFlipBack={onFlipBack}
                onViewComparison={onViewComparison}
                hasBreakdown={!!breakdown}
              />
                );
              })()}
          </motion.div>
        );
      })}
    </div>
  );
}
