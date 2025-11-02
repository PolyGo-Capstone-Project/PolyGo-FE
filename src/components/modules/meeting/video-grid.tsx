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
  isHost: boolean;
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
  isHost,
  className,
}: VideoGridProps) {
  // Filter out self from participants and add local user
  const { localParticipant, remoteParticipants, hostParticipant } =
    useMemo(() => {
      const others = participants.filter((p) => p.id !== myConnectionId);

      const local: Participant = {
        id: myConnectionId,
        name: localName,
        avatarUrl: localAvatarUrl,
        role: isHost ? "host" : "attendee",
        status: "connected",
        audioEnabled: localAudioEnabled,
        videoEnabled: localVideoEnabled,
        isHandRaised: false,
        stream: localStream || undefined,
      };

      // Find host from all participants (including local)
      const allParticipants = [local, ...others];
      const host = allParticipants.find((p) => p.role === "host");

      // Get other attendees (not host)
      const attendees = allParticipants.filter((p) => p.id !== host?.id);

      return {
        localParticipant: local,
        remoteParticipants: others,
        hostParticipant: host,
        attendees,
      };
    }, [
      participants,
      myConnectionId,
      localStream,
      localName,
      localAvatarUrl,
      localAudioEnabled,
      localVideoEnabled,
      isHost,
    ]);

  const totalCount = remoteParticipants.length + 1; // +1 for local

  // Fallback: if no host found (shouldn't happen), use old grid layout
  const allParticipants = [localParticipant, ...remoteParticipants];

  const gridLayout = useMemo(() => {
    const count = totalCount;

    if (count === 1) {
      return {
        containerClass: "flex items-center justify-center p-4",
        itemClass: "w-full max-w-4xl aspect-video",
      };
    }

    if (count === 2) {
      return {
        containerClass:
          "grid grid-cols-1 md:grid-cols-2 gap-4 p-4 auto-rows-fr",
        itemClass: "w-full h-full min-h-[300px]",
      };
    }

    if (count <= 4) {
      return {
        containerClass:
          "grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 auto-rows-fr",
        itemClass: "w-full h-full min-h-[250px]",
      };
    }

    if (count <= 6) {
      return {
        containerClass:
          "grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 auto-rows-fr",
        itemClass: "w-full h-full min-h-[200px] max-h-[calc(50vh-2rem)]",
      };
    }

    if (count <= 9) {
      return {
        containerClass:
          "grid grid-cols-2 md:grid-cols-3 gap-3 p-4 auto-rows-fr",
        itemClass: "w-full h-full min-h-[180px] max-h-[calc(33.33vh-2rem)]",
      };
    }

    if (count <= 12) {
      return {
        containerClass:
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 auto-rows-fr",
        itemClass: "w-full h-full min-h-[150px] max-h-[calc(25vh-2rem)]",
      };
    }

    return {
      containerClass:
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4",
      itemClass: "w-full aspect-video min-h-[120px]",
    };
  }, [totalCount]);

  const needsScroll = totalCount > 12;

  // ✅ NEW LAYOUT: Host ở giữa (lớn), attendees ở bên phải (nhỏ hơn, cuộn dọc)
  if (hostParticipant) {
    const attendees = [localParticipant, ...remoteParticipants].filter(
      (p) => p.id !== hostParticipant.id
    );

    return (
      <div className={cn("w-full h-full flex gap-2 p-2", className)}>
        {/* HOST VIDEO - Center, Large */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
            <VideoTile
              name={hostParticipant.name}
              avatarUrl={hostParticipant.avatarUrl}
              stream={hostParticipant.stream}
              audioEnabled={hostParticipant.audioEnabled}
              videoEnabled={hostParticipant.videoEnabled}
              isHandRaised={hostParticipant.isHandRaised}
              isLocal={hostParticipant.id === myConnectionId}
              isHost={true}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* ATTENDEES SIDEBAR - Right side, scrollable */}
        {attendees.length > 0 && (
          <div className="w-full sm:w-64 md:w-72 lg:w-80 flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {attendees.map((participant) => (
              <div
                key={participant.id}
                className="w-full aspect-video flex-shrink-0"
              >
                <VideoTile
                  name={participant.name}
                  avatarUrl={participant.avatarUrl}
                  stream={participant.stream}
                  audioEnabled={participant.audioEnabled}
                  videoEnabled={participant.videoEnabled}
                  isHandRaised={participant.isHandRaised}
                  isLocal={participant.id === myConnectionId}
                  isHost={false}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

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
              isLocal={participant.id === myConnectionId}
              isHost={participant.role === "host"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
