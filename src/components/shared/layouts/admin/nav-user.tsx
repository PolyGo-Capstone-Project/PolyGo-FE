"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks";
import { GetUserProfileResType } from "@/models";

export function NavUser({ user }: { user: GetUserProfileResType }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("header");
  const { logout, isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout();
  };

  const handleSettings = () => {
    router.push(`/${locale}/manage/setting`);
  };

  const handleAccount = () => {
    router.push(`/${locale}/manage/profile`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={user?.data.avatarUrl ?? undefined}
                  alt={user?.data.name}
                />
                <AvatarFallback className="rounded-lg">
                  {user?.data.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.data.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.data.mail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.data.avatarUrl ?? undefined}
                    alt={user?.data.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.data.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.data.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.data.mail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccount}>
                <IconUserCircle />
                {t("account") || "Tài khoản"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <IconSettings />
                {t("settings") || "Cài đặt"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <IconLogout />
              {isLoggingOut
                ? t("loggingOut") || "Đang đăng xuất..."
                : t("logout") || "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
