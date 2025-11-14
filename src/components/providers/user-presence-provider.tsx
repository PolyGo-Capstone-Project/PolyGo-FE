"use client";

import { useUserCommunicationHub } from "@/hooks";
import {
  CallAcceptedData,
  CallDeclinedData,
  CallFailedData,
  IncomingCallData,
  MediaStateUpdate,
} from "@/hooks/reusable/use-communication-hub";
import { UserStatusChangedType } from "@/models/presence.model";
import { HubConnection } from "@microsoft/signalr";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface UserPresenceContextValue {
  // Presence
  isConnected: boolean;
  error: string | null;
  onlineUsers: Set<string>;
  updateOnlineStatus: (userId: string) => Promise<void>;
  getOnlineStatus: (userIds: string[]) => Promise<Record<string, boolean>>;
  isUserOnline: (userId: string) => boolean;
  onUserStatusChanged?: (data: UserStatusChangedType) => void;
  setOnUserStatusChangedCallback: (
    callback: (data: UserStatusChangedType) => void
  ) => void;

  // Call - expose shared connection and methods
  connection: HubConnection | null;
  startCall: (receiverId: string, isVideoCall: boolean) => Promise<void>;
  respondCall: (callerId: string, accepted: boolean) => Promise<void>;
  toggleMedia: (micOn: boolean, camOn: boolean) => Promise<void>;
  endCall: () => Promise<void>;
  sendOffer: (receiverId: string, sdp: string) => Promise<void>;
  sendAnswer: (receiverId: string, sdp: string) => Promise<void>;
  sendIceCandidate: (receiverId: string, candidate: string) => Promise<void>;

  // Call event callbacks
  registerCallCallbacks: (callbacks: {
    onIncomingCall?: (data: IncomingCallData) => void;
    onCallAccepted?: (data: CallAcceptedData) => void;
    onCallDeclined?: (data: CallDeclinedData) => void;
    onCallFailed?: (data: CallFailedData) => void;
    onCallEnded?: () => void;
    onMediaStateUpdate?: (data: MediaStateUpdate) => void;
    onReceiveOffer?: (sdp: string) => void;
    onReceiveAnswer?: (sdp: string) => void;
    onReceiveIceCandidate?: (candidate: string) => void;
  }) => void;
}

const UserPresenceContext = createContext<UserPresenceContextValue | null>(
  null
);

export const useUserCommunicationHubContext = () => {
  const context = useContext(UserPresenceContext);
  if (!context) {
    throw new Error(
      "useUserCommunicationHubContext must be used within UserPresenceProvider"
    );
  }
  return context;
};

interface UserPresenceProviderProps {
  children: ReactNode;
}

/**
 * Global provider for user presence management
 *
 * Usage:
 * 1. Wrap your app with <UserPresenceProvider>
 * 2. Use useUserCommunicationHubContext() to access online users
 *
 * Benefits:
 * - Single WebSocket connection for entire app
 * - Centralized online status management
 * - Automatic updates across all components
 */
