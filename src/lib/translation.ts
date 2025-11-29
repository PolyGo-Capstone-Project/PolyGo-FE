/**
 * Translation utility for AI modules
 * Uses Google Translate API (free tier via MyMemory or LibreTranslate)
 */

export async function translateText(
  text: string,
  targetLang: string = "vi",
  sourceLang: string = "en"
): Promise<string> {
  try {
    // Skip translation if target is same as source
    if (sourceLang === targetLang) {
      return text;
    }

    // Option 1: Use MyMemory API (free, no API key needed)
    // Note: MyMemory doesn't support 'auto', default to 'en' (English)
    const source = sourceLang === "auto" ? "en" : sourceLang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=${source}|${targetLang}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `[Translation] API responded with status ${response.status}`
      );
      return text;
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      console.log(`[Translation] ✓ Translated to ${targetLang}`);
      return data.responseData.translatedText;
    }

    // Check for rate limit
    if (data.responseStatus === 403) {
      console.warn("[Translation] Rate limit exceeded (10k words/day)");
    } else {
      console.warn("[Translation] API returned unexpected response:", data);
    }

    return text;
  } catch (error) {
    console.error("[Translation] Error:", error);
    return text; // Return original text on error
  }
}

/**
 * Batch translate multiple texts
 */
export async function translateBatch(
  texts: string[],
  targetLang: string = "vi",
  sourceLang: string = "auto"
): Promise<string[]> {
  const promises = texts.map((text) =>
    translateText(text, targetLang, sourceLang)
  );
  return Promise.all(promises);
}

/**
 * Detect language of a text
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    // Simple language detection via translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=auto|en`;

    const response = await fetch(url);
    const data = await response.json();

    // MyMemory doesn't provide direct language detection,
    // but you can use other services like detectlanguage.com
    // For now, return 'auto'
    return "auto";
  } catch (error) {
    console.error("[Language Detection] Error:", error);
    return "auto";
  }
}

/**
 * Language codes mapping
 */
export const LANGUAGES = {
  en: "English",
  vi: "Tiếng Việt",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  ar: "العربية",
  ru: "Русский",
  pt: "Português",
  it: "Italiano",
  th: "ไทย",
} as const;

/**
 * Language flag emojis mapping
 */
export const LANGUAGE_FLAGS: Record<keyof typeof LANGUAGES, string> = {
  en: "🇬🇧",
  vi: "🇻🇳",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
  ar: "🇸🇦",
  ru: "🇷🇺",
  pt: "🇵🇹",
  it: "🇮🇹",
  th: "🇹🇭",
};

export type LanguageCode = keyof typeof LANGUAGES;

/**
 * Get language name from code
 */
export function getLanguageName(code: LanguageCode): string {
  return LANGUAGES[code] || code;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages(): Array<{
  code: LanguageCode;
  name: string;
  flag: string;
}> {
  return Object.entries(LANGUAGES).map(([code, name]) => ({
    code: code as LanguageCode,
    name,
    flag: LANGUAGE_FLAGS[code as LanguageCode],
  }));
}
