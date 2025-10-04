"use client";

import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";

import { Button, Separator } from "@/components/ui";

const footerLinks = {
  product: [
    { name: "Tính năng", href: "/#features" },
    { name: "Bảng giá", href: "/#pricing" },
    { name: "Đánh giá", href: "/testimonials" },
    { name: "Demo", href: "/demo" },
  ],
  support: [
    { name: "Trung tâm hỗ trợ", href: "/support" },
    { name: "Tài liệu API", href: "/docs" },
    { name: "Hướng dẫn", href: "/guides" },
    { name: "Liên hệ", href: "/contact" },
  ],
  company: [
    { name: "Về chúng tôi", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Tuyển dụng", href: "/careers" },
    { name: "Đối tác", href: "/partners" },
  ],
  legal: [
    { name: "Điều khoản dịch vụ", href: "/terms-of-service" },
    { name: "Chính sách bảo mật", href: "/privacy-policy" },
    { name: "Chính sách cookie", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

const socialLinks = [
  { name: "GitHub", href: "#", icon: IconBrandGithub },
  { name: "Twitter", href: "#", icon: IconBrandTwitter },
  { name: "LinkedIn", href: "#", icon: IconBrandLinkedin },
];

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-optimized layout */}
        <div className="py-12 lg:py-16">
          {/* Brand section - prominent on mobile */}
          <div className="text-center mb-12 lg:hidden">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
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
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Hẹn Dễ
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed mb-8">
              Giải pháp quản lý nhà hàng thông minh cho ngành F&B Việt Nam
            </p>

            {/* Social links - centered on mobile */}
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

          {/* Desktop layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Brand & Contact - Desktop */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6">
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
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="m2 17 10 5 10-5" />
                    <path d="m2 12 10 5 10-5" />
                  </svg>
                </div>
                <span className="text-xl font-bold">Hẹn Dễ</span>
              </Link>

              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut,
                non? Eos dolorem sapiente earum sint, dignissimos minima nobis
                numquam natus expedita, minus dicta maiores eius rerum vel
                exercitationem itaque aperiam.
              </p>

              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconMail className="size-4 flex-shrink-0" />
                  <span>scanorderly196@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconPhone className="size-4 flex-shrink-0" />
                  <span>0834564869</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <IconMapPin className="size-4 flex-shrink-0" />
                  <span>Thủ Đức, TP. Hồ Chí Minh</span>
                </div>
              </div>

              {/* Social links */}
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

            {/* Links columns */}
            <div>
              <h3 className="text-sm font-semibold mb-4">Sản phẩm</h3>
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
              <h3 className="text-sm font-semibold mb-4">Hỗ trợ</h3>
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
                <h3 className="text-sm font-semibold mb-4">Công ty</h3>
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
                <h3 className="text-sm font-semibold mb-4">Pháp lý</h3>
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

          {/* Mobile links - Accordion style */}
          <div className="lg:hidden">
            <div className="grid grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    Sản phẩm
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
                    Công ty
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

              {/* Right column */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                    <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                    Hỗ trợ
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
                    Pháp lý
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

            {/* Contact info - Mobile */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-6 text-center flex items-center justify-center">
                <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
                Liên hệ
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconMail className="size-4 text-primary" />
                  </div>
                  <span>scanorderly196@gmail.com</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconPhone className="size-4 text-primary" />
                  </div>
                  <span>0834564869</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <IconMapPin className="size-4 text-primary" />
                  </div>
                  <span>Thủ Đức, TP. HCM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Bottom section */}
        <div className="py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 Hẹn Dễ. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Proudly made in Vietnam</span>
              <span className="text-base">🇻🇳</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
