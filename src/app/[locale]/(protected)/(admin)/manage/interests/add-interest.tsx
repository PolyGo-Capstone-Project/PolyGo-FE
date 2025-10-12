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
  FormDescription,
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
import { CreateInterestBodySchema, CreateInterestBodyType } from "@/models";

const DEFAULT_VALUES: CreateInterestBodyType = {
  lang: "",
  name: "",
  description: "",
  iconUrl: "",
};

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type AddInterestProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    values: CreateInterestBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

export function AddInterest({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  isSubmitting,
  tError,
  isUploading,
}: AddInterestProps) {
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
    }
  }, [form, open]);

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
    setIconPreview("");
    form.setValue("iconUrl", "", { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateInterestBodyType = {
      lang: values.lang.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      iconUrl: values.iconUrl?.trim() || undefined,
    };

    try {
      await onSubmit(payload, { file: iconFile });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  });

  const isFormBusy = isSubmitting || isUploading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.createTitle", "Create interest")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.createDescription",
              "Define the locale, name, and description for the new interest."
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
              name="lang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.langLabel", "Language code")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={2}
                      placeholder={safeTranslate(
                        "form.langPlaceholder",
                        "e.g. en"
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {safeTranslate(
                      "form.langHint",
                      "Use the language code for this translation."
                    )}
                  </FormDescription>
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
                        {iconFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            {safeTranslate("form.iconRemove", "Remove")}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    {safeTranslate(
                      "form.iconHint",
                      "Upload a square image (PNG, JPG, SVG) to represent this interest."
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isFormBusy}
              >
                {safeTranslate("form.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isFormBusy}>
                {isFormBusy ? (
                  <Spinner className="size-4" />
                ) : (
                  safeTranslate("form.submitCreate", "Create")
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
