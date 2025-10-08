"use client";

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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, Input, Label, Separator } from "@/components/ui";
import { TypeOfVerificationCode } from "@/constants";
// import { useForgotPasswordMutation, useSendOTPMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { ForgotPasswordBodyType, SendOTPBodyType } from "@/models";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // const forgotPasswordMutation = useForgotPasswordMutation();
  // const sendOTPMutation = useSendOTPMutation();
  const forgotPasswordMutation = {
    isPending: false,
    mutateAsync: async (data: any) => ({
      payload: { message: "Mock forgot password success" },
    }),
  };
  const sendOTPMutation = {
    isPending: false,
    mutateAsync: async (data: any) => ({}),
  };

  const form = useForm<ForgotPasswordBodyType>({
    defaultValues: {
      mail: "",
      code: "",
      newPassword: "",
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
        verificationType: TypeOfVerificationCode.FORGOT_PASSWORD,
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
        <Label htmlFor="code">{t("otpLabel")}</Label>
        <div className="relative">
          <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="code"
            type="text"
            placeholder={t("otpPlaceholder")}
            maxLength={6}
            className="pl-10"
            {...form.register("code")}
          />
        </div>
        {form.formState.errors.code && (
          <p className="text-sm text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t("otpHint")}</p>
      </div>

      {/* New Password Field */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">{t("newPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder={t("newPasswordPlaceholder")}
            className="pr-10"
            {...form.register("newPassword")}
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
        {form.formState.errors.newPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.newPassword.message}
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
