import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading({ title, description }) {
  const router = useRouter();

  // Detect language directly from Next.js router
  const isArabic = router.locale === "ar";

  // Fallback text based on current locale
  const defaultTitle = isArabic ? "جاري التحميل..." : "Loading...";
  const defaultDescription = isArabic
    ? "يرجى الانتظار بينما نقوم بتحضير المحتوى لك."
    : "Please wait while we prepare the content for you.";

  const displayTitle = title ?? defaultTitle;
  const displayDescription = description ?? defaultDescription;

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>

            <CardTitle className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              {displayTitle}
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">{displayDescription}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            <div className="h-32 w-full animate-pulse rounded-xl bg-muted/60" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
