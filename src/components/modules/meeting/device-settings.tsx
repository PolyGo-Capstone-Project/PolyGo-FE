"use client";

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from "@/components/ui";
import { useDeviceSettings } from "@/hooks/reusable/use-device-settings";
import { getSupportedLanguages } from "@/lib/translation";
import { cn } from "@/lib/utils";
import {
  IconDeviceSpeaker,
  IconLanguage,
  IconMicrophone,
  IconVideo,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface DeviceSettingsProps {
  onClose: () => void;
  className?: string;
  targetLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  // Live Captions (viewing)
  captionsEnabled?: boolean;
  onCaptionsToggle?: (enabled: boolean) => void;
  // Microphone Transcription (sending)
  micTranscriptionEnabled?: boolean;
  onMicTranscriptionToggle?: (enabled: boolean) => void;
}

export function DeviceSettings({
  onClose,
  className,
  targetLanguage = "vi",
  onLanguageChange,
  captionsEnabled = false,
  onCaptionsToggle,
  micTranscriptionEnabled = false,
  onMicTranscriptionToggle,
}: DeviceSettingsProps) {
  const t = useTranslations("meeting.settings");
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const supportedLanguages = getSupportedLanguages();

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
      {/* Accessible title/description (avoid Sheet/Dialog-specific components so
              this component can be used inside a Card or inside a Sheet/Dialog) */}
      <h2 className="sr-only">{t("title")}</h2>
      <p className="sr-only">
        {t("description") || "Configure your audio and video devices"}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectCamera")} />
            </SelectTrigger>
            <SelectContent className="w-full">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectMicrophone")} />
            </SelectTrigger>
            <SelectContent className="w-full">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectSpeaker")} />
            </SelectTrigger>
            <SelectContent className="w-full">
              {audioOutputs.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Microphone Transcription Toggle (Sending) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <IconMicrophone className="h-4 w-4" />
                Microphone Transcription
              </Label>
              <p className="text-xs text-muted-foreground">
                Your speech will be transcribed and translated for others
              </p>
            </div>
            <Switch
              checked={micTranscriptionEnabled}
              onCheckedChange={onMicTranscriptionToggle}
              disabled={!onMicTranscriptionToggle}
            />
          </div>
        </div>

        {/* Live Captions Toggle (Viewing) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <IconLanguage className="h-4 w-4" />
                Live Captions
              </Label>
              <p className="text-xs text-muted-foreground">
                Show translated captions from other speakers on screen
              </p>
            </div>
            <Switch
              checked={captionsEnabled}
              onCheckedChange={onCaptionsToggle}
              disabled={!onCaptionsToggle}
            />
          </div>
        </div>

        {/* Caption Language selection */}
        <div
          className={`space-y-2 ${!captionsEnabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Label className="flex items-center gap-2">
            <IconLanguage className="h-4 w-4" />
            Caption Language
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Captions will be translated to this language
          </p>
          <Select
            value={targetLanguage}
            onValueChange={onLanguageChange}
            disabled={!onLanguageChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select caption language" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
