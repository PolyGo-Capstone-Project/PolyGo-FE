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
import {
  CreateGiftBodySchema,
  CreateGiftBodyType,
  GiftListItemType,
} from "@/models";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type EditGiftProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    id: string,
    values: CreateGiftBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  giftId: string | null;
  gift?: GiftListItemType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

const DEFAULT_VALUES = {
  lang: "",
  name: "",
  description: "",
  price: 0,
  iconUrl: "",
} satisfies CreateGiftBodyType;

export function EditGift({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  giftId,
  gift,
  isLoading,
  isSubmitting,
  tError,
  isUploading,
}: EditGiftProps) {
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
      return;
    }

    if (gift) {
      form.reset({
        lang: gift.lang ?? "",
        name: gift.name ?? "",
        description: gift.description ?? "",
        price: gift.price ?? 0,
        iconUrl: gift.iconUrl ?? "",
      });
      setIconFile(null);
      setIconPreview(gift.iconUrl ?? "");
      iconPreviewBlobRef.current = null;
    }
  }, [form, gift, open]);

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
    const fallback = gift?.iconUrl ?? "";
    setIconPreview(fallback);
    form.setValue("iconUrl", fallback, { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!giftId) return;

    const payload: CreateGiftBodyType = {
      lang: values.lang.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      price: values.price,
      iconUrl: values.iconUrl?.trim() || undefined,
    };

    try {
      await onSubmit(giftId, payload, { file: iconFile });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  });

  const isFormDisabled = isSubmitting || isLoading || isUploading || !giftId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.editTitle", "Edit gift")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.editDescription",
              "Update the information for the selected gift or add a new translation."
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
                      disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
                      disabled={isFormDisabled}
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
