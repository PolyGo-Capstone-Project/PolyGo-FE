"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { DevicePreview, JoinButton } from "@/components/modules/event";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function WaitingRoomPage() {
  const t = useTranslations("event-room.waitingRoom");
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("setupDevice")}</p>
        </div>

        <DevicePreview />

        {/* Event Info Card - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>{t("eventInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("startTime")}:</span>
              <span className="font-medium">2:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("host")}:</span>
              <span className="font-medium">John Doe</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("participants")}:
              </span>
              <span className="font-medium">5/50</span>
            </div>
          </CardContent>
        </Card>

        <JoinButton eventId={eventId} />
      </div>
    </div>
  );
}
