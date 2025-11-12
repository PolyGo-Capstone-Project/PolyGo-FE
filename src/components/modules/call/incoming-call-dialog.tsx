"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface IncomingCallDialogProps {
  open: boolean;
  callerName: string;
  callerAvatar?: string;
  isVideoCall: boolean;
  onAccept: () => void;
  onDecline: () => void;
  timeout?: number; // Auto-reject timeout in seconds (default: 30)
}

export function IncomingCallDialog({
  open,
  callerName,
  callerAvatar,
  isVideoCall,
  onAccept,
  onDecline,
  timeout = 30,
}: IncomingCallDialogProps) {
  const [timeLeft, setTimeLeft] = useState(timeout);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  console.log("📲 [IncomingCallDialog] Render:", {
    open,
    callerName,
    isVideoCall,
    timeLeft,
  });

  // Play ringtone when dialog opens
  useEffect(() => {
    if (open) {
      // Reset timer
      setTimeLeft(timeout);

      // Play ringtone
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/call-request.mp3");
        audioRef.current.loop = true;
      }

      audioRef.current
        .play()
        .catch((err) => console.error("Failed to play ringtone:", err));

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto decline when time runs out
            onDecline();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Stop ringtone and clear timer when dialog closes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [open, timeout, onDecline]);

  const handleAccept = () => {
    // Stop ringtone
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    onAccept();
  };

  const handleDecline = () => {
    // Stop ringtone
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    onDecline();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleDecline()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isVideoCall ? "Incoming Video Call" : "Incoming Voice Call"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {timeLeft > 0
              ? `Call will be auto-declined in ${timeLeft}s`
              : "Call timed out"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          {/* Caller Avatar with pulse animation */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Avatar className="size-24 relative">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="text-2xl">
                {getInitials(callerName)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Caller Name */}
          <div className="text-center">
            <h3 className="text-xl font-semibold">{callerName}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isVideoCall ? (
                <span className="flex items-center justify-center gap-1">
                  <Video className="size-4" />
                  Video Call
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <Phone className="size-4" />
                  Voice Call
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full size-16"
              onClick={handleDecline}
            >
              <PhoneOff className="size-6" />
            </Button>

            <Button
              size="lg"
              variant="default"
              className="rounded-full size-16 bg-green-600 hover:bg-green-700"
              onClick={handleAccept}
            >
              <Phone className="size-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
