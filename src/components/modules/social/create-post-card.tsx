"use client";

import { MDXEditorWrapper } from "@/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePost, useUploadMultipleMediaMutation } from "@/hooks";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Author = { id: string; name: string; avatar: string; initials: string };

type Props = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  currentUserAuthor: Author;
};

export default function CreatePostCard({ t, currentUserAuthor }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPostMutation = useCreatePost();
  const uploadMediaMutation = useUploadMultipleMediaMutation();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Some files were not images and were skipped");
    }

    // Limit to 10 images total
    const remainingSlots = 10 - selectedImages.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.error("Maximum 10 images allowed per post");
    }

    // Create preview URLs
    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...filesToAdd]);
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async () => {
    const text = postContent.trim();
    if (!text && selectedImages.length === 0) {
      toast.error("Post must have content or images");
      return;
    }

    setIsUploading(true);

    try {
      let imageUrls: string[] = [];

      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadResult = await uploadMediaMutation.mutateAsync({
          files: selectedImages,
          addUniqueName: true,
        });

        if (uploadResult.payload?.data) {
          imageUrls = uploadResult.payload.data;
        }
      }

      // Create post
      await createPostMutation.mutateAsync({
        content: text,
        imageUrls,
      });

      // Reset form and close modal
      setPostContent("");
      setSelectedImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsModalOpen(false);

      toast.success("Post created successfully");
    } catch (error: any) {
      console.error("Failed to create post:", error);
      toast.error(error?.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card className="mb-4 sm:mb-6 hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3 items-center">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-primary/10">
              <AvatarImage src={currentUserAuthor.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {currentUserAuthor.initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              className="flex-1 justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all h-10 sm:h-11"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="text-sm sm:text-base">
                {t("createPost.placeholder")}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => {
                setIsModalOpen(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {t("createPost.title")}
            </DialogTitle>
            <DialogDescription>{t("createPost.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/10">
                <AvatarImage src={currentUserAuthor.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {currentUserAuthor.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  {currentUserAuthor.name}
                </p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>
            </div>

            <MDXEditorWrapper
              value={postContent}
              onChange={(value) => setPostContent(value)}
              placeholder={t("createPost.placeholder")}
              minHeight="250px"
              className="border-0"
            />

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-accent/30">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square group rounded-lg overflow-hidden"
                    >
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex items-center justify-between border rounded-lg p-3 bg-accent/20">
              <p className="text-sm font-medium">Add to your post</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || selectedImages.length >= 10}
                type="button"
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Camera className="h-5 w-5 mr-2" />
                Photo
                {selectedImages.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {selectedImages.length}
                  </span>
                )}
              </Button>
            </div>

            <Button
              className="w-full h-11 text-base font-semibold"
              onClick={handlePostSubmit}
              disabled={
                (!postContent.trim() && selectedImages.length === 0) ||
                isUploading
              }
              type="button"
            >
              {isUploading ? (
                <>
                  <span className="mr-2">Posting...</span>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </>
              ) : (
                t("createPost.postButton")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
