"use client";

import envConfig from "@/config";
import { Participant, ParticipantStatus } from "@/types";
import * as signalR from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";

const HUB_URL = envConfig.NEXT_PUBLIC_API_ENDPOINT + "/eventRoomHub";

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: [
      "turn:160.25.81.144:3478",
      "turn:160.25.81.144:3478?transport=tcp",
      "turn:160.25.81.144:5349?transport=tcp",
    ],
    username: "polygo",
    credential: "polygo2024",
  },
];

interface UseWebRTCProps {
  eventId: string;
  userName: string;
  isHost: boolean;
  userId?: string;
  onRoomEnded?: () => void;
}

interface TranscriptionMessage {
  id: string;
  speakerId: string;
  senderName: string;
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  timestamp: Date;
}

interface VocabularyItem {
  word: string;
  meaning: string;
  context: string;
  examples: string[];
}

interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  vocabulary: VocabularyItem[];
  actionItems: string[];
}

interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  _pendingRemoteCandidates?: RTCIceCandidateInit[];
  _applyPendingCandidates?: () => Promise<void>;
}

export function useWebRTC({
  eventId,
  userName,
  isHost,
  userId,
  onRoomEnded,
}: UseWebRTCProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [myConnectionId, setMyConnectionId] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      senderId: string;
      senderName: string;
      message: string;
      timestamp: Date;
    }>
  >([]);
  const [transcriptions, setTranscriptions] = useState<TranscriptionMessage[]>(
    []
  );
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false); // Microphone transcription (sending)
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false); // Live captions (receiving)
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary | null>(
    null
  );
  const [isSummaryGenerating, setIsSummaryGenerating] = useState(false);

  const peerConnectionsRef = useRef<Map<string, ExtendedRTCPeerConnection>>(
    new Map()
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const outgoingCandidatesRef = useRef<
    Array<{ remoteId: string; candidateJson: string }>
  >([]);
  const myConnectionIdRef = useRef<string>("");
  const callStartedRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const targetLanguageRef = useRef<string>("vi");
  const isTranscriptionEnabledRef = useRef<boolean>(false);

  const connectionInitializedRef = useRef<boolean>(false);
  const isJoiningRef = useRef<boolean>(false);
  const hasJoinedRef = useRef<boolean>(false);
  const initiatedPeersRef = useRef<Set<string>>(new Set());

  // Refs cho callbacks to avoid closures
  const eventIdRef = useRef(eventId);
  const onRoomEndedRef = useRef(onRoomEnded);
  const userNameRef = useRef(userName);
  const isHostRef = useRef(isHost);
  const userIdRef = useRef(userId);

  useEffect(() => {
    eventIdRef.current = eventId;
  }, [eventId]);

  useEffect(() => {
    onRoomEndedRef.current = onRoomEnded;
  }, [onRoomEnded]);

  useEffect(() => {
    isTranscriptionEnabledRef.current = isTranscriptionEnabled;
  }, [isTranscriptionEnabled]);

  useEffect(() => {
    userNameRef.current = userName;
  }, [userName]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    targetLanguageRef.current = targetLanguage;
  }, [targetLanguage]);

  // ✅ FIX: Cleanup function để stop tất cả tracks
  const stopAllTracks = useCallback(() => {
    console.log("[Media] 🛑 Stopping all media tracks...");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log(`[Media] Stopping track: ${track.kind} (${track.id})`);
        track.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  // Get local media stream
  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      // ✅ FIX: Apply saved states from waiting room NGAY khi có stream
      const savedAudioState = localStorage.getItem("meeting_audio_enabled");
      const savedVideoState = localStorage.getItem("meeting_video_enabled");

      if (savedAudioState !== null) {
        const audioEnabled = savedAudioState === "true";
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = audioEnabled;
          setLocalAudioEnabled(audioEnabled);
          console.log("[Media] ✓ Applied saved audio state:", audioEnabled);
        }
      }

      if (savedVideoState !== null) {
        const videoEnabled = savedVideoState === "true";
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = videoEnabled;
          setLocalVideoEnabled(videoEnabled);
          console.log("[Media] ✓ Applied saved video state:", videoEnabled);
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      console.log(
        "[Media] ✓ Got local stream with tracks:",
        stream.getTracks().map((t) => t.kind)
      );
      return stream;
    } catch (error) {
      console.error("[Media] ✗ getUserMedia error:", error);
      throw error;
    }
  }, []);

  // Create peer connection helper
  const setupPeerConnectionHandlers = useCallback(
    (pc: ExtendedRTCPeerConnection, remoteId: string) => {
      pc._pendingRemoteCandidates = [];

      pc._applyPendingCandidates = async () => {
        while (
          pc._pendingRemoteCandidates &&
          pc._pendingRemoteCandidates.length > 0
        ) {
          const candidate = pc._pendingRemoteCandidates.shift();
          if (candidate) {
            try {
              await pc.addIceCandidate(candidate);
              console.log("[PC] ✓ Applied queued ICE candidate for", remoteId);
            } catch (error) {
              console.warn(
                "[PC] ✗ Failed to apply queued ICE candidate",
                error
              );
            }
          }
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("[PC] ICE gathering complete for", remoteId);
          return;
        }

        const candidateJson = JSON.stringify(event.candidate);
        const trySend = async () => {
          try {
            if (
              connectionRef.current?.state ===
              signalR.HubConnectionState.Connected
            ) {
              await connectionRef.current.invoke(
                "SendIceCandidate",
                eventIdRef.current,
                remoteId,
                candidateJson
              );
              console.log("[SignalR] ✓ Sent ICE candidate to", remoteId);
              return;
            }
          } catch (error) {
            console.warn("[SignalR] ✗ SendIceCandidate failed, queuing", error);
          }
          outgoingCandidatesRef.current.push({ remoteId, candidateJson });
        };
        trySend();
      };

      pc.ontrack = (event) => {
        console.log(
          "[PC] ✓ ontrack for",
          remoteId,
          "tracks:",
          event.streams[0].getTracks().map((t) => `${t.kind}:${t.enabled}`)
        );
        setParticipants((prev) => {
          const newMap = new Map(prev);
          const participant = newMap.get(remoteId);
          if (participant) {
            newMap.set(remoteId, {
              ...participant,
              stream: event.streams[0],
              status: "connected" as ParticipantStatus,
            });
          }
          return newMap;
        });
      };

      pc.oniceconnectionstatechange = () => {
        console.log("[PC] ICE state:", pc.iceConnectionState, "for", remoteId);

        if (
          pc.iceConnectionState === "connected" ||
          pc.iceConnectionState === "completed"
        ) {
          setParticipants((prev) => {
            const newMap = new Map(prev);
            const participant = newMap.get(remoteId);
            if (participant) {
              newMap.set(remoteId, {
                ...participant,
                status: "connected" as ParticipantStatus,
              });
            }
            return newMap;
          });
        } else if (pc.iceConnectionState === "disconnected") {
          console.log(
            "[PC] ⚠️ ICE disconnected for",
            remoteId,
            "- waiting for reconnection..."
          );
          setTimeout(() => {
            if (pc.iceConnectionState === "disconnected") {
              console.log(
                "[PC] 🔄 Still disconnected, attempting ICE restart for",
                remoteId
              );
              pc.restartIce?.();
            }
          }, 3000);
        } else if (pc.iceConnectionState === "failed") {
          console.log(
            "[PC] ⚠️ ICE failed for",
            remoteId,
            "- attempting immediate restart"
          );
          pc.restartIce?.();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(
          "[PC] Connection state:",
          pc.connectionState,
          "for",
          remoteId
        );
      };
    },
    []
  );

  // Create peer connection
  const createPeerConnection = useCallback(
    async (remoteId: string): Promise<ExtendedRTCPeerConnection> => {
      const existing = peerConnectionsRef.current.get(remoteId);
      if (existing) {
        console.log("[PC] Reusing existing peer connection for", remoteId);
        return existing;
      }

      console.log("[PC] Creating new peer connection for", remoteId);
      const pc = new RTCPeerConnection({
        iceServers: DEFAULT_ICE_SERVERS,
      }) as ExtendedRTCPeerConnection;

      setupPeerConnectionHandlers(pc, remoteId);

      const stream = await getLocalStream();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log(
          "[PC] ✓ Added",
          track.kind,
          "track to peer connection for",
          remoteId
        );
      });

      peerConnectionsRef.current.set(remoteId, pc);
      return pc;
    },
    [getLocalStream, setupPeerConnectionHandlers]
  );

  // ✅ FIX: Improved function to update peer connection tracks with proper renegotiation
  const updatePeerConnectionTracks = useCallback(
    async (newStream: MediaStream) => {
      console.log("[WebRTC] 🔄 Updating tracks for all peer connections");

      for (const [remoteId, pc] of peerConnectionsRef.current.entries()) {
        try {
          const senders = pc.getSenders();

          // Replace tracks
          for (const sender of senders) {
            const track = sender.track;
            if (!track) continue;

            const newTrack = newStream
              .getTracks()
              .find((t) => t.kind === track.kind);

            if (newTrack) {
              await sender.replaceTrack(newTrack);
              console.log(
                `[PC] ✓ Replaced ${track.kind} track for ${remoteId}`
              );
            }
          }

          // ✅ FIX: Always renegotiate after replacing tracks
          if (
            pc.signalingState === "stable" &&
            connectionRef.current?.state ===
              signalR.HubConnectionState.Connected
          ) {
            console.log(`[PC] 🔄 Starting renegotiation for ${remoteId}...`);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await connectionRef.current.invoke(
              "SendOffer",
              eventIdRef.current,
              remoteId,
              offer.sdp
            );

            console.log(`[PC] ✓ Renegotiation completed for ${remoteId}`);
          }
        } catch (error) {
          console.error(
            `[PC] ✗ Failed to update tracks for ${remoteId}:`,
            error
          );
        }
      }
    },
    []
  );

  // Broadcast media state change
  const broadcastMediaState = useCallback(
    async (type: "audio" | "video", enabled: boolean) => {
      try {
        if (
          connectionRef.current?.state === signalR.HubConnectionState.Connected
        ) {
          await connectionRef.current.invoke(
            "BroadcastMediaState",
            eventIdRef.current,
            myConnectionIdRef.current,
            type,
            enabled
          );
          console.log(`[WebRTC] ✓ Broadcast ${type} state: ${enabled}`);
        }
      } catch (error) {
        console.warn(`[WebRTC] ✗ Failed to broadcast ${type} state:`, error);
      }
    },
    []
  );

  // ✅ CRITICAL FIX: Initialize SignalR connection ONCE - NO dependencies!
  useEffect(() => {
    if (connectionInitializedRef.current || connectionRef.current) {
      console.log("[SignalR] Connection already initialized, skipping");
      return;
    }

    connectionInitializedRef.current = true;
    console.log(
      "[SignalR] Initializing connection for eventId:",
      eventIdRef.current
    );

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = hubConnection;

    // Setup all event handlers
    hubConnection.on(
      "SetRole",
      (role: string, connId: string, receivedHostId: string) => {
        console.log(
          "[SignalR] SetRole:",
          role,
          "connId:",
          connId,
          "hostId:",
          receivedHostId
        );
        setMyConnectionId(connId);
        myConnectionIdRef.current = connId;
        // ✅ FIX: Save hostId to state
        setHostId(receivedHostId);
        console.log("[SignalR] ✅ Host ID saved:", receivedHostId);
      }
    );

    // ✅ FIX: Handle HostInfo event to add host to participants
    hubConnection.on("HostInfo", (hostName: string, hostConnId: string) => {
      console.log("[SignalR] ✓ HostInfo:", hostName, "connId:", hostConnId);

      setParticipants((prev) => {
        const newMap = new Map(prev);
        // Check if host already exists
        if (!newMap.has(hostConnId)) {
          newMap.set(hostConnId, {
            id: hostConnId,
            name: hostName,
            role: "host",
            status: "connecting" as ParticipantStatus,
            audioEnabled: true,
            videoEnabled: true,
            isHandRaised: false,
          });
          console.log("[SignalR] ✓ Added host to participants:", hostName);
        }
        return newMap;
      });
    });

    hubConnection.on(
      "UserJoined",
      (participantName: string, role: string, connId: string) => {
        console.log(
          "[SignalR] ✓ UserJoined:",
          participantName,
          "connId:",
          connId,
          "role:",
          role
        );

        setParticipants((prev) => {
          const newMap = new Map(prev);
          newMap.set(connId, {
            id: connId,
            name: participantName,
            role: role === "host" || role === "0" ? "host" : "attendee",
            status: "connecting" as ParticipantStatus,
            audioEnabled: true,
            videoEnabled: true,
            isHandRaised: false,
          });
          return newMap;
        });

        if (callStartedRef.current && !initiatedPeersRef.current.has(connId)) {
          console.log(
            "[WebRTC] 🔔 Late joiner detected, initiating call to:",
            connId
          );

          setTimeout(async () => {
            try {
              if (!localStreamRef.current) {
                console.log(
                  "[WebRTC] ⚠️ No local stream for late joiner, getting stream..."
                );
                await getLocalStream();
              }

              if (!localStreamRef.current) {
                console.log("[WebRTC] ⚠️ Still no local stream, skipping");
                return;
              }

              console.log(
                "[WebRTC] 🔄 Creating offer for late joiner:",
                connId
              );
              const pc = await createPeerConnection(connId);

              if (pc.signalingState === "stable" && !pc.remoteDescription) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                if (
                  connectionRef.current?.state ===
                  signalR.HubConnectionState.Connected
                ) {
                  await connectionRef.current.invoke(
                    "SendOffer",
                    eventIdRef.current,
                    connId,
                    offer.sdp
                  );
                  initiatedPeersRef.current.add(connId);
                  console.log("[WebRTC] ✓ Offer sent to late joiner:", connId);
                }
              }
            } catch (error) {
              console.error(
                "[WebRTC] ✗ Failed to call late joiner:",
                connId,
                error
              );
            }
          }, 1000);
        }
      }
    );

    hubConnection.on("UserLeft", (connId: string) => {
      console.log("[SignalR] ✗ UserLeft:", connId);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(connId);
        return newMap;
      });

      const pc = peerConnectionsRef.current.get(connId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(connId);
        initiatedPeersRef.current.delete(connId);
        console.log("[PC] Cleaned up peer connection for", connId);
      }
    });

    hubConnection.on(
      "ReceiveMediaState",
      (fromConnId: string, type: "audio" | "video", enabled: boolean) => {
        console.log(
          `[SignalR] ReceiveMediaState from ${fromConnId}: ${type} = ${enabled}`
        );

        setParticipants((prev) => {
          const newMap = new Map(prev);
          const participant = newMap.get(fromConnId);
          if (participant) {
            newMap.set(fromConnId, {
              ...participant,
              audioEnabled:
                type === "audio" ? enabled : participant.audioEnabled,
              videoEnabled:
                type === "video" ? enabled : participant.videoEnabled,
            });
          }
          return newMap;
        });
      }
    );

    // ✅ Chat message handler
    hubConnection.on(
      "ReceiveChatMessage",
      (userName: string, message: string) => {
        console.log(`[SignalR] ReceiveChatMessage from ${userName}:`, message);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            senderId: "", // We don't get sender ID from backend
            senderName: userName,
            message,
            timestamp: new Date(),
          },
        ]);
        // Play chat message notification sound
        import("@/lib/notification-sound").then(({ playChatMessageSound }) => {
          playChatMessageSound();
        });
      }
    );

    // ✅ Raise hand handlers
    hubConnection.on("ReceiveWave", (connId: string, userName: string) => {
      console.log(`[SignalR] ReceiveWave from ${userName} (${connId})`);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        const participant = newMap.get(connId);
        if (participant) {
          newMap.set(connId, {
            ...participant,
            isHandRaised: true,
          });
        }
        return newMap;
      });
      // Play hand raise sound when someone else raises their hand
      import("@/lib/notification-sound").then(({ playHandRaiseSound }) => {
        playHandRaiseSound();
      });
    });

    hubConnection.on("ReceiveUnwave", (connId: string) => {
      console.log(`[SignalR] ReceiveUnwave from ${connId}`);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        const participant = newMap.get(connId);
        if (participant) {
          newMap.set(connId, {
            ...participant,
            isHandRaised: false,
          });
        }
        return newMap;
      });
    });

    hubConnection.on("AllHandsLowered", () => {
      console.log("[SignalR] AllHandsLowered - lowering all hands");
      setIsHandRaised(false); // Lower my own hand
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.forEach((participant, id) => {
          if (participant.isHandRaised) {
            newMap.set(id, {
              ...participant,
              isHandRaised: false,
            });
          }
        });
        return newMap;
      });
    });

    // ============ AI MODULES HANDLERS ============

    hubConnection.on(
      "ReceiveTranscription",
      async (
        transcriptionId: string,
        speakerId: string,
        speakerName: string,
        originalText: string,
        sourceLanguage: string,
        timestamp: Date
      ) => {
        console.log(
          `[SignalR] ReceiveTranscription from ${speakerName}:`,
          originalText
        );

        // Get current target language from ref to avoid stale closure
        const currentTargetLang = targetLanguageRef.current;

        let localTranslatedText = originalText;

        // Request translation from server if needed
        if (currentTargetLang && currentTargetLang !== sourceLanguage) {
          try {
            if (hubConnection.state === signalR.HubConnectionState.Connected) {
              // Server-side translation with cache
              localTranslatedText = await hubConnection.invoke(
                "RequestTranslation",
                transcriptionId,
                currentTargetLang
              );

              console.log(
                `[Transcription] Server translated to ${currentTargetLang}:`,
                localTranslatedText
              );
            }
          } catch (err) {
            console.warn("[Transcription] Server translation failed:", err);
            localTranslatedText = originalText; // Fallback to original
          }
        }

        setTranscriptions((prev) => [
          ...prev,
          {
            id: transcriptionId,
            speakerId,
            senderName: speakerName,
            originalText,
            translatedText: localTranslatedText,
            targetLanguage: currentTargetLang,
            timestamp: new Date(timestamp),
          },
        ]);
      }
    );

    hubConnection.on("ReceiveMeetingSummary", (summary: MeetingSummary) => {
      console.log("[SignalR] ReceiveMeetingSummary:", summary);
      setMeetingSummary(summary);
      setIsSummaryGenerating(false);
    });

    hubConnection.on("SummaryGenerating", () => {
      console.log("[SignalR] Summary is generating...");
      setIsSummaryGenerating(true);
    });

    hubConnection.on("SummaryError", (error: string) => {
      console.error("[SignalR] SummaryError:", error);
      setIsSummaryGenerating(false);
      import("sonner").then(({ toast }) => {
        toast.error(`Summary Error: ${error}`);
      });
    });

    // ✅ Host control handlers
    hubConnection.on("ToggleMicCommand", (enabled: boolean) => {
      console.log(`[SignalR] ToggleMicCommand: ${enabled}`);
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = enabled;
          setLocalAudioEnabled(enabled);

          // ✅ FIX: Auto-stop transcription when host mutes participant
          if (!enabled && isTranscriptionEnabledRef.current) {
            console.log(
              "[Transcription] 🔇 Auto-stopping transcription (host muted mic)"
            );
            if (recognitionRef.current) {
              recognitionRef.current.stop();
              recognitionRef.current = null;
              setIsTranscriptionEnabled(false);
            }
          }

          // ✅ FIX: Auto-start transcription when host unmutes participant
          if (enabled && !isTranscriptionEnabledRef.current) {
            console.log(
              "[Transcription] 🔊 Auto-starting transcription (host unmuted mic)"
            );
            setTimeout(() => {
              const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;

              if (!SpeechRecognition) {
                console.warn(
                  "[Transcription] Speech Recognition not supported"
                );
                return;
              }

              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = "en-US";

              recognition.onresult = async (event: any) => {
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript;

                if (result.isFinal) {
                  const currentAudioTrack =
                    localStreamRef.current?.getAudioTracks()[0];
                  if (!currentAudioTrack || !currentAudioTrack.enabled) {
                    return;
                  }

                  const sourceLanguage =
                    recognition.lang?.split("-")[0] || "en";

                  try {
                    if (
                      hubConnection.state ===
                      signalR.HubConnectionState.Connected
                    ) {
                      await hubConnection.invoke(
                        "BroadcastTranscription",
                        eventIdRef.current,
                        myConnectionIdRef.current,
                        transcript,
                        sourceLanguage
                      );
                    }
                  } catch (error) {
                    console.error("[Transcription] ✗ Failed to send:", error);
                  }
                }
              };

              recognition.onerror = (event: any) => {
                console.error("[Transcription] Error:", event.error);
              };

              recognition.onend = () => {
                if (isTranscriptionEnabledRef.current) {
                  const currentAudioTrack =
                    localStreamRef.current?.getAudioTracks()[0];
                  if (!currentAudioTrack || !currentAudioTrack.enabled) {
                    setIsTranscriptionEnabled(false);
                    recognitionRef.current = null;
                    return;
                  }
                  try {
                    recognition.start();
                  } catch (err) {
                    console.error("[Transcription] Failed to restart:", err);
                  }
                }
              };

              recognitionRef.current = recognition;
              recognition.start();
              setIsTranscriptionEnabled(true);
            }, 100);
          }
        }
      }
    });

    hubConnection.on("ToggleCamCommand", (enabled: boolean) => {
      console.log(`[SignalR] ToggleCamCommand: ${enabled}`);
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = enabled;
          setLocalVideoEnabled(enabled);
        }
      }
    });

    hubConnection.on("MicStateChanged", (connId: string, enabled: boolean) => {
      console.log(`[SignalR] MicStateChanged: ${connId} = ${enabled}`);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        const participant = newMap.get(connId);
        if (participant) {
          newMap.set(connId, {
            ...participant,
            audioEnabled: enabled,
          });
        }
        return newMap;
      });
    });

    hubConnection.on("CamStateChanged", (connId: string, enabled: boolean) => {
      console.log(`[SignalR] CamStateChanged: ${connId} = ${enabled}`);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        const participant = newMap.get(connId);
        if (participant) {
          newMap.set(connId, {
            ...participant,
            videoEnabled: enabled,
          });
        }
        return newMap;
      });
    });

    hubConnection.on("KickedFromRoom", (roomName: string) => {
      console.log("[SignalR] KickedFromRoom:", roomName);
      alert("You have been kicked from the room by the host.");
      // Trigger cleanup
      if (onRoomEndedRef.current) {
        onRoomEndedRef.current();
      }
    });

    hubConnection.on(
      "ReceiveOffer",
      async (fromConnId: string, sdp: string) => {
        try {
          console.log(
            "[SignalR] ReceiveOffer from",
            fromConnId,
            "sdp length:",
            sdp?.length
          );

          let pc = peerConnectionsRef.current.get(fromConnId);

          // Perfect Negotiation: Handle collision
          const isPolite = myConnectionIdRef.current < fromConnId;
          const offerCollision = pc && pc.signalingState !== "stable";

          if (offerCollision && pc) {
            console.log(
              `[PC] 🔄 Offer collision detected with ${fromConnId}, isPolite: ${isPolite}`
            );

            if (!isPolite) {
              // Impolite peer ignores the incoming offer
              console.log("[PC] 😤 I'm impolite, ignoring incoming offer");
              return;
            }

            // Polite peer rollbacks
            console.log("[PC] 👍 I'm polite, performing rollback");
            await pc.setLocalDescription({ type: "rollback" });
          }

          if (!pc) {
            pc = new RTCPeerConnection({
              iceServers: DEFAULT_ICE_SERVERS,
            }) as ExtendedRTCPeerConnection;

            setupPeerConnectionHandlers(pc, fromConnId);

            if (!localStreamRef.current) {
              console.log("[PC] ⚠️ No local stream yet, getting...");
              await getLocalStream();
            }

            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                pc!.addTrack(track, localStreamRef.current!);
                console.log(
                  "[PC] ✓ Added",
                  track.kind,
                  "track when receiving offer from",
                  fromConnId
                );
              });
            }

            peerConnectionsRef.current.set(fromConnId, pc);
          }

          await pc.setRemoteDescription({ type: "offer", sdp });
          console.log("[PC] ✓ Set remote description (offer) for", fromConnId);

          if (pc._applyPendingCandidates) {
            await pc._applyPendingCandidates();
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await hubConnection.invoke(
            "SendAnswer",
            eventIdRef.current,
            fromConnId,
            answer.sdp
          );
          console.log("[SignalR] ✓ Sent Answer to", fromConnId);

          // Mark as initiated to prevent re-offering
          initiatedPeersRef.current.add(fromConnId);
        } catch (error) {
          console.error("[SignalR] ✗ ReceiveOffer error:", error);
        }
      }
    );

    hubConnection.on(
      "ReceiveAnswer",
      async (fromConnId: string, sdp: string) => {
        console.log(
          "[SignalR] ReceiveAnswer from",
          fromConnId,
          "sdp length:",
          sdp?.length
        );
        const pc = peerConnectionsRef.current.get(fromConnId);
        if (pc) {
          try {
            await pc.setRemoteDescription({ type: "answer", sdp });
            console.log(
              "[PC] ✓ Set remote description (answer) for",
              fromConnId
            );
            if (pc._applyPendingCandidates) {
              await pc._applyPendingCandidates();
            }
          } catch (error) {
            console.error(
              "[PC] ✗ Failed to set remote description (answer)",
              error
            );
          }
        } else {
          console.warn(
            "[PC] ⚠️ No peer connection found for",
            fromConnId,
            "when receiving answer"
          );
        }
      }
    );

    hubConnection.on(
      "ReceiveIceCandidate",
      async (fromConnId: string, candidateJson: string) => {
        console.log("[SignalR] ReceiveIceCandidate from", fromConnId);
        try {
          const candidate = JSON.parse(candidateJson);
          let pc = peerConnectionsRef.current.get(fromConnId);

          if (!pc) {
            console.log(
              "[PC] Creating new PC for ICE candidate from",
              fromConnId
            );
            pc = new RTCPeerConnection({
              iceServers: DEFAULT_ICE_SERVERS,
            }) as ExtendedRTCPeerConnection;
            pc._pendingRemoteCandidates = [];
            peerConnectionsRef.current.set(fromConnId, pc);
          }

          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(candidate);
            console.log("[PC] ✓ Added remote ICE candidate for", fromConnId);
          } else {
            pc._pendingRemoteCandidates = pc._pendingRemoteCandidates || [];
            pc._pendingRemoteCandidates.push(candidate);
            console.log("[PC] Queued remote ICE candidate for", fromConnId);
          }
        } catch (error) {
          console.error("[SignalR] ✗ ReceiveIceCandidate error:", error);
        }
      }
    );

    hubConnection.on("ShowEndWarning", (message: string) => {
      console.log("[SignalR] ⚠️ ShowEndWarning:", message);
      // Show toast warning to user
      import("sonner").then(({ toast }) => {
        toast.warning(message || "The event will end soon!", {
          duration: 15000,
        });
      });
    });

    hubConnection.on("RoomEnded", () => {
      console.log("[SignalR] 🔴 RoomEnded - cleaning up");

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      initiatedPeersRef.current.clear();

      // ✅ FIX: Stop all tracks properly
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log(`[Media] 🛑 Stopping track: ${track.kind}`);
          track.stop();
        });
        localStreamRef.current = null;
        setLocalStream(null);
      }

      setParticipants(new Map());
      setIsConnected(false);
      callStartedRef.current = false;
      isJoiningRef.current = false;
      hasJoinedRef.current = false;

      if (onRoomEndedRef.current) onRoomEndedRef.current();
    });

    hubConnection.onreconnected(async (connectionId) => {
      console.log("[SignalR] ✅ Reconnected with new ID:", connectionId);

      // Re-join room with new connection ID
      try {
        await hubConnection.invoke(
          "JoinRoom",
          eventIdRef.current,
          userNameRef.current,
          isHostRef.current
        );
        console.log("[SignalR] ✓ Re-joined room after reconnection");

        // Confirm join again if userId exists
        if (userIdRef.current) {
          try {
            await hubConnection.invoke(
              "JoinRoomConfirm",
              eventIdRef.current,
              userIdRef.current
            );
            console.log("[SignalR] ✓ Re-confirmed join after reconnection");
          } catch (error) {
            console.warn(
              "[SignalR] ⚠️ JoinRoomConfirm failed after reconnection:",
              error
            );
          }
        }

        setIsConnected(true);
      } catch (error) {
        console.error(
          "[SignalR] ✗ Failed to rejoin after reconnection:",
          error
        );
      }
    });

    console.log("[SignalR] ✓ Connection handlers setup complete");

    return () => {
      console.log("[SignalR] Component unmounting - cleaning up connection");

      const cleanup = async () => {
        try {
          if (hubConnection.state === signalR.HubConnectionState.Connected) {
            await hubConnection.stop();
            console.log("[SignalR] ✓ Connection stopped");
          }
        } catch (error) {
          console.warn("[SignalR] ⚠️ Error stopping connection:", error);
        }

        peerConnectionsRef.current.forEach((pc) => pc.close());
        peerConnectionsRef.current.clear();
        initiatedPeersRef.current.clear();

        // ✅ FIX: Always stop tracks on unmount
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }

        connectionRef.current = null;
        connectionInitializedRef.current = false;
      };

      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ EMPTY dependencies array - initialize ONCE!

  // Join room
  const joinRoom = useCallback(async () => {
    if (isJoiningRef.current || hasJoinedRef.current) {
      console.log("[SignalR] ⚠️ Already joining or joined, skipping");
      return;
    }

    const conn = connectionRef.current;

    if (!conn) {
      console.error("[SignalR] ✗ Cannot join room: no connection");
      throw new Error("No connection available");
    }

    try {
      isJoiningRef.current = true;
      console.log("[SignalR] Current connection state:", conn.state);

      if (conn.state === signalR.HubConnectionState.Disconnected) {
        console.log("[SignalR] Starting connection...");
        await conn.start();
        setIsConnected(true);
        console.log("[SignalR] ✓ Connected to hub");
      } else if (conn.state === signalR.HubConnectionState.Connected) {
        console.log("[SignalR] Already connected");
        setIsConnected(true);
      } else {
        console.warn(
          "[SignalR] ⚠️ Connection in unexpected state:",
          conn.state
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isJoiningRef.current = false;
        return joinRoom();
      }

      // Pass isHost (new BE parameter) so server knows whether this client is host
      await conn.invoke("JoinRoom", eventIdRef.current, userName, isHost);
      console.log(
        "[SignalR] ✓ Joined room:",
        eventIdRef.current,
        "as",
        userName
      );
      hasJoinedRef.current = true;

      // Confirm join to update user status to "Attended"
      if (userId) {
        try {
          await conn.invoke("JoinRoomConfirm", eventIdRef.current, userId);
          console.log("[SignalR] ✓ Join confirmed for user:", userId);
        } catch (error) {
          console.warn("[SignalR] ⚠️ JoinRoomConfirm failed:", error);
        }
      }

      try {
        const participantList = await conn.invoke<Record<string, string>>(
          "GetParticipants",
          eventIdRef.current
        );
        if (participantList) {
          const newParticipants = new Map<string, Participant>();
          Object.entries(participantList).forEach(([connId, name]) => {
            if (connId !== myConnectionIdRef.current) {
              newParticipants.set(connId, {
                id: connId,
                name,
                role: "attendee",
                status: "connecting" as ParticipantStatus,
                audioEnabled: true,
                videoEnabled: true,
                isHandRaised: false,
              });
            }
          });
          setParticipants(newParticipants);
          console.log("[SignalR] ✓ Got", newParticipants.size, "participants");
        }
      } catch (getParticipantsError) {
        console.warn(
          "[SignalR] ⚠️ GetParticipants failed:",
          getParticipantsError
        );
      }

      if (outgoingCandidatesRef.current.length > 0) {
        console.log(
          "[SignalR] Draining",
          outgoingCandidatesRef.current.length,
          "queued ICE candidates"
        );
        const queue = [...outgoingCandidatesRef.current];
        outgoingCandidatesRef.current = [];

        for (const item of queue) {
          try {
            await conn.invoke(
              "SendIceCandidate",
              eventIdRef.current,
              item.remoteId,
              item.candidateJson
            );
            console.log(
              "[SignalR] ✓ Sent queued ICE candidate to",
              item.remoteId
            );
          } catch (error) {
            console.warn("[SignalR] ✗ Failed to send queued candidate", error);
          }
        }
      }
    } catch (error) {
      console.error("[SignalR] ✗ Join room error:", error);
      hasJoinedRef.current = false;
      throw error;
    } finally {
      isJoiningRef.current = false;
    }
  }, [userName, isHost]);

  // Start call
  const startCall = useCallback(async () => {
    if (callStartedRef.current) {
      console.log("[WebRTC] ⚠️ Call already started, skipping");
      return;
    }

    try {
      console.log("[WebRTC] Starting call...");
      await getLocalStream();

      const remoteParticipants = Array.from(participants.keys()).filter(
        (id) => id !== myConnectionId
      );

      if (remoteParticipants.length === 0) {
        console.log("[WebRTC] ⚠️ No remote participants to call");
        callStartedRef.current = true;
        return;
      }

      console.log(
        "[WebRTC] Starting call with",
        remoteParticipants.length,
        "participants:",
        remoteParticipants
      );
      callStartedRef.current = true;

      for (const remoteId of remoteParticipants) {
        if (initiatedPeersRef.current.has(remoteId)) {
          console.log("[WebRTC] ⚠️ Already initiated call to", remoteId);
          continue;
        }

        console.log("[WebRTC] 🔄 Creating offer for", remoteId);

        try {
          const pc = await createPeerConnection(remoteId);

          if (pc.remoteDescription) {
            console.log(
              "[WebRTC] ⚠️ Skipping offer to",
              remoteId,
              "(already has remote description)"
            );
            continue;
          }

          if (pc.signalingState !== "stable") {
            console.log(
              "[WebRTC] ⚠️ Skipping offer to",
              remoteId,
              "(signaling state:",
              pc.signalingState,
              ")"
            );
            continue;
          }

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (
            connectionRef.current?.state ===
            signalR.HubConnectionState.Connected
          ) {
            await connectionRef.current.invoke(
              "SendOffer",
              eventIdRef.current,
              remoteId,
              offer.sdp
            );
            initiatedPeersRef.current.add(remoteId);
            console.log("[WebRTC] ✓ Offer sent to", remoteId);
          }
        } catch (error) {
          console.error("[WebRTC] ✗ Failed offer for", remoteId, error);
        }
      }
    } catch (error) {
      console.error("[WebRTC] ✗ startCall error:", error);
      callStartedRef.current = false;
    }
  }, [participants, myConnectionId, getLocalStream, createPeerConnection]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      if (conn.state === signalR.HubConnectionState.Connected) {
        await conn.invoke("LeaveRoom", eventIdRef.current);
        console.log("[SignalR] ✓ Left room");
      }
    } catch (error) {
      console.warn("[SignalR] ⚠️ Leave room error:", error);
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    initiatedPeersRef.current.clear();

    // ✅ FIX: Always stop tracks when leaving
    stopAllTracks();

    setParticipants(new Map());
    setIsConnected(false);
    callStartedRef.current = false;
    isJoiningRef.current = false;
    hasJoinedRef.current = false;

    console.log("[WebRTC] ✓ Cleanup complete");
  }, [stopAllTracks]);

  // ✅ FIX: End room with proper cleanup
  const endRoom = useCallback(async () => {
    const conn = connectionRef.current;

    console.log("[SignalR] 🛑 Ending room...", {
      hasConnection: !!conn,
      connectionState: conn?.state,
      eventId: eventIdRef.current,
    });

    try {
      // Try to send EndRoom signal if connected
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        try {
          await conn.invoke("EndRoom", eventIdRef.current);
          console.log("[SignalR] ✓ Ended room - broadcast sent");
        } catch (invokeError) {
          console.error(
            "[SignalR] ⚠️ Failed to invoke EndRoom (continuing cleanup):",
            invokeError
          );
          // Continue with cleanup even if invoke fails
        }
      } else {
        console.warn(
          "[SignalR] ⚠️ Connection not available or not connected, skipping EndRoom invoke"
        );
      }

      // ✅ FIX: Host also needs to cleanup immediately after ending room
      console.log("[SignalR] 🧹 Host cleanup after ending room...");

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      initiatedPeersRef.current.clear();

      // Stop all tracks
      stopAllTracks();

      setParticipants(new Map());
      setIsConnected(false);
      callStartedRef.current = false;
      isJoiningRef.current = false;
      hasJoinedRef.current = false;

      console.log("[SignalR] ✓ Host cleanup complete");
    } catch (error) {
      console.error("[SignalR] ✗ End room error:", error);
      // ✅ Don't throw - still allow cleanup to complete
      // Just log the error and continue
    }
  }, [stopAllTracks]);

  // ✅ Send chat message
  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!connectionRef.current || !message.trim()) return;
      try {
        await connectionRef.current.invoke(
          "SendChatMessage",
          eventIdRef.current,
          userName,
          message.trim()
        );
        console.log("[SignalR] ✓ Sent chat message");
      } catch (error) {
        console.error("[SignalR] ✗ Failed to send chat message:", error);
      }
    },
    [userName]
  );

  // ✅ Toggle hand raise
  const toggleHandRaise = useCallback(async () => {
    if (!connectionRef.current) return;
    try {
      if (!isHandRaised) {
        await connectionRef.current.invoke("SendWave", eventIdRef.current);
        setIsHandRaised(true);
        // Play hand raise sound
        const { playHandRaiseSound } = await import("@/lib/notification-sound");
        playHandRaiseSound();
        console.log("[SignalR] ✓ Hand raised");
      } else {
        await connectionRef.current.invoke("Unwave", eventIdRef.current);
        setIsHandRaised(false);
        console.log("[SignalR] ✓ Hand lowered");
      }
    } catch (error) {
      console.error("[SignalR] ✗ Failed to toggle hand raise:", error);
    }
  }, [isHandRaised]);

  // ✅ Host: Toggle participant mic
  const hostToggleMic = useCallback(
    async (targetConnId: string, enabled: boolean) => {
      if (!connectionRef.current) return;
      try {
        await connectionRef.current.invoke(
          "ToggleMic",
          eventIdRef.current,
          targetConnId,
          enabled
        );
        console.log(
          `[SignalR] ✓ Host toggled mic for ${targetConnId}: ${enabled}`
        );
      } catch (error) {
        console.error("[SignalR] ✗ Failed to toggle mic:", error);
      }
    },
    []
  );

  // ✅ Host: Toggle participant camera
  const hostToggleCam = useCallback(
    async (targetConnId: string, enabled: boolean) => {
      if (!connectionRef.current) return;
      try {
        await connectionRef.current.invoke(
          "ToggleCam",
          eventIdRef.current,
          targetConnId,
          enabled
        );
        console.log(
          `[SignalR] ✓ Host toggled cam for ${targetConnId}: ${enabled}`
        );
      } catch (error) {
        console.error("[SignalR] ✗ Failed to toggle cam:", error);
      }
    },
    []
  );

  // ✅ Host: Kick user
  const kickUser = useCallback(async (targetConnId: string) => {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.invoke(
        "KickUser",
        eventIdRef.current,
        targetConnId
      );
      console.log(`[SignalR] ✓ Host kicked user: ${targetConnId}`);
    } catch (error) {
      console.error("[SignalR] ✗ Failed to kick user:", error);
    }
  }, []);

  // ✅ Host: Mute all participants
  const muteAllParticipants = useCallback(async () => {
    if (!connectionRef.current) return;
    const participantIds = Array.from(participants.keys()).filter(
      (id) => id !== myConnectionIdRef.current
    );
    console.log(
      `[SignalR] Muting all ${participantIds.length} participants...`
    );
    for (const id of participantIds) {
      try {
        await connectionRef.current.invoke(
          "ToggleMic",
          eventIdRef.current,
          id,
          false
        );
      } catch (error) {
        console.warn(`[SignalR] ✗ Failed to mute ${id}:`, error);
      }
    }
    console.log("[SignalR] ✓ Muted all participants");
  }, [participants]);

  // ✅ Host: Turn off all cameras
  const turnOffAllCameras = useCallback(async () => {
    if (!connectionRef.current) return;
    const participantIds = Array.from(participants.keys()).filter(
      (id) => id !== myConnectionIdRef.current
    );
    console.log(
      `[SignalR] Turning off cameras for ${participantIds.length} participants...`
    );
    for (const id of participantIds) {
      try {
        await connectionRef.current.invoke(
          "ToggleCam",
          eventIdRef.current,
          id,
          false
        );
      } catch (error) {
        console.warn(`[SignalR] ✗ Failed to turn off camera for ${id}:`, error);
      }
    }
    console.log("[SignalR] ✓ Turned off all cameras");
  }, [participants]);

  // ✅ Lower all hands
  const lowerAllHands = useCallback(async () => {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.invoke("LowerAllHands", eventIdRef.current);
      console.log("[SignalR] ✓ Lowered all hands");
    } catch (error) {
      console.error("[SignalR] ✗ Failed to lower all hands:", error);
    }
  }, []);

  // ============ AI MODULES FUNCTIONS ============

  // Start microphone transcription (your voice will be transcribed and sent to others)
  const startTranscription = useCallback(
    async (language: string = "vi", silent: boolean = false) => {
      // ✅ FIX: Check if WebRTC microphone is enabled first
      if (!localStreamRef.current) {
        console.error(
          "[Transcription] ✗ No local stream available. Please enable microphone first."
        );
        if (!silent) {
          import("sonner").then(({ toast }) => {
            toast.error(
              "Please enable your microphone first to use live translation."
            );
          });
        }
        return;
      }

      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (!audioTrack || !audioTrack.enabled) {
        console.error(
          "[Transcription] ✗ Microphone is muted. Cannot start transcription."
        );
        if (!silent) {
          import("sonner").then(({ toast }) => {
            toast.error(
              "Please unmute your microphone to use live translation."
            );
          });
        }
        return;
      }

      // Check if browser supports Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("[Transcription] Speech Recognition not supported");
        if (!silent) {
          import("sonner").then(({ toast }) => {
            toast.error(
              "Your browser doesn't support speech recognition. Please use Chrome or Edge."
            );
          });
        }
        return;
      }

      setTargetLanguage(language);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US"; // Auto-detect or set source language

      recognition.onresult = async (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          console.log("[Transcription] Final transcript:", transcript);

          // ✅ FIX: Check if microphone is still enabled before broadcasting
          const currentAudioTrack = localStreamRef.current?.getAudioTracks()[0];
          if (!currentAudioTrack || !currentAudioTrack.enabled) {
            console.warn(
              "[Transcription] ⚠️ Microphone is muted, skipping broadcast"
            );
            return;
          }

          // Get source language from recognition
          const sourceLanguage = recognition.lang?.split("-")[0] || "en";

          // Broadcast original text to all participants via SignalR
          // Server will handle translation on-demand per client
          try {
            if (
              connectionRef.current?.state ===
              signalR.HubConnectionState.Connected
            ) {
              await connectionRef.current.invoke(
                "BroadcastTranscription",
                eventIdRef.current,
                myConnectionIdRef.current,
                transcript,
                sourceLanguage
              );
              console.log(
                "[Transcription] ✓ Sent transcription with source language:",
                sourceLanguage
              );
            }
          } catch (error) {
            console.error("[Transcription] ✗ Failed to send:", error);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("[Transcription] Error:", event.error);
      };

      recognition.onend = () => {
        console.log("[Transcription] Recognition ended");
        // Use ref to check latest state, not closure variable
        if (isTranscriptionEnabledRef.current) {
          // ✅ FIX: Check if microphone is still enabled before restarting
          const currentAudioTrack = localStreamRef.current?.getAudioTracks()[0];
          if (!currentAudioTrack || !currentAudioTrack.enabled) {
            console.log(
              "[Transcription] ⚠️ Microphone is muted, stopping transcription"
            );
            setIsTranscriptionEnabled(false);
            recognitionRef.current = null;
            return;
          }

          console.log("[Transcription] Restarting after end...");
          try {
            recognition.start();
          } catch (err) {
            console.error("[Transcription] Failed to restart:", err);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsTranscriptionEnabled(true);
      console.log(
        "[Transcription] ✓ Started (synchronized with WebRTC microphone)"
      );
    },
    []
  );

  // Stop transcription (microphone)
  const stopTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsTranscriptionEnabled(false);
      console.log("[Transcription] ✓ Microphone transcription stopped");
    }
  }, []);

  // Enable captions (viewing only - no microphone)
  const enableCaptions = useCallback(() => {
    setIsCaptionsEnabled(true);
    console.log("[Captions] ✓ Live captions enabled");
  }, []);

  // Disable captions (viewing only)
  const disableCaptions = useCallback(() => {
    setIsCaptionsEnabled(false);
    console.log("[Captions] ✓ Live captions disabled");
  }, []);

  // Translation function using the translation utility
  const translateText = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    try {
      const { translateText: translate } = await import("@/lib/translation");
      return await translate(text, targetLang, "en"); // Source = English
    } catch (error) {
      console.error("[Translation] Failed:", error);
      return text; // Return original on error
    }
  };

  // Request meeting summary (host only)
  const requestMeetingSummary = useCallback(async () => {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.invoke(
        "RequestMeetingSummary",
        eventIdRef.current
      );
      console.log("[SignalR] ✓ Requested meeting summary");
      import("sonner").then(({ toast }) => {
        toast.info("Generating meeting summary...");
      });
    } catch (error) {
      console.error("[SignalR] ✗ Failed to request summary:", error);
      import("sonner").then(({ toast }) => {
        toast.error("Failed to generate meeting summary");
      });
    }
  }, []);

  // Get existing summary
  const getMeetingSummary = useCallback(async () => {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.invoke(
        "GetMeetingSummary",
        eventIdRef.current
      );
      console.log("[SignalR] ✓ Retrieved meeting summary");
    } catch (error) {
      console.error("[SignalR] ✗ Failed to get summary:", error);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (!localStreamRef.current) return undefined;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setLocalAudioEnabled(audioTrack.enabled);
      broadcastMediaState("audio", audioTrack.enabled);

      // ✅ FIX: Auto-stop transcription when muting microphone
      if (!audioTrack.enabled && isTranscriptionEnabledRef.current) {
        console.log(
          "[Transcription] 🔇 Auto-stopping transcription (mic muted)"
        );
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current = null;
          setIsTranscriptionEnabled(false);
        }
      }

      // ✅ FIX: Auto-start transcription when unmuting microphone
      if (audioTrack.enabled && !isTranscriptionEnabledRef.current) {
        console.log(
          "[Transcription] 🔊 Auto-starting transcription (mic unmuted)"
        );
        // Use setTimeout to ensure state is updated first
        setTimeout(() => {
          startTranscription(targetLanguageRef.current, true); // silent = true (no toast)
        }, 100);
      }

      console.log(
        "[Media]",
        audioTrack.enabled ? "✓ Unmuted" : "✗ Muted",
        "audio"
      );
      return audioTrack.enabled;
    }
    return undefined;
  }, [broadcastMediaState, startTranscription]);

  // ✅ FIX: Simplified and more reliable toggleVideo
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) {
      console.warn("[Media] ⚠️ No local stream to toggle video");
      return undefined;
    }

    try {
      const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];

      // Case 1: Disabling video (track exists and is enabled)
      if (currentVideoTrack && currentVideoTrack.enabled) {
        console.log("[Media] 🔴 Disabling video...");
        currentVideoTrack.enabled = false;
        setLocalVideoEnabled(false);
        await broadcastMediaState("video", false);
        console.log("[Media] ✓ Video disabled");
        return false;
      }

      // Case 2: Enabling video (track exists but is disabled)
      if (currentVideoTrack && !currentVideoTrack.enabled) {
        console.log("[Media] 🟢 Enabling video...");

        // Check if the track is still live
        if (currentVideoTrack.readyState === "live") {
          console.log("[Media] ✓ Track is live, simply enabling...");
          currentVideoTrack.enabled = true;
          setLocalVideoEnabled(true);
          await broadcastMediaState("video", true);
          console.log("[Media] ✓ Video enabled");
          return true;
        }

        // Track is ended, need to get a new one
        console.log("[Media] 🔄 Track ended, getting new video stream...");
      }

      // Case 3: Need to get a new video track (no track or track ended)
      console.log("[Media] 🎥 Requesting new video stream...");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error("Failed to get video track from new stream");
      }

      // Stop old video track if it exists
      if (currentVideoTrack) {
        console.log("[Media] 🛑 Stopping old video track...");
        currentVideoTrack.stop();
      }

      // Get audio tracks from current stream
      const audioTracks = localStreamRef.current.getAudioTracks();

      // Create new combined stream
      const combinedStream = new MediaStream();
      audioTracks.forEach((track) => combinedStream.addTrack(track));
      combinedStream.addTrack(newVideoTrack);

      console.log(
        "[Media] ✓ New stream created with tracks:",
        combinedStream.getTracks().map((t) => `${t.kind}:${t.id}`)
      );

      // Update refs and state
      localStreamRef.current = combinedStream;
      setLocalStream(combinedStream);
      setLocalVideoEnabled(true);

      // ✅ CRITICAL: Update all peer connections with the new video track
      console.log(
        "[Media] 🔄 Updating peer connections with new video track..."
      );
      await updatePeerConnectionTracks(combinedStream);

      // Broadcast the new state
      await broadcastMediaState("video", true);

      console.log("[Media] ✓ Video re-enabled successfully");
      return true;
    } catch (error) {
      console.error("[Media] ✗ toggleVideo error:", error);
      setLocalVideoEnabled(false);
      return undefined;
    }
  }, [broadcastMediaState, updatePeerConnectionTracks]);

  return {
    isConnected,
    myConnectionId,
    hostId,
    participants,
    localStream,
    localAudioEnabled,
    localVideoEnabled,
    isHandRaised,
    chatMessages,
    joinRoom,
    startCall,
    leaveRoom,
    endRoom,
    toggleAudio,
    toggleVideo,
    getLocalStream,
    sendChatMessage,
    toggleHandRaise,
    hostToggleMic,
    hostToggleCam,
    kickUser,
    muteAllParticipants,
    turnOffAllCameras,
    lowerAllHands,
    // AI Modules
    transcriptions,
    isTranscriptionEnabled, // Microphone is recording & sending
    isCaptionsEnabled, // Viewing captions on screen
    targetLanguage,
    meetingSummary,
    isSummaryGenerating,
    startTranscription, // Start microphone recording
    stopTranscription, // Stop microphone recording
    enableCaptions, // Start viewing captions
    disableCaptions, // Stop viewing captions
    requestMeetingSummary,
    getMeetingSummary,
    setTargetLanguage,
  };
}
