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
  onRoomEnded?: () => void;
}

interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  _pendingRemoteCandidates?: RTCIceCandidateInit[];
  _applyPendingCandidates?: () => Promise<void>;
}

export function useWebRTC({
  eventId,
  userName,
  isHost,
  onRoomEnded,
}: UseWebRTCProps) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [myConnectionId, setMyConnectionId] = useState<string>("");
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const peerConnectionsRef = useRef<Map<string, ExtendedRTCPeerConnection>>(
    new Map()
  );
  const localStreamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const outgoingCandidatesRef = useRef<
    Array<{ remoteId: string; candidateJson: string }>
  >([]);
  const myConnectionIdRef = useRef<string>("");

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
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("[Media] getUserMedia error:", error);
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(
    async (remoteId: string): Promise<ExtendedRTCPeerConnection> => {
      const existing = peerConnectionsRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({
        iceServers: DEFAULT_ICE_SERVERS,
      }) as ExtendedRTCPeerConnection;

      // Initialize pending candidates queue
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
            } catch (error) {
              console.warn("addIceCandidate from queue failed", error);
            }
          }
        }
      };

      // ICE candidate event
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;

        const candidateJson = JSON.stringify(event.candidate);
        const trySend = async () => {
          try {
            if (connectionRef.current?.invoke) {
              await connectionRef.current.invoke(
                "SendIceCandidate",
                eventId,
                remoteId,
                candidateJson
              );
              console.log("[SignalR] Sent ICE candidate to", remoteId);
              return;
            }
          } catch (error) {
            console.warn("SendIceCandidate failed, queuing", error);
          }
          outgoingCandidatesRef.current.push({ remoteId, candidateJson });
        };
        trySend();
      };

      // Track event - receive remote stream
      pc.ontrack = (event) => {
        console.log("[PC] ontrack for", remoteId);
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

      // Connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log(
          "[PC] iceConnectionState:",
          pc.iceConnectionState,
          "for",
          remoteId
        );
        if (pc.iceConnectionState === "failed") {
          console.log("[!] ICE failed, restarting...");
          pc.restartIce?.();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(
          "[PC] connectionState change for",
          remoteId,
          pc.connectionState
        );
      };

      // Add local stream tracks
      const stream = await getLocalStream();
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      peerConnectionsRef.current.set(remoteId, pc);
      return pc;
    },
    [eventId, getLocalStream]
  );

  // Initialize SignalR connection
  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = hubConnection;

    // Set role event
    hubConnection.on(
      "SetRole",
      (role: string, connId: string, hostId: string) => {
        console.log("[SignalR] SetRole:", role, connId, hostId);
        setMyConnectionId(connId);
        myConnectionIdRef.current = connId;
      }
    );

    // User joined event
    hubConnection.on(
      "UserJoined",
      (participantName: string, role: string, connId: string) => {
        console.log("[SignalR] UserJoined:", participantName, connId);
        setParticipants((prev) => {
          const newMap = new Map(prev);
          newMap.set(connId, {
            id: connId,
            name: participantName,
            role: role === "0" ? "host" : "attendee",
            status: "connecting" as ParticipantStatus,
            audioEnabled: true,
            videoEnabled: true,
            isHandRaised: false,
          });
          return newMap;
        });

        // Don't send offer to yourself
        if (connId === myConnectionIdRef.current) {
          console.log("[WebRTC] Skipping offer to self");
          return;
        }

        // Automatically initiate call with new participant after short delay
        setTimeout(async () => {
          try {
            if (!localStreamRef.current) {
              try {
                await getLocalStream();
              } catch (error) {
                console.error(
                  "[WebRTC] Failed to get local stream for auto-offer:",
                  error
                );
                return;
              }
            }

            const pc = await createPeerConnection(connId);

            // Check if already negotiating
            if (pc.remoteDescription) {
              console.log(
                "[WebRTC] Skipping auto-offer to",
                connId,
                "(already negotiating)"
              );
              return;
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            let retries = 3;
            let delay = 500;
            while (retries > 0) {
              try {
                if (connectionRef.current?.invoke) {
                  await connectionRef.current.invoke(
                    "SendOffer",
                    eventId,
                    connId,
                    offer.sdp
                  );
                  console.log("[✓] Auto-offer sent to new user", connId);
                  break;
                }
              } catch (error) {
                retries--;
                if (retries > 0) {
                  console.warn(
                    `[WebRTC] Auto-offer retry ${3 - retries}/3 for ${connId}`
                  );
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  delay *= 2;
                } else {
                  throw error;
                }
              }
            }
          } catch (error) {
            console.error("[✗] Auto-offer failed for new user", connId, error);
          }
        }, 1000);
      }
    );

    // User left event
    hubConnection.on("UserLeft", (connId: string) => {
      console.log("[SignalR] UserLeft:", connId);
      setParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.delete(connId);
        return newMap;
      });

      // Clean up peer connection
      const pc = peerConnectionsRef.current.get(connId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(connId);
      }
    });

    // Receive offer
    hubConnection.on(
      "ReceiveOffer",
      async (fromConnId: string, sdp: string) => {
        try {
          console.log("[SignalR] ReceiveOffer from", fromConnId);
          const pc = await createPeerConnection(fromConnId);
          await pc.setRemoteDescription({ type: "offer", sdp });

          if (pc._applyPendingCandidates) {
            await pc._applyPendingCandidates();
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await hubConnection.invoke(
            "SendAnswer",
            eventId,
            fromConnId,
            answer.sdp
          );
          console.log("[SignalR] Sent Answer to", fromConnId);
        } catch (error) {
          console.error("[SignalR] ReceiveOffer error:", error);
        }
      }
    );

    // Receive answer
    hubConnection.on(
      "ReceiveAnswer",
      async (fromConnId: string, sdp: string) => {
        console.log("[SignalR] ReceiveAnswer from", fromConnId);
        const pc = peerConnectionsRef.current.get(fromConnId);
        if (pc) {
          await pc.setRemoteDescription({ type: "answer", sdp });
          if (pc._applyPendingCandidates) {
            await pc._applyPendingCandidates();
          }
        }
      }
    );

    // Receive ICE candidate
    hubConnection.on(
      "ReceiveIceCandidate",
      async (fromConnId: string, candidateJson: string) => {
        console.log("[SignalR] ReceiveIceCandidate from", fromConnId);
        try {
          const candidate = JSON.parse(candidateJson);
          const pc = await createPeerConnection(fromConnId);

          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(candidate);
            console.log("[PC] Added remote ICE candidate for", fromConnId);
          } else {
            pc._pendingRemoteCandidates = pc._pendingRemoteCandidates || [];
            pc._pendingRemoteCandidates.push(candidate);
            console.log("[PC] Queued remote ICE candidate for", fromConnId);
          }
        } catch (error) {
          console.error("[SignalR] ReceiveIceCandidate error:", error);
        }
      }
    );

    // Room ended
    hubConnection.on("RoomEnded", () => {
      console.log("[SignalR] RoomEnded");
      onRoomEnded?.();
    });

    setConnection(hubConnection);

    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
      connectionRef.current = null;
    };
  }, [eventId, onRoomEnded, createPeerConnection, getLocalStream]);

  // Join room
  const joinRoom = useCallback(async () => {
    if (!connection) return;

    try {
      await connection.start();
      setIsConnected(true);
      console.log("[SignalR] Connected");

      // Join room
      await connection.invoke("JoinRoom", eventId, userName);
      console.log("[SignalR] Joined room:", eventId);

      // Get participants
      const participantList = await connection.invoke<Record<string, string>>(
        "GetParticipants",
        eventId
      );

      if (participantList) {
        const newParticipants = new Map<string, Participant>();
        Object.entries(participantList).forEach(([connId, name]) => {
          newParticipants.set(connId, {
            id: connId,
            name,
            role: "attendee",
            status: "connecting" as ParticipantStatus,
            audioEnabled: true,
            videoEnabled: true,
            isHandRaised: false,
          });
        });
        setParticipants(newParticipants);
      }

      // Drain queued ICE candidates
      if (outgoingCandidatesRef.current.length > 0) {
        const queue = [...outgoingCandidatesRef.current];
        outgoingCandidatesRef.current = [];

        for (const item of queue) {
          try {
            if (connectionRef.current?.invoke) {
              await connectionRef.current.invoke(
                "SendIceCandidate",
                eventId,
                item.remoteId,
                item.candidateJson
              );
            }
          } catch (error) {
            console.warn("drain candidate failed", error);
          }
        }
      }
    } catch (error) {
      console.error("[SignalR] Join room error:", error);
      throw error;
    }
  }, [connection, eventId, userName]);

  // Start call with all participants
  const startCall = useCallback(async () => {
    try {
      await getLocalStream();

      const remoteParticipants = Array.from(participants.keys()).filter(
        (id) => id !== myConnectionId
      );

      if (remoteParticipants.length === 0) {
        console.log("[WebRTC] No remote participants to call");
        return;
      }

      console.log(
        "[WebRTC] Starting call with participants:",
        remoteParticipants
      );

      for (const remoteId of remoteParticipants) {
        try {
          const pc = await createPeerConnection(remoteId);

          // Check if already have remote description (means we received offer first)
          if (pc.remoteDescription) {
            console.log(
              "[WebRTC] Skipping offer to",
              remoteId,
              "(already negotiating)"
            );
            continue;
          }

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Retry logic with exponential backoff
          let retries = 3;
          let delay = 300;
          while (retries > 0) {
            try {
              if (connectionRef.current?.invoke) {
                await connectionRef.current.invoke(
                  "SendOffer",
                  eventId,
                  remoteId,
                  offer.sdp
                );
                console.log("[✓] Offer sent to", remoteId);
                break;
              }
            } catch (error) {
              retries--;
              if (retries > 0) {
                console.warn(
                  `[WebRTC] SendOffer retry ${3 - retries}/3 for ${remoteId}`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
              } else {
                throw error;
              }
            }
          }
        } catch (error) {
          console.error("[✗] Failed offer for", remoteId, error);
        }
      }
    } catch (error) {
      console.error("[WebRTC] startCall error:", error);
    }
  }, [
    participants,
    myConnectionId,
    eventId,
    getLocalStream,
    createPeerConnection,
  ]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!connection) return;

    try {
      await connection.invoke("LeaveRoom", eventId);
      await connection.stop();
    } catch (error) {
      console.warn("[SignalR] Leave room error:", error);
    }

    setIsConnected(false);

    // Cleanup peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setParticipants(new Map());
    setMyConnectionId("");
  }, [connection, eventId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }, []);

  return {
    isConnected,
    myConnectionId,
    participants,
    localStream,
    joinRoom,
    startCall,
    leaveRoom,
    toggleAudio,
    toggleVideo,
    getLocalStream,
  };
}
