"use client";

import { CallModal } from "@/components/modules/call/call-modal";
import { IncomingCallDialog } from "@/components/modules/call/incoming-call-dialog";
import { useCall as useCallHook } from "@/hooks/reusable/use-call";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface CallContextType {
  startVoiceCall: (receiverId: string, receiverName: string) => void;
  startVideoCall: (receiverId: string, receiverName: string) => void;
  endCall: () => void;
  isInCall: boolean;
  currentCallUserId: string | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}

interface CallProviderProps {
  children: ReactNode;
}

export function CallProvider({ children }: CallProviderProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [currentCallUserId, setCurrentCallUserId] = useState<string | null>(
    null
  );
  const [currentCallUserName, setCurrentCallUserName] = useState<string | null>(
    null
  );
  const [currentCallIsVideo, setCurrentCallIsVideo] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    isVideoCall: boolean;
  } | null>(null);

  // Use ref to avoid re-creating callbacks on every render
  const userInfoMapRef = useRef<
    Record<string, { name: string; avatar?: string }>
  >({});

  // ✅ FIX: Use the new useCall hook with WebRTC support
  const callHook = useCallHook({
    // Incoming call event
    onIncomingCall: useCallback((callerId: string, isVideoCall: boolean) => {
      console.log("📞 [CallContext] Incoming call received:", {
        callerId,
        isVideoCall,
      });

      // Get caller info from ref (fallback to ID if name not found)
      const callerInfo = userInfoMapRef.current[callerId] || {
        name: callerId,
      };

      const callData = {
        callerId,
        callerName: callerInfo.name,
        callerAvatar: callerInfo.avatar,
        isVideoCall,
      };

      console.log("📞 [CallContext] Setting incoming call state:", callData);
      setIncomingCall(callData);
    }, []),

    // Call ended event
    onCallEnded: useCallback(() => {
      console.log("📴 [CallContext] Call ended");
      setIsInCall(false);
      setCurrentCallUserId(null);
      setIncomingCall(null);
      toast.info("The call has ended.");
    }, []),

    // Call failed event
    onCallFailed: useCallback((reason: string) => {
      console.log("⚠️ [CallContext] Call failed:", reason);
      setIncomingCall(null);
      toast.error(reason);
    }, []),

    // Call declined event
    onCallDeclined: useCallback(() => {
      console.log("❌ [CallContext] Call declined");
      setIncomingCall(null);
      toast.error("The call was declined.");
    }, []),
  });

  // Start voice call
  const startVoiceCall = useCallback(
    async (receiverId: string, receiverName: string) => {
      if (!callHook.isConnected) {
        toast.error("Not connected to server. Please try again.");
        return;
      }

      try {
        // Store receiver info for later use
        userInfoMapRef.current[receiverId] = { name: receiverName };

        // Set call state
        setCurrentCallUserId(receiverId);
        setCurrentCallUserName(receiverName);
        setCurrentCallIsVideo(false);
        setIsInCall(true);

        // Start the call with WebRTC
        await callHook.startCall(receiverId, false);
      } catch (error: any) {
        toast.error(error.message || "Failed to start call");
        setIsInCall(false);
        setCurrentCallUserId(null);
        setCurrentCallUserName(null);
      }
    },
    [callHook]
  );

  // Start video call
  const startVideoCall = useCallback(
    async (receiverId: string, receiverName: string) => {
      if (!callHook.isConnected) {
        toast.error("Not connected to server. Please try again.");
        return;
      }

      try {
        // Store receiver info for later use
        userInfoMapRef.current[receiverId] = { name: receiverName };

        // Set call state
        setCurrentCallUserId(receiverId);
        setCurrentCallUserName(receiverName);
        setCurrentCallIsVideo(true);
        setIsInCall(true);

        // Start the call with WebRTC
        await callHook.startCall(receiverId, true);
      } catch (error: any) {
        toast.error(error.message || "Failed to start call");
        setIsInCall(false);
        setCurrentCallUserId(null);
        setCurrentCallUserName(null);
      }
    },
    [callHook]
  );

  // End call
  const endCall = useCallback(async () => {
    try {
      // ✅ FIX: Use callHook.endCall which cleans up WebRTC
      await callHook.endCall();
      setIsInCall(false);
      setCurrentCallUserId(null);
      setCurrentCallUserName(null);
    } catch (error: any) {
      console.error("Error ending call:", error);
    }
  }, [callHook]);

  // ✅ FIX: Accept incoming call with WebRTC
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // Set call state
      setIsInCall(true);
      setCurrentCallUserId(incomingCall.callerId);
      setCurrentCallUserName(incomingCall.callerName);
      setCurrentCallIsVideo(incomingCall.isVideoCall);
      setIncomingCall(null);

      // Accept the call with WebRTC
      await callHook.acceptCall();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept call");
      setIncomingCall(null);
      setIsInCall(false);
      setCurrentCallUserId(null);
      setCurrentCallUserName(null);
    }
  }, [incomingCall, callHook]);

  // Decline incoming call
  const declineIncomingCall = useCallback(async () => {
    if (!incomingCall) return;

    try {
      // ✅ This sends decline signal and cleans up
      await callHook.declineCall();
      setIncomingCall(null);
    } catch (error: any) {
      console.error("Error declining call:", error);
      setIncomingCall(null);
    }
  }, [incomingCall, callHook]);

  console.log("🔍 [CallContext] Current render state:", {
    hasIncomingCall: !!incomingCall,
    incomingCallData: incomingCall,
    isInCall,
    currentCallUserId,
    callState: callHook.callState,
  });

  return (
    <CallContext.Provider
      value={{
        startVoiceCall,
        startVideoCall,
        endCall,
        isInCall,
        currentCallUserId,
      }}
    >
      {children}

      {/* Incoming Call Dialog */}
      {incomingCall && (
        <>
          {console.log(
            "🎯 [CallContext] Rendering IncomingCallDialog:",
            incomingCall
          )}
          <IncomingCallDialog
            open={!!incomingCall}
            callerName={incomingCall.callerName}
            callerAvatar={incomingCall.callerAvatar}
            isVideoCall={incomingCall.isVideoCall}
            onAccept={acceptIncomingCall}
            onDecline={declineIncomingCall}
            timeout={30}
          />
        </>
      )}

      {/* Call Modal */}
      <CallModal
        isOpen={isInCall}
        callState={callHook.callState}
        isVideoCall={currentCallIsVideo}
        peerName={currentCallUserName || undefined}
        onEndCall={endCall}
        onToggleMic={callHook.toggleAudio}
        onToggleCamera={callHook.toggleVideo}
      />
    </CallContext.Provider>
  );
}
