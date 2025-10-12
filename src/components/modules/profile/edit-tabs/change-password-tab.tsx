"use client";

import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field-wrapper";
import { Input } from "@/components/ui/input";

type ChangePasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordTab() {
  const t = useTranslations("profile.editDialog.changePassword");
  const tButton = useTranslations("profile.editDialog");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      // TODO: Show error toast
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      reset();
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Current Password */}
      <Field
        label={t("currentPassword")}
        error={errors.currentPassword?.message}
        required
      >
        <div className="relative">
          <Input
            {...register("currentPassword", {
              required: "Current password is required",
            })}
            type={showCurrentPassword ? "text" : "password"}
            placeholder={t("currentPasswordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrentPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {/* New Password */}
      <Field
        label={t("newPassword")}
        error={errors.newPassword?.message}
        required
      >
        <div className="relative">
          <Input
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            type={showNewPassword ? "text" : "password"}
            placeholder={t("newPasswordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showNewPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {/* Confirm Password */}
      <Field
        label={t("confirmPassword")}
        error={errors.confirmPassword?.message}
        required
      >
        <div className="relative">
          <Input
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPasswordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {/* Password Requirements */}
      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least 8 characters long</li>
          <li>Include uppercase and lowercase letters</li>
          <li>Include at least one number</li>
          <li>Include at least one special character</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tButton("saving") : tButton("save")}
        </Button>
      </div>
    </form>
  );
}
