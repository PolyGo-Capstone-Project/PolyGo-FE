"use client";

import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

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
  showOriginal?: boolean; // Option to show both original and translated
}

export function CaptionsOverlay({
  transcriptions,
  showOriginal = false,
}: CaptionsOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest caption
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  // Only show last 3 captions to avoid clutter
  const recentTranscriptions = transcriptions.slice(-3);

  if (recentTranscriptions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 pointer-events-none z-10">
      <div ref={scrollRef} className="space-y-2 max-h-32 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {recentTranscriptions.map((transcription) => (
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
                    {transcription.translatedText || transcription.originalText}
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
    </div>
  );
}
