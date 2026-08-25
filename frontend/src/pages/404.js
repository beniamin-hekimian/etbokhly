import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

export default function PageNotFound() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";

  const metaTitle = isAr ? "404 الصفحة غير موجودة | إطبخلي" : "404 Page Not Found | Etbokhly";
  const metaDescription = isAr
    ? "الصفحة التي تبحث عنها غير موجودة."
    : "The page you are looking for could not be found.";
  const subtitle = isAr ? "الصفحة غير موجودة" : "Page Not Found";
  const description = isAr
    ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
    : "The page you are looking for doesn't exist or has been moved.";
  const backHome = isAr ? "العودة للرئيسية" : "Back to Home";

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-6xl font-extrabold tracking-tight text-primary sm:text-7xl">
              404
            </CardTitle>
            <CardDescription className="text-lg font-bold text-foreground">{subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="text-center text-sm leading-relaxed text-muted-foreground">{description}</CardContent>

          <CardFooter className="justify-center pt-2">
            <Link href="/">
              <Button className="font-semibold shadow-sm">
                <BackIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {backHome}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
