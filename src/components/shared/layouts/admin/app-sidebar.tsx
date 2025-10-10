"use client";

import Link from "next/link";
import * as React from "react";

import { NavDocuments } from "@/components/shared/layouts/admin/nav-documents";
import {
  defaultNavItems,
  getNavItemsByRole,
} from "@/components/shared/layouts/admin/nav-items";
import { NavMain } from "@/components/shared/layouts/admin/nav-main";
import { NavSecondary } from "@/components/shared/layouts/admin/nav-secondary";
import { NavUser } from "@/components/shared/layouts/admin/nav-user";
import {
  Logo,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui";
import { useAuthMe, useAuthStore } from "@/hooks";
import { RoleType } from "@/types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData } = useAuthMe();
  const account = userData?.payload;

  const role = useAuthStore((state) => state.role);

  const navConfig = role
    ? getNavItemsByRole(role as RoleType)
    : defaultNavItems;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Logo className="h-6 w-auto text-black" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navConfig.navMain} />
        {navConfig.navManagement && (
          <NavDocuments items={navConfig.navManagement} title="Quản lý" />
        )}
        <NavSecondary items={navConfig.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{account && <NavUser user={account} />}</SidebarFooter>
    </Sidebar>
  );
}
