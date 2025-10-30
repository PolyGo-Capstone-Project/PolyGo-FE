"use client";

import { Button } from "@/components/ui/button";
import { useEventRoom } from "@/hooks/reusable/events/use-event-room";
import { LayoutGrid, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalVideo } from "./local-video";
import { RemoteVideo } from "./remote-video";

export function VideoGrid() {
  const t = useTranslations("event-room.room.controls");
  const { participants, myConnectionId, viewMode, toggleViewMode } =
    useEventRoom();

  const participantsList = Array.from(participants.entries()).filter(
    ([id]) => id !== myConnectionId
  );

  const totalParticipants = participantsList.length + 1; // +1 for local video

  // Calculate grid columns based on number of participants
  const getGridCols = () => {
    if (totalParticipants <= 1) return "grid-cols-1";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Toggle */}
      <div className="p-4 flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleViewMode}
          className="gap-2 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
        >
          {viewMode === "grid" ? (
            <>
              <LayoutGrid className="w-4 h-4" />
              {t("gridView")}
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              {t("speakerView")}
            </>
          )}
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div
          className={`grid ${getGridCols()} gap-4 auto-rows-fr h-full`}
          style={{
            gridAutoRows: viewMode === "speaker" ? "auto" : "1fr",
          }}
        >
          <LocalVideo />

          {participantsList.map(([peerId, participant]) => (
            <RemoteVideo key={peerId} participant={participant} />
          ))}
        </div>
      </div>
    </div>
  );
}
