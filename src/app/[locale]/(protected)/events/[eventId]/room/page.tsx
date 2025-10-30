"use client";
import { ControlBar, RoomLayout, VideoGrid } from "@/components/modules/event";
import { useEventRoom } from "@/hooks/reusable/events/use-event-room";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EventRoomPage() {
  const t = useTranslations("event-room.room");
  const params = useParams();
  const eventId = params.eventId as string;

  const { startCall, isConnected } = useEventRoom();

  useEffect(() => {
    // Auto-start call when connected
    if (isConnected) {
      const timer = setTimeout(() => {
        startCall();
        toast.success(t("connected"));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, startCall, t]);

  return (
    <RoomLayout>
      <VideoGrid />
      <ControlBar />
    </RoomLayout>
  );
}
