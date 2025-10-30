import envConfig from "@/config";
import { Participant } from "@/constants";
import { WebRTCManager } from "@/lib";
import SignalRClient from "@/lib/signalr";
import * as signalR from "@microsoft/signalr";
import { create } from "zustand";

interface EventRoomStore {
  // Connection
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  myConnectionId: string;

  // Room info
  roomId: string;
  eventId: string;
  isHost: boolean;

  // Media
  localStream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;

  // Participants
  participants: Map<string, Participant>;

  // WebRTC
  webrtcManager: WebRTCManager | null;

  // View mode
  viewMode: "grid" | "speaker";

  // UI States
  isChatOpen: boolean;
  isParticipantsOpen: boolean;

  // Actions
  connectToRoom: (
    eventId: string,
    roomId: string,
    userName: string
  ) => Promise<void>;
  disconnectFromRoom: () => Promise<void>;
  startCall: () => Promise<void>;
  toggleCamera: () => void;
  toggleMic: () => void;
  setLocalStream: (stream: MediaStream) => void;
  addRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeParticipant: (peerId: string) => void;
  toggleViewMode: () => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
}

export const useEventRoom = create<EventRoomStore>((set, get) => ({
  connection: null,
  isConnected: false,
  myConnectionId: "",
  roomId: "",
  eventId: "",
  isHost: false,
  localStream: null,
  isCameraOn: true,
  isMicOn: true,
  participants: new Map(),
  webrtcManager: null,
  viewMode: "grid",
  isChatOpen: false,
  isParticipantsOpen: false,

  connectToRoom: async (eventId, roomId, userName) => {
    try {
      const hubUrl = envConfig.NEXT_PUBLIC_API_ENDPOINT + "/eventRoomHub";
      const connection = await SignalRClient.connect(hubUrl);

      // Setup event handlers
      connection.on(
        "SetRole",
        (role: string, connId: string, hostId: string) => {
          console.log("SetRole:", role, connId, hostId);
          set({ myConnectionId: connId, isHost: role === "Host" });
        }
      );

      connection.on(
        "UserJoined",
        (userName: string, role: string, connId: string) => {
          console.log("UserJoined:", userName, role, connId);
          set((state) => {
            const newParticipants = new Map(state.participants);
            newParticipants.set(connId, {
              id: connId,
              name: userName,
              role: role as "Host" | "Participant",
            });
            return { participants: newParticipants };
          });
        }
      );

      connection.on("UserLeft", (connId: string) => {
        console.log("UserLeft:", connId);
        get().removeParticipant(connId);
      });

      connection.on("ReceiveOffer", async (fromConnId: string, sdp: string) => {
        console.log("ReceiveOffer from:", fromConnId);
        const { webrtcManager, connection, roomId } = get();
        if (!webrtcManager || !connection) return;

        try {
          const answerSdp = await webrtcManager.handleOffer(fromConnId, sdp);
          await connection.invoke("SendAnswer", roomId, fromConnId, answerSdp);
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      connection.on(
        "ReceiveAnswer",
        async (fromConnId: string, sdp: string) => {
          console.log("ReceiveAnswer from:", fromConnId);
          const { webrtcManager } = get();
          if (webrtcManager) {
            await webrtcManager.handleAnswer(fromConnId, sdp);
          }
        }
      );

      connection.on(
        "ReceiveIceCandidate",
        async (fromConnId: string, candidateJson: string) => {
          console.log("ReceiveIceCandidate from:", fromConnId);
          const { webrtcManager } = get();
          if (webrtcManager) {
            try {
              const candidate = JSON.parse(candidateJson);
              await webrtcManager.addIceCandidate(fromConnId, candidate);
            } catch (error) {
              console.error("Error adding ICE candidate:", error);
            }
          }
        }
      );

      connection.on("RoomEnded", () => {
        console.log("RoomEnded");
        get().disconnectFromRoom();
      });

      // Create WebRTC Manager
      const webrtcManager = new WebRTCManager(
        (peerId, stream) => get().addRemoteStream(peerId, stream),
        (peerId, candidate) => {
          const { connection, roomId } = get();
          if (connection) {
            connection
              .invoke(
                "SendIceCandidate",
                roomId,
                peerId,
                JSON.stringify(candidate)
              )
              .catch(console.error);
          }
        }
      );

      // Join room
      await connection.invoke("JoinRoom", roomId, userName);
      const participantsList = await connection.invoke(
        "GetParticipants",
        roomId
      );

      // Convert participants object to Map
      const participantsMap = new Map<string, Participant>();
      if (participantsList && typeof participantsList === "object") {
        Object.entries(participantsList).forEach(([id, name]) => {
          participantsMap.set(id, {
            id,
            name: name as string,
            role: "Participant",
          });
        });
      }

      set({
        connection,
        isConnected: true,
        roomId,
        eventId,
        webrtcManager,
        participants: participantsMap,
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  },

  disconnectFromRoom: async () => {
    const { connection, roomId, webrtcManager, localStream } = get();

    if (connection) {
      try {
        await connection.invoke("LeaveRoom", roomId);
        await SignalRClient.disconnect();
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    }

    if (webrtcManager) {
      webrtcManager.closeAll();
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    set({
      connection: null,
      isConnected: false,
      myConnectionId: "",
      roomId: "",
      participants: new Map(),
      localStream: null,
      webrtcManager: null,
    });
  },

  startCall: async () => {
    const { participants, myConnectionId, webrtcManager, connection, roomId } =
      get();

    if (!webrtcManager || !connection) return;

    for (const [peerId] of participants) {
      if (peerId === myConnectionId) continue;

      try {
        const offerSdp = await webrtcManager.createOffer(peerId);
        await connection.invoke("SendOffer", roomId, peerId, offerSdp);
      } catch (error) {
        console.error("Failed to create offer:", error);
      }
    }
  },

  toggleCamera: () => {
    const { localStream } = get();
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      set({ isCameraOn: videoTrack.enabled });
    }
  },

  toggleMic: () => {
    const { localStream } = get();
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      set({ isMicOn: audioTrack.enabled });
    }
  },

  setLocalStream: (stream) => {
    const { webrtcManager } = get();
    if (webrtcManager) {
      webrtcManager.setLocalStream(stream);
    }
    set({ localStream: stream });
  },

  addRemoteStream: (peerId, stream) => {
    set((state) => {
      const newParticipants = new Map(state.participants);
      const participant = newParticipants.get(peerId);
      if (participant) {
        newParticipants.set(peerId, { ...participant, stream });
      }
      return { participants: newParticipants };
    });
  },

  removeParticipant: (peerId) => {
    const { webrtcManager } = get();
    if (webrtcManager) {
      webrtcManager.closePeerConnection(peerId);
    }

    set((state) => {
      const newParticipants = new Map(state.participants);
      newParticipants.delete(peerId);
      return { participants: newParticipants };
    });
  },

  toggleViewMode: () => {
    set((state) => ({
      viewMode: state.viewMode === "grid" ? "speaker" : "grid",
    }));
  },

  toggleChat: () => {
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  },

  toggleParticipants: () => {
    set((state) => ({ isParticipantsOpen: !state.isParticipantsOpen }));
  },
}));
