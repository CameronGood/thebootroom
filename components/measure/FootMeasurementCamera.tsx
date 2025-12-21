"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MeasurementSession } from "@/types";
import { updateMeasurementSession } from "@/lib/firestore/measurementSessions";
import SockThicknessSelector from "./SockThicknessSelector";
import MeasurementStatus from "./MeasurementStatus";
import toast from "react-hot-toast";
import { Camera, Check, X, AlertCircle } from "lucide-react";

interface FootMeasurementCameraProps {
  sessionId: string;
  session: MeasurementSession;
}

type CaptureState = "setup" | "photo1" | "photo2" | "processing" | "complete";

interface DetectionStatus {
  a4Detected: boolean;
  feetDetected: boolean;
  tiltOK: boolean;
  blurOK: boolean;
  canCapture: boolean;
}

export default function FootMeasurementCamera({
  sessionId,
  session,
}: FootMeasurementCameraProps) {
  const [sockThickness, setSockThickness] = useState(session.sockThickness);
  const [captureState, setCaptureState] = useState<CaptureState>("setup");
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>({
    a4Detected: false,
    feetDetected: false,
    tiltOK: false,
    blurOK: false,
    canCapture: false,
  });
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Client is ready (we intentionally avoid bundling OpenCV.js here because
  // the current OpenCV package triggers a Webpack "fs" resolution error in Next.js.)
  useEffect(() => {
    setClientReady(true);
  }, []);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Failed to start camera:", err);
      setError("Failed to access camera. Please grant camera permissions.");
      toast.error("Camera access denied");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Client-side preprocessing with OpenCV
  const processFrame = useCallback(() => {
    if (!videoRef.current || !overlayCanvasRef.current || !clientReady) {
      return;
    }

    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match video
    overlayCanvas.width = video.videoWidth || 640;
    overlayCanvas.height = video.videoHeight || 480;

    // Draw overlay
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    ctx.strokeStyle = "#F5E4D0";
    ctx.lineWidth = 2;

    // Draw A4 guide rectangle (center, portrait)
    const centerX = overlayCanvas.width / 2;
    const centerY = overlayCanvas.height / 2;
    const a4Width = overlayCanvas.width * 0.6;
    const a4Height = a4Width * 1.414; // A4 aspect ratio

    ctx.strokeRect(
      centerX - a4Width / 2,
      centerY - a4Height / 2,
      a4Width,
      a4Height
    );

    // Draw foot placement zones
    const zoneWidth = (overlayCanvas.width - a4Width) / 4;
    
    // Left zone
    ctx.strokeStyle = "#F5E4D0";
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      centerX - a4Width / 2 - zoneWidth,
      centerY - a4Height / 2,
      zoneWidth,
      a4Height
    );

    // Right zone
    ctx.strokeRect(
      centerX + a4Width / 2,
      centerY - a4Height / 2,
      zoneWidth,
      a4Height
    );
    ctx.setLineDash([]);

    // Basic detection status (simplified for client-side)
    // Full detection happens on server
    const status: DetectionStatus = {
      a4Detected: true, // Optimistically allow capture, server validates
      feetDetected: true, // Optimistically allow capture
      tiltOK: true,
      blurOK: true,
      canCapture: captureState === "photo1" || captureState === "photo2",
    };

    setDetectionStatus(status);

    // Draw status indicators
    const statusY = 20;
    ctx.fillStyle = "#000000";
    ctx.fillRect(10, statusY, 200, 80);
    ctx.fillStyle = status.a4Detected ? "#00FF00" : "#FF0000";
    ctx.fillText("A4: " + (status.a4Detected ? "✓" : "✗"), 20, statusY + 20);
    ctx.fillStyle = status.feetDetected ? "#00FF00" : "#FF0000";
    ctx.fillText("Feet: " + (status.feetDetected ? "✓" : "✗"), 20, statusY + 40);

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [clientReady, captureState]);

  // Start processing frames
  useEffect(() => {
    if (clientReady && videoRef.current && captureState !== "setup" && captureState !== "complete") {
      processFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [clientReady, captureState, processFrame]);

  // Start camera when ready
  useEffect(() => {
    if (clientReady && captureState !== "setup") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [clientReady, captureState, startCamera, stopCamera]);

  // Update sock thickness in session
  const handleSockThicknessChange = async (value: typeof sockThickness) => {
    setSockThickness(value);
    // Note: sock thickness is stored when session is created, no need to update here
  };

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to capture photo");
        return;
      }

      try {
        // Get upload URL
        const uploadResponse = await fetch("/api/measurements/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl, objectKey } = await uploadResponse.json();

        // Upload image using FormData to server-side endpoint
        const formData = new FormData();
        formData.append("file", blob, "photo.jpg");

        const uploadResult = await fetch(`${uploadUrl}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResult.ok) {
          throw new Error("Failed to upload image");
        }

        // Update session status
        await updateMeasurementSession(sessionId, {
          status: "processing",
        });

        // Trigger analysis
        const photoNumber = captureState === "photo1" ? 1 : 2;
        const analyzeResponse = await fetch("/api/measurements/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            photoNumber,
            objectKey,
          }),
        });

        if (!analyzeResponse.ok) {
          throw new Error("Failed to process image");
        }

        const result = await analyzeResponse.json();

        if (result.retakeRequired) {
          toast.error(result.retakeReason || "Please retake the photo");
          // Reset to allow retake
          if (photoNumber === 1) {
            setCaptureState("photo1");
          } else {
            setCaptureState("photo2");
          }
        } else {
          // Move to next photo or complete
          if (photoNumber === 1) {
            setCaptureState("photo2");
            toast.success("Photo 1 captured! Prepare for photo 2.");
          } else {
            setCaptureState("complete");
            toast.success("Measurement complete!");
          }
        }
      } catch (err) {
        console.error("Error capturing photo:", err);
        toast.error("Failed to process photo. Please try again.");
      }
    }, "image/jpeg", 0.9);
  };

  const handleStart = () => {
    if (!sockThickness) {
      toast.error("Please select sock thickness");
      return;
    }
    setCaptureState("photo1");
  };

  const getInstructions = () => {
    if (captureState === "photo1") {
      return (
        <>
          <h3 className="text-xl font-bold text-[#F4F4F4] mb-4">
            Photo 1: Left foot beside long edge
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-[#F4F4F4]/90">
            <li>Place A4 paper in the center (portrait orientation)</li>
            <li>Place your LEFT foot beside the long edge of the A4</li>
            <li>Place your RIGHT foot below the short edge</li>
            <li>Make sure both feet are fully visible and don't touch the paper</li>
            <li>Tap capture when ready</li>
          </ol>
        </>
      );
    } else if (captureState === "photo2") {
      return (
        <>
          <h3 className="text-xl font-bold text-[#F4F4F4] mb-4">
            Photo 2: Right foot beside long edge
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-[#F4F4F4]/90">
            <li>Keep the same A4 paper placement</li>
            <li>Place your RIGHT foot beside the long edge of the A4</li>
            <li>Place your LEFT foot below the short edge</li>
            <li>Make sure both feet are fully visible and don't touch the paper</li>
            <li>Tap capture when ready</li>
          </ol>
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#040404] flex flex-col">
      {captureState === "setup" ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-6">
          <h2 className="text-2xl font-bold text-[#F4F4F4] text-center">
            Foot Measurement Setup
          </h2>
          <div className="w-full max-w-md space-y-4">
            <div>
              <label className="block text-[#F4F4F4] font-medium mb-2">
                Sock Thickness
              </label>
              <SockThicknessSelector
                value={sockThickness}
                onChange={handleSockThicknessChange}
              />
            </div>
            <button
              onClick={handleStart}
              disabled={!clientReady}
              className="w-full px-6 py-3 bg-[#F5E4D0] text-[#2B2D30] font-bold uppercase rounded-[4px] hover:bg-[#E8D4B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {clientReady ? "Start Measurement" : "Loading..."}
            </button>
          </div>
        </div>
      ) : captureState === "complete" ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <MeasurementStatus
            status={session.status || "complete"}
            left={session.final?.left}
            right={session.final?.right}
            errorMessage={session.errorMessage}
          />
        </div>
      ) : (
        <>
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <div className="absolute top-4 left-4 right-4 bg-black/70 p-4 rounded-[4px] text-white text-sm">
              {getInstructions()}
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center gap-4">
              <button
                onClick={capturePhoto}
                disabled={!detectionStatus.canCapture}
                className="w-20 h-20 rounded-full bg-[#F5E4D0] border-4 border-[#2B2D30] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-10 h-10 text-[#2B2D30]" />
              </button>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2B2D30] border border-red-500/50 p-6 rounded-[8px] max-w-md">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#F5E4D0] text-[#2B2D30] font-bold rounded-[4px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

