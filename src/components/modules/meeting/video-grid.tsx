"use client";

import { cn } from "@/lib/utils";
import { Participant } from "@/types";
import { useMemo } from "react";
import { VideoTile } from "./video-tile";

interface VideoGridProps {
  participants: Participant[];
  localStream?: MediaStream | null;
  localName: string;
  localAvatarUrl?: string;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  myConnectionId: string;
  className?: string;
}

export function VideoGrid({
  participants,
  localStream,
  localName,
  localAvatarUrl,
  localAudioEnabled,
  localVideoEnabled,
  myConnectionId,
  className,
}: VideoGridProps) {
  // Filter out self from participants and add local user
  const allParticipants = useMemo(() => {
    const others = participants.filter((p) => p.id !== myConnectionId);

    const localParticipant: Participant = {
      id: myConnectionId,
      name: localName,
      avatarUrl: localAvatarUrl,
      role: "host",
      status: "connected",
      audioEnabled: localAudioEnabled,
      videoEnabled: localVideoEnabled,
      isHandRaised: false,
      stream: localStream || undefined,
    };

    return [localParticipant, ...others];
  }, [
    participants,
    myConnectionId,
    localStream,
    localName,
    localAvatarUrl,
    localAudioEnabled,
    localVideoEnabled,
  ]);

  // ✅ IMPROVED: Calculate grid layout with better responsive design
  const gridLayout = useMemo(() => {
    const count = allParticipants.length;

    // Single participant - full screen
    if (count === 1) {
      return {
        containerClass: "flex items-center justify-center p-4",
        gridClass: "",
        itemClass: "w-full max-w-4xl aspect-video",
      };
    }

    // Two participants - side by side or stacked
    if (count === 2) {
      return {
        containerClass:
          "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 auto-rows-fr",
        gridClass: "",
        itemClass: "w-full h-full min-h-[300px]",
      };
    }

    // 3-4 participants - 2x2 grid
    if (count <= 4) {
      return {
        containerClass:
          "grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 auto-rows-fr",
        gridClass: "",
        itemClass: "w-full h-full min-h-[250px]",
      };
    }

    // 5-6 participants - 2x3 or 3x2 grid
    if (count <= 6) {
      return {
        containerClass:
          "grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 auto-rows-fr",
        gridClass: "",
        itemClass: "w-full h-full min-h-[200px] max-h-[calc(50vh-2rem)]",
      };
    }

    // 7-9 participants - 3x3 grid
    if (count <= 9) {
      return {
        containerClass:
          "grid grid-cols-2 md:grid-cols-3 gap-3 p-4 auto-rows-fr",
        gridClass: "",
        itemClass: "w-full h-full min-h-[180px] max-h-[calc(33.33vh-2rem)]",
      };
    }

    // 10-12 participants - 3x4 grid
    if (count <= 12) {
      return {
        containerClass:
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 auto-rows-fr",
        gridClass: "",
        itemClass: "w-full h-full min-h-[150px] max-h-[calc(25vh-2rem)]",
      };
    }

    // 13+ participants - 4x4 grid with scroll
    return {
      containerClass:
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4",
      gridClass: "",
      itemClass: "w-full aspect-video min-h-[120px]",
    };
  }, [allParticipants.length]);

  // ✅ For large groups, enable scrolling
  const needsScroll = allParticipants.length > 12;

  return (
    <div
      className={cn(
        "w-full h-full",
        needsScroll
          ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
          : "overflow-hidden",
        className
      )}
    >
      <div className={cn(gridLayout.containerClass)}>
        {allParticipants.map((participant, index) => (
          <div key={participant.id} className={cn(gridLayout.itemClass)}>
            <VideoTile
              name={participant.name}
              avatarUrl={participant.avatarUrl}
              stream={participant.stream}
              audioEnabled={participant.audioEnabled}
              videoEnabled={participant.videoEnabled}
              isHandRaised={participant.isHandRaised}
              isLocal={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
