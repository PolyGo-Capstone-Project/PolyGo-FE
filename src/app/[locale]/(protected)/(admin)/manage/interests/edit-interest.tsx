"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TranslationValues } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Spinner,
  Textarea,
} from "@/components/ui";
import { handleErrorApi } from "@/lib/utils";
import {
  CreateInterestBodySchema,
  CreateInterestBodyType,
  InterestListItemType,
} from "@/models";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type EditInterestProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    id: string,
    values: CreateInterestBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  interestId: string | null;
  interest?: InterestListItemType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

const DEFAULT_VALUES: CreateInterestBodyType = {
  code: "",
  name: "",
  description: "",
  iconUrl: "",
};

export function EditInterest({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  interestId,
  interest,
  isLoading,
  isSubmitting,
  tError,
  isUploading,
}: EditInterestProps) {
  const form = useForm<CreateInterestBodyType>({
    resolver: zodResolver(CreateInterestBodySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const iconPreviewBlobRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      if (iconPreviewBlobRef.current) {
        URL.revokeObjectURL(iconPreviewBlobRef.current);
        iconPreviewBlobRef.current = null;
      }
      setIconFile(null);
      setIconPreview("");
      return;
    }

    if (interest) {
      form.reset({
        code: interest.code ?? "",
        name: interest.name ?? "",
        description: interest.description ?? "",
        iconUrl: interest.iconUrl ?? "",
      });
      setIconFile(null);
      setIconPreview(interest.iconUrl ?? "");
      iconPreviewBlobRef.current = null;
    }
  }, [form, interest, open]);

  useEffect(() => {
    return () => {
      if (iconPreviewBlobRef.current) {
        URL.revokeObjectURL(iconPreviewBlobRef.current);
        iconPreviewBlobRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (iconPreviewBlobRef.current) {
      URL.revokeObjectURL(iconPreviewBlobRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    iconPreviewBlobRef.current = previewUrl;
    setIconFile(file);
    setIconPreview(previewUrl);
    form.setValue("iconUrl", file.name, { shouldDirty: true });

    event.target.value = "";
  };

  const handleRemoveFile = () => {
    if (iconPreviewBlobRef.current) {
      URL.revokeObjectURL(iconPreviewBlobRef.current);
      iconPreviewBlobRef.current = null;
    }

    setIconFile(null);
    const fallback = interest?.iconUrl ?? "";
    setIconPreview(fallback);
    form.setValue("iconUrl", fallback, { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!interestId) return;

    const payload: CreateInterestBodyType = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      iconUrl: values.iconUrl?.trim() || undefined,
    };

    try {
      await onSubmit(interestId, payload, { file: iconFile });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  });

  const isFormDisabled =
    isSubmitting || isLoading || isUploading || !interestId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.editTitle", "Edit interest")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.editDescription",
              "Update the selected interest details for this locale."
            )}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-6 px-4 pb-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.codeLabel", "Locale code")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={2}
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.codePlaceholder",
                        "e.g. en"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.nameLabel", "Interest name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.namePlaceholder",
                        "e.g. Travel"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.descriptionLabel", "Description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.descriptionPlaceholder",
                        "Describe this interest"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.iconLabel", "Icon")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.iconPlaceholder",
                        "No file selected"
                      )}
                    />
                  </FormControl>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isFormDisabled}
                    />
                    {iconPreview && (
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                          <Image
                            src={iconPreview}
                            alt={safeTranslate(
                              "form.iconPreviewAlt",
                              "Icon preview"
                            )}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                        {(iconFile || iconPreviewBlobRef.current) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={isFormDisabled}
                          >
                            {safeTranslate("form.iconRemove", "Remove")}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isFormDisabled}
              >
                {safeTranslate("form.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isFormDisabled}>
                {isSubmitting || isUploading ? (
                  <Spinner className="size-4" />
                ) : (
                  safeTranslate("form.submitUpdate", "Save changes")
                )}
              </Button>
            </SheetFooter>

            {isLoading && (
              <div className="flex items-center justify-center">
                <Spinner className="size-5" />
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
