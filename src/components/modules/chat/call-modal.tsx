"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CallState, ChatUser } from "@/types";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ChatUser;
  callState: CallState;
  onEndCall: () => void;
  onAcceptCall: () => void;
  onDeclineCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export function CallModal({
  isOpen,
  onClose,
  user,
  callState,
  onEndCall,
  onAcceptCall,
  onDeclineCall,
  onToggleMute,
  onToggleVideo,
}: CallModalProps) {
  const t = useTranslations("chat");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (callState.status === "connected" && callState.startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor(
          (now.getTime() - callState.startTime!.getTime()) / 1000
        );
        setDuration(diff);
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.status, callState.startTime]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callState.status) {
      case "calling":
        return t("calling");
      case "ringing":
        return t("ringing");
      case "connected":
        return formatDuration(duration);
      default:
        return "";
    }
  };

  const getCallTypeIcon = () => {
    if (callState.type === "video" && !callState.isVideoOff) {
      return <Video className="size-5 md:size-6" />;
    }
    return <Phone className="size-5 md:size-6" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-4 py-6 md:gap-6 md:py-8">
          {/* User Avatar */}
          <div className="relative">
            <Avatar className="size-24 md:size-32">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl md:text-3xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* Call Type Badge */}
            <div className="bg-primary text-primary-foreground absolute bottom-0 right-0 rounded-full p-1.5 md:p-2">
              {getCallTypeIcon()}
            </div>
          </div>

          {/* User Info */}
          <div className="text-center">
            <h3 className="mb-1 text-xl font-semibold md:mb-2 md:text-2xl">
              {user.name}
            </h3>
            <p className="text-muted-foreground text-base md:text-lg">
              {getStatusText()}
            </p>
          </div>

          {/* Video Preview (for video calls) */}
          {callState.type === "video" && callState.status === "connected" && (
            <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground text-sm">Video Stream</p>
              </div>

              {/* Self Video Preview */}
              {!callState.isVideoOff && (
                <div className="absolute bottom-3 right-3 h-24 w-20 overflow-hidden rounded-lg border-2 border-white bg-black md:bottom-4 md:right-4 md:h-32 md:w-24">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-white text-[10px] md:text-xs">You</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-4">
            {/* Mute/Unmute */}
            {callState.status === "connected" && (
              <Button
                size="icon-lg"
                variant={callState.isMuted ? "destructive" : "secondary"}
                onClick={onToggleMute}
                className="size-12 rounded-full md:size-14"
              >
                {callState.isMuted ? (
                  <MicOff className="size-5 md:size-6" />
                ) : (
                  <Mic className="size-5 md:size-6" />
                )}
              </Button>
            )}

            {/* Video On/Off (for video calls) */}
            {callState.type === "video" && callState.status === "connected" && (
              <Button
                size="icon-lg"
                variant={callState.isVideoOff ? "destructive" : "secondary"}
                onClick={onToggleVideo}
                className="size-12 rounded-full md:size-14"
              >
                {callState.isVideoOff ? (
                  <VideoOff className="size-5 md:size-6" />
                ) : (
                  <Video className="size-5 md:size-6" />
                )}
              </Button>
            )}

            {/* End/Decline Call */}
            {callState.status === "ringing" ? (
              <>
                <Button
                  size="icon-lg"
                  variant="destructive"
                  onClick={onDeclineCall}
                  className="size-12 rounded-full md:size-14"
                >
                  <PhoneOff className="size-5 md:size-6" />
                </Button>
                <Button
                  size="icon-lg"
                  variant="default"
                  onClick={onAcceptCall}
                  className="bg-green-500 hover:bg-green-600 size-12 rounded-full md:size-14"
                >
                  <Phone className="size-5 md:size-6" />
                </Button>
              </>
            ) : (
              <Button
                size="icon-lg"
                variant="destructive"
                onClick={onEndCall}
                className="size-12 rounded-full md:size-14"
              >
                <PhoneOff className="size-5 md:size-6" />
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {callState.status === "calling" && (
            <p className="text-muted-foreground text-xs md:text-sm">
              Waiting for {user.name} to answer...
            </p>
          )}

          {callState.status === "ringing" && (
            <p className="text-muted-foreground text-xs md:text-sm">
              Incoming {callState.type === "video" ? "video" : "voice"} call
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
