import { useRouter } from "next/router";
import { ar } from "@/dictionaries/ar";
import { en } from "@/dictionaries/en";

const dictionaries = { ar, en };

export function useTranslation() {
  const { locale } = useRouter();
  const t = dictionaries[locale] || dictionaries.ar;
  return { t, locale };
}
