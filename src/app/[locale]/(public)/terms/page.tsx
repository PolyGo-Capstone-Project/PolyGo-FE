"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  // Thay đổi từ "guideline" sang "terms" để bao gồm các điều khoản dịch vụ mới
  const t = useTranslations("terms");
  const t_guideline = useTranslations("guideline"); // Giữ lại để sử dụng phần Quy định cộng đồng cũ

  return (
    <div className="container mx-auto px-4 py-12 space-y-10 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-primary">{t("title")}</h1>
      <p className="text-lg text-muted-foreground">{t("intro")}</p>

      {/* 1. USERS & ACCOUNTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">
          {t("registration.title")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>{t("registration.items.required").split(":")[0]}</strong>:{" "}
            {t("registration.items.required").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("registration.items.verification").split(":")[0]}
            </strong>
            : {t("registration.items.verification").split(":")[1]}
          </li>
          <li>
            <strong>{t("registration.items.age").split(":")[0]}</strong>:{" "}
            {t("registration.items.age").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* 2. TIERED PLANS (FREE & PLUS) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">{t("plans.title")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>{t("plans.items.free").split(":")[0]}</strong>:{" "}
            {t("plans.items.free").split(":")[1]}
          </li>
          <li>
            <strong>{t("plans.items.plus").split(":")[0]}</strong>:{" "}
            {t("plans.items.plus").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* 3. COMMUNICATION & EVENTS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">
          {t("communication.title")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>
              {t("communication.items.roomCapacity").split(":")[0]}
            </strong>
            : {t("communication.items.roomCapacity").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("communication.items.eventVerification").split(":")[0]}
            </strong>
            : {t("communication.items.eventVerification").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("communication.items.entryVerification").split(":")[0]}
            </strong>
            : {t("communication.items.entryVerification").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("communication.items.callDuration").split(":")[0]}
            </strong>
            : {t("communication.items.callDuration").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("communication.items.matchingRules").split(":")[0]}
            </strong>
            : {t("communication.items.matchingRules").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("communication.items.cancellation").split(":")[0]}
            </strong>
            : {t("communication.items.cancellation").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* 4. PAYMENTS & CREDITS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">
          {t("payments.title")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          {/* <li>
            <strong>{t("payments.items.creditCurrency").split(":")[0]}</strong>:{" "}
            {t("payments.items.creditCurrency").split(":")[1]}
          </li>
          <li>
            <strong>{t("payments.items.usage").split(":")[0]}</strong>:{" "}
            {t("payments.items.usage").split(":")[1]}
          </li>
          <li>
            <strong>{t("payments.items.exchangeRate").split(":")[0]}</strong>:{" "}
            {t("payments.items.exchangeRate").split(":")[1]}
          </li> */}
          <li>
            <strong>{t("payments.items.billingCycle").split(":")[0]}</strong>:{" "}
            {t("payments.items.billingCycle").split(":")[1]}
          </li>
          <li>
            <strong>{t("payments.items.balance").split(":")[0]}</strong>:{" "}
            {t("payments.items.balance").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* 5. ADMINISTRATION & MODERATION */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">
          {t("administration.title")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>
              {t("administration.items.contentModeration").split(":")[0]}
            </strong>
            : {t("administration.items.contentModeration").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("administration.items.violationReporting").split(":")[0]}
            </strong>
            : {t("administration.items.violationReporting").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("administration.items.activityLogging").split(":")[0]}
            </strong>
            : {t("administration.items.activityLogging").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("administration.items.adminAuthority").split(":")[0]}
            </strong>
            : {t("administration.items.adminAuthority").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* 6. SECURITY & PRIVACY */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-2">
          {t("security.title")}
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>{t("security.items.dataCompliance").split(":")[0]}</strong>:{" "}
            {t("security.items.dataCompliance").split(":")[1]}
          </li>
          <li>
            <strong>
              {t("security.items.informationSharing").split(":")[0]}
            </strong>
            : {t("security.items.informationSharing").split(":")[1]}
          </li>
        </ul>
      </section>

      {/* --- COMMUNITY GUIDELINES (Sử dụng phần cũ) --- */}
      <div className="pt-6 border-t mt-10">
        <h2 className="text-3xl font-bold mb-4">{t_guideline("title")}</h2>
        <p className="text-muted-foreground mb-6">{t_guideline("intro")}</p>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">
            {t_guideline("conduct.title")}
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t_guideline("conduct.items.respect")}</li>
            <li>{t_guideline("conduct.items.safety")}</li>
            <li>{t_guideline("conduct.items.prohibited")}</li>
          </ul>
        </section>

        <section className="space-y-3 mt-6">
          <h3 className="text-xl font-semibold">
            {t_guideline("enforcement.title")}
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t_guideline("enforcement.items.warnings")}</li>
            <li>{t_guideline("enforcement.items.bans")}</li>
            <li>{t_guideline("enforcement.items.appeals")}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
