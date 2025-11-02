"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconCrown,
  IconHandStop,
  IconMicrophoneOff,
  IconVideoOff,
} from "@tabler/icons-react";
import { useEffect, useRef } from "react";

interface VideoTileProps {
  name: string;
  avatarUrl?: string;
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isHandRaised: boolean;
  isLocal?: boolean;
  isHost?: boolean;
  className?: string;
}

export function VideoTile({
  name,
  avatarUrl,
  stream,
  audioEnabled,
  videoEnabled,
  isHandRaised,
  isLocal = false,
  isHost = false,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && stream) {
      const currentStream = videoElement.srcObject as MediaStream | null;
      const streamId = stream.id;
      const currentStreamId = currentStream?.id;

      // ✅ OPTIMIZED: Skip if same stream and same tracks
      // Since we now only toggle track.enabled (not replacing tracks), this check is simpler
      if (currentStreamId === streamId) {
        const currentTracks = currentStream?.getTracks().map((t) => t.id) || [];
        const newTracks = stream.getTracks().map((t) => t.id);

        if (JSON.stringify(currentTracks) === JSON.stringify(newTracks)) {
          console.log(
            `[VideoTile] ⏭️ Skipping - same stream and tracks for ${name}`
          );
          return;
        }
      }

      console.log(
        `[VideoTile] 📹 Setting stream for ${name}, stream ID: ${streamId}, tracks:`,
        stream.getTracks().map((t) => `${t.kind}:${t.id}`)
      );

      // Set stream to video element
      videoElement.srcObject = stream;
      videoElement.muted = isLocal;

      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[VideoTile] ✅ Video playing for ${name}`);
          })
          .catch((error) => {
            console.warn(
              `[VideoTile] ⚠️ Autoplay prevented for ${name}:`,
              error
            );
            // Try playing with muted for remote users
            if (!isLocal) {
              videoElement.muted = true;
              videoElement
                .play()
                .catch((e) =>
                  console.error(`[VideoTile] ✗ Failed to play muted video:`, e)
                );
            }
          });
      }
    } else if (videoElement && !stream) {
      console.log(`[VideoTile] 🔇 Clearing stream for ${name}`);
      videoElement.srcObject = null;
    }

    return () => {
      // Don't clear srcObject on cleanup to prevent flicker during re-renders
      // The stream will be cleared when component unmounts or stream changes
    };
  }, [stream, name, isLocal]);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative w-full h-full rounded-lg overflow-hidden",
        "bg-secondary/30 border-2 border-transparent",
        "min-h-[120px]",
        isHandRaised && "border-yellow-500",
        isHost && "border-primary/50", // Highlight host with primary color
        className
      )}
    >
      {/* Video element or Avatar */}
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("w-full h-full object-cover", "bg-black")}
          aria-label={`Video stream for ${name}`}
        >
          <track kind="captions" />
        </video>
      ) : (
        /* Avatar fallback */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <Avatar
            className={cn(
              "border-2 border-border",
              "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-32 lg:w-32"
            )}
          >
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback
              className={cn(
                "font-semibold",
                "text-lg sm:text-xl md:text-2xl lg:text-3xl"
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Name badge with host indicator */}
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-2 max-w-[calc(100%-1rem)]">
          {isHost && (
            <IconCrown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
          )}
          <span className="text-white text-xs sm:text-sm font-medium truncate">
            {isLocal ? `${name} (You)` : name}
          </span>
          {!audioEnabled && (
            <IconMicrophoneOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 flex-shrink-0" />
          )}
        </div>

        {/* Hand raised indicator */}
        {isHandRaised && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1">
            <IconHandStop className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium hidden sm:inline">
              Hand Raised
            </span>
          </div>
        )}

        {/* Video off indicator */}
        {!videoEnabled && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm p-1.5 sm:p-2 rounded">
            <IconVideoOff className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
