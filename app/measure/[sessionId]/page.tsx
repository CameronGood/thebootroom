"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMeasurementSession } from "@/lib/firestore/measurementSessions";
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

export default function MeasurePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<MeasurementSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [measurementUrl, setMeasurementUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }

    // Detect device type
    const isMobile = isMobileOrTablet();
    setIsDesktop(!isMobile);

    const loadSession = async () => {
      try {
        const loadedSession = await getMeasurementSession(sessionId);
        if (!loadedSession) {
          setError("Measurement session not found");
        } else {
          setSession(loadedSession);
        }

        // If desktop flow, also fetch QR code payload
        if (!isMobile) {
          const qrRes = await fetch(
            `/api/measurements/session-link?sessionId=${sessionId}`
          );
          if (!qrRes.ok) {
            throw new Error("Failed to generate QR code");
          }
          const qrData = await qrRes.json();
          setQrCode(qrData.qrCode);
          setMeasurementUrl(qrData.url);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Failed to load measurement session");
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