export function UserPresenceProvider({ children }: UserPresenceProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const externalCallbackRef = useRef<
    ((data: UserStatusChangedType) => void) | null
  >(null);

  // Store call-related callbacks
  const callCallbacksRef = useRef<{
    onIncomingCall?: (data: IncomingCallData) => void;
    onCallAccepted?: (data: CallAcceptedData) => void;
    onCallDeclined?: (data: CallDeclinedData) => void;
    onCallFailed?: (data: CallFailedData) => void;
    onCallEnded?: () => void;
    onMediaStateUpdate?: (data: MediaStateUpdate) => void;
    onReceiveOffer?: (sdp: string) => void;
    onReceiveAnswer?: (sdp: string) => void;
    onReceiveIceCandidate?: (candidate: string) => void;
  }>({});

  const handleUserStatusChanged = useCallback((data: UserStatusChangedType) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      if (data.isOnline) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });

    // Call external callback if set
    externalCallbackRef.current?.(data);
  }, []);

  // Stable callback wrappers to prevent re-creating connection
  const handleIncomingCall = useCallback(
    (data: IncomingCallData) => callCallbacksRef.current.onIncomingCall?.(data),
    []
  );
  const handleCallAccepted = useCallback(
    (data: CallAcceptedData) => callCallbacksRef.current.onCallAccepted?.(data),
    []
  );
  const handleCallDeclined = useCallback(
    (data: CallDeclinedData) => callCallbacksRef.current.onCallDeclined?.(data),
    []
  );
  const handleCallFailed = useCallback(
    (data: CallFailedData) => callCallbacksRef.current.onCallFailed?.(data),
    []
  );
  const handleCallEnded = useCallback(
    () => callCallbacksRef.current.onCallEnded?.(),
    []
  );
  const handleMediaStateUpdate = useCallback(
    (data: MediaStateUpdate) =>
      callCallbacksRef.current.onMediaStateUpdate?.(data),
    []
  );
  const handleReceiveOffer = useCallback(
    (sdp: string) => callCallbacksRef.current.onReceiveOffer?.(sdp),
    []
  );
  const handleReceiveAnswer = useCallback(
    (sdp: string) => callCallbacksRef.current.onReceiveAnswer?.(sdp),
    []
  );
  const handleReceiveIceCandidate = useCallback(
    (candidate: string) =>
      callCallbacksRef.current.onReceiveIceCandidate?.(candidate),
    []
  );

  // Create a SINGLE shared connection with STABLE callbacks
  const communicationHub = useUserCommunicationHub({
    onUserStatusChanged: handleUserStatusChanged,
    // Use stable callback wrappers instead of inline functions
    onIncomingCall: handleIncomingCall,
    onCallAccepted: handleCallAccepted,
    onCallDeclined: handleCallDeclined,
    onCallFailed: handleCallFailed,
    onCallEnded: handleCallEnded,
    onMediaStateUpdate: handleMediaStateUpdate,
    onReceiveOffer: handleReceiveOffer,
    onReceiveAnswer: handleReceiveAnswer,
    onReceiveIceCandidate: handleReceiveIceCandidate,
  });

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const setOnUserStatusChangedCallback = useCallback(
    (callback: (data: UserStatusChangedType) => void) => {
      externalCallbackRef.current = callback;
    },
    []
  );

  const registerCallCallbacks = useCallback(
    (callbacks: {
      onIncomingCall?: (data: IncomingCallData) => void;
      onCallAccepted?: (data: CallAcceptedData) => void;
      onCallDeclined?: (data: CallDeclinedData) => void;
      onCallFailed?: (data: CallFailedData) => void;
      onCallEnded?: () => void;
      onMediaStateUpdate?: (data: MediaStateUpdate) => void;
      onReceiveOffer?: (sdp: string) => void;
      onReceiveAnswer?: (sdp: string) => void;
      onReceiveIceCandidate?: (candidate: string) => void;
    }) => {
      callCallbacksRef.current = callbacks;
    },
    []
  );

  // Use refs to store the latest communicationHub methods
  // This ensures we always call the most up-to-date methods without closure issues
  const communicationHubRef = useRef(communicationHub);

  // Update ref whenever communicationHub changes
  useEffect(() => {
    communicationHubRef.current = communicationHub;
  }, [communicationHub]);

  // Wrapper methods that use ref to get current connection
  const wrappedStartCall = useCallback(
    async (receiverId: string, isVideoCall: boolean) => {
      return communicationHubRef.current.startCall(receiverId, isVideoCall);
    },
    []
  );

  const wrappedRespondCall = useCallback(
    async (callerId: string, accepted: boolean) => {
      return communicationHubRef.current.respondCall(callerId, accepted);
    },
    []
  );

  const wrappedToggleMedia = useCallback(
    async (micOn: boolean, camOn: boolean) => {
      return communicationHubRef.current.toggleMedia(micOn, camOn);
    },
    []
  );

  const wrappedEndCall = useCallback(async () => {
    return communicationHubRef.current.endCall();
  }, []);

  const wrappedSendOffer = useCallback(
    async (receiverId: string, sdp: string) => {
      return communicationHubRef.current.sendOffer(receiverId, sdp);
    },
    []
  );

  const wrappedSendAnswer = useCallback(
    async (receiverId: string, sdp: string) => {
      return communicationHubRef.current.sendAnswer(receiverId, sdp);
    },
    []
  );

  const wrappedSendIceCandidate = useCallback(
    async (receiverId: string, candidate: string) => {
      return communicationHubRef.current.sendIceCandidate(
        receiverId,
        candidate
      );
    },
    []
  );

  const wrappedUpdateOnlineStatus = useCallback(async (userId: string) => {
    return communicationHubRef.current.updateOnlineStatus(userId);
  }, []);

  const wrappedGetOnlineStatus = useCallback(async (userIds: string[]) => {
    return communicationHubRef.current.getOnlineStatus(userIds);
  }, []);

  const value: UserPresenceContextValue = {
    // Presence
    isConnected: communicationHub.isConnected,
    error: communicationHub.error,
    onlineUsers,
    updateOnlineStatus: wrappedUpdateOnlineStatus,
    getOnlineStatus: wrappedGetOnlineStatus,
    isUserOnline,
    setOnUserStatusChangedCallback,

    // Call - expose shared connection and WRAPPED methods
    connection: communicationHub.connection,
    startCall: wrappedStartCall,
    respondCall: wrappedRespondCall,
    toggleMedia: wrappedToggleMedia,
    endCall: wrappedEndCall,
    sendOffer: wrappedSendOffer,
    sendAnswer: wrappedSendAnswer,
    sendIceCandidate: wrappedSendIceCandidate,
    registerCallCallbacks,
  };

  return (
    <UserPresenceContext.Provider value={value}>
      {children}
    </UserPresenceContext.Provider>
  );
}
