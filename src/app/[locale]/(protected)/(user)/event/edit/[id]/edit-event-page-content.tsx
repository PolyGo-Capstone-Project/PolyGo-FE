"use client";

import { useTranslations } from "next-intl";

import { EditEventForm } from "@/components";

type EditEventPageContentProps = {
  eventId: string;
};

export function EditEventPageContent({ eventId }: EditEventPageContentProps) {
  const t = useTranslations("event.edit");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>
      <EditEventForm eventId={eventId} />
    </div>
  );
}
