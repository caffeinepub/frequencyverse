import { type ReactNode, createContext, useContext, useState } from "react";
import {
  type Language,
  type Translations,
  translations,
} from "../lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const LANGUAGE_STORAGE_KEY = "frequencyverse-language";
const DEFAULT_LANGUAGE: Language = "tr";

// Safe localStorage access with fallback
function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isValidLanguage(stored)) {
      return stored as Language;
    }
  } catch (error) {
    console.warn("⚠️ [LANGUAGE] Failed to read from localStorage:", error);
  }
  return DEFAULT_LANGUAGE;
}

function isValidLanguage(value: string): boolean {
  return [
    "tr",
    "en",
    "de",
    "fr",
    "es",
    "it",
    "pt",
    "ru",
    "ar",
    "zh",
    "ja",
  ].includes(value);
}

function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn("⚠️ [LANGUAGE] Failed to write to localStorage:", error);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
