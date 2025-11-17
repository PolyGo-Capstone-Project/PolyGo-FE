"use client";

import { IconCamera, IconLoader2, IconUser } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@/components/ui";
import { Gender } from "@/constants";
import { useUploadMediaMutation } from "@/hooks";
import { cn } from "@/lib/utils";

type PersonalInfoStepProps = {
  name: string;
  gender: "Male" | "Female" | "Other" | null;
  introduction: string | null;
  avatarUrl: string | null;
  onNameChange: (name: string) => void;
  onGenderChange: (gender: "Male" | "Female" | "Other" | null) => void;
  onIntroductionChange: (introduction: string | null) => void;
  onAvatarChange: (avatarUrl: string | null) => void;
  errors?: {
    name?: string;
    gender?: string;
    introduction?: string;
    avatarUrl?: string;
  };
};

export function PersonalInfoStep({
  name,
  gender,
  introduction,
  avatarUrl,
  onNameChange,
  onGenderChange,
  onIntroductionChange,
  onAvatarChange,
  errors,
}: PersonalInfoStepProps) {
  const t = useTranslations("setupProfile.steps.personalInfo");
  const tCommon = useTranslations("common");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = useUploadMediaMutation();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("avatarInvalidType"));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("avatarTooLarge"));
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadMutation.mutateAsync({ file });
      onAvatarChange(response.payload.data);
      toast.success(t("avatarUploadSuccess"));
    } catch (error) {
      toast.error(t("avatarUploadError"));
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="size-32">
            <AvatarImage src={avatarUrl || undefined} alt={name || "Avatar"} />
            <AvatarFallback className="bg-primary/10 text-4xl">
              <IconUser className="size-16" />
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="icon"
            variant="default"
            className="absolute bottom-0 right-0 size-10 rounded-full shadow-lg"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <IconLoader2 className="size-5 animate-spin" />
            ) : (
              <IconCamera className="size-5" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{t("avatarLabel")}</p>
          <p className="text-xs text-muted-foreground">{t("avatarHint")}</p>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base">
          {t("nameLabel")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={cn(errors?.name && "border-destructive")}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
        <p className="text-xs text-muted-foreground">{t("nameHint")}</p>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <Label className="text-base">{t("genderLabel")}</Label>
        <RadioGroup
          value={gender || ""}
          onValueChange={(value) =>
            onGenderChange(
              (value || null) as "Male" | "Female" | "Other" | null
            )
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(Gender).map(([key, value]) => (
              <label
                key={key}
                htmlFor={`gender-${key}`}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all hover:shadow-md",
                  gender === value
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={value} id={`gender-${key}`} />
                <span className="font-medium">{tCommon(`gender.${key}`)}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
        {errors?.gender && (
          <p className="text-sm text-destructive">{errors.gender}</p>
        )}
      </div>

      {/* Introduction */}
      <div className="space-y-2">
        <Label htmlFor="introduction" className="text-base">
          {t("introductionLabel")}{" "}
        </Label>
        <Textarea
          id="introduction"
          placeholder={t("introductionPlaceholder")}
          value={introduction || ""}
          onChange={(e) => onIntroductionChange(e.target.value || null)}
          className={cn(
            "min-h-32 resize-none",
            errors?.introduction && "border-destructive"
          )}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t("introductionHint")}
          </p>
          <p className="text-xs text-muted-foreground">
            {introduction?.length || 0}/500
          </p>
        </div>
        {errors?.introduction && (
          <p className="text-sm text-destructive">{errors.introduction}</p>
        )}
      </div>

      {/* Optional Notice */}
      {/* <div className="rounded-xl border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">{t("skipNotice")}</p>
      </div> */}
    </div>
  );
}
