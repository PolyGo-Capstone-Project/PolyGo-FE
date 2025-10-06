"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import {
  AvailabilityStep,
  KnownLanguagesStep,
  ProficiencyStep,
  TargetLanguageStep,
} from "@/components/modules/setup-profile/steps";
import { Button, Progress } from "@/components/ui";

export type ProfileSetupData = {
  targetLanguages: string[];
  knownLanguages: string[];
  proficiencyLevel: string;
  interests: string[];
  availableTimes: string[];
  timezone: string;
  weeklyHours: number;
};

export function SetupProfileForm() {
  const t = useTranslations("setupProfile");
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileSetupData>({
    targetLanguages: [],
    knownLanguages: [],
    proficiencyLevel: "",
    interests: [],
    availableTimes: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weeklyHours: 3,
  });

  const STEPS = [
    {
      id: 1,
      title: t("steps.targetLanguage.title"),
      description: t("steps.targetLanguage.description"),
    },
    {
      id: 2,
      title: t("steps.knownLanguages.title"),
      description: t("steps.knownLanguages.description"),
    },
    {
      id: 3,
      title: t("steps.proficiency.title"),
      description: t("steps.proficiency.description"),
    },
    {
      id: 4,
      title: t("steps.availability.title"),
      description: t("steps.availability.description"),
    },
  ];

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (data: Partial<ProfileSetupData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.targetLanguages.length > 0;
      case 2:
        return formData.knownLanguages.length > 0;
      case 3:
        return (
          formData.proficiencyLevel !== "" && formData.interests.length > 0
        );
      case 4:
        return formData.availableTimes.length > 0 && formData.timezone !== "";
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

  const handleNext = () => {
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

  const handleSubmit = () => {
    // eslint-disable-next-line no-console
    console.log("Profile setup completed:", formData);
    // TODO: Call API to save profile
  };

  useEffect(() => {
    scrollToTop();
  }, []);

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
            <TargetLanguageStep
              selected={formData.targetLanguages}
              onSelect={(languages) =>
                updateFormData({ targetLanguages: languages })
              }
            />
          )}
          {currentStep === 2 && (
            <KnownLanguagesStep
              selected={formData.knownLanguages}
              onSelect={(languages) =>
                updateFormData({ knownLanguages: languages })
              }
              targetLanguages={formData.targetLanguages}
            />
          )}
          {currentStep === 3 && (
            <ProficiencyStep
              proficiency={formData.proficiencyLevel}
              interests={formData.interests}
              onProficiencyChange={(level) =>
                updateFormData({ proficiencyLevel: level })
              }
              onInterestsChange={(interests) => updateFormData({ interests })}
            />
          )}
          {currentStep === 4 && (
            <AvailabilityStep
              availableTimes={formData.availableTimes}
              timezone={formData.timezone}
              weeklyHours={formData.weeklyHours}
              onAvailableTimesChange={(times) =>
                updateFormData({ availableTimes: times })
              }
              onTimezoneChange={(tz) => updateFormData({ timezone: tz })}
              onWeeklyHoursChange={(hours) =>
                updateFormData({ weeklyHours: hours })
              }
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

            <div className="hidden text-sm text-muted-foreground md:block">
              {t("navigation.step", {
                current: currentStep,
                total: STEPS.length,
              })}
            </div>

            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
                className="min-w-24"
              >
                {t("navigation.continue")}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                size="lg"
                className="min-w-32"
              >
                {t("navigation.complete")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
