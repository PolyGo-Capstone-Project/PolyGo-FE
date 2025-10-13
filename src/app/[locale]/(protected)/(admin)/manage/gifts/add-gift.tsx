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
import { CreateGiftBodySchema, CreateGiftBodyType } from "@/models";

const DEFAULT_VALUES = {
  lang: "",
  name: "",
  description: "",
  price: 0,
  iconUrl: "",
} satisfies CreateGiftBodyType;

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type AddGiftProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    values: CreateGiftBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

export function AddGift({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  isSubmitting,
  tError,
  isUploading,
}: AddGiftProps) {
  const form = useForm<CreateGiftBodyType>({
    resolver: zodResolver(CreateGiftBodySchema) as any,
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
    const payload: CreateGiftBodyType = {
      lang: values.lang.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price: values.price,
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
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.createTitle", "Create gift")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.createDescription",
              "Define the name, price, description and icon for the new gift."
            )}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-6 px-4 pb-6 mt-4"
          >
            <FormField
              control={form.control}
              name="lang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.langLabel", "Translation locale")}
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
                    {safeTranslate("form.nameLabel", "Gift name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={100}
                      placeholder={safeTranslate(
                        "form.namePlaceholder",
                        "e.g. Premium Badge"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.priceLabel", "Price (VND)")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder={safeTranslate(
                        "form.pricePlaceholder",
                        "e.g. 50000"
                      )}
                    />
                  </FormControl>
                  <FormDescription>
                    {safeTranslate(
                      "form.priceHint",
                      "Price in Vietnamese Dong (VND)"
                    )}
                  </FormDescription>
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
                      value={field.value || ""}
                      maxLength={500}
                      rows={4}
                      placeholder={safeTranslate(
                        "form.descriptionPlaceholder",
                        "Describe this gift"
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
                    {safeTranslate("form.iconLabel", "Gift icon")}
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
                      "Upload an image (PNG, JPG, SVG) or use an emoji 🎁 to represent this gift."
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
