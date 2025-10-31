"use client";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SheetDescription,
  SheetTitle,
} from "@/components/ui";
import { useDeviceSettings } from "@/hooks/reusable/use-device-settings";
import { cn } from "@/lib/utils";
import {
  IconDeviceSpeaker,
  IconMicrophone,
  IconVideo,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface DeviceSettingsProps {
  onClose: () => void;
  className?: string;
}

export function DeviceSettings({ onClose, className }: DeviceSettingsProps) {
  const t = useTranslations("meeting.settings");
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const {
    audioInputs,
    videoInputs,
    audioOutputs,
    settings,
    isLoading,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
    getStreamWithSettings,
  } = useDeviceSettings();

  // Preview video
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startPreview = async () => {
      try {
        stream = await getStreamWithSettings();
        if (videoPreviewRef.current && stream) {
          videoPreviewRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("[Settings] Preview error:", error);
      }
    };

    startPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [settings.selectedVideoInput, getStreamWithSettings]);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <SheetTitle className="sr-only">{t("title")}</SheetTitle>
      <SheetDescription className="sr-only">
        {t("description") || "Configure your audio and video devices"}
      </SheetDescription>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Video preview */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <IconVideo className="h-4 w-4" />
            {t("videoPreview")}
          </Label>
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary/30 border">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Separator />

        {/* Camera selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <IconVideo className="h-4 w-4" />
            {t("camera")}
          </Label>
          <Select
            value={settings.selectedVideoInput}
            onValueChange={selectVideoInput}
            disabled={isLoading || videoInputs.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectCamera")} />
            </SelectTrigger>
            <SelectContent>
              {videoInputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Microphone selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <IconMicrophone className="h-4 w-4" />
            {t("microphone")}
          </Label>
          <Select
            value={settings.selectedAudioInput}
            onValueChange={selectAudioInput}
            disabled={isLoading || audioInputs.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectMicrophone")} />
            </SelectTrigger>
            <SelectContent>
              {audioInputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speaker selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <IconDeviceSpeaker className="h-4 w-4" />
            {t("speaker")}
          </Label>
          <Select
            value={settings.selectedAudioOutput}
            onValueChange={selectAudioOutput}
            disabled={isLoading || audioOutputs.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectSpeaker")} />
            </SelectTrigger>
            <SelectContent>
              {audioOutputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
