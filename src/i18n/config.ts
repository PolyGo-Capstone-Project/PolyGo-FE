// 🔥 DEVELOPMENT: Only English & Vietnamese for now
export const locales = ["en", "vi", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ja: "日本語",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  vi: "🇻🇳",
  ja: "🇯🇵",
};
