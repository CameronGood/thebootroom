"use client";

import { useState, useEffect } from "react";
import { MeasurementSession } from "@/types";
import MeasurementStatus from "./MeasurementStatus";
import { Loader2 } from "lucide-react";

interface DesktopMeasurementFlowProps {
  sessionId: string;
  qrCodeUrl: string;
  measurementUrl: string;
}

export default function DesktopMeasurementFlow({
  sessionId,
  qrCodeUrl,
  measurementUrl,
}: DesktopMeasurementFlowProps) {
  const [session, setSession] = useState<MeasurementSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollError, setPollError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [pausedReason, setPausedReason] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeout: any;
    let pollCount = 0;
    let lastStatus: string | null = null;
    let unchangedCount = 0;
    const maxPolls = 90; // hard cap to prevent endless polling (approx ~6-8 min with backoff)

    function getDelayMs(): number {
      // Gentle backoff: fast initial feedback, then slow down to reduce load
      if (pollCount < 5) return 1000; // first ~5s
      if (pollCount < 15) return 3000; // next ~30s
      return 5000; // thereafter
    }

    async function poll() {
      try {
        if (cancelled) return;
        if (!isPolling) return;
        pollCount += 1;

        // Stop polling if tab is hidden (resume when visible)
        if (typeof document !== "undefined" && document.hidden) {
          timeout = setTimeout(poll, 2000);
          return;
        }

        if (pollCount > maxPolls) {
          setIsPolling(false);
          setPausedReason(
            "Paused updates to reduce background requests. Tap Resume after you scan the QR code."
          );
          return;
        }

        const res = await fetch(
          `/api/measurements/session-status?sessionId=${sessionId}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Status ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;

        if (lastStatus === data.status) {
          unchangedCount += 1;
        } else {
          unchangedCount = 0;
          lastStatus = data.status;
        }

        setSession({
          quizSessionId: data.quizSessionId,
          status: data.status,
          sockThickness: data.sockThickness,
          photo1: data.photo1,
          photo2: data.photo2,
          final: data.final,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
          errorMessage: data.errorMessage,
        } as MeasurementSession);
        setLoading(false);
        setPollError(null);

        // stop polling once terminal
        if (data.status === "complete" || data.status === "failed") {
          setIsPolling(false);
          setPausedReason(null);
          return;
        }

        // If we're stuck in idle/capturing for a while, pause automatically
        // (This prevents infinite polling if the user walks away.)
        if (
          (data.status === "idle" || data.status === "capturing") &&
          unchangedCount >= 30 // ~2-3 min depending on backoff
        ) {
          setIsPolling(false);
          setPausedReason(
            "Paused updates while waiting for your phone. Tap Resume after you scan the QR code."
          );
          return;
        }
      } catch (e) {
        if (cancelled) return;
        setLoading(false);
        setPollError(e instanceof Error ? e.message : "Failed to poll status");
      } finally {
        if (!cancelled && isPolling) {
          timeout = setTimeout(poll, getDelayMs());
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [sessionId, isPolling]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#F5E4D0] animate-spin" />
      </div>
    );
  }

  if (pollError) {
    return (
      <div className="space-y-4">
        <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-[4px]">
          <p className="text-red-400 font-semibold">Couldn’t load status</p>
          <p className="text-[#F4F4F4]/80 text-sm">{pollError}</p>
        </div>
      </div>
    );
  }

  const getPhotoNumber = (): 1 | 2 | undefined => {
    if (!session) return undefined;
    if (session.photo1 && !session.photo1.processed) return 1;
    if (session.photo2 && !session.photo2.processed) return 2;
    if (session.status === "processing" && session.photo1?.processed && !session.photo2?.processed) return 2;
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#F4F4F4] mb-4">
          Scan QR Code with Your Phone
        </h2>
        <p className="text-[#F4F4F4]/70 mb-6">
          Open your phone camera and scan the QR code below to start measuring
          your feet.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="border border-[#F5E4D0]/20 bg-[#2B2D30]/50 p-6 rounded-[8px]">
          <img
            src={qrCodeUrl}
            alt="QR Code for measurement"
            className="w-64 h-64"
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-[#F4F4F4]/70">Or visit this URL on your phone:</p>
          <a
            href={measurementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5E4D0] underline break-all text-sm"
          >
            {measurementUrl}
          </a>
        </div>
      </div>

      {session && (
        <div className="space-y-3">
          {pausedReason && (
            <div className="border border-yellow-500/30 bg-yellow-500/10 p-4 rounded-[4px]">
              <p className="text-yellow-400 font-semibold mb-1">Updates paused</p>
              <p className="text-[#F4F4F4]/80 text-sm mb-3">{pausedReason}</p>
              <button
                type="button"
                onClick={() => {
                  setPausedReason(null);
                  setIsPolling(true);
                }}
                className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] font-bold uppercase rounded-[4px] hover:bg-[#E8D4B8] transition-colors"
              >
                Resume
              </button>
            </div>
          )}

          <MeasurementStatus
            status={session.status}
            photoNumber={getPhotoNumber()}
            left={session.final?.left}
            right={session.final?.right}
            errorMessage={session.errorMessage}
          />
        </div>
      )}
    </div>
  );
}

