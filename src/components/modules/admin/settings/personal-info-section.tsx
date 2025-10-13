"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconUpload } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
} from "@/components";
import { useAuthMe } from "@/hooks/query/use-auth";
import { useUploadMediaMutation } from "@/hooks/query/use-media";
import { useUpdateMeMutation } from "@/hooks/query/use-user";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { UpdateMeBodySchema, UpdateMeBodyType } from "@/models";

export function PersonalInfoSection() {
  const t = useTranslations("admin.settings.personalInfo");
  const tSection = useTranslations("admin.settings.sections");
  const errorMessages = useTranslations("admin.settings.errors");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const queryClient = useQueryClient();
  const { data: authData } = useAuthMe();
  const user = authData?.payload.data;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMeMutation = useUpdateMeMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const resolver = useMemo(
    () =>
      zodResolver(UpdateMeBodySchema, {
        error: (issue) => ({
          message: translatePersonalInfoError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateMeBodyType>({
    resolver,
    defaultValues: {
      name: user?.name || "",
      introduction: user?.introduction || "",
      gender: user?.gender || "Male",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(tError("invalidFileType"));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(tError("fileTooLarge"));
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadMediaMutation.mutateAsync({ file });
      const uploadedUrl = response.payload.data;
      setValue("avatarUrl", uploadedUrl);
      setAvatarPreview(uploadedUrl);
      toast.success(tSuccess("avatarUploaded"));
    } catch (error) {
      handleErrorApi({ error, tError });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return;
    try {
      const result = await updateMeMutation.mutateAsync(data);
      showSuccessToast(result.payload?.message || tSuccess("Update"), tSuccess);
      // Invalidate auth-me query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: setValue as any,
        tError,
      });
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tSection("personalInfo")}</CardTitle>
        <CardDescription>{tSection("personalInfoDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                {isUploading ? t("uploading") : t("changeAvatar")}
              </Button>
            </div>
          </div>

          {/* Name */}
          <Field label={t("name")} error={errors.name?.message} required>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder={t("namePlaceholder")}
            />
          </Field>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMeMutation.isPending}>
              {updateMeMutation.isPending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForPersonalInfo = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translatePersonalInfoError = (
  issue: ZodIssueForPersonalInfo,
  t: Translator
): string => {
  const field = issue.path?.[0];
  const detail = issue as Record<string, any>;

  if (typeof field !== "string") {
    return t("default");
  }

  switch (field) {
    case "name": {
      if (issue.code === "invalid_type") {
        return t("name.required");
      }

      if (issue.code === "too_small") {
        if (detail.minimum && detail.minimum > 1) {
          return t("name.min", { length: detail.minimum });
        }
        return t("name.required");
      }

      if (issue.code === "too_big") {
        return t("name.max", { length: detail.maximum ?? 100 });
      }

      break;
    }
    case "avatarUrl": {
      if (issue.code === "invalid_string") {
        return t("avatarUrl.invalid");
      }

      break;
    }
    default:
      break;
  }

  return t("default");
};
