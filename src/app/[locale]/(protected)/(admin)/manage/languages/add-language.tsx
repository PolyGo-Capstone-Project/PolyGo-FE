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
} from "@/components/ui";
import { handleErrorApi } from "@/lib/utils";
import { CreateLanguageBodySchema, CreateLanguageBodyType } from "@/models";

const DEFAULT_VALUES: CreateLanguageBodyType = {
  code: "",
  name: "",
  iconUrl: "",
};

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type AddLanguageProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    values: CreateLanguageBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

export function AddLanguage({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  isSubmitting,
  tError,
  isUploading,
}: AddLanguageProps) {
  const form = useForm<CreateLanguageBodyType>({
    resolver: zodResolver(CreateLanguageBodySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [flagPreview, setFlagPreview] = useState<string>("");
  const flagPreviewBlobRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      if (flagPreviewBlobRef.current) {
        URL.revokeObjectURL(flagPreviewBlobRef.current);
        flagPreviewBlobRef.current = null;
      }
      setFlagFile(null);
      setFlagPreview("");
    }
  }, [form, open]);

  useEffect(() => {
    return () => {
      if (flagPreviewBlobRef.current) {
        URL.revokeObjectURL(flagPreviewBlobRef.current);
        flagPreviewBlobRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (flagPreviewBlobRef.current) {
      URL.revokeObjectURL(flagPreviewBlobRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    flagPreviewBlobRef.current = previewUrl;
    setFlagFile(file);
    setFlagPreview(previewUrl);
    form.setValue("iconUrl", file.name, { shouldDirty: true });
    event.target.value = "";
  };

  const handleRemoveFile = () => {
    if (flagPreviewBlobRef.current) {
      URL.revokeObjectURL(flagPreviewBlobRef.current);
      flagPreviewBlobRef.current = null;
    }
    setFlagFile(null);
    setFlagPreview("");
    form.setValue("iconUrl", "", { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateLanguageBodyType = {
      code: values.code.trim(),
      name: values.name.trim(),
      iconUrl: values.iconUrl?.trim() || undefined,
    };

    try {
      await onSubmit(payload, { file: flagFile });
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
            {safeTranslate("sheet.createTitle", "Create language")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.createDescription",
              "Define the language code and display name."
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
                    {safeTranslate("form.codeLabel", "Language code")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={2}
                      placeholder={safeTranslate(
                        "form.codePlaceholder",
                        "e.g. EN"
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
                    {safeTranslate("form.nameLabel", "Display name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={safeTranslate(
                        "form.namePlaceholder",
                        "English"
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
                    {safeTranslate("form.flagLabel", "Flag icon")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      placeholder={safeTranslate(
                        "form.flagPlaceholder",
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
                    {flagPreview && (
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                          <Image
                            src={flagPreview}
                            alt={safeTranslate(
                              "form.flagPreviewAlt",
                              "Flag preview"
                            )}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                        {flagFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            {safeTranslate("form.flagRemove", "Remove")}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    {safeTranslate(
                      "form.flagHint",
                      "Upload a square image (PNG, JPG, SVG) for the language flag."
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
