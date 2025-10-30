"use client";

import { useEventRoom } from "@/hooks/reusable/events/use-event-room";
import { useTranslations } from "next-intl";

interface RoomLayoutProps {
  children: React.ReactNode;
}

export function RoomLayout({ children }: RoomLayoutProps) {
  const t = useTranslations("event-room.room");
  const { isConnected, isHost } = useEventRoom();

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          {isHost && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-600 rounded">
              {t("host")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-2 text-sm text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t("connected")}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-yellow-400">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              {t("connecting")}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
