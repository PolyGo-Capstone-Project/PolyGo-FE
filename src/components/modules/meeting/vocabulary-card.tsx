"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

interface VocabularyItem {
  word: string;
  meaning: string;
  context: string;
  examples: string[];
}

interface VocabularyCardProps {
  vocabulary: VocabularyItem;
}

export function VocabularyCard({ vocabulary }: VocabularyCardProps) {
  const handlePronounce = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(vocabulary.word);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h5 className="text-lg font-semibold">{vocabulary.word}</h5>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={handlePronounce}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm font-medium text-primary">
            {vocabulary.meaning}
          </p>
        </div>
      </div>

      {vocabulary.context && (
        <div className="mb-3">
          <Badge variant="secondary" className="mb-1 text-xs">
            Context
          </Badge>
          <p className="text-sm italic text-muted-foreground">
            &quot;{vocabulary.context}&quot;
          </p>
        </div>
      )}

      {vocabulary.examples && vocabulary.examples.length > 0 && (
        <div>
          <Badge variant="outline" className="mb-2 text-xs">
            Examples
          </Badge>
          <ul className="space-y-1">
            {vocabulary.examples.map((example, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
