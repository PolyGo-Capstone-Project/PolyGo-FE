"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Input } from "@/components";
import { useChangePasswordMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { ChangePasswordBodySchema, ChangePasswordBodyType } from "@/models";

export function ChangePasswordTab() {
  const t = useTranslations("profile.editDialog.changePassword");
  const tButton = useTranslations("profile.editDialog");
  const errorMessages = useTranslations(
    "profile.editDialog.errors.changePassword"
  );
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useChangePasswordMutation();

  const resolver = useMemo(
    () =>
      zodResolver(ChangePasswordBodySchema, {
        error: (issue) => ({
          message: translateChangePasswordError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm<ChangePasswordBodyType>({
    resolver,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return;
    try {
      const result = await changePasswordMutation.mutateAsync(data);
      showSuccessToast(
        result.payload?.message || tSuccess("ChangePassword"),
        tSuccess
      );
      reset();
    } catch (error: any) {
      handleErrorApi({
        error,
        setError,
        tError,
      });
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
        <Button type="submit" disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending
            ? tButton("saving")
            : tButton("save")}
        </Button>
      </div>
    </form>
  );
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForChangePassword = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translateChangePasswordError = (
  issue: ZodIssueForChangePassword,
  t: Translator
): string => {
  const field = issue.path?.[0];
  const detail = issue as Record<string, any>;

  if (typeof field !== "string") {
    return t("default");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  const handlePasswordField = (fieldName: string) => {
    if (issue.code === "invalid_type") {
      return t(`${fieldName}.required`);
    }

    if (issue.code === "too_small") {
      if (detail.minimum && detail.minimum > 1) {
        return t(`${fieldName}.min`, { length: detail.minimum });
      }
      return t(`${fieldName}.required`);
    }

    if (issue.code === "too_big") {
      return t(`${fieldName}.max`, { length: detail.maximum ?? 100 });
    }

    // Handle regex validation error
    if (issue.code === "invalid_format" && detail.format === "regex") {
      return t(`${fieldName}.format`);
    }

    // Backward compatibility: check invalid_string
    if (issue.code === "invalid_string") {
      return t(`${fieldName}.format`);
    }

    return null;
  };

  switch (field) {
    case "currentPassword": {
      const result = handlePasswordField("currentPassword");
      if (result) return result;
      break;
    }
    case "newPassword": {
      const result = handlePasswordField("newPassword");
      if (result) return result;
      break;
    }
    case "confirmPassword": {
      const result = handlePasswordField("confirmPassword");
      if (result) return result;

      // Handle mismatch error
      if (issue.code === "custom") {
        return t("confirmPassword.mismatch");
      }

      break;
    }
    default:
      break;
  }

  return t("default");
};
