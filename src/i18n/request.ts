import type { AbstractIntlMessages } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

import { defaultLocale, locales } from "./config";

const messageNamespaces = [
  "common",
  "support",
  "terms",
  "policy",
  "about",
  "footer",
  "guideline",
  "home",
  "auth",
  "setup-profile",
  "admin",
  "profile",
  "matching",
  "wallet",
  "gift",
  "chat",
  "pricing",
  "social",
  "dashboard",
  "event",
  "meeting",
  "game",
  "report",
  "notification",
  "adminDashboard",
];

async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const namespaceModules = await Promise.all(
    messageNamespaces.map(async (namespace) => {
      try {
        return (await import(`./locales/${locale}/${namespace}.json`)).default;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `Missing translation namespace: ${namespace} for locale: ${locale}`
          );
        }

        return {};
      }
    })
  );

  return namespaceModules.reduce<AbstractIntlMessages>(
    (accumulator, messages) => ({
      ...accumulator,
      ...messages,
    }),
    {}
  );
}

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
    messages: await loadMessages(locale),
  };
});
