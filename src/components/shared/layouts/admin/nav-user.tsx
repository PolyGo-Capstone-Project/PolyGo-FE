"use client";

import {
  IconDotsVertical,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
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
import { useAuthStore } from "@/hooks";

// export function NavUser({ user }: { user: GetUserProfileResType }) {
export function NavUser() {
  const { isMobile } = useSidebar();
  const reset = useAuthStore((state) => state.reset);
  const setRole = useAuthStore((state) => state.setRole);
  // const logoutMutation = useLogoutMutation();
  const logoutMutation = {
    isPending: false,
    mutateAsync: async () => {},
  };

  const user = {
    data: {
      name: "Admin",
      mail: "admin@gmail.com",
      avatar: "",
    },
  };

  const router = useRouter();

  const logout = async () => {
    if (logoutMutation.isPending) return;
    // try {
    //   const result = await logoutMutation.mutateAsync();
    //   const message = (result.payload as any)?.message || "";
    //   toast.success(message, {
    //     duration: 3000,
    //   });
    //   reset();
    //   setRole();
    //   router.push("/");
    // } catch (error: any) {
    //   handleErrorApi({
    //     error,
    //   });
    // }
  };

  const settings = async () => {
    router.push("/manage/setting");
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
                  src={user?.data.avatar ?? undefined}
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
                    src={user?.data.avatar ?? undefined}
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
              <DropdownMenuItem>
                <IconUserCircle />
                Tài khoản
              </DropdownMenuItem>
              <DropdownMenuItem onClick={settings}>
                <IconSettings />
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <IconLogout />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
