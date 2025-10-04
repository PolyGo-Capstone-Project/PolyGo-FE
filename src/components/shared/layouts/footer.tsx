"use client";

import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { Button, Separator } from "@/components/ui";

const socialLinks = [
  { name: "GitHub", href: "#", icon: IconBrandGithub },
  { name: "Twitter", href: "#", icon: IconBrandTwitter },
  { name: "LinkedIn", href: "#", icon: IconBrandLinkedin },
];

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");

  const footerLinks = {
    product: [
      {
        name: t("features"),
        href: `/${locale === "en" ? "" : locale}#features`,
      },
      { name: t("pricing"), href: `/${locale === "en" ? "" : locale}#pricing` },
      {
        name: "Testimonials",
        href: `/${locale === "en" ? "" : locale}/testimonials`,
      },
      { name: "Demo", href: `/${locale === "en" ? "" : locale}/demo` },
    ],
    support: [
      {
        name: t("supportCenter"),
        href: `/${locale === "en" ? "" : locale}/support`,
      },
      { name: "API Docs", href: `/${locale === "en" ? "" : locale}/docs` },
      { name: "Guides", href: `/${locale === "en" ? "" : locale}/guides` },
      { name: t("contact"), href: `/${locale === "en" ? "" : locale}/contact` },
    ],
    company: [
      { name: t("about"), href: `/${locale === "en" ? "" : locale}/about` },
      { name: "Blog", href: `/${locale === "en" ? "" : locale}/blog` },
      { name: "Careers", href: `/${locale === "en" ? "" : locale}/careers` },
      { name: "Partners", href: `/${locale === "en" ? "" : locale}/partners` },
    ],
    legal: [
      {
        name: t("terms"),
        href: `/${locale === "en" ? "" : locale}/terms-of-service`,
      },
      {
        name: t("privacy"),
        href: `/${locale === "en" ? "" : locale}/privacy-policy`,
      },
      { name: "Cookies", href: `/${locale === "en" ? "" : locale}/cookies` },
      { name: "GDPR", href: `/${locale === "en" ? "" : locale}/gdpr` },
    ],
  };

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          {/* Mobile Brand Section */}
          <div className="text-center mb-12 lg:hidden">
            <Link
              href={`/${locale === "en" ? "" : locale}`}
              className="inline-flex items-center space-x-3 mb-6"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                PolyGo
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed mb-8">
              {t("description")}
            </p>

            <div className="flex justify-center items-center gap-3 mb-8">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={social.name}
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-10 w-10 rounded-full border-2 hover:scale-110 transition-all duration-200"
                  >
                    <Link href={social.href}>
                      <IconComponent className="size-4" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            <div className="lg:col-span-2">
              <Link
                href={`/${locale === "en" ? "" : locale}`}
                className="flex items-center space-x-2 mb-6"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">PolyGo</span>
              </Link>

              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {t("description")}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconMail className="size-4 flex-shrink-0" />
                  <span>contact@polygo.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconPhone className="size-4 flex-shrink-0" />
                  <span>+84 834 564 869</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconMapPin className="size-4 flex-shrink-0" />
                  <span>Thu Duc, Ho Chi Minh City, Vietnam</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-9 w-9"
                    >
                      <Link href={social.href}>
                        <IconComponent className="size-4" />
                        <span className="sr-only">{social.name}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">{t("product")}</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">{t("support")}</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-4">{t("company")}</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4">{t("legal")}</h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Links */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    {t("product")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.product.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    {t("company")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    {t("support")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    {t("legal")}
                  </h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-6 text-center flex items-center justify-center">
                <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                {t("contact")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconMail className="size-4 text-primary" />
                  </div>
                  <span>contact@polygo.com</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconPhone className="size-4 text-primary" />
                  </div>
                  <span>+84 834 564 869</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconMapPin className="size-4 text-primary" />
                  </div>
                  <span>Thu Duc, Ho Chi Minh City</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">{t("copyright")}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("madeInVietnam")}</span>
              <span className="text-base">🇻🇳</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
