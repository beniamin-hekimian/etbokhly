import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/reveal";

export function CallToAction() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16 mb-16">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-[#FF8C5A] to-secondary px-6 py-16 text-center shadow-lg md:px-12 md:py-20">
            {/* Decorative Circles */}
            <div className="pointer-events-none absolute -right-20 -top-35 h-80 w-80 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-30 -left-15 h-65 w-65 rounded-full bg-white/10" />

            {/* Banner Content */}
            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl leading-tight">
                {t.cta.title}
              </h2>
              <p className="mt-4 text-base font-medium text-white/95 md:text-lg">{t.cta.description}</p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-white text-primary font-bold hover:bg-white/90 text-md p-6 rounded-full"
                  >
                    {t.cta.getStarted}
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white dark:border-white bg-white/10 dark:bg-white/10 font-bold text-white backdrop-blur-xs hover:bg-white/20 dark:hover:bg-white/20 hover:text-white text-md p-6 rounded-full"
                  >
                    {t.cta.login}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
