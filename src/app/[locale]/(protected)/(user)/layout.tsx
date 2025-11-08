"use client";

import { useLocale } from "next-intl";

import { UserHeader } from "@/components";
import { UserPresenceProvider } from "@/components/providers";
import { AuthLoading } from "@/components/shared/auth-loading";
import { Role } from "@/constants";
import { ChatNotificationProvider } from "@/contexts/chat-notification-context";
import { useAuthGuard } from "@/hooks";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const locale = useLocale();
  const { isLoading, isAuthorized } = useAuthGuard({
    requiredRole: Role.User,
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

  // Render user content with presence tracking and chat notifications
  return (
    <UserPresenceProvider>
      <ChatNotificationProvider>
        <div className="min-h-screen flex flex-col">
          <UserHeader />
          <main>{children}</main>
        </div>
      </ChatNotificationProvider>
    </UserPresenceProvider>
  );
}
