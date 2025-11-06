"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Image as ImageIcon, Loader2, Send, Smile } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  onSendText: (content: string) => Promise<void> | void;
  onSendImages: (files: File[]) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageInput({
  onSendText,
  onSendImages,
  disabled = false,
}: MessageInputProps) {
  const t = useTranslations("chat");
  const tError = useTranslations("chat.error");
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBusy = disabled || isSending || isUploading;

  const handleSendMessage = async () => {
    if (!message.trim() || isBusy) return;

    try {
      setIsSending(true);
      await onSendText(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast.error(tError("sendMessage"));
    } finally {
      setIsSending(false);
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

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (!files.length) {
      return;
    }

    try {
      setIsUploading(true);
      await onSendImages(files);
    } catch (error) {
      console.error("Failed to upload images", error);
      toast.error(tError("uploadImage"));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="border-t p-3 md:p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

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
          disabled={!message.trim() || isBusy}
          type="button"
          className="md:size-9"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin md:size-5" />
          ) : (
            <Send className="size-3.5 md:size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
