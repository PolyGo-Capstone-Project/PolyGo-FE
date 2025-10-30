"use client";

import { useEventRoom } from "@/hooks/reusable/events/use-event-room";
import { CameraOff, MicOff, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

export function LocalVideo() {
  const t = useTranslations("event-room.room");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localStream, isCameraOn, isMicOn } = useEventRoom();

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      )}

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{t("you")}</span>
        </div>

        <div className="flex items-center gap-2">
          {!isMicOn && (
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <MicOff className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          {!isCameraOn && (
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <CameraOff className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Border indicator */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
    </div>
  );
}
