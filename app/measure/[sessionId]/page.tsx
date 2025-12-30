"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MeasurementSession } from "@/types";
import FootMeasurementCamera from "@/components/measure/FootMeasurementCamera";
import DelayedSpinner from "@/components/DelayedSpinner";
import DesktopMeasurementFlow from "@/components/measure/DesktopMeasurementFlow";

// Improved device detection function
function isMobileOrTablet(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check user agent for mobile/tablet devices
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const isMobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Check for touch support (tablets often have this)
  const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  
  // Check screen width (mobile/tablet typically < 1024px, but this is less reliable)
  const isSmallScreen = window.innerWidth < 1024;
  
  // Mobile/tablet if: has mobile UA OR (has touch AND small screen)
  return isMobileUA || (hasTouchScreen && isSmallScreen);
}

// Helper to convert API response to MeasurementSession type
function convertApiResponseToSession(apiData: any): MeasurementSession {
  return {
    quizSessionId: apiData.quizSessionId,
    status: apiData.status,
    sockThickness: apiData.sockThickness,
    photo1: apiData.photo1,
    photo2: apiData.photo2,
    final: apiData.final,
    createdAt: new Date(apiData.createdAt),
    completedAt: apiData.completedAt ? new Date(apiData.completedAt) : undefined,
    errorMessage: apiData.errorMessage,
  };
}

export default function MeasurePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<MeasurementSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [measurementUrl, setMeasurementUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }

    // Detect device type
    const isMobile = isMobileOrTablet();
    setIsDesktop(!isMobile);

    const loadSession = async (retry = 0) => {
      try {
        // Use API route instead of direct Firestore access
        const response = await fetch(
          `/api/measurements/get-session?sessionId=${sessionId}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Failed to load session (${response.status})`;
          
          // Retry once if it's a 404 (might be propagation delay)
          if (response.status === 404 && retry < 1) {
            console.log(`Session not found, retrying... (attempt ${retry + 1})`);
            setTimeout(() => loadSession(retry + 1), 1000);
            return;
          }
          
          throw new Error(errorMessage);
        }

        const apiData = await response.json();
        const loadedSession = convertApiResponseToSession(apiData);
        setSession(loadedSession);

        // If desktop flow, also fetch QR code payload
        if (!isMobile) {
          const qrRes = await fetch(
            `/api/measurements/session-link?sessionId=${sessionId}`
          );
          if (!qrRes.ok) {
            const qrErrorData = await qrRes.json().catch(() => ({}));
            throw new Error(qrErrorData.error || "Failed to generate QR code");
          }
          const qrData = await qrRes.json();
          setQrCode(qrData.qrCode);
          setMeasurementUrl(qrData.url);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load measurement session";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center">
        <DelayedSpinner size="lg" isLoading={loading} />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error || "Session not found"}</p>
          <p className="text-[#F4F4F4]/70">
            Please try scanning the QR code again or check your connection.
          </p>
        </div>
      </div>
    );
  }

  // Desktop: Show QR code flow
  if (isDesktop) {
    if (!qrCode || !measurementUrl) {
      return (
        <div className="min-h-screen bg-[#040404] flex items-center justify-center">
          <DelayedSpinner size="lg" isLoading={true} />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#040404] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <DesktopMeasurementFlow
            sessionId={sessionId}
            qrCodeUrl={qrCode}
            measurementUrl={measurementUrl}
          />
        </div>
      </div>
    );
  }

  // Mobile/Tablet: Show camera directly
  return <FootMeasurementCamera sessionId={sessionId} session={session} />;
}

