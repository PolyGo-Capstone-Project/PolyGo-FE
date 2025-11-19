"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2, IconUpload } from "@tabler/icons-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  Skeleton,
  Textarea,
} from "@/components/ui";
import { DateTimePicker } from "@/components/ui/date-time";
import { EventStatus, PlanTypeEnum } from "@/constants";
import {
  useAuthMe,
  useGetEventById,
  useInterestsQuery,
  useLanguagesQuery,
  useUpdateEventMutation,
  useUploadMediaMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { UpdateEventBodySchema, UpdateEventBodyType } from "@/models";

type EditEventFormProps = {
  eventId: string;
};

export function EditEventForm({ eventId }: EditEventFormProps) {
  const t = useTranslations("event.edit");
  const tCreate = useTranslations("event.create");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const locale = useLocale();
  const router = useRouter();
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Fetch event data
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useGetEventById(eventId, { lang: locale });

  const { data: languagesData } = useLanguagesQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });
  const { data: interestsData } = useInterestsQuery({
    params: { pageNumber: 1, pageSize: 100, lang: locale },
  });

  const languages = languagesData?.payload?.data?.items || [];
  const interests = interestsData?.payload?.data?.items || [];

  const uploadMediaMutation = useUploadMediaMutation();
  const updateEventMutation = useUpdateEventMutation();

  const { data: authData } = useAuthMe();
  const userId = authData?.payload.data.id;

  const errorMessages = useTranslations("event.create.errors");

  const resolver = useMemo(
    () =>
      zodResolver(UpdateEventBodySchema, {
        error: (issue) => ({
          message: translateEventError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const form = useForm<UpdateEventBodyType>({
    resolver: resolver as any,
    defaultValues: {
      title: "",
      description: "",
      bannerUrl: "",
      notesUrl: null,
      languageId: "",
      status: EventStatus.Pending,
      isPublic: true,
      allowLateRegister: false,
      capacity: 5,
      fee: 0,
      hostId: "",
      startAt: "",
      registerDeadline: "",
      expectedDurationInMinutes: 120,
      password: null,
      interestIds: [],
      requiredPlanType: PlanTypeEnum.FREE,
    },
  });

  // Populate form with event data
  useEffect(() => {
    if (eventData?.payload?.data) {
      const event = eventData.payload.data;

      // Set banner preview
      if (event.bannerUrl) {
        setBannerPreview(event.bannerUrl);
      }

      // Get category IDs from the event
      const categoryIds = event.categories?.map((cat) => cat.id) || [];

      form.reset({
        title: event.title || "",
        description: event.description || "",
        bannerUrl: event.bannerUrl || "",
        notesUrl: null,
        languageId: event.language?.id || "",
        status: event.status || EventStatus.Pending,
        isPublic: event.isPublic ?? true,
        allowLateRegister: event.allowLateRegister ?? false,
        capacity: event.capacity || 10,
        fee: event.fee || 0,
        hostId: event.host?.id || userId || "",
        startAt: event.startAt || "",
        registerDeadline: event.registerDeadline || "",
        expectedDurationInMinutes: event.expectedDurationInMinutes || 120,
        password: null,
        interestIds: categoryIds,
        requiredPlanType: event.planType || PlanTypeEnum.FREE,
      });
    }
  }, [eventData, form, userId]);

  const isPublic = useWatch({ control: form.control, name: "isPublic" });

  const handleStartAtChange = (date: Date | undefined) => {
    if (!date) return;
    form.setValue("startAt", date.toISOString());

    // Set registerDeadline = startAt - 12 hours
    const deadlineDate = new Date(date.getTime() - 12 * 60 * 60 * 1000);
    form.setValue("registerDeadline", deadlineDate.toISOString());
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingBanner(true);
    try {
      const result = await uploadMediaMutation.mutateAsync({ file });
      form.setValue("bannerUrl", result.payload.data as string);
      form.clearErrors("bannerUrl");
    } catch (error: any) {
      handleErrorApi({ error, setError: form.setError, tError });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const onSubmit = async (data: UpdateEventBodyType) => {
    if (updateEventMutation.isPending) {
      return;
    }

    if (!userId) {
      alert("Please login again to update event");
      return;
    }

    if (!data.startAt) {
      form.setError("startAt", {
        type: "manual",
        message: errorMessages("startAt.required"),
      });
      return;
    }

    if (!data.registerDeadline) {
      form.setError("registerDeadline", {
        type: "manual",
        message: errorMessages("registerDeadline.required"),
      });
      return;
    }

    try {
      const result = await updateEventMutation.mutateAsync({
        id: eventId,
        body: data,
      });
      showSuccessToast(result.payload?.message || tSuccess("Update"), tSuccess);
      router.push(`/${locale}/my-event`);
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError,
        tError,
      });
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (eventError || !eventData?.payload?.data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-destructive">
            <p>{t("loadError")}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tCreate("basicInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{tCreate("fields.title.label")}</Label>
            <Input
              id="title"
              placeholder={tCreate("fields.title.placeholder")}
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
            <Label htmlFor="description">
              {tCreate("fields.description.label")}
            </Label>
            <Textarea
              id="description"
              placeholder={tCreate("fields.description.placeholder")}
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
            <Label>{tCreate("fields.banner.label")}</Label>
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
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    document.getElementById("banner-upload")?.click();
                  }}
                >
                  {tCreate("fields.banner.changeImage")}
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
                          {tCreate("fields.banner.uploading")}
                        </p>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {tCreate("fields.banner.upload")}
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
            <input
              type="file"
              id="banner-upload"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={isUploadingBanner}
            />
            {form.formState.errors.bannerUrl && (
              <p className="text-sm text-destructive">
                {form.formState.errors.bannerUrl.message}
              </p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label>{tCreate("fields.language.label")}</Label>
            <Controller
              name="languageId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={tCreate("fields.language.placeholder")}
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
            <Label>{tCreate("fields.categories.label")}</Label>
            <Controller
              name="interestIds"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`interest-${interest.id}`}
                        checked={field.value?.includes(interest.id)}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          if (checked) {
                            field.onChange([...current, interest.id]);
                          } else {
                            field.onChange(
                              current.filter((id) => id !== interest.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`interest-${interest.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {interest.name}
                      </label>
                    </div>
                  ))}
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

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>{tCreate("details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <Label>{tCreate("fields.startDate.label")}</Label>
            <Controller
              name="startAt"
              control={form.control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={handleStartAtChange}
                />
              )}
            />
            {form.formState.errors.startAt && (
              <p className="text-sm text-destructive">
                {form.formState.errors.startAt.message}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">{tCreate("fields.duration.label")}</Label>
            <Input
              id="duration"
              type="number"
              placeholder={tCreate("fields.duration.placeholder")}
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
            <Label>{tCreate("fields.registerDeadline.label")}</Label>
            <Controller
              name="registerDeadline"
              control={form.control}
              render={({ field }) => (
                <DateTimePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => {
                    if (date) {
                      field.onChange(date.toISOString());
                    }
                  }}
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
            <Label htmlFor="capacity">{tCreate("fields.capacity.label")}</Label>
            <Input
              id="capacity"
              type="number"
              placeholder={tCreate("fields.capacity.placeholder")}
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
            <Label htmlFor="fee">{tCreate("fields.fee.label")}</Label>
            <Input
              id="fee"
              type="number"
              placeholder={tCreate("fields.fee.placeholder")}
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

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{tCreate("settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Public/Private */}
          <div className="space-y-2">
            <Controller
              name="isPublic"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="isPublic" className="cursor-pointer">
                      {tCreate("fields.isPublic.label")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {tCreate("fields.isPublic.description")}
                    </p>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Password if Private */}
          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="password">
                {tCreate("fields.password.label")}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={tCreate("fields.password.placeholder")}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Allow Late Registration */}
          <div className="space-y-2">
            <Controller
              name="allowLateRegister"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowLateRegister"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="allowLateRegister"
                      className="cursor-pointer"
                    >
                      {tCreate("fields.allowLateRegister.label")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {tCreate("fields.allowLateRegister.description")}
                    </p>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Required Plan Type */}
          <div className="space-y-2">
            <Label>{tCreate("fields.requiredPlanType.label")}</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {tCreate("fields.requiredPlanType.description")}
            </p>
            <Controller
              name="requiredPlanType"
              control={form.control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PlanTypeEnum.FREE} id="plan-free" />
                    <Label htmlFor="plan-free" className="cursor-pointer">
                      {tCreate("fields.requiredPlanType.free")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={PlanTypeEnum.PLUS} id="plan-plus" />
                    <Label htmlFor="plan-plus" className="cursor-pointer">
                      {tCreate("fields.requiredPlanType.plus")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={PlanTypeEnum.PREMIUM}
                      id="plan-premium"
                    />
                    <Label htmlFor="plan-premium" className="cursor-pointer">
                      {tCreate("fields.requiredPlanType.premium")}
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
          disabled={updateEventMutation.isPending}
        >
          {updateEventMutation.isPending ? (
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
    if (detail.validation === "datetime") {
      return t(`${field}.invalid`);
    }
    return t(`${field}.invalid`);
  }

  if (issue.code === "invalid_date") {
    return t(`${field}.invalid`);
  }

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
