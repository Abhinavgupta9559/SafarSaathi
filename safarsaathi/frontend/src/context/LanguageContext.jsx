import { createContext, useContext, useState, useMemo, useCallback } from "react";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

const dictionaries = { en, hi };
const LanguageContext = createContext(null);

function getNested(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("ss_language") || "en");

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem("ss_language", lang);
  }, []);

  const t = useCallback(
    (key) => {
      const dict = dictionaries[language] || dictionaries.en;
      const value = getNested(dict, key);
      if (value !== undefined) return value;
      // graceful fallback to English if a key is missing in the active language
      return getNested(dictionaries.en, key) || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, isHindi: language === "hi" }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
