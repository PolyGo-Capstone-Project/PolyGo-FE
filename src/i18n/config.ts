// 🔥 DEVELOPMENT: Only English & Vietnamese for now
export const locales = ["en", "vi"] as const;
// export const locales = ['en', 'vi', 'ja', 'fr', 'es'] as const; // 🔥 Enable later

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  // 🔥 Commented out for now
  // ja: '日本語',
  // fr: 'Français',
  // es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  vi: "🇻🇳",
  // 🔥 Commented out for now
  // ja: '🇯🇵',
  // fr: '🇫🇷',
  // es: '🇪🇸',
};
