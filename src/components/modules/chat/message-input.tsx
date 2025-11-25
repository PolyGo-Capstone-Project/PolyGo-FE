"use client";

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components";
import { showErrorToast } from "@/lib";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Image as ImageIcon,
  Loader2,
  Mic,
  Send,
  Smile,
  Square,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";

interface MessageInputProps {
  onSendText: (content: string) => Promise<void> | void;
  onSendImages: (files: File[]) => Promise<void> | void;
  onSendAudio: (file: File) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageInput({
  onSendText,
  onSendImages,
  onSendAudio,
  disabled = false,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const tError = useTranslations("chat.error");
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isBusy = disabled || isSending || isUploading || isRecording;

  const handleSendMessage = async () => {
    const hasMessage = message.trim();
    const hasImages = selectedImages.length > 0;

    if ((!hasMessage && !hasImages) || isBusy) return;

    try {
      // Send images first if any
      if (hasImages) {
        setIsUploading(true);
        await onSendImages(selectedImages);

        // Clear previews
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setSelectedImages([]);
        setImagePreviews([]);
        setIsUploading(false);
      }

      // Then send text message if any
      if (hasMessage) {
        setIsSending(true);
        await onSendText(message.trim());
        setMessage("");
        setIsSending(false);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      if (hasImages) {
        showErrorToast("uploadImage", tError);
      } else {
        showErrorToast("sendMessage", tError);
      }
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setEmojiPickerOpen(false);
  };

  const handleImageButtonClick = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (!files.length) {
      return;
    }

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));

    setSelectedImages(files);
    setImagePreviews(previews);
    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendImages = async () => {
    if (!selectedImages.length || isBusy) return;

    try {
      setIsUploading(true);
      await onSendImages(selectedImages);

      // Clear previews
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Failed to upload images", error);
      showErrorToast("uploadImage", tError);
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (isBusy) return;

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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        try {
          setIsUploading(true);
          await onSendAudio(audioFile);
        } catch (error) {
          console.error("Failed to send audio", error);
          showErrorToast("sendMessage", tError);
        } finally {
          setIsUploading(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording", error);
      showErrorToast("sendMessage", tError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      // Stop all tracks without sending
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

  return (
    <div className="border-t bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Image Preview */}
      {imagePreviews.length > 0 && (
        <div className="border-b p-3 md:p-4">
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative size-20 md:size-24">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                  unoptimized
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
                  type="button"
                >
                  <X className="size-3 md:size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 md:p-4">
        {isRecording ? (
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              size="icon-sm"
              variant="destructive"
              type="button"
              onClick={cancelRecording}
              className="md:size-9"
            >
              <X className="size-4 md:size-5" />
            </Button>
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="size-2 animate-pulse rounded-full bg-destructive" />
              <span className="text-sm font-medium md:text-base">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <Button
              size="icon-sm"
              variant="default"
              type="button"
              onClick={stopRecording}
              className="md:size-9"
            >
              <Square className="size-4 md:size-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 md:gap-2">
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  type="button"
                  disabled={isBusy}
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

            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              disabled={isBusy}
              onClick={handleImageButtonClick}
              className="md:size-9"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin md:size-5" />
              ) : (
                <ImageIcon className="size-4 md:size-5" />
              )}
            </Button>

            <Button
              size="icon-sm"
              variant="ghost"
              type="button"
              disabled={isBusy}
              onClick={startRecording}
              className="md:size-9"
            >
              <Mic className="size-4 md:size-5" />
            </Button>

            <Input
              type="text"
              placeholder={t("messagePlaceholder")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isBusy}
              className="flex-1 text-sm md:text-base"
            />

            <Button
              size="icon-sm"
              onClick={handleSendMessage}
              disabled={
                (!message.trim() && selectedImages.length === 0) || isBusy
              }
              type="button"
              className="md:size-9"
            >
              {isSending || isUploading ? (
                <Loader2 className="size-4 animate-spin md:size-5" />
              ) : (
                <Send className="size-3.5 md:size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
