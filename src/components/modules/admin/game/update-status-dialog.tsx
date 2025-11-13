"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
} from "@/components/ui";
import { useUpdateWordsetStatusMutation } from "@/hooks/query/use-wordset";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { WordsetStatus } from "@/models";
import { IconEdit } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  wordsetId: string;
};

export function UpdateWordsetStatusDialog({ wordsetId }: Props) {
  const t = useTranslations("admin.wordsets.updateStatus");
  const tStatus = useTranslations("admin.wordsets.status");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  useLocale(); // reserve for future locale-based behaviours

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<WordsetStatus | "">("");
  const [reason, setReason] = useState("");

  const mutation = useUpdateWordsetStatusMutation({
    onSuccess: (res) => {
      showSuccessToast(res.payload?.message, tSuccess);
      setOpen(false);
      setStatus("");
      setReason("");
    },
    onError: (error) => {
      handleErrorApi({ error, tError });
    },
  });

  const onSubmit = async () => {
    if (!status || mutation.isPending) return;
    await mutation.mutateAsync({
      body: {
        wordSetId: wordsetId,
        status,
        rejectionReason: reason || undefined,
      },
    });
  };

  const statusOptions: WordsetStatus[] = [
    "Draft",
    "Pending",
    "Approved",
    "Rejected",
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Edit status">
          <IconEdit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("statusLabel")}</Label>
            <Select
              value={status || ""}
              onValueChange={(v) => setStatus(v as WordsetStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("reasonLabel")}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              className="min-h-[84px]"
            />
            <p className="text-xs text-muted-foreground">
              {t("reasonOptional")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={!status || mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Spinner className="mr-2 size-4" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
