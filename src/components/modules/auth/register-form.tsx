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
// import { useRegisterMutation, useSendOTPMutation } from "@/hooks";
import { handleErrorApi } from "@/lib/utils";
import { RegisterBodyType, SendOTPBodyType } from "@/models";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // const registerMutation = useRegisterMutation();
  // const sendOTPMutation = useSendOTPMutation();
  const registerMutation = {
    isPending: false,
    mutateAsync: async (data: any) => ({
      payload: { message: "Mock register success" },
    }),
  };
  const sendOTPMutation = {
    isPending: false,
    mutateAsync: async (data: any) => ({}),
  };
  //   const { initiateGoogleLogin, isLoading: isGoogleLoading } = useGoogleAuth();

  const form = useForm<RegisterBodyType>({
    defaultValues: {
      name: "",
      mail: "",
      avatar: "",
      password: "",
      confirmPassword: "",
      code: "",
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
        type: TypeOfVerificationCode.REGISTER,
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
      });
    }
  };

  const onSubmit = async (data: RegisterBodyType) => {
    if (registerMutation.isPending) return;

    try {
      const response = await registerMutation.mutateAsync(data);
      toast.success(response.payload.message || t("registerSuccess"));
      router.push("/login");
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Name & Phone Row */}
      <div className="flex gap-4">
        <div className="flex-1 basis-3/5 space-y-2">
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("namePlaceholder")}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
      </div>
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

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("passwordPlaceholder")}
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
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("confirmPasswordPlaceholder")}
            className="pr-10"
            {...form.register("confirmPassword")}
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
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-center space-x-2">
        <input
          id="terms"
          type="checkbox"
          required
          className="size-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
        />
        <Label
          htmlFor="terms"
          className="text-sm text-muted-foreground leading-relaxed"
        >
          {t("agreeToTerms")}
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <>
            <IconLoader2 className="mr-2 size-4 animate-spin" />
            {t("registering")}
          </>
        ) : (
          t("registerButton")
        )}
      </Button>

      {/* Divider */}
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center gap-2"
        // disabled={registerMutation.isPending || isGoogleLoading}
        // onClick={initiateGoogleLogin}
      >
        {/* {isGoogleLoading ? (
          <IconLoader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
        )}
        {isGoogleLoading ? "Đang kết nối..." : "Đăng ký bằng Google"} */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
        >
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        {t("googleRegister")}
      </Button>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link
            href={`/${locale}/login`}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("loginNow")}
          </Link>
        </p>
      </div>
    </form>
  );
}
