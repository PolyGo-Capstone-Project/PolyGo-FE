"use client";

import { Button } from "@/components/ui/button";
import { CallState } from "@/hooks/reusable/use-call";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CallModalProps {
  isOpen: boolean;
  callState: CallState;
  isVideoCall: boolean;
  peerName?: string;
  onEndCall: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
}

export function CallModal({
  isOpen,
  callState,
  isVideoCall,
  peerName,
  onEndCall,
  onToggleMic,
  onToggleCamera,
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update local video element when stream changes
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
      console.log("📹 [CallModal] Local stream attached to video element");
    }
  }, [callState.localStream]);

  // Force local video element to re-render when video enabled state changes
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      const videoTrack = callState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log("📹 [CallModal] Local video track state changed:", {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          localVideoEnabled: callState.localVideoEnabled,
        });

        // Force video element to update by re-attaching the stream
        if (callState.localVideoEnabled && videoTrack.enabled) {
          localVideoRef.current.srcObject = null;
          localVideoRef.current.srcObject = callState.localStream;
          console.log("📹 [CallModal] Local video element refreshed");
        }
      }
    }
  }, [callState.localVideoEnabled, callState.localStream]);

  // Update remote video element when stream changes
  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;

      const tracks = callState.remoteStream.getTracks();
      console.log(
        "📹 [CallModal] Remote stream attached - tracks:",
        tracks.map(
          (t) => `${t.kind}:enabled=${t.enabled},readyState=${t.readyState}`
        )
      );
    }
  }, [
    callState.remoteStream,
    callState.remoteVideoEnabled,
    callState.remoteAudioEnabled,
  ]);

  // Update remote audio element for voice calls
  useEffect(() => {
    if (remoteAudioRef.current && callState.remoteStream) {
      remoteAudioRef.current.srcObject = callState.remoteStream;
      // Force play to handle autoplay restrictions
      remoteAudioRef.current.play().catch((err) => {
        console.warn("⚠️ [CallModal] Autoplay blocked for remote audio:", err);
      });
      console.log("🔊 [CallModal] Remote audio stream attached");
    }
  }, [callState.remoteStream]);

  // Start call duration timer when connected
  useEffect(() => {
    if (callState.status === "connected") {
      setCallDuration(0);
      callDurationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
        callDurationIntervalRef.current = null;
      }
    }

    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, [callState.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callDurationIntervalRef.current) {
        clearInterval(callDurationIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = (): string => {
    switch (callState.status) {
      case "idle":
        return "Initializing...";
      case "calling":
        return "Calling...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return formatDuration(callDuration);
      case "ended":
        return "Call Ended";
      case "failed":
        return "Call Failed";
      case "declined":
        return "Call Declined";
      default:
        return "Unknown";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col text-white h-screen">
      {/* Header */}
      <div className="p-3 md:p-4 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
        <div className="text-center">
          <h1 className="text-lg md:text-xl font-semibold">
            {isVideoCall ? "Video Call" : "Voice Call"}
          </h1>
          {peerName && (
            <p className="text-xs md:text-sm text-gray-300 mt-1">{peerName}</p>
          )}
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {getStatusText()}
          </p>
        </div>
      </div>

      {/* Video/Voice Container */}
      <div className="flex-1 relative bg-gray-950 overflow-hidden min-h-0">
        {/* Video Call UI */}
        {isVideoCall ? (
          <>
            {/* Remote Video (Full Screen) - show when video is enabled */}
            {callState.remoteVideoEnabled && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                <track kind="captions" />
              </video>
            )}

            {/* Remote Audio Only Display - show when video is disabled */}
            {!callState.remoteVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center px-4">
                <div className="text-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-4xl sm:text-5xl">
                      {peerName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl text-gray-300">
                    {peerName || "Unknown"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">
                    {callState.remoteAudioEnabled ? "🎤 Speaking" : "🔇 Muted"}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) - show when local video is enabled */}
            {callState.localVideoEnabled && callState.localStream && (
              <div className="absolute top-2 right-2 w-24 h-32 sm:w-32 sm:h-40 md:top-4 md:right-4 md:w-48 md:h-36 rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain mirror"
                >
                  <track kind="captions" />
                </video>
                {!callState.localVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Voice Call UI - Centered with gradient background */
          <div className="w-full h-full flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hidden audio element for voice call remote stream */}
            <audio ref={remoteAudioRef} autoPlay playsInline>
              <track kind="captions" />
            </audio>
            <div className="text-center">
              {/* Large Avatar with animated ring */}
              <div className="relative inline-block mb-6 md:mb-8">
                {callState.status === "connected" &&
                  callState.remoteAudioEnabled && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
                  )}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-2xl border-4 border-gray-700">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-semibold">
                    {peerName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>

              {/* Peer Info */}
              <div className="mb-4 md:mb-6">
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-2">
                  {peerName || "Unknown"}
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-300">
                  {callState.status === "connected"
                    ? callState.remoteAudioEnabled
                      ? "On call"
                      : "Muted"
                    : getStatusText()}
                </p>
              </div>

              {/* Audio visualizer indicator */}
              {callState.status === "connected" && (
                <div className="flex items-center justify-center gap-1 mt-6">
                  {callState.remoteAudioEnabled ? (
                    <>
                      <div
                        className="w-1 h-3 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-1 h-5 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                      <div
                        className="w-1 h-6 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "450ms" }}
                      />
                      <div
                        className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "600ms" }}
                      />
                      <div
                        className="w-1 h-5 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "750ms" }}
                      />
                      <div
                        className="w-1 h-3 bg-green-500 rounded-full animate-pulse"
                        style={{ animationDelay: "900ms" }}
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MicOff className="w-5 h-5" />
                      <span className="text-sm">Microphone off</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status Overlay - only for video calls or initial states */}
        {(callState.status === "calling" || callState.status === "ringing") && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="animate-pulse mb-3 md:mb-4">
                <Phone className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <p className="text-lg md:text-xl">
                {callState.status === "calling"
                  ? "Calling..."
                  : "Connecting..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 md:p-6 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {/* Microphone Toggle */}
          <Button
            size="lg"
            variant={callState.localAudioEnabled ? "secondary" : "destructive"}
            className="rounded-full w-12 h-12 md:w-14 md:h-14"
            onClick={onToggleMic}
          >
            {callState.localAudioEnabled ? (
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            ) : (
              <MicOff className="w-5 h-5 md:w-6 md:h-6" />
            )}
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14 md:w-16 md:h-16"
            onClick={onEndCall}
          >
            <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
          </Button>

          {/* Camera Toggle - only show for video calls */}
          {isVideoCall && (
            <Button
              size="lg"
              variant={
                callState.localVideoEnabled ? "secondary" : "destructive"
              }
              className="rounded-full w-12 h-12 md:w-14 md:h-14"
              onClick={onToggleCamera}
            >
              {callState.localVideoEnabled ? (
                <Video className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <VideoOff className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </Button>
          )}
        </div>

        {/* Media State Indicators */}
        <div className="mt-3 md:mt-4 flex items-center justify-center gap-4 md:gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            {callState.localAudioEnabled ? (
              <Mic className="w-3 h-3" />
            ) : (
              <MicOff className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">Your mic</span>
          </div>
          {isVideoCall && (
            <div className="flex items-center gap-1">
              {callState.localVideoEnabled ? (
                <Video className="w-3 h-3" />
              ) : (
                <VideoOff className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">Your camera</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
