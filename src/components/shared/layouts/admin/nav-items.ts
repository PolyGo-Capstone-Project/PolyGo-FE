import {
  Cog,
  HelpCircle,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  ShieldUser,
  SquareStack,
  Table,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import { Role } from "@/constants";
import { RoleType } from "@/types";

export interface NavItem {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface NavConfig {
  navMain: NavItem[];
  navSecondary: NavItem[];
  navManagement?: NavItem[];
}

// Navigation items theo role
export const getNavItemsByRole = (role: RoleType): NavConfig => {
  const baseNavSecondary = [
    {
      title: "Cài đặt",
      url: "/manage/setting",
      icon: Settings,
    },
    {
      title: "Hỗ trợ",
      url: "#",
      icon: HelpCircle,
    },
  ];

  switch (role) {
    case Role.Admin:
      return {
        navMain: [
          {
            title: "Dashboard",
            url: "/manage/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: "Quản lý hóa đơn",
            url: "/manage/bills",
            icon: Receipt,
          },
          {
            title: "Quản lý nhân viên",
            url: "/manage/accounts",
            icon: Users,
          },
          {
            title: "Quản lý category",
            url: "/manage/categories",
            icon: SquareStack,
          },
          {
            title: "Quản lý menu",
            url: "/manage/dishes",
            icon: UtensilsCrossed,
          },
          {
            title: "Quản lý bàn ăn",
            url: "/manage/tables",
            icon: Table,
          },
        ],
        navManagement: [
          {
            title: "Quản lý quyền hạn",
            url: "/manage/permissions",
            icon: Cog,
          },
          {
            title: "Quản lý vai trò",
            url: "/manage/roles",
            icon: ShieldUser,
          },
        ],
        navSecondary: baseNavSecondary,
      };

    default:
      return {
        navMain: [],
        navSecondary: baseNavSecondary,
      };
  }
};

// Navigation items mặc định (fallback)
export const defaultNavItems: NavConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/manage/dashboard",
      icon: LayoutDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Tìm kiếm",
      url: "#",
      icon: Search,
    },
    {
      title: "Hỗ trợ",
      url: "#",
      icon: HelpCircle,
    },
  ],
};
