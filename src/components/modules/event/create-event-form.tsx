"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconCheck, IconLoader2, IconUpload, IconX } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from "@/components/ui";
import { EventStatus, PlanTypeEnum } from "@/constants";
import {
  useAuthStore,
  useCreateEventMutation,
  useInterestsQuery,
  useLanguagesQuery,
  useUploadMediaMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { CreateEventBodySchema, CreateEventBodyType } from "@/models";

export function CreateEventForm() {
  const t = useTranslations("event.create");
  const tError = useTranslations("Error");
  const tSuccess = useTranslations("Success");
  const locale = useLocale();
  const router = useRouter();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const { data: languagesData } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });

  const languages = languagesData?.payload?.data?.items || [];
  const interests = interestsData?.payload?.data?.items || [];

  const uploadMediaMutation = useUploadMediaMutation();
  const createEventMutation = useCreateEventMutation();

  // Get user ID from auth store
  const user = useAuthStore((state) => state.role);

  const errorMessages = useTranslations("event.create.errors");

  const form = useForm<CreateEventBodyType>({
    resolver: zodResolver(CreateEventBodySchema) as any,
    defaultValues: {
      title: "",
      description: "",
      bannerUrl: "",
      notesUrl: null,
      languageId: "",
      status: EventStatus.Pending,
      isPublic: true,
      allowLateRegister: false,
      capacity: 10,
      fee: 0,
      hostId: "", // Will be set from auth
      startAt: "",
      endAt: null,
      registerDeadline: "",
      expectedDurationInMinutes: 60,
      password: null,
      interestIds: [],
      requiredPlanType: PlanTypeEnum.FREE,
    },
  });

  // Use useWatch instead of form.watch to avoid re-render loops
  const isPublic = useWatch({ control: form.control, name: "isPublic" });
  const startAt = useWatch({ control: form.control, name: "startAt" });

  // Helper function to convert datetime-local to ISO 8601
  const convertToISO = (dateTimeLocal: string): string => {
    if (!dateTimeLocal) return "";
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    // Add seconds and convert to ISO 8601 with timezone
    const dateWithSeconds = dateTimeLocal + ":00";
    const date = new Date(dateWithSeconds);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  };

  // Helper function to convert ISO 8601 to datetime-local
  const convertFromISO = (isoString: string): string => {
    if (!isoString) return "";
    const date = new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Auto-fill endAt (+2h) and registerDeadline (-12h) when startAt changes
  const handleStartAtChange = (value: string) => {
    if (value) {
      const startDate = new Date(value + ":00");

      // Check if date is valid
      if (isNaN(startDate.getTime())) {
        return;
      }

      // Set endAt = startAt + 2 hours
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      const endDateLocal = convertFromISO(endDate.toISOString());
      form.setValue("endAt", endDateLocal);

      // Set registerDeadline = startAt - 12 hours
      const deadlineDate = new Date(startDate.getTime() - 12 * 60 * 60 * 1000);
      const deadlineDateLocal = convertFromISO(deadlineDate.toISOString());
      form.setValue("registerDeadline", deadlineDateLocal);
    }
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploadingBanner(true);
    try {
      const result = await uploadMediaMutation.mutateAsync({ file });
      // upload API returns data as string (url)
      form.setValue("bannerUrl", result.payload.data as string);
      form.clearErrors("bannerUrl");
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError, tError });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const onSubmit = async (data: CreateEventBodyType) => {
    if (createEventMutation.isPending) return;

    // Convert datetime-local format to ISO 8601
    const startAtISO = convertToISO(data.startAt);
    const endAtISO = data.endAt ? convertToISO(data.endAt) : null;
    const registerDeadlineISO = convertToISO(data.registerDeadline);

    // Validate converted dates
    if (!startAtISO) {
      form.setError("startAt", {
        type: "manual",
        message: errorMessages("startAt.invalid"),
      });
      return;
    }

    if (!registerDeadlineISO) {
      form.setError("registerDeadline", {
        type: "manual",
        message: errorMessages("registerDeadline.invalid"),
      });
      return;
    }

    const submitData = {
      ...data,
      startAt: startAtISO,
      endAt: endAtISO,
      registerDeadline: registerDeadlineISO,
      hostId: "user-id-placeholder", // TODO: Get actual user ID from auth store
    };

    console.log("Submit data:", submitData); // Debug log

    try {
      const result = await createEventMutation.mutateAsync(submitData);
      showSuccessToast(t("success"), tSuccess);
      router.push(`/${locale}/event`);
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError,
        tError,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("fields.title.label")}</Label>
            <Input
              id="title"
              placeholder={t("fields.title.placeholder")}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("fields.description.label")}</Label>
            <Textarea
              id="description"
              placeholder={t("fields.description.placeholder")}
              rows={4}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <Label>{t("fields.banner.label")}</Label>
            {bannerPreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <Image
                  src={bannerPreview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setBannerPreview(null);
                    form.setValue("bannerUrl", "");
                  }}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                  disabled={isUploadingBanner}
                />
                <label htmlFor="banner-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    {isUploadingBanner ? (
                      <>
                        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t("fields.banner.uploading")}
                        </p>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t("fields.banner.upload")}
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
            {form.formState.errors.bannerUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bannerUrl.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>{t("fields.language.label")}</Label>
            <Controller
              name="languageId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("fields.language.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.languageId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.languageId.message}
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>{t("fields.categories.label")}</Label>
            <Controller
              name="interestIds"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {interests.map((interest) => {
                    const isSelected = field.value?.includes(interest.id);
                    const handleToggle = () => {
                      const current = field.value || [];
                      if (isSelected) {
                        field.onChange(
                          current.filter((id) => id !== interest.id)
                        );
                      } else {
                        field.onChange([...current, interest.id]);
                      }
                    };

                    return (
                      <div
                        key={interest.id}
                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={handleToggle}
                      >
                        <div
                          className={`size-4 shrink-0 rounded-[4px] border transition-colors flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {isSelected && <IconCheck className="size-3.5" />}
                        </div>
                        <Label className="cursor-pointer flex-1">
                          {interest.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            />
            {form.formState.errors.interestIds && (
              <p className="text-sm text-destructive">
                {form.formState.errors.interestIds.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startAt">{t("fields.startDate.label")}</Label>
            <Controller
              name="startAt"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleStartAtChange(e.target.value);
                  }}
                />
              )}
            />
            {form.formState.errors.startAt && (
              <p className="text-sm text-destructive">
                {form.formState.errors.startAt.message}
              </p>
            )}
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="endAt">{t("fields.endDate.label")}</Label>
            <Controller
              name="endAt"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              )}
            />
            {form.formState.errors.endAt && (
              <p className="text-sm text-destructive">
                {form.formState.errors.endAt.message}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">{t("fields.duration.label")}</Label>
            <Input
              id="duration"
              type="number"
              placeholder={t("fields.duration.placeholder")}
              {...form.register("expectedDurationInMinutes", {
                valueAsNumber: true,
              })}
            />
            {form.formState.errors.expectedDurationInMinutes && (
              <p className="text-sm text-destructive">
                {form.formState.errors.expectedDurationInMinutes.message}
              </p>
            )}
          </div>

          {/* Registration Deadline */}
          <div className="space-y-2">
            <Label htmlFor="registerDeadline">
              {t("fields.registerDeadline.label")}
            </Label>
            <Controller
              name="registerDeadline"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="registerDeadline"
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {form.formState.errors.registerDeadline && (
              <p className="text-sm text-destructive">
                {form.formState.errors.registerDeadline.message}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">{t("fields.capacity.label")}</Label>
            <Input
              id="capacity"
              type="number"
              placeholder={t("fields.capacity.placeholder")}
              {...form.register("capacity", { valueAsNumber: true })}
            />
            {form.formState.errors.capacity && (
              <p className="text-sm text-destructive">
                {form.formState.errors.capacity.message}
              </p>
            )}
          </div>

          {/* Fee */}
          <div className="space-y-2">
            <Label htmlFor="fee">{t("fields.fee.label")}</Label>
            <Input
              id="fee"
              type="number"
              placeholder={t("fields.fee.placeholder")}
              {...form.register("fee", { valueAsNumber: true })}
            />
            {form.formState.errors.fee && (
              <p className="text-sm text-destructive">
                {form.formState.errors.fee.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Public/Private */}
          <div className="space-y-3">
            <Label>Event Privacy</Label>
            <Controller
              name="isPublic"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value ? "public" : "private"}
                  onValueChange={(value) => field.onChange(value === "public")}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="public" id="public" />
                    <div className="flex-1">
                      <Label htmlFor="public" className="cursor-pointer">
                        {t("fields.isPublic.label")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.isPublic.description")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="private" id="private" />
                    <div className="flex-1">
                      <Label htmlFor="private" className="cursor-pointer">
                        {t("fields.isPrivate.label")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("fields.isPrivate.description")}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Password (only for private events) */}
          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="password">{t("fields.password.label")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("fields.password.placeholder")}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Allow Late Registration */}
          <div className="flex items-start space-x-2">
            <Controller
              name="allowLateRegister"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="allowLateRegister"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="flex-1">
              <Label htmlFor="allowLateRegister" className="cursor-pointer">
                {t("fields.allowLateRegister.label")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("fields.allowLateRegister.description")}
              </p>
            </div>
          </div>

          <Separator />

          {/* Required Plan Type */}
          <div className="space-y-3">
            <div>
              <Label>{t("fields.requiredPlanType.label")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("fields.requiredPlanType.description")}
              </p>
            </div>
            <Controller
              name="requiredPlanType"
              control={form.control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={PlanTypeEnum.FREE} id="plan-free" />
                    <Label
                      htmlFor="plan-free"
                      className="cursor-pointer flex-1"
                    >
                      {t("fields.requiredPlanType.free")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={PlanTypeEnum.PLUS} id="plan-plus" />
                    <Label
                      htmlFor="plan-plus"
                      className="cursor-pointer flex-1"
                    >
                      {t("fields.requiredPlanType.plus")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem
                      value={PlanTypeEnum.PREMIUM}
                      id="plan-premium"
                    />
                    <Label
                      htmlFor="plan-premium"
                      className="cursor-pointer flex-1"
                    >
                      {t("fields.requiredPlanType.premium")}
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={createEventMutation.isPending}
        >
          {createEventMutation.isPending ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </div>
    </form>
  );
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForEvent = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translateEventError = (
  issue: ZodIssueForEvent,
  t: Translator
): string => {
  const field = issue.path?.[0];
  const detail = issue as Record<string, any>;

  if (typeof field !== "string") {
    return t("default");
  }

  // Handle common validation patterns
  if (issue.code === "invalid_type") {
    return t(`${field}.required`);
  }

  if (issue.code === "too_small") {
    if (detail.type === "array" && detail.minimum) {
      return t(`${field}.min`, { length: detail.minimum });
    }
    if (detail.minimum && detail.minimum > 1) {
      return t(`${field}.min`, { length: detail.minimum });
    }
    return t(`${field}.required`);
  }

  if (issue.code === "too_big") {
    return t(`${field}.max`, { length: detail.maximum });
  }

  if (issue.code === "invalid_string") {
    // Handle datetime validation
    if (detail.validation === "datetime") {
      return t(`${field}.invalid`);
    }
    return t(`${field}.invalid`);
  }

  if (issue.code === "invalid_date") {
    return t(`${field}.invalid`);
  }

  // Field-specific handling
  if (field === "password") {
    if (issue.code === "custom") {
      return t("password.required");
    }
  }

  if (field === "interestIds" && issue.code === "too_small") {
    return t("interestIds.required");
  }

  return t("default");
};
