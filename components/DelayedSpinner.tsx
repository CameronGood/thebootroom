"use client";

import { useState, useEffect } from "react";
import Spinner from "./Spinner";

interface DelayedSpinnerProps {
  size?: "sm" | "md" | "lg";
  delay?: number; // Delay in milliseconds before showing spinner
  isLoading?: boolean; // Optional prop to control visibility
}

export default function DelayedSpinner({
  size = "md",
  delay = 400,
  isLoading = true,
}: DelayedSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSpinner(false);
      return;
    }

    // Only show spinner after delay
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  if (!showSpinner || !isLoading) {
    return null;
  }

  return <Spinner size={size} />;
}

