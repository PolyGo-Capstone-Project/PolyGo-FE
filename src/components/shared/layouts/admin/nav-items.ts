import {
  Icon123,
  IconAdjustmentsBolt,
  IconGift,
  IconHelpCircle,
  IconLayoutDashboard,
  IconReceipt2,
  IconSearch,
  IconSettings,
  IconShieldLock,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";

export interface NavItem {
  title: string;
  url: string;
  icon: Icon;
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

type TranslateFn = (key: string) => string;

const buildNavItems = (locale: string, t: TranslateFn): NavConfig => {
  const baseNavSecondary = [
    {
      title: t("settings"),
      url: `/${locale}/manage/setting`,
      icon: IconSettings,
    },
    {
      title: t("support"),
      url: `/${locale}/manage/support`,
      icon: IconHelpCircle,
    },
  ];

  return {
    navMain: [
      {
        title: t("dashboard"),
        url: `/${locale}/manage/dashboard`,
        icon: IconLayoutDashboard,
      },
      {
        title: t("accounts"),
        url: `/${locale}/manage/accounts`,
        icon: IconUsers,
      },
      {
        title: t("languages"),
        url: `/${locale}/manage/languages`,
        icon: IconReceipt2,
      },
      {
        title: t("interests"),
        url: `/${locale}/manage/interests`,
        icon: Icon123,
      },
      {
        title: t("gifts"),
        url: `/${locale}/manage/gifts`,
        icon: IconGift,
      },
    ],
    navManagement: [
      {
        title: t("permissions"),
        url: `/${locale}/manage/permissions`,
        icon: IconAdjustmentsBolt,
      },
      {
        title: t("roles"),
        url: `/${locale}/manage/roles`,
        icon: IconShieldLock,
      },
    ],
    navSecondary: baseNavSecondary,
  };
};

const buildDefaultNavItems = (locale: string, t: TranslateFn): NavConfig => ({
  navMain: [
    {
      title: t("dashboard"),
      url: `/${locale}/manage/dashboard`,
      icon: IconLayoutDashboard,
    },
  ],
  navSecondary: [
    {
      title: t("search"),
      url: "#",
      icon: IconSearch,
    },
    {
      title: t("support"),
      url: "#",
      icon: IconHelpCircle,
    },
  ],
});

export const getNavItems = (locale: string, t: TranslateFn): NavConfig =>
  buildNavItems(locale, t);

export const getDefaultNavItems = (locale: string, t: TranslateFn): NavConfig =>
  buildDefaultNavItems(locale, t);
