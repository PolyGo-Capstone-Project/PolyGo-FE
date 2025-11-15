"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconHandStop,
  IconLanguage,
  IconMessage,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoneOff,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettings,
  IconUsers,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface MeetingControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isSettingsOpen: boolean;
  isTranscriptOpen?: boolean;
  isHost: boolean;
  hasStartedEvent: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleHandRaise: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onToggleSettings: () => void;
  onToggleTranscript?: () => void;
  onLeave: () => void;
  onStartEvent?: () => void;
  onEndEvent?: () => void;
  onMuteAll?: () => void;
  onTurnOffAllCameras?: () => void;
  className?: string;
}

export function MeetingControls({
  audioEnabled,
  videoEnabled,
  isHandRaised,
  isChatOpen,
  isParticipantsOpen,
  isSettingsOpen,
  isTranscriptOpen = false,
  isHost,
  hasStartedEvent,
  onToggleAudio,
  onToggleVideo,
  onToggleHandRaise,
  onToggleChat,
  onToggleParticipants,
  onToggleSettings,
  onToggleTranscript,
  onLeave,
  onStartEvent,
  onEndEvent,
  onMuteAll,
  onTurnOffAllCameras,
  className,
}: MeetingControlsProps) {
  const t = useTranslations("meeting.controls");

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 bg-background border-t",
        className
      )}
    >
      {/* Left side - Meeting info & Host controls */}
      <div className="flex items-center gap-2">
        {isHost && !hasStartedEvent && (
          <Button
            variant="default"
            size="sm"
            onClick={onStartEvent}
            className="gap-2"
          >
            <IconPlayerPlay className="h-4 w-4" />
            {t("startEvent")}
          </Button>
        )}

        {/* Host-only controls */}
        {isHost && hasStartedEvent && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onMuteAll}
              className="gap-2"
              title="Mute all participants"
            >
              <IconMicrophoneOff className="h-4 w-4" />
              Mute All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTurnOffAllCameras}
              className="gap-2"
              title="Turn off all cameras"
            >
              <IconVideoOff className="h-4 w-4" />
              Turn Off All Cameras
            </Button>
          </>
        )}
      </div>

      {/* Center - Main controls */}
      <div className="flex items-center gap-2">
        {/* Mic */}
        <Button
          variant={audioEnabled ? "default" : "destructive"}
          size="icon"
          onClick={onToggleAudio}
          title={audioEnabled ? t("muteMic") : t("unmuteMic")}
          className="h-12 w-12 rounded-full"
        >
          {audioEnabled ? (
            <IconMicrophone className="h-5 w-5" />
          ) : (
            <IconMicrophoneOff className="h-5 w-5" />
          )}
        </Button>

        {/* Camera */}
        <Button
          variant={videoEnabled ? "default" : "destructive"}
          size="icon"
          onClick={onToggleVideo}
          title={videoEnabled ? t("turnCameraOff") : t("turnCameraOn")}
          className="h-12 w-12 rounded-full"
        >
          {videoEnabled ? (
            <IconVideo className="h-5 w-5" />
          ) : (
            <IconVideoOff className="h-5 w-5" />
          )}
        </Button>

        {/* Raise Hand */}
        <Button
          variant={isHandRaised ? "default" : "outline"}
          size="icon"
          onClick={onToggleHandRaise}
          title={isHandRaised ? t("lowerHand") : t("raiseHand")}
          className={cn(
            "h-12 w-12 rounded-full",
            isHandRaised && "bg-yellow-500 hover:bg-yellow-600"
          )}
        >
          <IconHandStop className="h-5 w-5" />
        </Button>

        {/* Chat */}
        <Button
          variant={isChatOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleChat}
          title={t("chat")}
          className="h-12 w-12 rounded-full"
        >
          <IconMessage className="h-5 w-5" />
        </Button>

        {/* Participants */}
        <Button
          variant={isParticipantsOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleParticipants}
          title={t("participants")}
          className="h-12 w-12 rounded-full"
        >
          <IconUsers className="h-5 w-5" />
        </Button>

        {/* Settings */}
        <Button
          variant={isSettingsOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleSettings}
          title={t("settings")}
          className="h-12 w-12 rounded-full"
        >
          <IconSettings className="h-5 w-5" />
        </Button>

        {/* Live Transcript */}
        <Button
          variant={isTranscriptOpen ? "default" : "outline"}
          size="icon"
          onClick={onToggleTranscript}
          title="Live Script Translate"
          className="h-12 w-12 rounded-full"
        >
          <IconLanguage className="h-5 w-5" />
        </Button>

        {/* Leave/End */}
        {isHost && hasStartedEvent ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={onEndEvent}
            className="gap-2 ml-4"
          >
            <IconPlayerStop className="h-4 w-4" />
            {t("endEvent")}
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="icon"
            onClick={onLeave}
            title={t("leave")}
            className="h-12 w-12 rounded-full ml-4"
          >
            <IconPhoneOff className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Right side - Spacer */}
      <div className="w-32" />
    </div>
  );
}
