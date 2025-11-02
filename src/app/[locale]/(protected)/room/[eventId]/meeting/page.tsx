"use client";

import {
  ChatPanel,
  DeviceSettings,
  MeetingControls,
  ParticipantList,
  VideoGrid,
} from "@/components/modules/meeting";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  Sheet,
  SheetContent,
} from "@/components/ui";
import { EventStatus } from "@/constants";
import { useEventMeeting } from "@/hooks/reusable/use-event-meeting";
import { useMeetingControls } from "@/hooks/reusable/use-meeting-controls";
import { useWebRTC } from "@/hooks/reusable/use-webrtc";
import { removeSettingMediaFromLocalStorage } from "@/lib";
import eventApiRequest from "@/lib/apis/event";
import { MeetingChatMessage, Participant } from "@/types";
import { IconLoader2 } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("meeting");
  const tControls = useTranslations("meeting.controls");
  const tDialogs = useTranslations("meeting.dialogs");
  const tError = useTranslations("meeting.errors");

  const eventId = params.eventId as string;
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEndEventDialog, setShowEndEventDialog] = useState(false);
  const [hasStartedEvent, setHasStartedEvent] = useState(false);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const callInitiatedRef = useRef(false);

  const { event, currentUser, isHost, canJoin, isLoading } =
    useEventMeeting(eventId);

  const {
    isConnected,
    myConnectionId,
    hostId,
    participants: webrtcParticipants,
    localStream,
    localAudioEnabled,
    localVideoEnabled,
    joinRoom,
    startCall,
    leaveRoom,
    endRoom,
    toggleAudio: webrtcToggleAudio,
    toggleVideo: webrtcToggleVideo,
    getLocalStream,
  } = useWebRTC({
    eventId,
    userName: currentUser?.name || "Guest",
    isHost: isHost || false,
    onRoomEnded: () => {
      toast.error(tError("eventEnded"));
      removeSettingMediaFromLocalStorage();
      router.push(`/${locale}/dashboard`);
    },
  });

  const {
    controls,
    toggleHandRaise,
    toggleChat,
    toggleParticipants,
    toggleSettings,
    setAudioEnabled,
    setVideoEnabled,
  } = useMeetingControls();

  useEffect(() => {
    setAudioEnabled(localAudioEnabled);
  }, [localAudioEnabled, setAudioEnabled]);

  useEffect(() => {
    setVideoEnabled(localVideoEnabled);
  }, [localVideoEnabled, setVideoEnabled]);

  // Convert WebRTC participants map to array
  const participantsList: Participant[] = Array.from(
    webrtcParticipants.values()
  );

  // ✅ Initialize meeting ONCE
  useEffect(() => {
    if (!isLoading && event && currentUser && canJoin && !isInitialized) {
      const init = async () => {
        try {
          console.log("[Meeting] Getting local stream before joining...");
          await getLocalStream();
          console.log("[Meeting] ✓ Local stream ready, joining room...");

          await joinRoom();
          setIsInitialized(true);

          if (event.status === EventStatus.Live) {
            setHasStartedEvent(true);
          }
        } catch (error) {
          console.error("[Meeting] Init error:", error);
          toast.error(tError("joinFailed"));
        }
      };

      init();
    }
  }, [
    isLoading,
    event,
    currentUser,
    canJoin,
    isInitialized,
    getLocalStream,
    joinRoom,
    tError,
  ]);

  // Auto start call when participants join
  useEffect(() => {
    if (!isInitialized || !hasStartedEvent || callInitiatedRef.current) {
      return;
    }

    const participantCount = participantsList.length;

    if (participantCount > 0 && isConnected) {
      console.log(
        "[Meeting] Initiating call with",
        participantCount,
        "participants"
      );

      callInitiatedRef.current = true;

      const timer = setTimeout(() => {
        startCall();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [
    isInitialized,
    hasStartedEvent,
    participantsList.length,
    isConnected,
    startCall,
  ]);

  // Handle audio toggle
  const handleToggleAudio = () => {
    webrtcToggleAudio();
  };

  // Handle video toggle
  const handleToggleVideo = () => {
    webrtcToggleVideo();
  };

  // Handle leave
  const handleLeave = async () => {
    callInitiatedRef.current = false;
    await leaveRoom();
    router.push(`/${locale}/dashboard`);
  };

  // Handle start event (host only)
  const handleStartEvent = async () => {
    if (!isHost || !event) return;

    try {
      await eventApiRequest.updateEventStatusByHost({
        eventId,
        status: EventStatus.Live,
      });
      setHasStartedEvent(true);
      toast.success(tControls("startEvent"));
    } catch (error) {
      console.error("[Meeting] Start event error:", error);
      toast.error("Failed to start event");
    }
  };

  // Handle end event
  const handleEndEvent = async () => {
    if (!isHost || !event) return;

    try {
      // 1. End room via SignalR - this broadcasts to ALL participants
      await endRoom();

      // 2. Update event status in database
      await eventApiRequest.updateEventStatusByHost({
        eventId,
        status: EventStatus.Completed,
      });

      toast.success(tControls("endEvent"));

      // 3. Cleanup local resources
      callInitiatedRef.current = false;
      await leaveRoom();
    } catch (error) {
      console.error("[Meeting] End event error:", error);
      toast.error("Failed to end event");
    } finally {
      removeSettingMediaFromLocalStorage();
      router.push(`/${locale}/dashboard`);
    }
  };

  // Handle send chat message
  const handleSendMessage = (message: string) => {
    const newMessage: MeetingChatMessage = {
      id: Date.now().toString(),
      senderId: myConnectionId,
      senderName: currentUser?.name || "Guest",
      message,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  // Handle participant actions
  const handleMuteParticipant = (participantId: string) => {
    toast.info("Mute participant feature (UI only)");
  };

  const handleDisableVideoParticipant = (participantId: string) => {
    toast.info("Disable video feature (UI only)");
  };

  const handleKickParticipant = (participantId: string) => {
    toast.info("Kick participant feature (UI only)");
  };

  const handleLowerAllHands = () => {
    toast.info("Lower all hands feature (UI only)");
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!event || !currentUser || !canJoin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              {tError("notAuthorized")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show waiting message for attendees if event not started
  if (!isHost && !hasStartedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <IconLoader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">{t("meeting.waitingForHost")}</p>
            <p className="text-sm text-muted-foreground">
              {t("meeting.eventNotStarted")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Video Grid */}
      <div className="flex-1 overflow-hidden">
        <VideoGrid
          participants={participantsList}
          localStream={localStream}
          localName={currentUser.name}
          localAvatarUrl={currentUser.avatarUrl || undefined}
          localAudioEnabled={controls.audioEnabled}
          localVideoEnabled={controls.videoEnabled}
          myConnectionId={myConnectionId}
          hostId={hostId} // ✅ ADD: Pass hostId prop
          isHost={isHost}
        />
      </div>

      {/* Controls */}
      <MeetingControls
        audioEnabled={controls.audioEnabled}
        videoEnabled={controls.videoEnabled}
        isHandRaised={controls.isHandRaised}
        isChatOpen={controls.isChatOpen}
        isParticipantsOpen={controls.isParticipantsOpen}
        isSettingsOpen={controls.isSettingsOpen}
        isHost={isHost}
        hasStartedEvent={hasStartedEvent}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleHandRaise={toggleHandRaise}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipants}
        onToggleSettings={toggleSettings}
        onLeave={() => setShowLeaveDialog(true)}
        onStartEvent={handleStartEvent}
        onEndEvent={() => setShowEndEventDialog(true)}
      />

      {/* Participants Panel */}
      <Sheet
        open={controls.isParticipantsOpen}
        onOpenChange={toggleParticipants}
      >
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <ParticipantList
            participants={participantsList}
            isHost={isHost}
            myConnectionId={myConnectionId}
            onMuteParticipant={handleMuteParticipant}
            onDisableVideoParticipant={handleDisableVideoParticipant}
            onKickParticipant={handleKickParticipant}
            onLowerAllHands={handleLowerAllHands}
            onClose={toggleParticipants}
          />
        </SheetContent>
      </Sheet>

      {/* Chat Panel */}
      <Sheet open={controls.isChatOpen} onOpenChange={toggleChat}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClose={toggleChat}
          />
        </SheetContent>
      </Sheet>

      {/* Settings Panel */}
      <Sheet open={controls.isSettingsOpen} onOpenChange={toggleSettings}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <DeviceSettings onClose={toggleSettings} />
        </SheetContent>
      </Sheet>

      {/* Leave Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialogs("leaveTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialogs("leaveMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialogs("leaveCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave}>
              {tDialogs("leaveConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Event Dialog */}
      <AlertDialog
        open={showEndEventDialog}
        onOpenChange={setShowEndEventDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDialogs("endEventTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {tDialogs("endEventMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialogs("endEventCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndEvent}>
              {tDialogs("endEventConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
