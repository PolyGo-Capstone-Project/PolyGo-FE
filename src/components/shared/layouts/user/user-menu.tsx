"use client";

import { IconCalendarEvent } from "@tabler/icons-react";
import { LogOut, Settings, User, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useAuthStore, useLogout } from "@/hooks";
import { GetUserProfileResType } from "@/models";

export function UserMenu({ user }: { user: GetUserProfileResType }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");
  const { logout, isLoggingOut } = useLogout();
  const isNewUser = useAuthStore((state) => state.isNewUser);
  const handleLogout = () => {
    logout();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 hover:bg-accent/60"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.data.avatarUrl ?? undefined}
              alt={user?.data.name}
            />
            <AvatarFallback>
              {user?.data.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 mt-2 z-[9999]" // tăng z-index cao
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-semibold">{user?.data.name}</span>
          <span className="text-xs text-muted-foreground">
            {user?.data.mail}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            isNewUser
              ? router.push(`/${locale}/setup-profile`)
              : router.push(`/${locale}/profile`);
          }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>{t("profile") || "Profile"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/events`)}>
          <IconCalendarEvent className="mr-2 h-4 w-4" />
          <span>{t("events") || "My Events"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/wallet`)}>
          <Wallet className="mr-2 h-4 w-4" />
          <span>{t("wallet") || "Wallet"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/${locale}/settings`)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("settings") || "Settings"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-500 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {isLoggingOut
              ? t("loggingOut") || "Logging out..."
              : t("logout") || "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
