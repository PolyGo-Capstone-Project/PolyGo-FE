"use client";

import { MeetingControls } from "@/types";
import { useCallback, useState } from "react";

export function useMeetingControls() {
  const [controls, setControls] = useState<MeetingControls>({
    audioEnabled: true,
    videoEnabled: true,
    isHandRaised: false,
    isChatOpen: false,
    isParticipantsOpen: false,
    isSettingsOpen: false,
  });

  const toggleAudio = useCallback(() => {
    setControls((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  const toggleVideo = useCallback(() => {
    setControls((prev) => ({ ...prev, videoEnabled: !prev.videoEnabled }));
  }, []);

  const toggleHandRaise = useCallback(() => {
    setControls((prev) => ({ ...prev, isHandRaised: !prev.isHandRaised }));
  }, []);

  const toggleChat = useCallback(() => {
    setControls((prev) => ({ ...prev, isChatOpen: !prev.isChatOpen }));
  }, []);

  const toggleParticipants = useCallback(() => {
    setControls((prev) => ({
      ...prev,
      isParticipantsOpen: !prev.isParticipantsOpen,
    }));
  }, []);

  const toggleSettings = useCallback(() => {
    setControls((prev) => ({ ...prev, isSettingsOpen: !prev.isSettingsOpen }));
  }, []);

  const setAudioEnabled = useCallback((enabled: boolean) => {
    setControls((prev) => ({ ...prev, audioEnabled: enabled }));
  }, []);

  const setVideoEnabled = useCallback((enabled: boolean) => {
    setControls((prev) => ({ ...prev, videoEnabled: enabled }));
  }, []);

  return {
    controls,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    toggleChat,
    toggleParticipants,
    toggleSettings,
    setAudioEnabled,
    setVideoEnabled,
  };
}
