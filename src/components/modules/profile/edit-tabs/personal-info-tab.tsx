"use client";

import { IconUpload } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field-wrapper";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthMe } from "@/hooks/query/use-auth";

type PersonalInfoFormData = {
  name: string;
  introduction: string;
  gender: string;
};

export function PersonalInfoTab() {
  const t = useTranslations("profile.editDialog.personalInfo");
  const tCommon = useTranslations("common.gender");
  const tButton = useTranslations("profile.editDialog");

  const { data: authData } = useAuthMe();
  const user = authData?.payload.data;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    defaultValues: {
      name: user?.name || "",
      introduction: user?.introduction || "",
      gender: user?.gender || "Male",
    },
  });

  const gender = watch("gender");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PersonalInfoFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error updating personal info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
          <AvatarImage src={avatarPreview || undefined} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <input
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
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <IconUpload className="mr-2 h-4 w-4" />
            {t("changeAvatar")}
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

      {/* Introduction */}
      <Field label={t("introduction")} error={errors.introduction?.message}>
        <Textarea
          {...register("introduction")}
          placeholder={t("introductionPlaceholder")}
          rows={4}
          className="resize-none"
        />
      </Field>

      {/* Gender */}
      <Field label={t("gender")} error={errors.gender?.message} required>
        <Select value={gender} onValueChange={(val) => setValue("gender", val)}>
          <SelectTrigger>
            <SelectValue placeholder={t("genderPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">{tCommon("Male")}</SelectItem>
            <SelectItem value="Female">{tCommon("Female")}</SelectItem>
            <SelectItem value="Other">{tCommon("Other")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tButton("saving") : tButton("save")}
        </Button>
      </div>
    </form>
  );
}
