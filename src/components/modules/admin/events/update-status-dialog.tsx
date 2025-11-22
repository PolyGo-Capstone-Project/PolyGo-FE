"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconEdit } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
} from "@/components/ui";
import { EventStatus } from "@/constants";
import { useUpdateEventStatusMutation } from "@/hooks/query/use-event";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  UpdateEventStatusBodySchema,
  UpdateEventStatusBodyType,
} from "@/models";

type UpdateStatusDialogProps = {
  eventId: string;
};

export function UpdateStatusDialog({ eventId }: UpdateStatusDialogProps) {
  const t = useTranslations("admin.events.updateStatus");
  const tStatus = useTranslations("admin.events.status");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const form = useForm<UpdateEventStatusBodyType>({
    resolver: zodResolver(UpdateEventStatusBodySchema),
    defaultValues: {
      eventId,
      status: "" as any,
      adminNote: "",
    },
  });

  const updateStatusMutation = useUpdateEventStatusMutation({
    onSuccess: (data) => {
      showSuccessToast(data.payload?.message, tSuccess);
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      handleErrorApi({
        error,
        setError: form.setError,
        tError,
      });
    },
  });

  const onSubmit = async (data: UpdateEventStatusBodyType) => {
    if (updateStatusMutation.isPending) return;
    await updateStatusMutation.mutateAsync({ body: data });
  };

  const statusOptions = [
    EventStatus.Pending,
    EventStatus.Approved,
    EventStatus.Rejected,
    // EventStatus.Live,
    EventStatus.Cancelled,
    EventStatus.Completed,
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <IconEdit className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Status Select */}
          <div className="space-y-2 w-full">
            <Label htmlFor="status">{t("statusLabel")}</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(value) =>
                form.setValue("status", value as any, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder={t("statusPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="w-full">
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {tStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-destructive">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          {/* Admin Note */}
          <div className="space-y-2">
            <Label htmlFor="adminNote">{t("noteLabel")}</Label>
            <textarea
              id="adminNote"
              placeholder={t("notePlaceholder")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("adminNote")}
            />
            {form.formState.errors.adminNote && (
              <p className="text-sm text-destructive">
                {form.formState.errors.adminNote.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                form.reset();
              }}
              disabled={updateStatusMutation.isPending}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
