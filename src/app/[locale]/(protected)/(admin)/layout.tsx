"use client";

import { useLocale } from "next-intl";

import { AuthLoading } from "@/components/shared/auth-loading";
import { Role } from "@/constants";
import { useAuthGuard } from "@/hooks";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const locale = useLocale();
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRole: Role.Admin,
    redirectTo: `/${locale}/login`,
  });

  // Show loading while checking authorization
  if (isLoading) {
    return <AuthLoading message="" />;
  }

  // If not authorized, return null (redirect already handled in hook)
  if (!isAuthorized) {
    return null;
  }

  // Render admin content
  return (
    <div className="min-h-screen flex flex-col">
      {/* TODO: Add AdminHeader component here when ready */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
