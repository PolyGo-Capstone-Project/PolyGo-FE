"use client";

import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span>📋</span>
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
      {/* <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{t("lastUpdated")}: 01 Tháng 1, 2025</span>{" "}
          
        </div>
        <div className="flex items-center gap-2">
          <span>⏰</span>
          <span>{t("effectiveDate")}: 01 Tháng 1, 2025</span>{" "}
          
        </div>
      </div> */}

      {/* Warning Box */}
      <Card className="mb-8 border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                {t("warning.title")}:
              </h3>{" "}
              <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                {t("warning.content")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Content */}
      <div className="space-y-8">
        {/* Section 1: Registration */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">1.</span>
              <span>{t("registration.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("registration.items.requiredTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("registration.items.required")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("registration.items.verificationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("registration.items.verification")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("registration.items.ageTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("registration.items.age")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Plans */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">2.</span>
              <span>{t("plans.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("plans.items.freeTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("plans.items.free")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("plans.items.plusTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("plans.items.plus")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Communication */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">3.</span>
              <span>{t("communication.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.roomCapacityTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.roomCapacity")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.eventVerificationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.eventVerification")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.entryVerificationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.entryVerification")}
                </p>
              </div>

              {/* <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.callDurationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.callDuration")}
                </p>
              </div> */}

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.matchingRulesTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.matchingRules")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("communication.items.cancellationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("communication.items.cancellation")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Payments */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">4.</span>
              <span>{t("payments.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("payments.items.billingCycleTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("payments.items.billingCycle")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("payments.items.balanceTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("payments.items.balance")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Administration */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">5.</span>
              <span>{t("administration.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("administration.items.contentModerationTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("administration.items.contentModeration")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("administration.items.violationReportingTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("administration.items.violationReporting")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("administration.items.activityLoggingTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("administration.items.activityLogging")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("administration.items.adminAuthorityTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("administration.items.adminAuthority")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section: Merit System */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">6.</span>
              <span>{t("merit.title")}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Intro */}
            <p className="text-sm text-muted-foreground leading-relaxed pl-8">
              {t("merit.intro")}
            </p>

            <div className="space-y-4 pl-8">
              {/* Admin controlled */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  {t("merit.admin.title")}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("merit.admin.content")}
                </p>
              </div>

              {/* Positive behaviors */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  {t("merit.positive.title")}
                </div>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>{t("merit.positive.dailyLogin")}</li>
                  <li>{t("merit.positive.createEvent")}</li>
                  <li>{t("merit.positive.approvedEvent")}</li>
                  <li>{t("merit.positive.joinEvent")}</li>
                  <li>{t("merit.positive.friend")}</li>
                  <li>{t("merit.positive.review")}</li>
                  <li>{t("merit.positive.game")}</li>
                </ul>
              </div>

              {/* Violations & penalties */}
              <div className="p-4 rounded-lg border border-red-500/40 bg-red-50 dark:bg-red-950/20">
                <div className="font-semibold text-red-700 dark:text-red-300 mb-2">
                  {t("merit.penalty.title")}
                </div>
                <ul className="text-sm text-red-700 dark:text-red-300 list-disc pl-5 space-y-1">
                  <li>{t("merit.penalty.cancelEvent")}</li>
                  <li>{t("merit.penalty.lateEvent")}</li>
                  <li>{t("merit.penalty.noShow")}</li>
                  <li>{t("merit.penalty.adminPenalty")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Security */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-start gap-3">
              <span className="text-primary shrink-0">7.</span>
              <span>{t("security.title")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pl-8">
              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("security.items.dataComplianceTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("security.items.dataCompliance")}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="font-semibold text-foreground mb-2">
                  • {t("security.items.informationSharingTitle")}
                </div>{" "}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("security.items.informationSharing")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
