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
            if (connectionRef.current?.invoke) {
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
        } else if (pc.iceConnectionState === "failed") {
          console.log(
            "[PC] ⚠️ ICE failed for",
            remoteId,
            "- attempting restart"
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
    [eventId, getLocalStream]
  );

  // Initialize SignalR connection - CRITICAL: Minimal dependencies!
  useEffect(() => {
    console.log("[SignalR] Setting up connection for eventId:", eventId);

    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = hubConnection;

    // Set role event
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

    // User joined event
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

        if (connId === myConnectionIdRef.current) {
          console.log("[WebRTC] Skipping auto-offer to self");
          return;
        }

        // Auto-offer logic uses refs, safe in event handler
        setTimeout(async () => {
          try {
            console.log("[WebRTC] Auto-initiating offer to new user:", connId);

            if (!localStreamRef.current) {
              console.log("[WebRTC] Getting local stream before auto-offer");
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                  video: true,
                });
                localStreamRef.current = stream;
                setLocalStream(stream);
              } catch (error) {
                console.error(
                  "[WebRTC] ✗ Failed to get local stream for auto-offer:",
                  error
                );
                return;
              }
            }

            // Create PC inline to avoid dependency issues
            let pc = peerConnectionsRef.current.get(connId);
            if (!pc) {
              pc = new RTCPeerConnection({
                iceServers: DEFAULT_ICE_SERVERS,
              }) as ExtendedRTCPeerConnection;

              pc._pendingRemoteCandidates = [];
              pc._applyPendingCandidates = async () => {
                while (
                  pc!._pendingRemoteCandidates &&
                  pc!._pendingRemoteCandidates.length > 0
                ) {
                  const candidate = pc!._pendingRemoteCandidates.shift();
                  if (candidate) {
                    try {
                      await pc!.addIceCandidate(candidate);
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
                if (!event.candidate) return;
                const candidateJson = JSON.stringify(event.candidate);
                const trySend = async () => {
                  try {
                    if (connectionRef.current?.invoke) {
                      await connectionRef.current.invoke(
                        "SendIceCandidate",
                        eventId,
                        connId,
                        candidateJson
                      );
                      return;
                    }
                  } catch (error) {
                    console.warn(
                      "[SignalR] ✗ SendIceCandidate failed, queuing",
                      error
                    );
                  }
                  outgoingCandidatesRef.current.push({
                    remoteId: connId,
                    candidateJson,
                  });
                };
                trySend();
              };

              pc.ontrack = (event) => {
                console.log("[PC] ✓ ontrack for", connId);
                setParticipants((prev) => {
                  const newMap = new Map(prev);
                  const participant = newMap.get(connId);
                  if (participant) {
                    newMap.set(connId, {
                      ...participant,
                      stream: event.streams[0],
                      status: "connected" as ParticipantStatus,
                    });
                  }
                  return newMap;
                });
              };

              pc.oniceconnectionstatechange = () => {
                console.log(
                  "[PC] ICE state:",
                  pc!.iceConnectionState,
                  "for",
                  connId
                );
                if (
                  pc!.iceConnectionState === "connected" ||
                  pc!.iceConnectionState === "completed"
                ) {
                  setParticipants((prev) => {
                    const newMap = new Map(prev);
                    const participant = newMap.get(connId);
                    if (participant) {
                      newMap.set(connId, {
                        ...participant,
                        status: "connected" as ParticipantStatus,
                      });
                    }
                    return newMap;
                  });
                } else if (pc!.iceConnectionState === "failed") {
                  pc!.restartIce?.();
                }
              };

              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => {
                  pc!.addTrack(track, localStreamRef.current!);
                });
              }

              peerConnectionsRef.current.set(connId, pc);
            }

            if (pc.remoteDescription) {
              console.log(
                "[WebRTC] ⚠️ Skipping auto-offer (already has remote description)"
              );
              return;
            }

            if (pc.signalingState !== "stable") {
              console.log(
                "[WebRTC] ⚠️ Skipping auto-offer (signaling state:",
                pc.signalingState,
                ")"
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
                  console.log("[WebRTC] ✓ Auto-offer sent to new user", connId);
                  break;
                }
              } catch (error) {
                retries--;
                if (retries > 0) {
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  delay *= 2;
                } else {
                  throw error;
                }
              }
            }
          } catch (error) {
            console.error(
              "[WebRTC] ✗ Auto-offer failed for new user",
              connId,
              error
            );
          }
        }, 1000);
      }
    );

    // User left event
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
        console.log("[PC] Cleaned up peer connection for", connId);
      }
    });

    // Receive offer
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
            // Create PC inline
            pc = new RTCPeerConnection({
              iceServers: DEFAULT_ICE_SERVERS,
            }) as ExtendedRTCPeerConnection;

            pc._pendingRemoteCandidates = [];
            pc._applyPendingCandidates = async () => {
              while (
                pc!._pendingRemoteCandidates &&
                pc!._pendingRemoteCandidates.length > 0
              ) {
                const candidate = pc!._pendingRemoteCandidates.shift();
                if (candidate) {
                  try {
                    await pc!.addIceCandidate(candidate);
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
              if (!event.candidate) return;
              const candidateJson = JSON.stringify(event.candidate);
              const trySend = async () => {
                try {
                  if (connectionRef.current?.invoke) {
                    await connectionRef.current.invoke(
                      "SendIceCandidate",
                      eventId,
                      fromConnId,
                      candidateJson
                    );
                    return;
                  }
                } catch (error) {
                  console.warn("[SignalR] ✗ SendIceCandidate failed", error);
                }
                outgoingCandidatesRef.current.push({
                  remoteId: fromConnId,
                  candidateJson,
                });
              };
              trySend();
            };

            pc.ontrack = (event) => {
              console.log("[PC] ✓ ontrack for", fromConnId);
              setParticipants((prev) => {
                const newMap = new Map(prev);
                const participant = newMap.get(fromConnId);
                if (participant) {
                  newMap.set(fromConnId, {
                    ...participant,
                    stream: event.streams[0],
                    status: "connected" as ParticipantStatus,
                  });
                }
                return newMap;
              });
            };

            pc.oniceconnectionstatechange = () => {
              console.log(
                "[PC] ICE state:",
                pc!.iceConnectionState,
                "for",
                fromConnId
              );
              if (
                pc!.iceConnectionState === "connected" ||
                pc!.iceConnectionState === "completed"
              ) {
                setParticipants((prev) => {
                  const newMap = new Map(prev);
                  const participant = newMap.get(fromConnId);
                  if (participant) {
                    newMap.set(fromConnId, {
                      ...participant,
                      status: "connected" as ParticipantStatus,
                    });
                  }
                  return newMap;
                });
              } else if (pc!.iceConnectionState === "failed") {
                pc!.restartIce?.();
              }
            };

            if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => {
                pc!.addTrack(track, localStreamRef.current!);
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

    // Receive answer
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

    // Receive ICE candidate
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

    // Room ended
    hubConnection.on("RoomEnded", () => {
      console.log("[SignalR] RoomEnded");
      if (onRoomEnded) onRoomEnded();
    });

    console.log("[SignalR] ✓ Connection setup complete (not started yet)");

    return () => {
      console.log("[SignalR] Cleanup: stopping connection if started");
      if (hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        hubConnection.stop();
      }
      connectionRef.current = null;
    };
  }, [eventId]); // ONLY eventId! No function dependencies!

  // Join room
  const joinRoom = useCallback(async () => {
    const conn = connectionRef.current;

    if (!conn) {
      console.error("[SignalR] ✗ Cannot join room: no connection");
      throw new Error("No connection available");
    }

    try {
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
        return joinRoom();
      }

      await conn.invoke("JoinRoom", eventId, userName);
      console.log("[SignalR] ✓ Joined room:", eventId, "as", userName);

      try {
        const participantList = await conn.invoke<Record<string, string>>(
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
          console.log("[SignalR] ✓ Got", newParticipants.size, "participants");
        }
      } catch (getParticipantsError) {
        console.warn(
          "[SignalR] ⚠️ GetParticipants failed:",
          getParticipantsError
        );
        console.warn("[SignalR] Continuing without initial participant list");
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
            if (connectionRef.current?.invoke) {
              await connectionRef.current.invoke(
                "SendIceCandidate",
                eventId,
                item.remoteId,
                item.candidateJson
              );
              console.log(
                "[SignalR] ✓ Sent queued ICE candidate to",
                item.remoteId
              );
            }
          } catch (error) {
            console.warn("[SignalR] ✗ Failed to send queued candidate", error);
          }
        }
      }
    } catch (error) {
      console.error("[SignalR] ✗ Join room error:", error);
      throw error;
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
                console.log("[WebRTC] ✓ Offer sent to", remoteId);
                break;
              }
            } catch (error) {
              retries--;
              if (retries > 0) {
                console.warn(
                  `[WebRTC] SendOffer retry ${3 - retries}/3 for ${remoteId}`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
              } else {
                throw error;
              }
            }
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
        await conn.stop();
        console.log("[SignalR] ✓ Left room and stopped connection");
      }
    } catch (error) {
      console.warn("[SignalR] ⚠️ Leave room error:", error);
    }

    setIsConnected(false);
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setParticipants(new Map());
    setMyConnectionId("");
    callStartedRef.current = false;
  }, [eventId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return false;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log(
        "[Media]",
        audioTrack.enabled ? "✓ Unmuted" : "✗ Muted",
        "audio"
      );
      return audioTrack.enabled;
    }
    return false;
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return false;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log(
        "[Media]",
        videoTrack.enabled ? "✓ Enabled" : "✗ Disabled",
        "video"
      );
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
