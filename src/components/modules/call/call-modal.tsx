"use client";

import { Button } from "@/components/ui/button";
import { CallState } from "@/hooks/reusable/use-call";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
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
  const [callDuration, setCallDuration] = useState(0);
  const callDurationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update local video element when stream changes
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
      console.log("📹 [CallModal] Local stream attached to video element");
    }
  }, [callState.localStream]);

  // Update remote video element when stream changes
  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
      console.log("📹 [CallModal] Remote stream attached to video element");
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
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col text-white">
      {/* Header */}
      <div className="p-4 bg-gray-800/50 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            {isVideoCall ? "Video Call" : "Voice Call"}
          </h1>
          {peerName && <p className="text-sm text-gray-300 mt-1">{peerName}</p>}
          <p className="text-sm text-gray-400 mt-1">{getStatusText()}</p>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gray-950">
        {/* Remote Video (Full Screen) */}
        {isVideoCall && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          >
            <track kind="captions" />
          </video>
        )}

        {/* Remote Audio Only Display */}
        {!isVideoCall && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">
                  {peerName?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <p className="text-xl text-gray-300">{peerName || "Unknown"}</p>
              <p className="text-sm text-gray-400 mt-2">
                {callState.remoteAudioEnabled ? "🎤 Speaking" : "🔇 Muted"}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {isVideoCall && callState.localStream && (
          <div className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-800 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            >
              <track kind="captions" />
            </video>
            {!callState.localVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Connection Status Overlay */}
        {callState.status === "calling" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <PhoneOff className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl">Calling...</p>
            </div>
          </div>
        )}

        {callState.status === "ringing" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <PhoneOff className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone Toggle */}
          <Button
            size="lg"
            variant={callState.localAudioEnabled ? "secondary" : "destructive"}
            className="rounded-full w-14 h-14"
            onClick={onToggleMic}
          >
            {callState.localAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16"
            onClick={onEndCall}
          >
            <PhoneOff className="w-7 h-7" />
          </Button>

          {/* Camera Toggle (only for video calls) */}
          {isVideoCall && (
            <Button
              size="lg"
              variant={
                callState.localVideoEnabled ? "secondary" : "destructive"
              }
              className="rounded-full w-14 h-14"
              onClick={onToggleCamera}
            >
              {callState.localVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>
          )}
        </div>

        {/* Media State Indicators */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            {callState.localAudioEnabled ? (
              <Mic className="w-3 h-3" />
            ) : (
              <MicOff className="w-3 h-3" />
            )}
            <span>Your mic</span>
          </div>
          {isVideoCall && (
            <div className="flex items-center gap-1">
              {callState.localVideoEnabled ? (
                <Video className="w-3 h-3" />
              ) : (
                <VideoOff className="w-3 h-3" />
              )}
              <span>Your camera</span>
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
