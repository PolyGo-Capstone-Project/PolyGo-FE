import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./src/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export default function middleware(request: any) {
  const response = intlMiddleware(request);

  return response;
}

export const config = {
  matcher: [
    "/",
    "/(en|vi)/:path*",
    "/((?!_next|_vercel|api|favicon.ico|.*\\..*).*)",
  ],
};
