import type { Locale } from "@/i18n/config";

export interface LocaleParams {
  locale: Locale;
}

export interface LocalePageProps {
  params: Promise<LocaleParams>; // 🔥 Changed to Promise
}

export interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<LocaleParams>; // 🔥 Changed to Promise
}
