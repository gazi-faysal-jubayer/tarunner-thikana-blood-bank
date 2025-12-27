"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "bn" as Language,

      setLanguage: (language) => set({ language }),

      t: (key) => {
        const { language } = get();
        return translations[language][key] || translations.bn[key] || key;
      },
    }),
    {
      name: "language-storage",
      partialize: (state) => ({ language: state.language }),
    }
  )
);

// React hook for translations
export function useTranslation() {
  const { language, setLanguage, t } = useLanguage();

  return {
    language,
    setLanguage,
    t,
    isEnglish: language === "en",
    isBengali: language === "bn",
  };
}


