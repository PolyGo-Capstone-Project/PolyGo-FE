"use client";

import { CallStatusEnum, MessageEnum } from "@/constants";
import { cn } from "@/lib/utils";
import { Phone, PhoneMissed, Video, VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface CallMessageProps {
  type: typeof MessageEnum.VoiceCall | typeof MessageEnum.VideoCall;
  status: keyof typeof CallStatusEnum;
  durationSeconds?: number;
}

export function CallMessage({
  type,
  status,
  durationSeconds,
}: CallMessageProps) {
  const t = useTranslations("chat.call");

  const isVideoCall = type === MessageEnum.VideoCall;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  const getCallInfo = () => {
    switch (status) {
      case CallStatusEnum.Completed:
        return {
          icon: isVideoCall ? Video : Phone,
          text: isVideoCall ? t("videoCall") : t("voiceCall"),
          duration: durationSeconds ? formatDuration(durationSeconds) : null,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          textColor: "text-emerald-900 dark:text-foreground",
          bg: "bg-emerald-100 dark:bg-white/10",
        };
      case CallStatusEnum.Missed:
        return {
          icon: isVideoCall ? VideoOff : PhoneMissed,
          text: t("missedCall.incoming"),
          duration: null,
          iconColor: "text-red-600 dark:text-red-400",
          textColor: "text-red-900 dark:text-red-100",
          bg: "bg-red-100 dark:bg-red-500/10",
        };
      case CallStatusEnum.Declined:
        return {
          icon: isVideoCall ? VideoOff : PhoneMissed,
          text: t("declined.incoming"),
          duration: null,
          iconColor: "text-orange-600 dark:text-orange-400",
          textColor: "text-orange-900 dark:text-orange-100",
          bg: "bg-orange-100 dark:bg-orange-500/10",
        };
      case CallStatusEnum.Failed:
      case CallStatusEnum.Cancelled:
        return {
          icon: isVideoCall ? VideoOff : PhoneMissed,
          text:
            status === CallStatusEnum.Failed
              ? t("failed.incoming")
              : t("cancelled.incoming"),
          duration: null,
          iconColor: "text-muted-foreground",
          textColor: "text-muted-foreground",
          bg: "bg-muted/50",
        };
      default:
        return {
          icon: isVideoCall ? Video : Phone,
          text: isVideoCall ? t("videoCall") : t("voiceCall"),
          duration: null,
          iconColor: "text-foreground",
          textColor: "text-foreground",
          bg: "bg-muted",
        };
    }
  };

  const callInfo = getCallInfo();
  const Icon = callInfo.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1.5",
        callInfo.bg
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", callInfo.iconColor)} />
      <span className={cn("text-xs font-medium", callInfo.textColor)}>
        {callInfo.text}
      </span>
      {callInfo.duration && (
        <>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground">
            {callInfo.duration}
          </span>
        </>
      )}
    </div>
  );
}
