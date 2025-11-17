"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMail,
  IconShield,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, Input, Label, Separator } from "@/components/ui";
import { TypeOfVerificationCode } from "@/constants";
import { useForgotPasswordMutation, useSendOTPMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  ForgotPasswordBodySchema,
  ForgotPasswordBodyType,
  SendOTPBodyType,
} from "@/models";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const errorMessages = useTranslations("auth.forgotPassword.errors");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  const forgotPasswordMutation = useForgotPasswordMutation();
  const sendOTPMutation = useSendOTPMutation();

  const resolver = useMemo(
    () =>
      zodResolver(ForgotPasswordBodySchema, {
        error: (issue) => ({
          message: translateForgotPasswordError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const form = useForm<ForgotPasswordBodyType>({
    resolver,
    defaultValues: {
      mail: "",
      otp: "",
      password: "",
      confirmNewPassword: "",
    },
  });

  const watchedMail = form.watch("mail");

  const handleSendOTP = async () => {
    if (!watchedMail) {
      form.setError("mail", {
        type: "manual",
        message: t("otpRequired"),
      });
      return;
    }

    if (sendOTPMutation.isPending || countdown > 0) return;

    try {
      const otpData: SendOTPBodyType = {
        mail: watchedMail,
        verificationType: TypeOfVerificationCode.Forgot_password,
      };

      await sendOTPMutation.mutateAsync(otpData);
      toast.success(t("otpSentSuccess"));
      setOtpSent(true);

      // Start countdown
      setCountdown(120);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
        tError,
      });
    }
  };

  const onSubmit = async (data: ForgotPasswordBodyType) => {
    if (forgotPasswordMutation.isPending) return;

    try {
      const response = await forgotPasswordMutation.mutateAsync(data);
      showSuccessToast(response.payload.message, tSuccess);
      router.push(`/${locale}/login`);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
        tError,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Mail Field with OTP */}
      <div className="space-y-2">
        <Label htmlFor="mail">{t("mailLabel")}</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="mail"
              type="mail"
              placeholder={t("mailPlaceholder")}
              className="pl-10"
              {...form.register("mail")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSendOTP}
            disabled={
              sendOTPMutation.isPending || countdown > 0 || !watchedMail
            }
            className="shrink-0"
          >
            {sendOTPMutation.isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : countdown > 0 ? (
              countdown
            ) : (
              t("sendOTP")
            )}
          </Button>
        </div>
        {form.formState.errors.mail && (
          <p className="text-sm text-destructive">
            {form.formState.errors.mail.message}
          </p>
        )}
        {otpSent && !form.formState.errors.mail && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <IconCheck className="size-4" />
            <span>{t("otpSent")}</span>
          </div>
        )}
      </div>

      {/* OTP Field */}
      <div className="space-y-2">
        <Label htmlFor="otp">{t("otpLabel")}</Label>
        <div className="relative">
          <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="otp"
            type="text"
            placeholder={t("otpPlaceholder")}
            maxLength={6}
            className="pl-10"
            {...form.register("otp")}
          />
        </div>
        {form.formState.errors.otp && (
          <p className="text-sm text-destructive">
            {form.formState.errors.otp.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t("otpHint")}</p>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">{t("newPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("newPasswordPlaceholder")}
            className="pr-10"
            {...form.register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <IconEyeOff className="size-4 text-muted-foreground" />
            ) : (
              <IconEye className="size-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
        {!form.formState.errors.password && form.watch("password") && (
          <p className="text-xs text-muted-foreground">
            {t("newPasswordHint")}
          </p>
        )}
      </div>

      {/* Confirm New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmNewPassword">{t("confirmPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="confirmNewPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPasswordPlaceholder")}
            className="pr-10"
            {...form.register("confirmNewPassword")}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <IconEyeOff className="size-4 text-muted-foreground" />
            ) : (
              <IconEye className="size-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {form.formState.errors.confirmNewPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={forgotPasswordMutation.isPending}
      >
        {forgotPasswordMutation.isPending ? (
          <>
            <IconLoader2 className="mr-2 size-4 animate-spin" />
            {t("resetting")}
          </>
        ) : (
          t("resetButton")
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <Separator />
      </div>

      {/* Back to Login Link */}
      <div className="text-center">
        <Link
          href={`/${locale}/login`}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          {t("backToLogin")}
        </Link>
      </div>
    </form>
  );
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForForgotPassword = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translateForgotPasswordError = (
  issue: ZodIssueForForgotPassword,
  t: Translator
): string => {
  const field = issue.path?.[0];
  const detail = issue as Record<string, any>;

  if (typeof field !== "string") {
    return t("default");
  }

  switch (field) {
    case "mail": {
      if (issue.code === "invalid_type") {
        return t("mail.required");
      }

      // Handle email format validation
      if (issue.code === "invalid_format" && detail.format === "email") {
        return t("mail.invalid");
      }

      // Backward compatibility
      if (issue.code === "invalid_string" && detail.validation === "email") {
        return t("mail.invalid");
      }

      if (issue.code === "too_small") {
        return t("mail.required");
      }

      if (issue.code === "too_big") {
        return t("mail.max", { length: detail.maximum ?? 100 });
      }

      break;
    }
    case "code": {
      if (issue.code === "invalid_type") {
        return t("code.required");
      }

      if (issue.code === "too_small" || issue.code === "too_big") {
        const expectedLength =
          typeof detail.minimum === "number" &&
          typeof detail.maximum === "number"
            ? Math.max(detail.minimum, detail.maximum)
            : (detail.minimum ?? detail.maximum ?? 6);
        return t("code.length", { length: expectedLength });
      }

      break;
    }
    case "password": {
      if (issue.code === "invalid_type") {
        return t("password.required");
      }

      if (issue.code === "too_small") {
        if (detail.minimum && detail.minimum > 1) {
          return t("password.min", { length: detail.minimum });
        }
        return t("password.required");
      }

      if (issue.code === "too_big") {
        return t("password.max", { length: detail.maximum ?? 100 });
      }

      // Handle regex validation error
      // Zod trả về code: "invalid_format" và format: "regex" khi regex fail
      if (issue.code === "invalid_format" && detail.format === "regex") {
        return t("password.format");
      }

      // Backward compatibility: check invalid_string
      if (issue.code === "invalid_string") {
        return t("password.format");
      }

      break;
    }
    case "confirmNewPassword": {
      if (issue.code === "invalid_type") {
        return t("confirmNewPassword.required");
      }

      if (issue.code === "too_small") {
        if (detail.minimum && detail.minimum > 1) {
          return t("confirmNewPassword.min", { length: detail.minimum });
        }
        return t("confirmNewPassword.required");
      }

      if (issue.code === "too_big") {
        return t("confirmNewPassword.max", { length: detail.maximum ?? 100 });
      }

      // Handle custom validation error (password mismatch)
      if (issue.code === "custom") {
        return t("confirmNewPassword.mismatch");
      }

      break;
    }
    default:
      break;
  }

  return t("default");
};
