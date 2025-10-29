"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";

type RegistrationSuccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle?: string;
  eventId?: string;
};

export function RegistrationSuccessDialog({
  open,
  onOpenChange,
  eventTitle,
  eventId,
}: RegistrationSuccessDialogProps) {
  const t = useTranslations("event.detail");
  const tCommon = useTranslations("event");
  const locale = useLocale();
  const router = useRouter();

  const handleViewMyEvents = () => {
    router.push(`/${locale}/my-event`);
    onOpenChange(false);
  };

  const handleViewEventDetails = () => {
    if (eventId) {
      router.push(`/${locale}/event/${eventId}`);
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {t("registrationSuccess.title")}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {eventTitle
              ? t("registrationSuccess.messageWithTitle", {
                  title: eventTitle,
                })
              : t("registrationSuccess.message")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">
              {t("registrationSuccess.nextSteps")}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t("registrationSuccess.checkEmail")}</li>
              <li>{t("registrationSuccess.viewMyEvents")}</li>
              <li>{t("registrationSuccess.prepareForEvent")}</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            <IconX className="h-4 w-4 mr-2" />
            {t("registrationSuccess.close")}
          </Button>
          <Button
            variant="default"
            onClick={handleViewMyEvents}
            className="w-full sm:w-auto"
          >
            {t("registrationSuccess.viewMyEventsButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
