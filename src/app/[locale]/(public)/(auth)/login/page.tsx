import { useTranslations } from "next-intl";

import { AuthCard, LoginForm } from "@/components";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <AuthCard title={t("title")} description={t("description")}>
      <LoginForm />
    </AuthCard>
  );
}
