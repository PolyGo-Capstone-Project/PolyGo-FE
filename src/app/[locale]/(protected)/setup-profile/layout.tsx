"use client";

import { AuthLoading } from "@/components/shared/auth-loading";
import { Role } from "@/constants";
import { useAuthGuard, useAuthStore, useNewUserGuard } from "@/hooks";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

interface SetupProfileLayoutProps {
  children: React.ReactNode;
}

export default function SetupProfileLayout({
  children,
}: SetupProfileLayoutProps) {
  const locale = useLocale();
  const [isNewUserChecked, setIsNewUserChecked] = useState(false);
  const [isNewUserFromStorage, setIsNewUserFromStorage] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("isNewUser") === "true";
    setIsNewUserFromStorage(stored);
    setIsNewUserChecked(true);
  }, []);

  // Get isNewUser from Zustand store
  const isNewUserFromStore = useAuthStore((state) => state.isNewUser);
  const isNewUser = isNewUserFromStore || isNewUserFromStorage;

  // Wait for initial sessionStorage check before anything else
  if (!isNewUserChecked) {
    return <AuthLoading message="" />;
  }

  // If user is new, render setup profile directly without auth checks
  if (isNewUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        {children}
      </div>
    );
  }

  // Only for non-new users: check auth and newUserGuard
  return (
    <AuthenticatedSetupProfile locale={locale}>
      {children}
    </AuthenticatedSetupProfile>
  );
}

// Separate component for authenticated flow to avoid hook rules violation
function AuthenticatedSetupProfile({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { isLoading: isCheckingAuth, isAuthorized } = useAuthGuard({
    requiredRole: Role.User,
    redirectTo: `/${locale}/login`,
  });

  const { isLoading: isCheckingNewUser } = useNewUserGuard();

  if (isCheckingAuth || isCheckingNewUser) {
    return <AuthLoading message="" />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      {children}
    </div>
  );
}
