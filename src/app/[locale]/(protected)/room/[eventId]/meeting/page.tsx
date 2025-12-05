"use client";

import {
  CaptionsOverlay,
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
import { useEffect, useState } from "react";
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
    // AI Features
    transcriptions,
    isTranscriptionEnabled,
    isCaptionsEnabled,
    sourceLanguage,
    setSourceLanguage,
    targetLanguage,
    setTargetLanguage,
    startTranscription,
    stopTranscription,
    enableCaptions,
    disableCaptions,
  } = useWebRTC({
    eventId,
    userName: currentUser?.name || "Guest",
    isHost: isHost || false,
    userId: currentUser?.id,
    onRoomEnded: () => {
      toast.error(tError("eventEnded"));
      removeSettingMediaFromLocalStorage();
      router.push(`/${locale}/event/${eventId}`);
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

  // Auto start call when participants join or when participant list changes
  useEffect(() => {
    if (!isInitialized || !hasStartedEvent) {
      return;
    }

    const participantCount = participantsList.length;

    if (participantCount > 0 && isConnected) {
      console.log(
        "[Meeting] Initiating call with",
        participantCount,
        "participants"
      );

      // ✅ REMOVED callInitiatedRef check - allow startCall to run whenever participants change
      // This ensures all participants (including late joiners) can establish peer connections

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

      // Auto-start transcription for host when starting event
      if (!isTranscriptionEnabled) {
        console.log("[Meeting] Auto-starting host transcription...");
        // Pass event language as source, user's target language for translation
        startTranscription(event.language.code, targetLanguage);
      }

      toast.success(tControls("startEvent"));
    } catch (error) {
      console.error("[Meeting] Start event error:", error);
      toast.error("Failed to start event");
    }
  };

  // Handle end event
  const handleEndEvent = async () => {
    if (!isHost || !event) return;

    // Close the confirmation dialog first
    setShowEndEventDialog(false);

    try {
      // ✅ FIX: End room via SignalR FIRST - this validates minimum duration
      // If it fails (too early), it will throw error and stop execution
      await endRoom();

      // ✅ Only proceed if endRoom succeeded (didn't throw)
      console.log("[Meeting] ✓ EndRoom successful, updating status...");

      // 2. Update event status in database
      await eventApiRequest.updateEventStatusByHost({
        eventId,
        status: EventStatus.Completed,
      });

      toast.success(tControls("endEvent"));

      // 3. Cleanup local resources
      removeSettingMediaFromLocalStorage();

      // 4. Redirect to event detail page
      router.push(`/${locale}/event/${eventId}`);
    } catch (error) {
      console.error("[Meeting] End event error:", error);
      // ✅ Error toast already shown by endRoom() function
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

  // Handle captions toggle (viewing only)
  const handleCaptionsToggle = (enabled?: boolean) => {
    const shouldEnable = enabled !== undefined ? enabled : !isCaptionsEnabled;
    if (shouldEnable) {
      enableCaptions();
    } else {
      disableCaptions();
    }
  };

  // Handle microphone transcription toggle (sending)
  const handleMicTranscriptionToggle = (enabled: boolean) => {
    if (enabled) {
      console.log("[Meeting] Starting microphone transcription...");
      // Pass event language as source, user's target language for translation
      startTranscription(event?.language.code || "en", targetLanguage);
    } else {
      console.log("[Meeting] Stopping microphone transcription...");
      stopTranscription();
    }
  };

  // ✅ FIX: Check authorization BEFORE checking initialization
  // This prevents stuck "Connecting..." for unauthorized users
  if (!isLoading && (!event || !currentUser || !canJoin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-destructive"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-sm text-muted-foreground">
                {!event
                  ? "Event not found."
                  : !canJoin
                    ? "You are not registered for this event. Please register first to join the meeting."
                    : tError("notAuthorized")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/${locale}/dashboard`)}
              >
                Go to Dashboard
              </Button>
              {event && !canJoin && (
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/${locale}/event/${eventId}`)}
                >
                  View Event Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Show loading state AFTER authorization check
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

  // ✅ TypeScript assertion: At this point, event and currentUser are guaranteed to exist
  // because we already checked authorization above
  if (!event || !currentUser) {
    return null; // This should never happen due to earlier checks
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
      <div className="flex-1 overflow-hidden relative">
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

      {/* Captions Panel (Separate from video) */}
      {isCaptionsEnabled && (
        <CaptionsOverlay
          transcriptions={transcriptions}
          showOriginal={false}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          isTranscriptionEnabled={isTranscriptionEnabled}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={setTargetLanguage}
          onClose={() => {
            // Disable captions when closing
            if (isCaptionsEnabled) {
              handleCaptionsToggle(false);
            }
          }}
        />
      )}

      {/* Controls */}
      <MeetingControls
        audioEnabled={controls.audioEnabled}
        videoEnabled={controls.videoEnabled}
        isHandRaised={controls.isHandRaised}
        isChatOpen={controls.isChatOpen}
        isParticipantsOpen={controls.isParticipantsOpen}
        isSettingsOpen={controls.isSettingsOpen}
        isCaptionsEnabled={isCaptionsEnabled}
        isHost={isHost}
        hasStartedEvent={hasStartedEvent}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleHandRaise={handleToggleHandRaise}
        onToggleChat={toggleChat}
        onToggleParticipants={toggleParticipants}
        onToggleSettings={toggleSettings}
        onToggleCaptions={handleCaptionsToggle}
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
          <DeviceSettings
            onClose={toggleSettings}
            micTranscriptionEnabled={isTranscriptionEnabled}
            onMicTranscriptionToggle={handleMicTranscriptionToggle}
          />
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
