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
  Button,
  Card,
  CardContent,
  Sheet,
  SheetContent,
} from "@/components/ui";
import { EventStatus } from "@/constants";
import { useEventMeeting } from "@/hooks/reusable/use-event-meeting";
import { useMeetingControls } from "@/hooks/reusable/use-meeting-controls";
import { useWebRTC } from "@/hooks/reusable/use-webrtc";
import { useMobileDevice } from "@/hooks/use-mobile-device";
import { removeSettingMediaFromLocalStorage } from "@/lib";
import eventApiRequest from "@/lib/apis/event";
import { MeetingChatMessage, Participant } from "@/types";
import { IconDeviceMobile, IconLoader2 } from "@tabler/icons-react";
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
  const tMobile = useTranslations("meeting.mobile");

  const eventId = params.eventId as string;
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEndEventDialog, setShowEndEventDialog] = useState(false);
  const [hasStartedEvent, setHasStartedEvent] = useState(false);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const callInitiatedRef = useRef(false);
  const isMobileDevice = useMobileDevice();

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
    isHandRaised,
    chatMessages: webrtcChatMessages,
    joinRoom,
    startCall,
    leaveRoom,
    endRoom,
    toggleAudio: webrtcToggleAudio,
    toggleVideo: webrtcToggleVideo,
    getLocalStream,
    sendChatMessage,
    toggleHandRaise: webrtcToggleHandRaise,
    hostToggleMic,
    hostToggleCam,
    kickUser,
    muteAllParticipants,
    turnOffAllCameras,
    lowerAllHands,
  } = useWebRTC({
    eventId,
    userName: currentUser?.name || "Guest",
    isHost: isHost || false,
    onRoomEnded: () => {
      toast.error(tError("eventEnded"));
      removeSettingMediaFromLocalStorage();
      router.push(`/${locale}/events/${eventId}`);
    },
  });

  const {
    controls,
    toggleChat,
    toggleParticipants,
    toggleSettings,
    setAudioEnabled,
    setVideoEnabled,
    setHandRaised,
  } = useMeetingControls();

  // Sync hand raised state from WebRTC to controls
  useEffect(() => {
    setHandRaised(isHandRaised);
  }, [isHandRaised, setHandRaised]);

  // Sync chat messages from WebRTC
  useEffect(() => {
    setChatMessages(webrtcChatMessages);
  }, [webrtcChatMessages]);

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
    } catch (error) {
      console.error("[Meeting] End event error:", error);
      toast.error("Failed to end event");
    } finally {
      // 3. Cleanup local resources (always run this)
      callInitiatedRef.current = false;
      removeSettingMediaFromLocalStorage();

      // Small delay to ensure cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push(`/${locale}/dashboard`);
    }
  };

  // Handle send chat message
  const handleSendMessage = async (message: string) => {
    await sendChatMessage(message);
  };

  // Handle toggle hand raise
  const handleToggleHandRaise = async () => {
    await webrtcToggleHandRaise();
  };

  // Handle participant actions (Host only)
  const handleMuteParticipant = async (
    participantId: string,
    enabled: boolean
  ) => {
    if (!isHost) return;
    await hostToggleMic(participantId, enabled);
  };

  const handleDisableVideoParticipant = async (
    participantId: string,
    enabled: boolean
  ) => {
    if (!isHost) return;
    await hostToggleCam(participantId, enabled);
  };

  const handleKickParticipant = async (participantId: string) => {
    if (!isHost) return;
    await kickUser(participantId);
  };

  const handleLowerAllHands = async () => {
    if (!isHost) return;
    await lowerAllHands();
  };

  // Handle Mute All (Host only)
  const handleMuteAll = async () => {
    if (!isHost) return;
    await muteAllParticipants();
    toast.success("Muted all participants");
  };

  // Handle Turn Off All Cameras (Host only)
  const handleTurnOffAllCameras = async () => {
    if (!isHost) return;
    await turnOffAllCameras();
    toast.success("Turned off all cameras");
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

  // ✅ NEW: Block mobile devices in meeting room
  if (isMobileDevice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <IconDeviceMobile className="h-16 w-16 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {tMobile("notSupportedTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tMobile("notSupportedMessage")}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/${locale}/dashboard`)}
            >
              {tMobile("backButton")}
            </Button>
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
        onToggleHandRaise={handleToggleHandRaise}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipants}
        onToggleSettings={toggleSettings}
        onLeave={() => setShowLeaveDialog(true)}
        onStartEvent={handleStartEvent}
        onEndEvent={() => setShowEndEventDialog(true)}
        onMuteAll={handleMuteAll}
        onTurnOffAllCameras={handleTurnOffAllCameras}
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
