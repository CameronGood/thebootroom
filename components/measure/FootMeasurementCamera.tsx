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
  const [showInstructions, setShowInstructions] = useState(true);

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
    
    const centerX = overlayCanvas.width / 2;
    const centerY = overlayCanvas.height / 2;
    const a4Width = overlayCanvas.width * 0.5; // Slightly smaller for better visibility
    const a4Height = a4Width * 1.414; // A4 aspect ratio (297mm x 210mm)
    
    // Draw A4 paper guide (solid, prominent rectangle)
    ctx.strokeStyle = "#F5E4D0";
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(
      centerX - a4Width / 2,
      centerY - a4Height / 2,
      a4Width,
      a4Height
    );
    
    // Add label for A4 paper
    ctx.fillStyle = "#F5E4D0";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("A4 PAPER", centerX, centerY);
    
    // Draw foot placement zones with labels
    const zoneWidth = overlayCanvas.width * 0.15;
    const zoneHeight = a4Height * 0.6; // Foot-sized zones
    
    // Determine which foot goes where based on capture state
    const isPhoto1 = captureState === "photo1";
    const leftFootZone = isPhoto1 ? "LEFT" : "RIGHT";
    const rightFootZone = isPhoto1 ? "RIGHT" : "LEFT";
    
    // Left foot zone (beside long edge)
    ctx.strokeStyle = "#4ADE80"; // Green for active zone
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    const leftZoneX = centerX - a4Width / 2 - zoneWidth - 10;
    const leftZoneY = centerY - zoneHeight / 2;
    ctx.strokeRect(leftZoneX, leftZoneY, zoneWidth, zoneHeight);
    
    // Label for left zone
    ctx.fillStyle = "#4ADE80";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${leftFootZone} FOOT`,
      leftZoneX + zoneWidth / 2,
      leftZoneY - 10
    );
    
    // Right foot zone (below short edge)
    ctx.strokeStyle = "#60A5FA"; // Blue for secondary zone
    const rightZoneX = centerX - zoneWidth / 2;
    const rightZoneY = centerY + a4Height / 2 + 10;
    ctx.strokeRect(rightZoneX, rightZoneY, zoneWidth, zoneHeight);
    
    // Label for right zone
    ctx.fillStyle = "#60A5FA";
    ctx.fillText(
      `${rightFootZone} FOOT`,
      rightZoneX + zoneWidth / 2,
      rightZoneY + zoneHeight + 20
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
            Photo 1: Position Your Feet
          </h3>
          <div className="space-y-3 text-[#F4F4F4]/90 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <p className="flex-1">Place <strong className="text-[#F5E4D0]">A4 paper</strong> in the center (portrait orientation) - see the white rectangle on screen</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <p className="flex-1">Place your <strong className="text-[#4ADE80]">LEFT foot</strong> beside the long edge (left side of paper) - see the green dashed box</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#60A5FA] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <p className="flex-1">Place your <strong className="text-[#60A5FA]">RIGHT foot</strong> below the short edge (bottom of paper) - see the blue dashed box</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5E4D0]/20 text-[#F5E4D0] flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <p className="flex-1">Make sure both feet are fully visible and don't touch the paper</p>
            </div>
            <div className="pt-2 border-t border-[#F5E4D0]/20">
              <p className="text-center text-[#F5E4D0] font-semibold">Tap the camera button when ready</p>
            </div>
          </div>
        </>
      );
    } else if (captureState === "photo2") {
      return (
        <>
          <h3 className="text-xl font-bold text-[#F4F4F4] mb-4">
            Photo 2: Swap Your Feet
          </h3>
          <div className="space-y-3 text-[#F4F4F4]/90 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5E4D0] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <p className="flex-1">Keep the <strong className="text-[#F5E4D0]">A4 paper</strong> in the same position</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <p className="flex-1">Place your <strong className="text-[#4ADE80]">RIGHT foot</strong> beside the long edge (left side of paper) - see the green dashed box</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#60A5FA] text-[#2B2D30] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <p className="flex-1">Place your <strong className="text-[#60A5FA]">LEFT foot</strong> below the short edge (bottom of paper) - see the blue dashed box</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5E4D0]/20 text-[#F5E4D0] flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <p className="flex-1">Make sure both feet are fully visible and don't touch the paper</p>
            </div>
            <div className="pt-2 border-t border-[#F5E4D0]/20">
              <p className="text-center text-[#F5E4D0] font-semibold">Tap the camera button when ready</p>
            </div>
          </div>
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
            {showInstructions && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-black/85 backdrop-blur-sm p-6 rounded-lg border border-[#F5E4D0]/30 shadow-2xl z-10">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5E4D0]/20 hover:bg-[#F5E4D0]/30 transition-colors"
                  aria-label="Close instructions"
                >
                  <X className="w-5 h-5 text-[#F5E4D0]" />
                </button>
                <div className="text-center">
                  {getInstructions()}
                </div>
              </div>
            )}
            {!showInstructions && (
              <button
                onClick={() => setShowInstructions(true)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-sm border border-[#F5E4D0]/30 transition-colors z-10"
                aria-label="Show instructions"
              >
                <AlertCircle className="w-5 h-5 text-[#F5E4D0]" />
              </button>
            )}
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

