"use client";

import { Button, Card, ScrollArea } from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

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
}

export function CaptionsOverlay({
  transcriptions,
  showOriginal = false,
}: CaptionsOverlayProps) {
  const t = useTranslations("meeting.captions");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out empty transcriptions
  const filteredTranscriptions = transcriptions.filter(
    (t) =>
      (t.translatedText && t.translatedText.trim() !== "") ||
      (t.originalText && t.originalText.trim() !== "")
  );

  // Show last 2 when collapsed, all when expanded
  const displayedTranscriptions = isExpanded
    ? filteredTranscriptions
    : filteredTranscriptions.slice(-2);

  // Auto-scroll to latest caption
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions, isExpanded]);

  if (filteredTranscriptions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-10">
      {/* Expand/Collapse button */}
      {filteredTranscriptions.length > 2 && (
        <div className="flex justify-center mb-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-black/60 hover:bg-black/80 text-white border-none h-6 px-3 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {t("collapse")}
              </>
            ) : (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {t("viewPrevious", {
                  count: filteredTranscriptions.length - 2,
                })}
              </>
            )}
          </Button>
        </div>
      )}

      <ScrollArea
        className={`${
          isExpanded ? "h-64" : "max-h-32"
        } ${isExpanded ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        <div ref={scrollRef} className="space-y-2 pr-4">
          <AnimatePresence mode="popLayout">
            {displayedTranscriptions.map((transcription) => (
              <motion.div
                key={transcription.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-black/80 backdrop-blur-sm border-none shadow-lg px-4 py-2 pointer-events-auto">
                  <div className="text-center">
                    {/* Speaker name */}
                    <p className="text-xs text-gray-400 mb-1">
                      {transcription.senderName}
                    </p>

                    {/* Translated text (main) */}
                    <p className="text-white text-lg font-medium leading-tight">
                      {transcription.translatedText ||
                        transcription.originalText}
                    </p>

                    {/* Original text (optional, smaller) */}
                    {showOriginal &&
                      transcription.translatedText &&
                      transcription.translatedText !==
                        transcription.originalText && (
                        <p className="text-gray-400 text-sm mt-1 italic">
                          {transcription.originalText}
                        </p>
                      )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
