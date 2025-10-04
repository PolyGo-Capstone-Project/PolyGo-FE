import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { defaultLocale, locales } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // 🔥 Use requestLocale instead of locale (deprecated)
  let locale = await requestLocale;

  if (locale) {
    if (locale.includes("-")) {
      const baseLocale = locale.split("-")[0];

      locale = locales.includes(baseLocale as any) ? baseLocale : defaultLocale;
    } else if (!locales.includes(locale as any)) {
      notFound();
    }
  } else {
    locale = defaultLocale;
  }

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale, // 🔥 Return locale explicitly
    messages: (await import(`./locales/${locale}/common.json`)).default,
  };
});
