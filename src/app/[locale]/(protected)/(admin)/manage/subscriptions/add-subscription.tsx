"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { TranslationValues } from "next-intl";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  Button,
  Checkbox,
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
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Spinner,
  Textarea,
} from "@/components";
import { FeatureTypeEnum, LimitTypeEnum, PlanTypeEnum } from "@/constants";
import { handleErrorApi } from "@/lib/utils";
import {
  CreateSubscriptionBodySchema,
  CreateSubscriptionBodyType,
} from "@/models";

const DEFAULT_VALUES: CreateSubscriptionBodyType = {
  planType: "Free" as const,
  price: 0,
  durationInDays: 30,
  isActive: true,
  translations: [{ lang: "", name: "", description: "" }],
  features: [],
};

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type AddSubscriptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safeTranslate: SafeTranslate;
  onSubmit: (values: CreateSubscriptionBodyType) => Promise<void>;
  isSubmitting: boolean;
  tError: (key: string, values?: TranslationValues) => string;
};

export function AddSubscription({
  open,
  onOpenChange,
  safeTranslate,
  onSubmit,
  isSubmitting,
  tError,
}: AddSubscriptionProps) {
  const form = useForm<CreateSubscriptionBodyType>({
    resolver: zodResolver(CreateSubscriptionBodySchema) as any,
    defaultValues: DEFAULT_VALUES,
  });

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({
    control: form.control,
    name: "translations",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control: form.control,
    name: "features",
  });

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError, tError });
    }
  });

  const handleAddTranslation = () => {
    appendTranslation({ lang: "", name: "", description: "" });
  };

  const handleAddFeature = () => {
    appendFeature({
      featureType: "Chat" as const,
      limitValue: 0,
      limitType: "Daily" as const,
      isEnable: true,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-2xl overflow-y-auto w-full"
      >
        <SheetHeader>
          <SheetTitle>
            {safeTranslate("sheet.createTitle", "Create subscription")}
          </SheetTitle>
          <SheetDescription>
            {safeTranslate(
              "sheet.createDescription",
              "Define the plan type, price, duration, translations and features for the new subscription."
            )}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-6 px-4 pb-6 mt-4"
          >
            {/* Plan Type */}
            <FormField
              control={form.control}
              name="planType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {safeTranslate("form.planTypeLabel", "Plan type")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue
                          placeholder={safeTranslate(
                            "form.planTypePlaceholder",
                            "Select a plan type"
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(PlanTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {safeTranslate(`planTypes.${type}`, type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Price */}
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
                          "e.g. 99000"
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      {safeTranslate(
                        "form.priceHint",
                        "Price in Vietnamese Dong (VND). Use 0 for free plans."
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="durationInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {safeTranslate("form.durationLabel", "Duration (days)")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder={safeTranslate(
                          "form.durationPlaceholder",
                          "e.g. 30"
                        )}
                      />
                    </FormControl>
                    <FormDescription>
                      {safeTranslate(
                        "form.durationHint",
                        "Number of days this subscription is valid."
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {safeTranslate("form.isActiveLabel", "Active status")}
                    </FormLabel>
                    <FormDescription>
                      {safeTranslate(
                        "form.isActiveHint",
                        "Enable or disable this subscription plan."
                      )}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Separator />

            {/* Translations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>
                  {safeTranslate("form.translationsLabel", "Translations")}
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTranslation}
                >
                  <IconPlus className="size-4" />
                  {safeTranslate("form.addTranslation", "Add translation")}
                </Button>
              </div>

              {translationFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-4 p-4 border rounded-lg relative"
                >
                  {translationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeTranslation(index)}
                    >
                      <IconTrash className="size-4 text-destructive" />
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name={`translations.${index}.lang`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {safeTranslate(
                            "form.translationLangLabel",
                            "Language"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={2}
                            placeholder={safeTranslate(
                              "form.translationLangPlaceholder",
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
                    name={`translations.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {safeTranslate(
                            "form.translationNameLabel",
                            "Plan name"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            maxLength={200}
                            placeholder={safeTranslate(
                              "form.translationNamePlaceholder",
                              "e.g. Premium"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {safeTranslate(
                            "form.translationDescriptionLabel",
                            "Description"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            maxLength={1000}
                            rows={3}
                            placeholder={safeTranslate(
                              "form.translationDescriptionPlaceholder",
                              "Describe this plan"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>
                  {safeTranslate("form.featuresLabel", "Features")}
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFeature}
                >
                  <IconPlus className="size-4" />
                  {safeTranslate("form.addFeature", "Add feature")}
                </Button>
              </div>

              {featureFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-4 p-4 border rounded-lg relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeFeature(index)}
                  >
                    <IconTrash className="size-4 text-destructive" />
                  </Button>

                  {/* FeatureType + LimitType - Same Row (5:5) */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`features.${index}.featureType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {safeTranslate(
                              "form.featureTypeLabel",
                              "Feature type"
                            )}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={safeTranslate(
                                    "form.featureTypePlaceholder",
                                    "Select feature"
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(FeatureTypeEnum).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {safeTranslate(`featureTypes.${type}`, type)}
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
                      name={`features.${index}.limitType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {safeTranslate("form.limitTypeLabel", "Limit type")}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={safeTranslate(
                                    "form.limitTypePlaceholder",
                                    "Select limit type"
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(LimitTypeEnum).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {safeTranslate(`limitTypes.${type}`, type)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Limit Value */}
                  <FormField
                    control={form.control}
                    name={`features.${index}.limitValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {safeTranslate("form.limitValueLabel", "Limit value")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder={safeTranslate(
                              "form.limitValuePlaceholder",
                              "e.g. 100"
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`features.${index}.isEnable`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {safeTranslate("form.isEnabledLabel", "Enabled")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {safeTranslate("form.cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
