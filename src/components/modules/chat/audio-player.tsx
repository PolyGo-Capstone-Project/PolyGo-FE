"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  src: string;
  isOwn: boolean;
}

export function AudioPlayer({ src, isOwn }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const waveform = waveformRef.current;
    if (!audio || !waveform || isLoading) return;

    const rect = waveform.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate waveform bars (simplified visual representation)
  const bars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.sin(i * 0.5) * 20 + 40 + Math.random() * 20;
    return height;
  });

  return (
    <div className="flex items-center gap-2.5 w-full min-w-[240px] max-w-[320px]">
      <audio ref={audioRef} src={src} preload="metadata">
        <track kind="captions" />
      </audio>

      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayPause}
        disabled={isLoading}
        className={cn(
          "size-9 shrink-0 rounded-full transition-all",
          isOwn
            ? "hover:bg-primary-foreground/20 text-primary-foreground"
            : "hover:bg-accent"
        )}
      >
        {isPlaying ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current ml-0.5" />
        )}
      </Button>

      <div className="flex flex-1 flex-col gap-1.5">
        <div
          ref={waveformRef}
          className="relative h-8 cursor-pointer select-none"
          onClick={handleWaveformClick}
        >
          <div className="flex items-center justify-between h-full gap-[2px]">
            {bars.map((height, index) => {
              const isPassed = (index / bars.length) * 100 <= progress;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex-1 rounded-full transition-all",
                    isOwn
                      ? isPassed
                        ? "bg-primary-foreground"
                        : "bg-primary-foreground/30"
                      : isPassed
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                  )}
                  style={{
                    height: `${height}%`,
                    maxHeight: "100%",
                  }}
                />
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "text-[10px] font-medium",
            isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {isPlaying || currentTime > 0
            ? formatTime(currentTime)
            : formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
