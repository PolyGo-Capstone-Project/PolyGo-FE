"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field-wrapper";
import { Label } from "@/components/ui/label";
import {
  useInterestsQuery,
  useUserInterestsQuery,
} from "@/hooks/query/use-interest";
import {
  useLanguagesQuery,
  useUserLanguagesLearningQuery,
  useUserLanguagesSpeakingQuery,
} from "@/hooks/query/use-language";

type LanguagesInterestsFormData = {
  nativeLanguageIds: string[];
  learningLanguageIds: string[];
  interestIds: string[];
};

export function LanguagesInterestsTab() {
  const t = useTranslations("profile.editDialog.languagesAndInterests");
  const tButton = useTranslations("profile.editDialog");

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LanguagesInterestsFormData>({
    defaultValues: {
      nativeLanguageIds: userNativeLanguages.map((l) => l.id),
      learningLanguageIds: userLearningLanguages.map((l) => l.id),
      interestIds: userInterests.map((i) => i.id),
    },
  });

  const nativeLanguageIds = watch("nativeLanguageIds") || [];
  const learningLanguageIds = watch("learningLanguageIds") || [];
  const interestIds = watch("interestIds") || [];

  const toggleLanguage = (languageId: string, type: "native" | "learning") => {
    const field =
      type === "native" ? "nativeLanguageIds" : "learningLanguageIds";
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

  const onSubmit = async (data: LanguagesInterestsFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error updating languages & interests:", error);
    } finally {
      setIsSubmitting(false);
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
                id={`native-${language.id}`}
                checked={nativeLanguageIds.includes(language.id)}
                onCheckedChange={() => toggleLanguage(language.id, "native")}
              />
              <Label
                htmlFor={`native-${language.id}`}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tButton("saving") : tButton("save")}
        </Button>
      </div>
    </form>
  );
}
