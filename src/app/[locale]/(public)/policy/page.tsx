"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function PolicyPage() {
  const t = useTranslations("policy");

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span>🔒</span>
          <span>{t("header")}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-balance">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t("intro")}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{t("lastUpdated")}: 01 Tháng 1, 2025</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏰</span>
          <span>{t("effectiveDate")}: 01 Tháng 1, 2025</span>
        </div>
      </div>

      {/* Warning Box */}
      <Card className="mb-8 border-2 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🔐</span>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                {t("commitment.title")}:
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                {t("commitment.content")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Content */}
      <div className="space-y-8">
        {/* Section 1: Data Collection */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">1.</span>
              <span>{t("dataCollection.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataCollection.items.personalTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataCollection.items.personal")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataCollection.items.usageTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataCollection.items.usage")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataCollection.items.communicationTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataCollection.items.communication")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataCollection.items.paymentTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataCollection.items.payment")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Data Usage */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">2.</span>
              <span>{t("dataUsage.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataUsage.items.serviceTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataUsage.items.service")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataUsage.items.improvementTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataUsage.items.improvement")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataUsage.items.aiTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataUsage.items.ai")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataUsage.items.securityTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataUsage.items.security")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Data Sharing */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">3.</span>
              <span>{t("dataSharing.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSharing.items.noThirdPartyTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSharing.items.noThirdParty")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSharing.items.serviceProvidersTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSharing.items.serviceProviders")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSharing.items.legalTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSharing.items.legal")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: User Rights */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">4.</span>
              <span>{t("userRights.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("userRights.items.accessTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("userRights.items.access")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("userRights.items.editTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("userRights.items.edit")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("userRights.items.deleteTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("userRights.items.delete")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("userRights.items.exportTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("userRights.items.export")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Data Security */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">5.</span>
              <span>{t("dataSecurity.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSecurity.items.encryptionTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSecurity.items.encryption")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSecurity.items.paymentSecurityTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSecurity.items.paymentSecurity")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSecurity.items.accessControlTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSecurity.items.accessControl")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataSecurity.items.monitoringTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataSecurity.items.monitoring")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Cookies & Tracking */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">6.</span>
              <span>{t("cookies.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("cookies.items.essentialTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cookies.items.essential")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("cookies.items.analyticsTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cookies.items.analytics")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("cookies.items.managementTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("cookies.items.management")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Data Retention */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">7.</span>
              <span>{t("dataRetention.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataRetention.items.durationTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataRetention.items.duration")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataRetention.items.deletionTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataRetention.items.deletion")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("dataRetention.items.legalTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("dataRetention.items.legal")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Children's Privacy */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">8.</span>
              <span>{t("childrenPrivacy.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("childrenPrivacy.items.ageLimitTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("childrenPrivacy.items.ageLimit")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("childrenPrivacy.items.protectionTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("childrenPrivacy.items.protection")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 9: Changes to Policy */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">9.</span>
              <span>{t("policyChanges.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("policyChanges.items.notificationTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("policyChanges.items.notification")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("policyChanges.items.acceptanceTitle")}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("policyChanges.items.acceptance")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <Card className="mt-8 border-2 bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              {t("footerNote")}
            </p>
            <div className="flex flex-col items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <Link
                  href="mailto:polygocorp@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  polygocorp@gmail.com
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span className="text-muted-foreground">+84 123 456 789</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
