"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import {
  useGetConversationLanguageSetup,
  useSetConversationLanguage,
} from "@/hooks/query/use-communication";
import { useLanguagesQuery } from "@/hooks/query/use-language";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TranslationSetupDialogProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TranslationSetupDialog({
  conversationId,
  open,
  onOpenChange,
}: TranslationSetupDialogProps) {
  const t = useTranslations("chat");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  // Get current language setup
  const { data: languageSetup, isLoading: isLoadingSetup } =
    useGetConversationLanguageSetup(conversationId, {
      enabled: open && !!conversationId,
    });

  // Get all available languages
  const { data: languagesData, isLoading: isLoadingLanguages } =
    useLanguagesQuery({
      enabled: open,
      params: { pageNumber: 1, pageSize: 100 },
    });

  // Set conversation language mutation
  const setLanguageMutation = useSetConversationLanguage(conversationId);

  // Update selected language when data loads
  useEffect(() => {
    if (languageSetup?.payload?.data?.effectiveLanguageCode) {
      setSelectedLanguage(languageSetup.payload.data.effectiveLanguageCode);
    }
  }, [languageSetup]);

  const handleSave = async () => {
    if (!selectedLanguage) {
      toast.error(t("error.saveLanguage"));
      return;
    }

    try {
      await setLanguageMutation.mutateAsync({
        languageCode: selectedLanguage,
      });
      toast.success(
        t("error.saveLanguage").replace("Failed to", "Successfully")
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(t("error.saveLanguage"));
    }
  };

  const languages = languagesData?.payload?.data?.items ?? [];
  const isLoading = isLoadingSetup || isLoadingLanguages;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("translationLanguageTitle")}</DialogTitle>
          <DialogDescription>
            {t("translationLanguageDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Language Display */}
          {languageSetup?.payload?.data?.effectiveLanguageCode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("currentLanguage")}
              </label>
              <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                {languageSetup.payload.data.effectiveLanguageCode.toUpperCase()}
              </div>
            </div>
          )}

          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("selectLanguage")}</label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isLoading ? "Loading..." : t("selectLanguage")}
                />
              </SelectTrigger>
              <SelectContent>
                {languages.map(
                  (lang: { id: string; code: string; name: string }) => (
                    <SelectItem key={lang.id} value={lang.code}>
                      {lang.name} ({lang.code.toUpperCase()})
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || setLanguageMutation.isPending}
          >
            {setLanguageMutation.isPending ? t("sending") : t("saveLanguage")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
