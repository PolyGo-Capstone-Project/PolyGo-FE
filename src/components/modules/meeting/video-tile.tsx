"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
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
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && stream) {
      console.log(
        `[VideoTile] Setting stream for ${name}, tracks:`,
        stream.getTracks().map((t) => t.kind)
      );

      // Set srcObject
      videoElement.srcObject = stream;

      // Force play to handle autoplay restrictions
      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[VideoTile] ✓ Video playing for ${name}`);
          })
          .catch((error) => {
            console.warn(
              `[VideoTile] ⚠️ Autoplay prevented for ${name}:`,
              error
            );
            // User interaction might be needed to play
            // For local video, we mute it so autoplay works
            if (isLocal) {
              videoElement.muted = true;
              videoElement
                .play()
                .catch((e) =>
                  console.error(
                    `[VideoTile] ✗ Failed to play muted local video:`,
                    e
                  )
                );
            }
          });
      }
    } else if (videoElement && !stream) {
      console.log(`[VideoTile] Clearing stream for ${name}`);
      videoElement.srcObject = null;
    }

    // Cleanup
    return () => {
      if (videoElement && videoElement.srcObject) {
        console.log(`[VideoTile] Cleaning up stream for ${name}`);
        videoElement.srcObject = null;
      }
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
        "relative aspect-video rounded-lg overflow-hidden bg-secondary/30 border-2 border-transparent",
        isHandRaised && "border-yellow-500",
        className
      )}
    >
      {/* Video element */}
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          aria-label={`Video stream for ${name}`}
        >
          <track kind="captions" />
        </video>
      ) : (
        /* Avatar fallback */
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Name badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {isLocal ? `${name} (You)` : name}
          </span>
          {!audioEnabled && (
            <IconMicrophoneOff className="h-4 w-4 text-red-400" />
          )}
        </div>

        {/* Hand raised indicator */}
        {isHandRaised && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1">
            <IconHandStop className="h-4 w-4" />
            <span className="text-xs font-medium">Hand Raised</span>
          </div>
        )}

        {/* Video off indicator */}
        {!videoEnabled && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm p-2 rounded">
            <IconVideoOff className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
