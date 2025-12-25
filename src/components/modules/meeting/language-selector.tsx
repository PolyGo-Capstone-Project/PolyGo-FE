"use client";

import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconBadgeCc, IconLanguage, IconMicrophone } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface LanguageSelectorProps {
  sourceLanguage: string; // Language user is SPEAKING
  targetLanguage: string; // Language user wants to HEAR
  onSourceLanguageChange: (language: string) => void;
  onTargetLanguageChange: (language: string) => void;
  isTranscriptionEnabled: boolean;
  className?: string;
}

// Language options with flags and names
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
];

export function LanguageSelector({
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
  isTranscriptionEnabled,
  className,
}: LanguageSelectorProps) {
  const t = useTranslations("meeting.language");

  const getLanguageName = (code: string) => {
    return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];
  };

  const sourceLang = getLanguageName(sourceLanguage);
  const targetLang = getLanguageName(targetLanguage);

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            title={t("title")}
          >
            <IconLanguage className="h-4 w-4" />
            <span className="hidden md:inline">
              {sourceLang.flag} → {targetLang.flag}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center gap-2">
            <IconLanguage className="h-4 w-4" />
            {t("title")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Source Language (Speaking) */}
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <IconMicrophone className="h-4 w-4" />
              {t("speaking")}
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={`source-${lang.code}`}
                  onClick={() => {
                    onSourceLanguageChange(lang.code);
                    if (isTranscriptionEnabled) {
                      // Show warning that they need to restart transcription
                      import("sonner").then(({ toast }) => {
                        toast.info(t("restartWarning"));
                      });
                    }
                  }}
                  className={
                    sourceLanguage === lang.code
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Target Language (Listening) */}
          <div className="p-2">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
              <IconBadgeCc className="h-4 w-4" />
              {t("subtitles")}
            </div>
            <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={`target-${lang.code}`}
                  onClick={() => onTargetLanguageChange(lang.code)}
                  className={
                    targetLanguage === lang.code
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />
          <div className="p-2 text-xs text-muted-foreground">{t("footer")}</div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
