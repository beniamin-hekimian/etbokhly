import { useRouter } from "next/router";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const router = useRouter();
  const { pathname, asPath, query, locale } = router;

  function toggleLanguage() {
    const nextLocale = locale === "ar" ? "en" : "ar";
    document.cookie = `NEXT_LOCALE=${nextLocale}; max-age=31536000; path=/`;
    router.push({ pathname, query }, asPath, { locale: nextLocale });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      title={locale === "ar" ? "English" : "Arabic"}
      aria-label="Toggle language"
    >
      <Globe />
    </Button>
  );
}
