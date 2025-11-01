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
  const [isConnected, setIsConnected] = useState(false);
  const [myConnectionId, setMyConnectionId] = useState<string>("");
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);

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

  const connectionInitializedRef = useRef<boolean>(false);
  const isJoiningRef = useRef<boolean>(false);
  const hasJoinedRef = useRef<boolean>(false);

  // ✅ FIX 1: Track which peers we've already initiated calls with
  const initiatedPeersRef = useRef<Set<string>>(new Set());

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
                eventId,
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
          event.streams[0].getTracks().map((t) => t.kind)
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
          // Don't immediately restart, wait a bit
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
    [eventId]
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

  // ✅ FIX 2: Helper function to update peer connection tracks
  const updatePeerConnectionTracks = useCallback(
    async (newStream: MediaStream) => {
      console.log("[WebRTC] Updating tracks for all peer connections");

      for (const [remoteId, pc] of peerConnectionsRef.current.entries()) {
        try {
          // Get all senders
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

          // ✅ After replacing tracks, may need to renegotiate if signaling state allows
          if (
            pc.signalingState === "stable" &&
            connectionRef.current?.state ===
              signalR.HubConnectionState.Connected
          ) {
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              await connectionRef.current.invoke(
                "SendOffer",
                eventId,
                remoteId,
                offer.sdp
              );
              console.log(
                `[PC] ✓ Renegotiated after track update for ${remoteId}`
              );
            } catch (renegError) {
              console.warn(
                `[PC] ⚠️ Renegotiation failed for ${remoteId}:`,
                renegError
              );
            }
          }
        } catch (error) {
          console.error(
            `[PC] ✗ Failed to update tracks for ${remoteId}:`,
            error
          );
        }
      }
    },
    [eventId]
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
            eventId,
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
    [eventId]
  );

  // ✅ FIX 3: Initialize SignalR connection ONCE
  useEffect(() => {
    if (connectionInitializedRef.current || connectionRef.current) {
      console.log("[SignalR] Connection already initialized, skipping");
      return;
    }

    connectionInitializedRef.current = true;
    console.log("[SignalR] Initializing connection for eventId:", eventId);

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = hubConnection;

    // Setup all event handlers
    hubConnection.on(
      "SetRole",
      (role: string, connId: string, hostId: string) => {
        console.log(
          "[SignalR] SetRole:",
          role,
          "connId:",
          connId,
          "hostId:",
          hostId
        );
        setMyConnectionId(connId);
        myConnectionIdRef.current = connId;
      }
    );

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
            role: role === "0" ? "host" : "attendee",
            status: "connecting" as ParticipantStatus,
            audioEnabled: true,
            videoEnabled: true,
            isHandRaised: false,
          });
          return newMap;
        });

        // ✅ FIX 4: Auto-establish connection with late joiners
        if (callStartedRef.current && !initiatedPeersRef.current.has(connId)) {
          console.log(
            "[WebRTC] 🔔 Late joiner detected, initiating call to:",
            connId
          );

          // Longer delay to ensure both sides are ready
          setTimeout(async () => {
            try {
              // Verify local stream is available
              if (!localStreamRef.current) {
                console.log(
                  "[WebRTC] ⚠️ No local stream for late joiner, skipping"
                );
                return;
              }

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
                    eventId,
                    connId,
                    offer.sdp
                  );
                  initiatedPeersRef.current.add(connId);
                  console.log("[WebRTC] ✓ Offer sent to late joiner:", connId);
                }
              } else {
                console.log(
                  "[WebRTC] ⚠️ Skipping late joiner offer - state:",
                  pc.signalingState,
                  "hasRemote:",
                  !!pc.remoteDescription
                );
              }
            } catch (error) {
              console.error(
                "[WebRTC] ✗ Failed to call late joiner:",
                connId,
                error
              );
            }
          }, 1000); // Increased from 500ms to 1000ms
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
          if (!pc) {
            pc = new RTCPeerConnection({
              iceServers: DEFAULT_ICE_SERVERS,
            }) as ExtendedRTCPeerConnection;

            setupPeerConnectionHandlers(pc, fromConnId);

            // ✅ FIX: Ensure we have local stream before adding tracks
            if (!localStreamRef.current) {
              console.log("[PC] ⚠️ No local stream yet, waiting...");
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
            eventId,
            fromConnId,
            answer.sdp
          );
          console.log("[SignalR] ✓ Sent Answer to", fromConnId);
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

    hubConnection.on("RoomEnded", () => {
      console.log("[SignalR] 🔴 RoomEnded - cleaning up");

      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      initiatedPeersRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }

      setParticipants(new Map());
      setIsConnected(false);
      callStartedRef.current = false;
      isJoiningRef.current = false;
      hasJoinedRef.current = false;

      if (onRoomEnded) onRoomEnded();
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

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }

        connectionRef.current = null;
        connectionInitializedRef.current = false;
      };

      cleanup();
    };
  }, []);

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

      await conn.invoke("JoinRoom", eventId, userName);
      console.log("[SignalR] ✓ Joined room:", eventId, "as", userName);
      hasJoinedRef.current = true;

      try {
        const participantList = await conn.invoke<Record<string, string>>(
          "GetParticipants",
          eventId
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
              eventId,
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
  }, [eventId, userName]);

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
        callStartedRef.current = true; // ✅ Still mark as started for late joiners
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
        // Skip if already initiated
        if (initiatedPeersRef.current.has(remoteId)) {
          console.log("[WebRTC] ⚠️ Already initiated call to", remoteId);
          continue;
        }

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
              eventId,
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
  }, [
    participants,
    myConnectionId,
    eventId,
    getLocalStream,
    createPeerConnection,
  ]);

  // Leave room
  const leaveRoom = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      if (conn.state === signalR.HubConnectionState.Connected) {
        await conn.invoke("LeaveRoom", eventId);
        console.log("[SignalR] ✓ Left room");
      }
    } catch (error) {
      console.warn("[SignalR] ⚠️ Leave room error:", error);
    }

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    initiatedPeersRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setParticipants(new Map());
    setIsConnected(false);
    callStartedRef.current = false;
    isJoiningRef.current = false;
    hasJoinedRef.current = false;

    console.log("[WebRTC] ✓ Cleanup complete");
  }, [eventId]);

  // End room (host only)
  const endRoom = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      if (conn.state === signalR.HubConnectionState.Connected) {
        await conn.invoke("EndRoom", eventId);
        console.log("[SignalR] ✓ Ended room - broadcast sent");
      }
    } catch (error) {
      console.error("[SignalR] ✗ End room error:", error);
      throw error;
    }
  }, [eventId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return undefined;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setLocalAudioEnabled(audioTrack.enabled);
      broadcastMediaState("audio", audioTrack.enabled);
      console.log(
        "[Media]",
        audioTrack.enabled ? "✓ Unmuted" : "✗ Muted",
        "audio"
      );
      return audioTrack.enabled;
    }
    return undefined;
  }, [broadcastMediaState]);

  // ✅ FIX 5: Toggle video with proper track replacement
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return undefined;

    try {
      const videoTracks = localStreamRef.current.getVideoTracks();

      // 🔴 If video is ON → turn it OFF by disabling track (NOT stopping)
      if (videoTracks.length > 0 && videoTracks[0].enabled) {
        videoTracks[0].enabled = false;
        setLocalVideoEnabled(false);
        await broadcastMediaState("video", false);
        console.log("[Media] ✗ Video disabled (track.enabled = false)");
        return false;
      }

      // 🟢 If video is OFF → turn it back ON
      if (videoTracks.length > 0 && !videoTracks[0].enabled) {
        // Check if track is still live
        if (videoTracks[0].readyState === "live") {
          videoTracks[0].enabled = true;
          setLocalVideoEnabled(true);
          await broadcastMediaState("video", true);
          console.log("[Media] ✓ Video enabled (track.enabled = true)");
          return true;
        }
      }

      // If track is stopped or doesn't exist, request new stream
      console.log("[Media] 🔄 Requesting new video stream...");
      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error("Failed to get video track from new stream");
      }

      // Keep existing audio tracks, add new video track
      const audioTracks = localStreamRef.current.getAudioTracks();
      const combinedStream = new MediaStream();
      audioTracks.forEach((t) => combinedStream.addTrack(t));
      combinedStream.addTrack(newVideoTrack);

      console.log(
        "[Media] 📹 New combined stream tracks:",
        combinedStream
          .getTracks()
          .map((t) => `${t.kind}: ${t.id}`)
          .join(", ")
      );

      // Stop old video tracks
      videoTracks.forEach((track) => track.stop());

      // Update local stream reference
      localStreamRef.current = combinedStream;
      setLocalStream(combinedStream);

      // Small delay for React state update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Update all peer connections with new video track
      await updatePeerConnectionTracks(combinedStream);

      setLocalVideoEnabled(true);
      await broadcastMediaState("video", true);
      console.log(
        "[Media] ✓ Video re-enabled with new track ID:",
        newVideoTrack.id
      );
      return true;
    } catch (error) {
      console.error("[Media] ✗ toggleVideo error:", error);
      return undefined;
    }
  }, [broadcastMediaState, updatePeerConnectionTracks]);

  return {
    isConnected,
    myConnectionId,
    participants,
    localStream,
    localAudioEnabled,
    localVideoEnabled,
    joinRoom,
    startCall,
    leaveRoom,
    endRoom,
    toggleAudio,
    toggleVideo,
    getLocalStream,
  };
}
