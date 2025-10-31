"use client";

import { DeviceInfo, MeetingSettings } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useDeviceSettings() {
  const [audioInputs, setAudioInputs] = useState<DeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<DeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<DeviceInfo[]>([]);
  const [settings, setSettings] = useState<MeetingSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    try {
      setIsLoading(true);

      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioIns: DeviceInfo[] = [];
      const videoIns: DeviceInfo[] = [];
      const audioOuts: DeviceInfo[] = [];

      devices.forEach((device) => {
        const deviceInfo: DeviceInfo = {
          deviceId: device.deviceId,
          label:
            device.label || `${device.kind} ${device.deviceId.slice(0, 5)}`,
          kind: device.kind,
        };

        if (device.kind === "audioinput") {
          audioIns.push(deviceInfo);
        } else if (device.kind === "videoinput") {
          videoIns.push(deviceInfo);
        } else if (device.kind === "audiooutput") {
          audioOuts.push(deviceInfo);
        }
      });

      setAudioInputs(audioIns);
      setVideoInputs(videoIns);
      setAudioOutputs(audioOuts);

      // Set default devices
      if (!settings.selectedAudioInput && audioIns.length > 0) {
        setSettings((prev) => ({
          ...prev,
          selectedAudioInput: audioIns[0].deviceId,
        }));
      }
      if (!settings.selectedVideoInput && videoIns.length > 0) {
        setSettings((prev) => ({
          ...prev,
          selectedVideoInput: videoIns[0].deviceId,
        }));
      }
      if (!settings.selectedAudioOutput && audioOuts.length > 0) {
        setSettings((prev) => ({
          ...prev,
          selectedAudioOutput: audioOuts[0].deviceId,
        }));
      }
    } catch (error) {
      console.error("[Devices] Enumeration error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [settings]);

  // Initialize on mount
  useEffect(() => {
    enumerateDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [enumerateDevices]);

  // Select audio input
  const selectAudioInput = useCallback((deviceId: string) => {
    setSettings((prev) => ({ ...prev, selectedAudioInput: deviceId }));
  }, []);

  // Select video input
  const selectVideoInput = useCallback((deviceId: string) => {
    setSettings((prev) => ({ ...prev, selectedVideoInput: deviceId }));
  }, []);

  // Select audio output
  const selectAudioOutput = useCallback((deviceId: string) => {
    setSettings((prev) => ({ ...prev, selectedAudioOutput: deviceId }));
  }, []);

  // Get stream with selected devices
  const getStreamWithSettings = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: settings.selectedAudioInput
          ? { deviceId: { exact: settings.selectedAudioInput } }
          : true,
        video: settings.selectedVideoInput
          ? { deviceId: { exact: settings.selectedVideoInput } }
          : true,
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("[Devices] Get stream error:", error);
      throw error;
    }
  }, [settings]);

  return {
    audioInputs,
    videoInputs,
    audioOutputs,
    settings,
    isLoading,
    selectAudioInput,
    selectVideoInput,
    selectAudioOutput,
    getStreamWithSettings,
    refreshDevices: enumerateDevices,
  };
}
