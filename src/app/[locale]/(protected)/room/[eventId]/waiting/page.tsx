"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components";
import { DeviceSettings } from "@/components/modules/meeting";
import { useEventMeeting } from "@/hooks/reusable/use-event-meeting";
import { cn, removeSettingMediaFromLocalStorage } from "@/lib/utils";
import {
  IconLoader2,
  IconMicrophone,
  IconMicrophoneOff,
  IconSettings,
  IconVideo,
  IconVideoOff,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("meeting.waiting");
  const tError = useTranslations("meeting.errors");
  const locale = useLocale();
  const eventId = params.eventId as string;

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { event, currentUser, canJoin, isLoading } = useEventMeeting(eventId);

  useEffect(() => {
    if (isInitialized) return;

    let mounted = true;

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsInitialized(true);
        console.log("[Waiting] ✓ Stream initialized");
      } catch (error) {
        console.error("[Waiting] Media error:", error);
        setPermissionError(tError("permissionDenied"));
      }
    };

    initStream();

    return () => {
      mounted = false;
    };
  }, [isInitialized, tError]);

  // ✅ FIX: Cleanup stream on unmount BUT KHÔNG stop tracks (để giữ cho meeting)
  useEffect(() => {
    return () => {
      // Lưu trạng thái audio/video trước khi unmount
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];

        if (audioTrack) {
          localStorage.setItem(
            "meeting_audio_enabled",
            String(audioTrack.enabled)
          );
        }
        if (videoTrack) {
          localStorage.setItem(
            "meeting_video_enabled",
            String(videoTrack.enabled)
          );
        }

        console.log(
          "[Waiting] Saved media states - audio:",
          audioTrack?.enabled,
          "video:",
          videoTrack?.enabled
        );
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
      videoRef.current
        .play()
        .then(() => console.log("[Waiting] Video playing"))
        .catch((err) => console.error("[Waiting] Play error:", err));
    }
  }, [localStream]);

  // ✅ FIX: Toggle audio - CHỈ toggle enabled, KHÔNG stop track
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        console.log(
          "[Waiting]",
          audioTrack.enabled ? "✓ Audio enabled" : "✗ Audio disabled"
        );
      }
    }
  };

  // ✅ FIX: Toggle video - CHỈ toggle enabled, KHÔNG stop track
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        console.log(
          "[Waiting]",
          videoTrack.enabled ? "✓ Video enabled" : "✗ Video disabled"
        );
      }
    }
  };

  // Join meeting
  const handleJoin = () => {
    router.push(`/${locale}/room/${eventId}/meeting`);
  };

  // Cancel meeting
  const handleCancel = () => {
    router.back();
    removeSettingMediaFromLocalStorage();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardDescription>{t("subtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/30 border">
                  {videoEnabled && localStream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconVideoOff className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  {/* Controls overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Button
                      variant={audioEnabled ? "default" : "destructive"}
                      size="icon"
                      onClick={toggleAudio}
                      className="h-12 w-12 rounded-full"
                      disabled={!localStream}
                    >
                      {audioEnabled ? (
                        <IconMicrophone className="h-5 w-5" />
                      ) : (
                        <IconMicrophoneOff className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      variant={videoEnabled ? "default" : "destructive"}
                      size="icon"
                      onClick={toggleVideo}
                      className="h-12 w-12 rounded-full"
                      disabled={!localStream}
                    >
                      {videoEnabled ? (
                        <IconVideo className="h-5 w-5" />
                      ) : (
                        <IconVideoOff className="h-5 w-5" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className="h-12 w-12 rounded-full"
                    >
                      <IconSettings className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Permission error */}
                {permissionError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm text-destructive">
                      {permissionError}
                    </p>
                  </div>
                )}

                {/* Status indicators */}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      audioEnabled ? "text-green-600" : "text-muted-foreground"
                    )}
                  >
                    {audioEnabled ? (
                      <IconMicrophone className="h-4 w-4" />
                    ) : (
                      <IconMicrophoneOff className="h-4 w-4" />
                    )}
                    <span>
                      {audioEnabled ? t("micEnabled") : t("micDisabled")}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      videoEnabled ? "text-green-600" : "text-muted-foreground"
                    )}
                  >
                    {videoEnabled ? (
                      <IconVideo className="h-4 w-4" />
                    ) : (
                      <IconVideoOff className="h-4 w-4" />
                    )}
                    <span>
                      {videoEnabled ? t("cameraEnabled") : t("cameraDisabled")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel or Event Info */}
          <div className="lg:col-span-1">
            {showSettings ? (
              <Card className="h-full">
                <DeviceSettings onClose={() => setShowSettings(false)} />
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{t("setupDevices")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Host</p>
                    <p className="font-medium">{event.host.name}</p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleJoin}
                    disabled={!!permissionError}
                  >
                    {t("joinButton")}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
