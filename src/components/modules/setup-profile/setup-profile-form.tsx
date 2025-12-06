"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  InterestsStep,
  KnownLanguagesStep,
  PersonalInfoStep,
  TargetLanguageStep,
} from "@/components/modules/setup-profile/steps";
import { Button, Progress } from "@/components/ui";
import {
  useAuthMe,
  useAuthStore,
  useSetupProfileMutation,
  useUpdateMeMutation,
} from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";
import {
  SetupProfileBodySchema,
  SetupProfileBodyType,
  UpdateMeBodySchema,
  UpdateMeBodyType,
} from "@/models";

type FormData = {
  // Step 1: Personal Info
  name: string;
  gender: "Male" | "Female" | "Other" | null;
  introduction: string | null;
  avatarUrl: string | null;
  // Step 2-4: Profile Setup
  targetLanguages: string[];
  knownLanguages: string[];
  interests: string[];
};

export function SetupProfileForm() {
  const { data: authData } = useAuthMe();
  const t = useTranslations("setupProfile");
  const tError = useTranslations("Error");
  const tSuccess = useTranslations("Success");
  const locale = useLocale();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const updateMeMutation = useUpdateMeMutation();
  const setupProfileMutation = useSetupProfileMutation();

  const errorMessages = useTranslations("setupProfile.errors");
  const setIsNewUser = useAuthStore((state) => state.setIsNewUser);
  const personalInfoForm = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBodySchema),
    defaultValues: {
      name: "",
      gender: null,
      introduction: null,
      avatarUrl: null,
    },
  });

  const user = authData?.payload.data;
  const setupProfileForm = useForm<SetupProfileBodyType>({
    resolver: zodResolver(SetupProfileBodySchema),
    defaultValues: {
      learningLanguageIds: [],
      speakingLanguageIds: [],
      interestIds: [],
    },
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    gender: null,
    introduction: null,
    avatarUrl: null,
    targetLanguages: [],
    knownLanguages: [],
    interests: [],
  });

  // Sync authData to formData when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        gender: user.gender || null,
        introduction: user.introduction || null,
        avatarUrl: user.avatarUrl || null,
      }));

      // Also update personalInfoForm
      personalInfoForm.reset({
        name: user.name || "",
        gender: user.gender || null,
        introduction: user.introduction || null,
        avatarUrl: user.avatarUrl || null,
      });
    }
  }, [user, personalInfoForm]);

  const STEPS = [
    {
      id: 1,
      title: t("steps.personalInfo.title"),
      description: t("steps.personalInfo.description"),
    },
    {
      id: 2,
      title: t("steps.targetLanguage.title"),
      description: t("steps.targetLanguage.description"),
    },
    {
      id: 3,
      title: t("steps.knownLanguages.title"),
      description: t("steps.knownLanguages.description"),
    },
    {
      id: 4,
      title: t("steps.interests.title"),
      description: t("steps.interests.description"),
    },
  ];

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Name is required
        return formData.name.trim().length > 0;
      case 2:
        return formData.targetLanguages.length > 0;
      case 3:
        return formData.knownLanguages.length > 0;
      case 4:
        return formData.interests.length > 0;
      default:
        return false;
    }
  };

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = async () => {
    // If step 1, validate and call updateMe
    if (currentStep === 1) {
      const personalInfoData: UpdateMeBodyType = {
        name: formData.name,
        gender: formData.gender,
        introduction: formData.introduction,
        avatarUrl: formData.avatarUrl,
      };

      const isValid = await personalInfoForm.trigger();
      if (!isValid) {
        return;
      }

      try {
        await updateMeMutation.mutateAsync(personalInfoData);
        toast.success(t("personalInfoSaved"));
        setCurrentStep(currentStep + 1);
        scrollToTop();
      } catch (error) {
        handleErrorApi({
          error,
          setError: personalInfoForm.setError,
          tError,
        });
      }
      return;
    }

    // For other steps, just proceed
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    }
  };

  const handleSkip = () => {
    // Skip to dashboard
    router.push(`/${locale}/dashboard`);
  };

  const handleSubmit = async () => {
    const setupData: SetupProfileBodyType = {
      learningLanguageIds: formData.targetLanguages,
      speakingLanguageIds: formData.knownLanguages,
      interestIds: formData.interests,
    };

    const isValid = await setupProfileForm.trigger();
    if (!isValid) {
      return;
    }

    try {
      const response = await setupProfileMutation.mutateAsync(setupData);
      showSuccessToast(response.payload.message, tSuccess);
      setIsNewUser(false);
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      handleErrorApi({
        error,
        setError: setupProfileForm.setError,
        tError,
      });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  // Sync form data with react-hook-form
  useEffect(() => {
    personalInfoForm.setValue("name", formData.name);
    personalInfoForm.setValue("gender", formData.gender);
    personalInfoForm.setValue("introduction", formData.introduction);
    personalInfoForm.setValue("avatarUrl", formData.avatarUrl);
  }, [formData, personalInfoForm]);

  useEffect(() => {
    setupProfileForm.setValue("learningLanguageIds", formData.targetLanguages);
    setupProfileForm.setValue("speakingLanguageIds", formData.knownLanguages);
    setupProfileForm.setValue("interestIds", formData.interests);
  }, [formData, setupProfileForm]);

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl space-y-8">
      {/* Progress Header */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {STEPS[currentStep - 1].title}
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  index + 1 === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : index + 1 < currentStep
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                <span className="text-sm font-semibold">{step.id}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 transition-all md:w-24 ${
                    index + 1 < currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      {/* Content Area */}
      <div className="rounded-2xl border bg-card shadow-lg">
        <div className="p-6 md:p-8 lg:p-10">
          {currentStep === 1 && (
            <PersonalInfoStep
              name={formData.name}
              gender={formData.gender}
              introduction={formData.introduction}
              avatarUrl={formData.avatarUrl}
              onNameChange={(name) => updateFormData({ name })}
              onGenderChange={(gender) => updateFormData({ gender })}
              onIntroductionChange={(introduction) =>
                updateFormData({ introduction })
              }
              onAvatarChange={(avatarUrl) => updateFormData({ avatarUrl })}
              errors={{
                name: personalInfoForm.formState.errors.name?.message,
                gender: personalInfoForm.formState.errors.gender?.message,
                introduction:
                  personalInfoForm.formState.errors.introduction?.message,
                avatarUrl: personalInfoForm.formState.errors.avatarUrl?.message,
              }}
            />
          )}
          {currentStep === 2 && (
            <TargetLanguageStep
              selected={formData.targetLanguages}
              onSelect={(languages) =>
                updateFormData({ targetLanguages: languages })
              }
            />
          )}
          {currentStep === 3 && (
            <KnownLanguagesStep
              selected={formData.knownLanguages}
              onSelect={(languages) =>
                updateFormData({ knownLanguages: languages })
              }
              targetLanguages={formData.targetLanguages}
            />
          )}
          {currentStep === 4 && (
            <InterestsStep
              interests={formData.interests}
              onInterestsChange={(interests) => updateFormData({ interests })}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-muted/30 px-6 py-4 md:px-8 lg:px-10">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              size="lg"
              className="min-w-24"
            >
              {t("navigation.back")}
            </Button>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {t("navigation.step", {
                  current: currentStep,
                  total: STEPS.length,
                })}
              </span>
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  size="sm"
                  className="text-muted-foreground"
                >
                  {t("navigation.skip")}
                </Button>
              )}
            </div>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={
                  !canProceed() ||
                  (currentStep === 1 && updateMeMutation.isPending)
                }
                size="lg"
                className="min-w-24"
              >
                {currentStep === 1 && updateMeMutation.isPending
                  ? t("navigation.saving")
                  : t("navigation.continue")}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || setupProfileMutation.isPending}
                size="lg"
                className="min-w-32"
              >
                {setupProfileMutation.isPending
                  ? t("navigation.completing")
                  : t("navigation.complete")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
