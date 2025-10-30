"use client";

import { Button } from "@/components/ui/button";
import { useEventRoom } from "@/hooks/reusable/events/use-event-room";
import { getUserMediaStream } from "@/lib";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface JoinButtonProps {
  eventId: string;
}

export function JoinButton({ eventId }: JoinButtonProps) {
  const t = useTranslations("event-room.waitingRoom");
  const tRoom = useTranslations("event-room.room");
  const router = useRouter();
  const locale = useLocale();
  const { connectToRoom, setLocalStream } = useEventRoom();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);

    try {
      // Get media stream
      const stream = await getUserMediaStream();
      setLocalStream(stream);

      // Connect to room
      const roomId = eventId; // In production, you might fetch this from API
      const userName = "User"; // Get from auth context

      await connectToRoom(eventId, roomId, userName);

      // Navigate to room
      router.push(`/${locale}/events/${eventId}/room`);
    } catch (error) {
      console.error("Failed to join:", error);
      toast.error(tRoom("errors.connectionFailed"));
      setIsJoining(false);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={isJoining}
      size="lg"
      className="w-full"
    >
      {isJoining ? t("joining") : t("joinButton")}
    </Button>
  );
}
