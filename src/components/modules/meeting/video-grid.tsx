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

  // Calculate grid layout
  const gridCols = useMemo(() => {
    const count = allParticipants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-3 xl:grid-cols-4";
  }, [allParticipants.length]);

  return (
    <div
      className={cn(
        "grid gap-4 w-full h-full p-4",
        gridCols,
        "auto-rows-fr",
        className
      )}
    >
      {allParticipants.map((participant, index) => (
        <VideoTile
          key={participant.id}
          name={participant.name}
          avatarUrl={participant.avatarUrl}
          stream={participant.stream}
          audioEnabled={participant.audioEnabled}
          videoEnabled={participant.videoEnabled}
          isHandRaised={participant.isHandRaised}
          isLocal={index === 0} // First one is local
        />
      ))}
    </div>
  );
}
