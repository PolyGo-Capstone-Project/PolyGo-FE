"use client";

import {
  Button,
  Input,
  ScrollArea,
  SheetDescription,
  SheetTitle,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { MeetingChatMessage } from "@/types";
import { IconSend } from "@tabler/icons-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  messages: MeetingChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  className?: string;
}

export function ChatPanel({
  messages,
  onSendMessage,
  onClose,
  className,
}: ChatPanelProps) {
  const t = useTranslations("meeting.chat");
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <SheetTitle className="sr-only">{t("title")}</SheetTitle>
      <SheetDescription className="sr-only">
        {t("description") || "Meeting chat messages"}
      </SheetDescription>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t("noMessages")}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(msg.timestamp, "HH:mm")}
                    </span>
                  </div>
                  <div className="bg-secondary/50 rounded-lg px-3 py-2">
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("placeholder")}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputMessage.trim()}
          >
            <IconSend className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
