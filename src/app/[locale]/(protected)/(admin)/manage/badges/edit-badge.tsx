"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { TranslationValues } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  BadgeCategory,
  BadgeListItemType,
  UpdateBadgeBodySchema,
  UpdateBadgeBodyType,
} from "@/models";

// Extended schema with code validation for SCREAMING_SNAKE_CASE
const UpdateBadgeFormSchema = UpdateBadgeBodySchema.extend({
  code: z
    .string()
    .min(1, "Code is required")
    .regex(
      /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/,
      "Code must be in SCREAMING_SNAKE_CASE format (e.g., FIRST_EVENT, ACCOUNT_VERIFIED)"
    ),
});

type UpdateBadgeFormType = z.infer<typeof UpdateBadgeFormSchema>;

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type EditBadgeProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (
    id: string,
    values: UpdateBadgeBodyType,
    options?: { file?: File | null }
  ) => Promise<void>;
  badgeId: string | null;
  badge?: BadgeListItemType | null;
  isLoading: boolean;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
  isUploading: boolean;
};

const DEFAULT_VALUES: UpdateBadgeFormType = {
  lang: "",
  code: "",
  name: "",
  description: "",
  badgeCategory: "Account",
  iconUrl: "",
};

const badgeCategories = Object.values(BadgeCategory);

export function EditBadge({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  badgeId,
  badge,
  isLoading,
  isSubmitting,
  tError,
  isUploading,
}: EditBadgeProps) {
  const form = useForm<UpdateBadgeFormType>({
    resolver: zodResolver(UpdateBadgeFormSchema) as any,
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

    if (badge) {
      form.reset({
        lang: badge.lang ?? "",
        code: badge.code ?? "",
        name: badge.name ?? "",
        description: badge.description ?? "",
        badgeCategory: badge.badgeCategory ?? "Account",
        iconUrl: badge.iconUrl ?? "",
      });
      setIconFile(null);
      setIconPreview(badge.iconUrl ?? "");
      iconPreviewBlobRef.current = null;
    }
  }, [form, badge, open]);

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
    const fallback = badge?.iconUrl ?? "";
    setIconPreview(fallback);
    form.setValue("iconUrl", fallback, { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!badgeId) return;

    const payload: UpdateBadgeBodyType = {
      lang: values.lang.trim(),
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      badgeCategory: values.badgeCategory,
      iconUrl: values.iconUrl?.trim() || undefined,
    };

    try {
      await onSubmit(badgeId, payload, { file: iconFile });
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  });

  const isFormDisabled = isSubmitting || isLoading || isUploading || !badgeId;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.editTitle", "Edit badge")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.editDescription",
              "Update the information for the selected badge or add a new translation."
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.codeLabel", "Badge code")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.codePlaceholder",
                        "e.g. FIRST_EVENT"
                      )}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    {safeTranslate(
                      "form.codeHint",
                      "Use SCREAMING_SNAKE_CASE format (e.g., FIRST_EVENT, ACCOUNT_VERIFIED)"
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
                    {safeTranslate("form.nameLabel", "Badge name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={200}
                      disabled={isFormDisabled}
                      placeholder={safeTranslate(
                        "form.namePlaceholder",
                        "e.g. First Event"
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="badgeCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.categoryLabel", "Category")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isFormDisabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={safeTranslate(
                            "form.categoryPlaceholder",
                            "Select a category"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {badgeCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        "Describe this badge"
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
                    {safeTranslate("form.iconLabel", "Badge icon")}
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
                      "Upload an image (PNG, JPG, SVG) or use an emoji 🏆 to represent this badge."
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
