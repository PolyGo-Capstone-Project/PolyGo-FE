"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  ScrollArea,
  SheetDescription,
  SheetTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Participant } from "@/types";
import {
  IconHandStop,
  IconMicrophoneOff,
  IconUserOff,
  IconVideoOff,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface ParticipantListProps {
  participants: Participant[];
  isHost: boolean;
  myConnectionId: string;
  onMuteParticipant?: (participantId: string, enabled: boolean) => void;
  onDisableVideoParticipant?: (participantId: string, enabled: boolean) => void;
  onKickParticipant?: (participantId: string) => void;
  onLowerAllHands?: () => void;
  onClose: () => void;
  className?: string;
}

export function ParticipantList({
  participants,
  isHost,
  myConnectionId,
  onMuteParticipant,
  onDisableVideoParticipant,
  onKickParticipant,
  onLowerAllHands,
  onClose,
  className,
}: ParticipantListProps) {
  const t = useTranslations("meeting.participants");

  const hasRaisedHands = participants.some((p) => p.isHandRaised);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <SheetTitle className="sr-only">
        {t("title")} ({participants.length})
      </SheetTitle>
      <SheetDescription className="sr-only">
        {t("description") || "List of meeting participants"}
      </SheetDescription>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 flex-1">
          <h3 className="text-lg font-semibold">
            {t("title")} ({participants.length})
          </h3>
          {isHost && hasRaisedHands && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLowerAllHands}
              className="text-xs"
            >
              {t("lowerAllHands")}
            </Button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Participant list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {participants.map((participant) => {
            const isMe = participant.id === myConnectionId;
            const initials = participant.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={participant.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors",
                  participant.isHandRaised && "bg-yellow-500/10"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage
                      src={participant.avatarUrl}
                      alt={participant.name}
                    />
                    <AvatarFallback className="text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {participant.name}
                        {isMe && (
                          <span className="text-muted-foreground ml-1">
                            ({t("you")})
                          </span>
                        )}
                      </p>
                      {participant.role === "host" && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          {t("host")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {!participant.audioEnabled && (
                        <IconMicrophoneOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {!participant.videoEnabled && (
                        <IconVideoOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {participant.isHandRaised && (
                        <IconHandStop className="h-3 w-3 text-yellow-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Host controls */}
                {isHost && !isMe && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onMuteParticipant?.(
                          participant.id,
                          !participant.audioEnabled
                        )
                      }
                      title={
                        participant.audioEnabled
                          ? t("muteParticipant")
                          : "Unmute participant"
                      }
                    >
                      <IconMicrophoneOff className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onDisableVideoParticipant?.(
                          participant.id,
                          !participant.videoEnabled
                        )
                      }
                      title={
                        participant.videoEnabled
                          ? t("disableVideo")
                          : "Enable video"
                      }
                    >
                      <IconVideoOff className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onKickParticipant?.(participant.id)}
                      title={t("kickParticipant")}
                    >
                      <IconUserOff className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {participants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t("noParticipants")}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
