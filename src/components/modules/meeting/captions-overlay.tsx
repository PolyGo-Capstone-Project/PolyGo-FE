"use client";

import { Button, ScrollArea } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { LanguageSelector } from "./language-selector";

interface TranscriptionMessage {
  id: string;
  speakerId: string;
  senderName: string;
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  timestamp: Date;
}

interface CaptionsOverlayProps {
  transcriptions: TranscriptionMessage[];
  showOriginal?: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  isTranscriptionEnabled: boolean;
  onSourceLanguageChange: (language: string) => void;
  onTargetLanguageChange: (language: string) => void;
  onClose?: () => void;
}

export function CaptionsOverlay({
  transcriptions,
  showOriginal = false,
  sourceLanguage,
  targetLanguage,
  isTranscriptionEnabled,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onClose,
}: CaptionsOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out empty transcriptions
  const filteredTranscriptions = transcriptions.filter(
    (t) =>
      (t.translatedText && t.translatedText.trim() !== "") ||
      (t.originalText && t.originalText.trim() !== "")
  );

  // Auto-scroll to latest caption (using setTimeout to ensure DOM is updated)
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

    // Small delay to ensure content is rendered
    setTimeout(scrollToBottom, 100);
  }, [filteredTranscriptions]);

  return (
    <div className="border-t border-border bg-background">
      {/* Header with Language Selector and Close */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            onSourceLanguageChange={onSourceLanguageChange}
            onTargetLanguageChange={onTargetLanguageChange}
            isTranscriptionEnabled={isTranscriptionEnabled}
          />
        </div>

        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Captions ScrollArea */}
      <ScrollArea className="h-32" ref={scrollRef}>
        <div className="px-4 py-2 space-y-2">
          {filteredTranscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No captions yet. Start speaking to see translations...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTranscriptions.map((transcription) => (
                <motion.div
                  key={transcription.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-muted/50 rounded-lg px-4 py-2 border">
                    <div className="flex items-start gap-3">
                      {/* Speaker name */}
                      <p className="text-xs text-muted-foreground font-medium min-w-[80px] pt-0.5">
                        {transcription.senderName}
                      </p>

                      <div className="flex-1">
                        {/* Translated text (main) */}
                        <p className="text-sm leading-tight">
                          {transcription.translatedText ||
                            transcription.originalText}
                        </p>

                        {/* Original text (optional, smaller) */}
                        {showOriginal &&
                          transcription.translatedText &&
                          transcription.translatedText !==
                            transcription.originalText && (
                            <p className="text-muted-foreground text-xs mt-1 italic">
                              {transcription.originalText}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
