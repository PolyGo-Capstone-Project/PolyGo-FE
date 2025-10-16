"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Mic, Send, Smile, X } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  onSendMessage: (content: string, type: "text" | "voice" | "emoji") => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim(), "text");
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiPickerOpen(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        onSendMessage(audioUrl, "voice");

        stream.getTracks().forEach((track) => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error(t("error.recordVoice"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      audioChunksRef.current = [];
      setRecordingTime(0);

      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isRecording) {
    return (
      <div className="border-t p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            size="icon-sm"
            variant="destructive"
            onClick={cancelRecording}
            type="button"
            className="md:size-9"
          >
            <X className="size-3.5 md:size-4" />
          </Button>

          <div className="bg-destructive/10 flex flex-1 items-center gap-2 rounded-lg px-3 py-2 md:gap-3 md:px-4 md:py-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="size-1.5 md:size-2 animate-pulse rounded-full bg-red-500" />
              <Mic className="text-destructive size-4 md:size-5" />
            </div>
            <span className="font-mono text-xs md:text-sm">
              {formatRecordingTime(recordingTime)}
            </span>
            <div className="h-6 flex-1 md:h-8">
              <div className="flex h-full items-center gap-0.5">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-primary h-full w-0.5 rounded-full md:w-1"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: "pulse 0.5s ease-in-out infinite",
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            size="icon-sm"
            variant="default"
            onClick={stopRecording}
            type="button"
            className="md:size-9"
          >
            <Send className="size-3.5 md:size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground mt-1.5 text-center text-[10px] md:mt-2 md:text-xs">
          {t("recording")}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t p-3 md:p-4">
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Emoji Picker */}
        <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              disabled={disabled}
              className="md:size-9"
            >
              <Smile className="size-4 md:size-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full border-0 p-0"
            align="start"
            side="top"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={350}
            />
          </PopoverContent>
        </Popover>

        {/* Message Input */}
        <Input
          type="text"
          placeholder={t("messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1 text-sm md:text-base"
        />

        {/* Voice Record or Send Button */}
        {message.trim() ? (
          <Button
            size="icon-sm"
            onClick={handleSendMessage}
            disabled={disabled}
            type="button"
            className="md:size-9"
          >
            <Send className="size-3.5 md:size-4" />
          </Button>
        ) : (
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={startRecording}
            disabled={disabled}
            type="button"
            className="md:size-9"
          >
            <Mic className="size-3.5 md:size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
