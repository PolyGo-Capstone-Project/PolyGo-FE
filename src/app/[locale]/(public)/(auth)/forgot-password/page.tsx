import { getTranslations } from "next-intl/server";

import { AuthCard } from "@/components";
import ForgotPasswordForm from "@/components/modules/auth/forgot-password-form";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth.forgotPassword");

  return (
    <AuthCard title={t("title")} description={t("description")}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
