"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  desc: string;
  progressText: string; // ví dụ "0/6"
  wordsLabel: string; // "words"
  continueText: string; // "Continue Playing"
  quitText: string; // "Quit Game"
  onQuit: () => void;
};

export default function QuitDialog({
  open,
  onOpenChange,
  title,
  desc,
  progressText,
  wordsLabel,
  continueText,
  quitText,
  onQuit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="text-sm text-muted-foreground">
          Current progress: {progressText} {wordsLabel} completed
        </div>
        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {continueText}
          </Button>
          <Button variant="destructive" onClick={onQuit}>
            {quitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
