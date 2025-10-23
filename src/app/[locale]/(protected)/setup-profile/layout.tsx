"use client";

import { useLocale } from "next-intl";

import { AuthLoading } from "@/components/shared/auth-loading";
import { Role } from "@/constants";
import { useAuthGuard, useNewUserGuard } from "@/hooks";

interface SetupProfileLayoutProps {
  children: React.ReactNode;
}

export default function SetupProfileLayout({
  children,
}: SetupProfileLayoutProps) {
  const locale = useLocale();

  // First check if user is authenticated and has User role
  const { isLoading: isCheckingAuth, isAuthorized } = useAuthGuard({
    requiredRole: Role.User,
    redirectTo: `/${locale}/login`,
  });

  // Then check if user is new
  const { isLoading: isCheckingNewUser } = useNewUserGuard();

  // Show loading while checking authorization
  if (isCheckingAuth || isCheckingNewUser) {
    return <AuthLoading message="" />;
  }

  // If not authorized, return null (redirect already handled in hooks)
  if (!isAuthorized) {
    return null;
  }

  // Render setup profile content
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {children}
    </div>
  );
}
