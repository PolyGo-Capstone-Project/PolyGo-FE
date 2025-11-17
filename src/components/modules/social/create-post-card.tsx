"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost, useUploadMultipleMediaMutation } from "@/hooks";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Author = { id: string; name: string; avatar: string; initials: string };

type Props = {
  t: ReturnType<typeof import("next-intl").useTranslations>;
  currentUserAuthor: Author;
};

export default function CreatePostCard({ t, currentUserAuthor }: Props) {
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

      // Reset form
      setPostContent("");
      setSelectedImages([]);
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Post created successfully");
    } catch (error: any) {
      console.error("Failed to create post:", error);
      toast.error(error?.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={currentUserAuthor.avatar} />
            <AvatarFallback>{currentUserAuthor.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder={t("createPost.placeholder")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="mb-2 border-none bg-muted text-sm sm:mb-3 sm:text-base min-h-[60px] resize-none"
              rows={3}
            />

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-0.5 sm:gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || selectedImages.length >= 10}
                  type="button"
                >
                  <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("createPost.photoButton")}
                  </span>
                  {selectedImages.length > 0 && (
                    <span className="ml-1">({selectedImages.length})</span>
                  )}
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handlePostSubmit}
                disabled={
                  (!postContent.trim() && selectedImages.length === 0) ||
                  isUploading
                }
                type="button"
              >
                {isUploading
                  ? t("createPost.posting")
                  : t("createPost.postButton")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
