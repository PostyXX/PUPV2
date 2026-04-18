import { th } from "./th";
import { en } from "./en";

export type Lang = "th" | "en";

const STORAGE_KEY = "pup_lang";

const dictionaries = {
  th,
  en,
};

export function getInitialLang(): Lang {
  if (typeof window === "undefined") return "th";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored === "th" || stored === "en") return stored;
  return "th";
}

let currentLang: Lang = getInitialLang();

export function setLang(lang: Lang) {
  currentLang = lang;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent("pup-lang-changed", { detail: { lang } }));
  }
}

export function getLang(): Lang {
  return currentLang;
}

export function t(path: string): string {
  const dict = dictionaries[currentLang] as any;
  const parts = path.split(".");
  let cur: any = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

export function subscribeLangChange(cb: (lang: Lang) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail as { lang?: Lang } | undefined;
    if (detail?.lang) cb(detail.lang);
  };
  window.addEventListener("pup-lang-changed", handler);
  return () => window.removeEventListener("pup-lang-changed", handler);
}
