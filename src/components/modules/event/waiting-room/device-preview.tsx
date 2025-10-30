"use client";

import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import type { MediaDeviceInfo as LocalMediaDeviceInfo } from "@/lib";
import { getMediaDevices, getUserMediaStream } from "@/lib";
import { Camera, CameraOff, Mic, MicOff, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function DevicePreview() {
  const t = useTranslations("event-room.waitingRoom");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const [cameras, setCameras] = useState<LocalMediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<LocalMediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeDevices();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (selectedCamera || selectedMic) {
      changeDevices();
    }
  }, [selectedCamera, selectedMic]);

  const initializeDevices = async () => {
    try {
      // Get initial stream to trigger permissions
      const initialStream = await getUserMediaStream();
      setStream(initialStream);

      if (videoRef.current) {
        videoRef.current.srcObject = initialStream;
      }

      // Get available devices
      const { cameras: cams, microphones: mics } = await getMediaDevices();
      setCameras(cams);
      setMicrophones(mics);

      // Set default selections
      if (cams.length > 0) setSelectedCamera(cams[0].deviceId);
      if (mics.length > 0) setSelectedMic(mics[0].deviceId);
    } catch (error) {
      console.error("Failed to get media devices:", error);
      toast.error(t("deviceError"));
    }
  };

  const changeDevices = async () => {
    if (!selectedCamera && !selectedMic) return;

    try {
      // Stop existing stream
      stream?.getTracks().forEach((track) => track.stop());

      // Get new stream with selected devices
      const newStream = await getUserMediaStream(selectedCamera, selectedMic);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Update track states
      const videoTrack = newStream.getVideoTracks()[0];
      const audioTrack = newStream.getAudioTracks()[0];
      if (videoTrack) videoTrack.enabled = isCameraOn;
      if (audioTrack) audioTrack.enabled = isMicOn;
    } catch (error) {
      console.error("Failed to change devices:", error);
      toast.error(t("deviceError"));
    }
  };

  const toggleCamera = () => {
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    if (!stream) return;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isCameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={toggleCamera}
            variant={isCameraOn ? "default" : "destructive"}
            size="lg"
            className="gap-2"
          >
            {isCameraOn ? (
              <>
                <Camera className="w-5 h-5" />
                {t("cameraOn")}
              </>
            ) : (
              <>
                <CameraOff className="w-5 h-5" />
                {t("cameraOff")}
              </>
            )}
          </Button>

          <Button
            onClick={toggleMic}
            variant={isMicOn ? "default" : "destructive"}
            size="lg"
            className="gap-2"
          >
            {isMicOn ? (
              <>
                <Mic className="w-5 h-5" />
                {t("micOn")}
              </>
            ) : (
              <>
                <MicOff className="w-5 h-5" />
                {t("micOff")}
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {showSettings && (
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("cameraLabel")}</label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((camera) => (
                    <SelectItem key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("microphoneLabel")}
              </label>
              <Select value={selectedMic} onValueChange={setSelectedMic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {microphones.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
