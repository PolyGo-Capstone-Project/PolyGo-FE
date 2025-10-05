"use client";

import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMail,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Input, Label, Separator } from "@/components/ui";
import { useAuthStore, useSearchParamsLoader } from "@/hooks";
// import { useLoginMutation } from "@/hooks/query/use-auth";
import { LoginBodyType } from "@/models";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const clearTokens = searchParams?.get("clearTokens");
  // const loginMutation = useLoginMutation();
  const [loginMutation] = [{ isPending: false }]; // Placeholder for loginMutation
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const setRole = useAuthStore((state) => state.setRole);
  // const setSocket = useAuthStore((state) => state.setSocket);
  const form = useForm<LoginBodyType>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (clearTokens) {
      setRole();
    }
  }, [clearTokens, setRole]);

  const onSubmit = async (data: LoginBodyType) => {
    // if (loginMutation.isPending) return;
    // try {
    //   const result = await loginMutation.mutateAsync(data);
    //   toast.success("Đăng nhập thành công!");
    //   const role = decodeToken(result.payload.data.accessToken).roleName;
    //   setRole(role);
    //   // setSocket(generateSocketInstance(result.payload.data.accessToken));
    //   router.push("/manage/dashboard");
    // } catch (error: any) {
    //   handleErrorApi({
    //     error,
    //     setError: form.setError,
    //   });
    // }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <div className="relative">
          <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="pl-10"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
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

      {/* Forgot Password Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="remember" className="text-sm text-muted-foreground">
            {t("rememberMe")}
          </Label>
        </div>
        <Link
          href={`/${locale}/forgot-password`}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {t("forgotPassword")}
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <IconLoader2 className="mr-2 size-4 animate-spin" />
            {t("loggingIn")}
          </>
        ) : (
          t("loginButton")
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
        disabled={loginMutation.isPending || isGoogleLoading}
        // onClick={initiateGoogleLogin}
      >
        {isGoogleLoading ? (
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
        {isGoogleLoading ? t("connecting") : t("googleLogin")}
      </Button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t("registerNow")}
          </Link>
        </p>
      </div>
    </form>
  );
}
