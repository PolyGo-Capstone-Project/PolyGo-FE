"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button, Checkbox } from "@/components";
import { Field, Label } from "@/components/ui";
import {
  useInterestsQuery,
  useLanguagesQuery,
  useUserInterestsQuery,
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks";
import { useUpdateProfileMutation } from "@/hooks/query/use-user";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import { UpdateProfileBodySchema, UpdateProfileBodyType } from "@/models";

export function LanguagesInterestsTab() {
  const t = useTranslations("profile.editDialog.languagesAndInterests");
  const tButton = useTranslations("profile.editDialog");
  const errorMessages = useTranslations(
    "profile.editDialog.errors.languagesInterests"
  );
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");

  const queryClient = useQueryClient();

  // Fetch all languages and interests
  const { data: allLanguagesData } = useLanguagesQuery();
  const { data: allInterestsData } = useInterestsQuery();

  // Fetch user's current selections
  const { data: userNativeLanguagesData } = useUserLanguagesSpeakingQuery();
  const { data: userLearningLanguagesData } = useUserLanguagesLearningQuery();
  const { data: userInterestsData } = useUserInterestsQuery();

  const allLanguages = allLanguagesData?.payload.data?.items || [];
  const allInterests = allInterestsData?.payload.data?.items || [];

  const userNativeLanguages =
    userNativeLanguagesData?.payload.data?.items || [];
  const userLearningLanguages =
    userLearningLanguagesData?.payload.data?.items || [];
  const userInterests = userInterestsData?.payload.data?.items || [];

  const updateProfileMutation = useUpdateProfileMutation();

  const resolver = useMemo(
    () =>
      zodResolver(UpdateProfileBodySchema, {
        error: (issue) => ({
          message: translateLanguagesInterestsError(issue, errorMessages),
        }),
      }),
    [errorMessages]
  );

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileBodyType>({
    resolver,
    defaultValues: {
      speakingLanguageIds: userNativeLanguages.map((l) => l.id),
      learningLanguageIds: userLearningLanguages.map((l) => l.id),
      interestIds: userInterests.map((i) => i.id),
    },
  });

  const nativeLanguageIds = watch("speakingLanguageIds") || [];
  const learningLanguageIds = watch("learningLanguageIds") || [];
  const interestIds = watch("interestIds") || [];

  const toggleLanguage = (
    languageId: string,
    type: "speaking" | "learning"
  ) => {
    const field =
      type === "speaking" ? "speakingLanguageIds" : "learningLanguageIds";
    const currentIds = watch(field) || [];

    if (currentIds.includes(languageId)) {
      setValue(
        field,
        currentIds.filter((id) => id !== languageId)
      );
    } else {
      setValue(field, [...currentIds, languageId]);
    }
  };

  const toggleInterest = (interestId: string) => {
    const currentIds = watch("interestIds") || [];

    if (currentIds.includes(interestId)) {
      setValue(
        "interestIds",
        currentIds.filter((id) => id !== interestId)
      );
    } else {
      setValue("interestIds", [...currentIds, interestId]);
    }
  };

  const onSubmit = async (data: UpdateProfileBodyType) => {
    if (updateProfileMutation.isPending) return;
    try {
      const result = await updateProfileMutation.mutateAsync(data);
      showSuccessToast(
        result.payload?.message || tSuccess("UpdateProfile"),
        tSuccess
      );
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["user-languages-speaking"] });
      queryClient.invalidateQueries({ queryKey: ["user-languages-learning"] });
      queryClient.invalidateQueries({ queryKey: ["user-interests"] });
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: setValue as any,
        tError,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Native Languages */}
      <Field label={t("nativeLanguages")} required>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allLanguages.map((language) => (
            <div
              key={language.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <Checkbox
                id={`speaking-${language.id}`}
                checked={nativeLanguageIds.includes(language.id)}
                onCheckedChange={() => toggleLanguage(language.id, "speaking")}
              />
              <Label
                htmlFor={`speaking-${language.id}`}
                className="flex flex-1 cursor-pointer items-center gap-2"
              >
                {language.iconUrl && (
                  <Image
                    src={language.iconUrl}
                    alt={language.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm">{language.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </Field>

      {/* Learning Languages */}
      <Field label={t("learningLanguages")} required>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allLanguages.map((language) => (
            <div
              key={language.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <Checkbox
                id={`learning-${language.id}`}
                checked={learningLanguageIds.includes(language.id)}
                onCheckedChange={() => toggleLanguage(language.id, "learning")}
              />
              <Label
                htmlFor={`learning-${language.id}`}
                className="flex flex-1 cursor-pointer items-center gap-2"
              >
                {language.iconUrl && (
                  <Image
                    src={language.iconUrl}
                    alt={language.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm">{language.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </Field>

      {/* Interests */}
      <Field label={t("interests")} required>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {allInterests.map((interest) => (
            <div
              key={interest.id}
              className="flex items-center gap-2 rounded-lg border p-3"
            >
              <Checkbox
                id={`interest-${interest.id}`}
                checked={interestIds.includes(interest.id)}
                onCheckedChange={() => toggleInterest(interest.id)}
              />
              <Label
                htmlFor={`interest-${interest.id}`}
                className="flex flex-1 cursor-pointer items-center gap-2"
              >
                {interest.iconUrl && (
                  <Image
                    src={interest.iconUrl}
                    alt={interest.name}
                    width={24}
                    height={24}
                  />
                )}
                <span className="text-sm">{interest.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </Field>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending
            ? tButton("saving")
            : tButton("save")}
        </Button>
      </div>
    </form>
  );
}

type Translator = (key: string, values?: Record<string, any>) => string;

type ZodIssueForLanguagesInterests = {
  code: string;
  message?: string;
  path?: PropertyKey[];
  [key: string]: unknown;
};

const translateLanguagesInterestsError = (
  issue: ZodIssueForLanguagesInterests,
  t: Translator
): string => {
  const field = issue.path?.[0];
  const detail = issue as Record<string, any>;

  if (typeof field !== "string") {
    return t("default");
  }

  switch (field) {
    case "speakingLanguageIds": {
      if (issue.code === "invalid_type") {
        return t("speakingLanguageIds.required");
      }

      if (issue.code === "too_small") {
        const min = detail.minimum ?? 1;
        return t("speakingLanguageIds.min", { min });
      }

      break;
    }
    case "learningLanguageIds": {
      if (issue.code === "invalid_type") {
        return t("learningLanguageIds.required");
      }

      if (issue.code === "too_small") {
        const min = detail.minimum ?? 1;
        return t("learningLanguageIds.min", { min });
      }

      break;
    }
    case "interestIds": {
      if (issue.code === "invalid_type") {
        return t("interestIds.required");
      }

      if (issue.code === "too_small") {
        const min = detail.minimum ?? 1;
        return t("interestIds.min", { min });
      }

      break;
    }
    default:
      break;
  }

  return t("default");
};
