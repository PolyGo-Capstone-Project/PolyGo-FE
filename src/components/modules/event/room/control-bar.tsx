"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components";
import { useEventRoom } from "@/hooks";

import {
  Camera,
  CameraOff,
  CameraOff as CameraOffAll,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  MicOff as MicOffAll,
  MonitorUp,
  PhoneOff,
  Play,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function ControlBar() {
  const t = useTranslations("event-room.room");
  const router = useRouter();
  const {
    toggleCamera,
    toggleMic,
    disconnectFromRoom,
    isCameraOn,
    isMicOn,
    isHost,
    toggleChat,
    toggleParticipants,
  } = useEventRoom();

  const handleLeave = async () => {
    await disconnectFromRoom();
    router.push("/");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <TooltipProvider>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - Host controls */}
          <div className="flex items-center gap-2">
            {isHost && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white border-0"
                    >
                      <Play className="w-5 h-5" />
                      {t("host.startEvent")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("host.startEvent")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      <Square className="w-5 h-5" />
                      {t("host.endEvent")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("host.endEvent")}</TooltipContent>
                </Tooltip>

                <div className="w-px h-8 bg-gray-700 mx-2" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <MicOffAll className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("host.muteAll")}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <CameraOffAll className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("host.cameraAll")}</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          {/* Center - Main controls */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleCamera}
                  variant={isCameraOn ? "default" : "destructive"}
                  size="lg"
                  className="gap-2"
                >
                  {isCameraOn ? (
                    <Camera className="w-5 h-5" />
                  ) : (
                    <CameraOff className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.camera")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMic}
                  variant={isMicOn ? "default" : "destructive"}
                  size="lg"
                  className="gap-2"
                >
                  {isMicOn ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.microphone")}</TooltipContent>
            </Tooltip>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Hand className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.raiseHand")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleChat}
                  variant="ghost"
                  size="icon"
                  className="text-white"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.chat")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <MonitorUp className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.shareScreen")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleParticipants}
                  variant="ghost"
                  size="icon"
                  className="text-white"
                >
                  <Users className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.participants")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("controls.settings")}</TooltipContent>
            </Tooltip>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                      disabled={isHost}
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("controls.leave")}</TooltipContent>
                </Tooltip>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("leave.confirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("leave.confirmMessage")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("leave.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave}>
                    {t("leave.confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Right side - Placeholder */}
          <div className="w-[200px]" />
        </div>
      </TooltipProvider>
    </div>
  );
}
