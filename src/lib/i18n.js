import { useEffect, useState } from "react";
import en from "@/locales/en";
import it from "@/locales/it";

const dictionaries = { en, it };

// Language is chosen locally. No API call or connection is required.
function preferredLanguage() {
  if (typeof navigator === "undefined") return "en";
  const preferred = navigator.languages?.[0] || navigator.language || "en";
  return /^it(?:-|$)/i.test(preferred) ? "it" : "en";
}

export function useTranslation() {
  // Render English on the server and for the first hydration pass to avoid
  // React SSR hydration mismatches. Detect the device language after mount.
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const update = () => {
      const next = preferredLanguage();
      setLanguage(next);
      document.documentElement.lang = next;
    };
    update();
    window.addEventListener("languagechange", update);
    return () => window.removeEventListener("languagechange", update);
  }, []);

  const t = (key, values) => {
    const pattern = dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;
    if (!values) return pattern;
    return pattern.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
  };

  return { language, t };
}
