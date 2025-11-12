"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CallAcceptedData,
  CallDeclinedData,
  CallFailedData,
  IncomingCallData,
  MediaStateUpdate,
  useUserCommunicationHub,
} from "./use-communication-hub";

// ==================== ICE SERVERS CONFIG ====================
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

// ==================== TYPES ====================
export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connected"
  | "ended"
  | "failed"
  | "declined";

export interface CallState {
  status: CallStatus;
  isVideoCall: boolean;
  peerId: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localAudioEnabled: boolean;
  localVideoEnabled: boolean;
  remoteAudioEnabled: boolean;
  remoteVideoEnabled: boolean;
}

interface UseCallOptions {
  onIncomingCall?: (callerId: string, isVideoCall: boolean) => void;
  onCallEnded?: () => void;
  onCallFailed?: (reason: string) => void;
  onCallDeclined?: () => void;
}

interface ExtendedRTCPeerConnection extends RTCPeerConnection {
  _pendingRemoteCandidates?: RTCIceCandidateInit[];
  _applyPendingCandidates?: () => Promise<void>;
}

// ==================== HOOK ====================
export const useCall = (options?: UseCallOptions) => {
  // WebRTC State
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    isVideoCall: false,
    peerId: null,
    localStream: null,
    remoteStream: null,
    localAudioEnabled: true,
    localVideoEnabled: true,
    remoteAudioEnabled: true,
    remoteVideoEnabled: true,
  });

  // Refs
  const peerConnectionRef = useRef<ExtendedRTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const makingOfferRef = useRef<boolean>(false);
  const ignoreOfferRef = useRef<boolean>(false);
  const isCallerRef = useRef<boolean>(false); // Track if we initiated the call

  // ==================== COMMUNICATION HUB ====================
  const communicationHub = useUserCommunicationHub({
    // Handle incoming call
    onIncomingCall: (data: IncomingCallData) => {
      console.log(
        `📞 [Call] Incoming ${data.isVideoCall ? "video" : "voice"} call from:`,
        data.callerId
      );

      setCallState((prev) => ({
        ...prev,
        status: "ringing",
        isVideoCall: data.isVideoCall,
        peerId: data.callerId,
      }));

      options?.onIncomingCall?.(data.callerId, data.isVideoCall);
    },

    // Handle call accepted
    onCallAccepted: async (data: CallAcceptedData) => {
      console.log("✅ [Call] Call accepted by:", data.userId);

      // Don't set status to "connected" yet - wait for WebRTC connection
      // Status will be set to "connected" in onconnectionstatechange handler
      // Keep status as "calling" while WebRTC connection is being established

      // Only initialize WebRTC if we are the CALLER
      // Receiver already initialized WebRTC in acceptCall()
      if (isCallerRef.current) {
        console.log("[Call] 📞 We are caller, initializing WebRTC...");
        // Use the current peerId from state (the person we called)
        if (callState.peerId) {
          await initializeWebRTCConnection(
            callState.peerId,
            callState.isVideoCall
          );
        }
      } else {
        console.log(
          "[Call] 📲 We are receiver, WebRTC already initialized in acceptCall()"
        );
      }
    },

    // Handle call declined
    onCallDeclined: (data: CallDeclinedData) => {
      console.log("❌ [Call] Call declined by:", data.userId);

      cleanupCall();
      setCallState((prev) => ({
        ...prev,
        status: "declined",
        peerId: null,
      }));

      options?.onCallDeclined?.();
    },

    // Handle call failed
    onCallFailed: (data: CallFailedData) => {
      console.log("⚠️ [Call] Call failed:", data.reason);

      cleanupCall();
      setCallState((prev) => ({
        ...prev,
        status: "failed",
        peerId: null,
      }));

      options?.onCallFailed?.(data.reason);
    },

    // Handle call ended
    onCallEnded: () => {
      console.log("📴 [Call] Call ended");

      cleanupCall();
      setCallState((prev) => ({
        ...prev,
        status: "ended",
        peerId: null,
      }));

      options?.onCallEnded?.();
    },

    // Handle media state update
    onMediaStateUpdate: (data: MediaStateUpdate) => {
      console.log(
        `🎤📹 [Call] Media state update from ${data.userId}: mic=${data.micOn}, cam=${data.camOn}`
      );

      setCallState((prev) => ({
        ...prev,
        remoteAudioEnabled: data.micOn,
        remoteVideoEnabled: data.camOn,
      }));
    },

    // ==================== WEBRTC SIGNALING ====================
    onReceiveOffer: async (sdp: string) => {
      console.log("📨 [WebRTC] Received offer");
      await handleReceiveOffer(sdp);
    },

    onReceiveAnswer: async (sdp: string) => {
      console.log("📨 [WebRTC] Received answer");
      await handleReceiveAnswer(sdp);
    },

    onReceiveIceCandidate: async (candidate: string) => {
      console.log("📨 [WebRTC] Received ICE candidate");
      await handleReceiveIceCandidate(candidate);
    },
  });

  // ==================== WEBRTC HELPERS ====================

  // Get local media stream
  const getLocalStream = useCallback(
    async (isVideoCall: boolean): Promise<MediaStream> => {
      if (localStreamRef.current) {
        return localStreamRef.current;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideoCall,
        });

        localStreamRef.current = stream;
        setCallState((prev) => ({
          ...prev,
          localStream: stream,
        }));

        console.log(
          "[Media] ✓ Got local stream with tracks:",
          stream.getTracks().map((t) => t.kind)
        );
        return stream;
      } catch (error) {
        console.error("[Media] ✗ getUserMedia error:", error);
        throw error;
      }
    },
    []
  );

  // Create peer connection
  const createPeerConnection = useCallback(
    (peerId: string): ExtendedRTCPeerConnection => {
      console.log("[PC] Creating new peer connection for:", peerId);

      const pc = new RTCPeerConnection({
        iceServers: DEFAULT_ICE_SERVERS,
      }) as ExtendedRTCPeerConnection;

      pc._pendingRemoteCandidates = [];

      // Apply pending ICE candidates
      pc._applyPendingCandidates = async () => {
        while (
          pc._pendingRemoteCandidates &&
          pc._pendingRemoteCandidates.length > 0
        ) {
          const candidate = pc._pendingRemoteCandidates.shift();
          if (candidate) {
            try {
              await pc.addIceCandidate(candidate);
              console.log("[PC] ✓ Applied queued ICE candidate");
            } catch (error) {
              console.warn(
                "[PC] ✗ Failed to apply queued ICE candidate",
                error
              );
            }
          }
        }
      };

      // ICE candidate handler
      pc.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("[PC] ICE gathering complete");
          return;
        }

        const candidateJson = JSON.stringify(event.candidate);
        communicationHub
          .sendIceCandidate(peerId, candidateJson)
          .catch((err) =>
            console.error("[PC] ✗ Failed to send ICE candidate:", err)
          );
      };

      // Track handler
      pc.ontrack = (event) => {
        console.log(
          "[PC] ✓ ontrack - tracks:",
          event.streams[0].getTracks().map((t) => `${t.kind}:${t.enabled}`)
        );

        remoteStreamRef.current = event.streams[0];
        setCallState((prev) => ({
          ...prev,
          remoteStream: event.streams[0],
        }));
      };

      // Connection state handlers
      pc.oniceconnectionstatechange = () => {
        console.log("[PC] ICE state:", pc.iceConnectionState);

        if (pc.iceConnectionState === "disconnected") {
          console.log("[PC] ⚠️ ICE disconnected - waiting for reconnection...");
          setTimeout(() => {
            if (pc.iceConnectionState === "disconnected") {
              console.log("[PC] 🔄 Still disconnected, attempting ICE restart");
              pc.restartIce?.();
            }
          }, 3000);
        } else if (pc.iceConnectionState === "failed") {
          console.log("[PC] ⚠️ ICE failed - attempting immediate restart");
          pc.restartIce?.();
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("[PC] Connection state:", pc.connectionState);

        if (pc.connectionState === "connected") {
          setCallState((prev) => ({ ...prev, status: "connected" }));
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          // Inline cleanup instead of calling cleanupCall
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
          if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
          }
          remoteStreamRef.current = null;
          setCallState((prev) => ({ ...prev, status: "failed" }));
        }
      };

      // Perfect Negotiation (Only for caller)
      pc.onnegotiationneeded = async () => {
        // Only caller should create and send offer
        if (!isCallerRef.current) {
          console.log("[PC] ⚠️ Skipping negotiation - we are receiver");
          return;
        }

        try {
          console.log(
            "[PC] 🔄 Negotiation needed - creating offer (as caller)"
          );
          makingOfferRef.current = true;
          await pc.setLocalDescription();

          if (pc.localDescription) {
            await communicationHub.sendOffer(peerId, pc.localDescription.sdp!);
            console.log("[PC] ✓ Sent offer via negotiation (as caller)");
          }
        } catch (err) {
          console.error("[PC] ✗ Negotiation error:", err);
        } finally {
          makingOfferRef.current = false;
        }
      };

      return pc;
    },
    [communicationHub]
  );

  // Initialize WebRTC connection
  const initializeWebRTCConnection = useCallback(
    async (peerId: string, isVideoCall: boolean) => {
      try {
        console.log("[WebRTC] Initializing connection with:", peerId);

        // Get local stream
        const stream = await getLocalStream(isVideoCall);

        // Create peer connection if not exists
        if (!peerConnectionRef.current) {
          peerConnectionRef.current = createPeerConnection(peerId);
        }

        const pc = peerConnectionRef.current;

        // Check if tracks are already added to avoid duplicate senders
        const existingSenders = pc.getSenders();
        const existingTrackIds = new Set(
          existingSenders.map((s) => s.track?.id).filter(Boolean)
        );

        // Add local tracks to peer connection (only if not already added)
        stream.getTracks().forEach((track) => {
          if (!existingTrackIds.has(track.id)) {
            pc.addTrack(track, stream);
            console.log("[PC] ✓ Added", track.kind, "track");
          } else {
            console.log("[PC] ⚠️ Track", track.kind, "already added, skipping");
          }
        });

        console.log("[WebRTC] ✓ Connection initialized");

        // If we are the CALLER, create and send offer immediately
        if (isCallerRef.current) {
          console.log("[WebRTC] 📞 We are caller - creating offer now");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (pc.localDescription) {
              await communicationHub.sendOffer(
                peerId,
                pc.localDescription.sdp!
              );
              console.log("[WebRTC] ✅ Sent offer to receiver");
            }
          } catch (err) {
            console.error("[WebRTC] ✗ Failed to create/send offer:", err);
          }
        }
      } catch (error) {
        console.error("[WebRTC] ✗ Failed to initialize connection:", error);
        throw error;
      }
    },
    [getLocalStream, createPeerConnection, communicationHub]
  );

  // Handle receive offer
  const handleReceiveOffer = useCallback(
    async (sdp: string) => {
      try {
        console.log(
          "[PC] 📨 Handling received offer, isCaller:",
          isCallerRef.current
        );

        // If we are the caller and making an offer, ignore incoming offer (collision)
        if (isCallerRef.current && makingOfferRef.current) {
          console.log("[PC] ⚠️ Ignoring offer - we are caller making offer");
          return;
        }

        // If we are the receiver, process the offer and send answer
        if (!isCallerRef.current) {
          const pc = peerConnectionRef.current;
          if (!pc) {
            console.warn(
              "[PC] ⚠️ No peer connection when receiving offer as receiver"
            );
            return;
          }

          // Add local stream if not already added
          if (!localStreamRef.current && callState.isVideoCall !== undefined) {
            const stream = await getLocalStream(callState.isVideoCall);
            const existingSenders = pc.getSenders();
            const existingTrackIds = new Set(
              existingSenders.map((s) => s.track?.id).filter(Boolean)
            );

            stream.getTracks().forEach((track) => {
              if (!existingTrackIds.has(track.id)) {
                pc.addTrack(track, stream);
                console.log("[PC] ✓ Added", track.kind, "track to answer");
              }
            });
          }

          await pc.setRemoteDescription({ type: "offer", sdp });
          console.log("[PC] ✓ Set remote description (offer)");

          if (pc._applyPendingCandidates) {
            await pc._applyPendingCandidates();
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          if (callState.peerId) {
            await communicationHub.sendAnswer(callState.peerId, answer.sdp!);
            console.log("[PC] ✓ Sent answer as receiver");
          }
        } else {
          // We are caller but not making offer, this is a collision
          console.log("[PC] ⚠️ Offer collision detected - ignoring");
        }
      } catch (error) {
        console.error("[PC] ✗ Failed to handle offer:", error);
      }
    },
    [getLocalStream, callState.isVideoCall, callState.peerId, communicationHub]
  );

  // Handle receive answer
  const handleReceiveAnswer = useCallback(async (sdp: string) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.warn("[PC] ⚠️ No peer connection when receiving answer");
        return;
      }

      await pc.setRemoteDescription({ type: "answer", sdp });
      console.log("[PC] ✓ Set remote description (answer)");

      if (pc._applyPendingCandidates) {
        await pc._applyPendingCandidates();
      }
    } catch (error) {
      console.error("[PC] ✗ Failed to handle answer:", error);
    }
  }, []);

  // Handle receive ICE candidate
  const handleReceiveIceCandidate = useCallback(
    async (candidateJson: string) => {
      try {
        const candidate = JSON.parse(candidateJson);
        const pc = peerConnectionRef.current;

        if (!pc) {
          console.warn("[PC] ⚠️ No peer connection for ICE candidate");
          return;
        }

        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(candidate);
          console.log("[PC] ✓ Added remote ICE candidate");
        } else {
          pc._pendingRemoteCandidates = pc._pendingRemoteCandidates || [];
          pc._pendingRemoteCandidates.push(candidate);
          console.log("[PC] Queued remote ICE candidate");
        }
      } catch (error) {
        console.error("[PC] ✗ Failed to handle ICE candidate:", error);
      }
    },
    []
  );

  // Cleanup call
  const cleanupCall = useCallback(() => {
    console.log("[Call] 🧹 Cleaning up call...");

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log(`[Media] 🛑 Stopping track: ${track.kind}`);
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Clear remote stream
    remoteStreamRef.current = null;

    // Reset refs
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    isCallerRef.current = false; // Reset caller flag

    console.log("[Call] ✓ Cleanup complete");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, [cleanupCall]);

  // ==================== PUBLIC METHODS ====================

  /**
   * Start a call to another user
   */
  const startCall = useCallback(
    async (userId: string, isVideoCall: boolean) => {
      try {
        console.log(
          `📞 [Call] Starting ${isVideoCall ? "video" : "voice"} call to:`,
          userId
        );

        // Mark as caller
        isCallerRef.current = true;

        setCallState((prev) => ({
          ...prev,
          status: "calling",
          isVideoCall,
          peerId: userId,
        }));

        // Get local stream first
        await getLocalStream(isVideoCall);

        // Call via SignalR
        await communicationHub.startCall(userId, isVideoCall);

        console.log("[Call] ✓ Call initiated");
      } catch (error) {
        console.error("[Call] ✗ Failed to start call:", error);
        setCallState((prev) => ({
          ...prev,
          status: "failed",
          peerId: null,
        }));
        throw error;
      }
    },
    [communicationHub, getLocalStream]
  );

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(async () => {
    try {
      if (!callState.peerId) {
        throw new Error("No caller ID found");
      }

      console.log("✅ [Call] Accepting call from:", callState.peerId);

      // Mark as receiver (not caller)
      isCallerRef.current = false;

      // Get local stream
      await getLocalStream(callState.isVideoCall);

      // Initialize WebRTC connection (receiver initializes here, but won't create offer)
      await initializeWebRTCConnection(callState.peerId, callState.isVideoCall);

      // Respond to call via SignalR (this tells caller we accepted)
      await communicationHub.respondCall(callState.peerId, true);

      // Don't set status to "connected" yet - wait for WebRTC connection
      // Status will be set when onconnectionstatechange fires

      console.log("[Call] ✓ Call accepted - waiting for offer from caller");
    } catch (error) {
      console.error("[Call] ✗ Failed to accept call:", error);
      throw error;
    }
  }, [
    callState.peerId,
    callState.isVideoCall,
    communicationHub,
    getLocalStream,
    initializeWebRTCConnection,
  ]);

  /**
   * Decline an incoming call
   */
  const declineCall = useCallback(async () => {
    try {
      if (!callState.peerId) {
        throw new Error("No caller ID found");
      }

      console.log("❌ [Call] Declining call from:", callState.peerId);

      await communicationHub.respondCall(callState.peerId, false);

      cleanupCall();
      setCallState((prev) => ({
        ...prev,
        status: "idle",
        peerId: null,
      }));

      console.log("[Call] ✓ Call declined");
    } catch (error) {
      console.error("[Call] ✗ Failed to decline call:", error);
      throw error;
    }
  }, [callState.peerId, communicationHub, cleanupCall]);

  /**
   * End the current call
   */
  const endCall = useCallback(async () => {
    try {
      console.log("📴 [Call] Ending call");

      await communicationHub.endCall();

      cleanupCall();
      setCallState((prev) => ({
        ...prev,
        status: "ended",
        peerId: null,
      }));

      console.log("[Call] ✓ Call ended");
    } catch (error) {
      console.error("[Call] ✗ Failed to end call:", error);
      throw error;
    }
  }, [communicationHub, cleanupCall]);

  /**
   * Toggle microphone
   */
  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return undefined;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newState = audioTrack.enabled;

      setCallState((prev) => ({
        ...prev,
        localAudioEnabled: newState,
      }));

      // Notify peer
      communicationHub.toggleMedia(newState, callState.localVideoEnabled);

      console.log("[Media]", newState ? "✓ Unmuted" : "✗ Muted", "microphone");
      return newState;
    }
    return undefined;
  }, [communicationHub, callState.localVideoEnabled]);

  /**
   * Toggle camera
   */
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return undefined;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) {
      console.warn("[Media] ⚠️ No video track available");
      return undefined;
    }

    try {
      // Case 1: Disabling video
      if (videoTrack.enabled) {
        console.log("[Media] 🔴 Disabling video...");
        videoTrack.enabled = false;
        setCallState((prev) => ({
          ...prev,
          localVideoEnabled: false,
        }));

        await communicationHub.toggleMedia(callState.localAudioEnabled, false);
        console.log("[Media] ✓ Video disabled");
        return false;
      }

      // Case 2: Enabling video
      console.log("[Media] 🟢 Enabling video...");

      // Check if track is still live
      if (videoTrack.readyState === "live") {
        videoTrack.enabled = true;
        setCallState((prev) => ({
          ...prev,
          localVideoEnabled: true,
        }));

        await communicationHub.toggleMedia(callState.localAudioEnabled, true);
        console.log("[Media] ✓ Video enabled");
        return true;
      }

      // Track ended, need new stream
      console.log("[Media] 🔄 Track ended, getting new video stream...");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error("Failed to get video track from new stream");
      }

      // Stop old track
      videoTrack.stop();

      // Get audio tracks from current stream
      const audioTracks = localStreamRef.current.getAudioTracks();

      // Create new combined stream
      const combinedStream = new MediaStream();
      audioTracks.forEach((track) => combinedStream.addTrack(track));
      combinedStream.addTrack(newVideoTrack);

      // Update peer connection tracks
      const pc = peerConnectionRef.current;
      if (pc) {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
          console.log("[PC] ✓ Replaced video track");
        }
      }

      // Update refs and state
      localStreamRef.current = combinedStream;
      setCallState((prev) => ({
        ...prev,
        localStream: combinedStream,
        localVideoEnabled: true,
      }));

      await communicationHub.toggleMedia(callState.localAudioEnabled, true);
      console.log("[Media] ✓ Video re-enabled successfully");
      return true;
    } catch (error) {
      console.error("[Media] ✗ toggleVideo error:", error);
      setCallState((prev) => ({
        ...prev,
        localVideoEnabled: false,
      }));
      return undefined;
    }
  }, [communicationHub, callState.localAudioEnabled]);

  return {
    // State
    callState,
    isConnected: communicationHub.isConnected,

    // Methods
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};
