import { useTranslations } from "next-intl";

import { AuthCard, RegisterForm } from "@/components";

export default function RegisterPage() {
  const t = useTranslations("auth.register");

  return (
    <AuthCard title={t("title")} description={t("description")}>
      <RegisterForm />
    </AuthCard>
  );
}
