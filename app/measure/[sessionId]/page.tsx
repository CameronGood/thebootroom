"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getMeasurementSession } from "@/lib/firestore/measurementSessions";
import { MeasurementSession } from "@/types";
import FootMeasurementCamera from "@/components/measure/FootMeasurementCamera";
import DelayedSpinner from "@/components/DelayedSpinner";
import DesktopMeasurementFlow from "@/components/measure/DesktopMeasurementFlow";

export default function MeasurePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<MeasurementSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [measurementUrl, setMeasurementUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Session ID is required");
      setLoading(false);
      return;
    }

    const loadSession = async () => {
      try {
        const loadedSession = await getMeasurementSession(sessionId);
        if (!loadedSession) {
          setError("Measurement session not found");
        } else {
          setSession(loadedSession);
        }

        // If desktop flow, also fetch QR code payload
        const isDesktop = searchParams.get("desktop") === "true";
        if (isDesktop) {
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
  }, [sessionId, searchParams]);

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

  const isDesktop = searchParams.get("desktop") === "true";
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

  return <FootMeasurementCamera sessionId={sessionId} session={session} />;
}

