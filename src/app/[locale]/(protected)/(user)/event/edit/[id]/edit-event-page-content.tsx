"use client";

import { EditEventForm } from "@/components/modules/event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { useState } from "react";

type EditEventPageContentProps = {
  eventId: string;
};

export function EditEventPageContent({ eventId }: EditEventPageContentProps) {
  const t = useTranslations("event.edit");
  const [showPurposeDialog, setShowPurposeDialog] = useState(true);

  return (
    <>
      <AlertDialog open={showPurposeDialog} onOpenChange={setShowPurposeDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">
              {t("purposeDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4 pt-4">
              <p className="font-semibold text-foreground">
                {t("purposeDialog.description")}
              </p>
              <ul className="space-y-3 text-foreground/90">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>{t("purposeDialog.point1")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span>{t("purposeDialog.point2")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-bold">⚠</span>
                  <span>{t("purposeDialog.point3")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">💡</span>
                  <span>{t("purposeDialog.point4")}</span>
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPurposeDialog(false)}>
              {t("purposeDialog.understand")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <EditEventForm eventId={eventId} />
      </div>
    </>
  );
}
