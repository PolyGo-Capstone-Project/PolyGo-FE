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
import { Image as ImageIcon, Loader2, Send, Smile, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState } from "react";

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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isBusy = disabled || isSending || isUploading;

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
      </div>
    </div>
  );
}
