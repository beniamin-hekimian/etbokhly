import { Search, ShoppingBag, HandCoins } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/reveal";

export function HowItWorks() {
  const { t } = useTranslation();
  const { locale } = useRouter();

  const steps = [
    {
      number: locale === "ar" ? "١" : "1",
      icon: Search,
      title: t.howItWorks.steps.browse.title,
      description: t.howItWorks.steps.browse.description,
    },
    {
      number: locale === "ar" ? "٢" : "2",
      icon: ShoppingBag,
      title: t.howItWorks.steps.order.title,
      description: t.howItWorks.steps.order.description,
    },
    {
      number: locale === "ar" ? "٣" : "3",
      icon: HandCoins,
      title: t.howItWorks.steps.receive.title,
      description: t.howItWorks.steps.receive.description,
    },
  ];

  return (
    <section className="py-12 md:py-16" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Head */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              {t.howItWorks.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.howItWorks.title}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.howItWorks.description}</p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
                >
                  {/* Step Number Badge */}
                  <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-foreground">
                    {step.number}
                  </span>

                  {/* Step Icon */}
                  <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-[22px] bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-[0_10px_22px_rgba(255,107,53,0.28)] transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Step Content */}
                  <h3 className="mb-2.5 text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
