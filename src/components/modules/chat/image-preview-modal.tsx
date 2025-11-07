"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  images,
  initialIndex,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[65vw] max-h-[70vh] p-0 bg-black/85 border-none dark:bg-white/85">
        <div className="relative flex h-[70vh] w-full items-center justify-center">
          {/* Close Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 z-50 size-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>

          {/* Download Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-16 top-4 z-50 size-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={handleDownload}
          >
            <Download className="size-5" />
          </Button>

          {/* Previous Button */}
          {images.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-4 top-1/2 z-50 size-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handlePrevious}
            >
              <ChevronLeft className="size-6" />
            </Button>
          )}

          {/* Image */}
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <div className="relative max-h-full max-w-full">
              <Image
                src={images[currentIndex]}
                alt={`Preview ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-1/2 z-50 size-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={handleNext}
            >
              <ChevronRight className="size-6" />
            </Button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
