import Image from "next/image";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/reveal";

const DEFAULT_GRADIENTS = [
  "from-[#FFD59E] to-primary",
  "from-[#A8E0B0] to-[#2B8A3E]",
  "from-[#F4C77A] to-[#E8A33D]",
  "from-[#FF9472] to-[#E85A2A]",
];

export function TopChefs({ chefs = [] }) {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16" id="chefs">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              {t.topChefs.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.topChefs.title}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.topChefs.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-6.5 sm:grid-cols-2 lg:grid-cols-4">
            {chefs.map((chef, index) => {
              const gradient = DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];

              return (
                <article
                  key={chef.id}
                  className="flex flex-col items-center rounded-2xl border border-border bg-card p-8.5 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
                >
                  {/* Avatar Container */}
                  <div
                    className={`relative mb-4.5 flex h-23 w-23 items-center justify-center rounded-full bg-linear-to-br ${gradient} p-1`}
                  >
                    <Image
                      src={chef.profile_image}
                      alt={chef.full_name}
                      width={92}
                      height={92}
                      className="h-full w-full rounded-full object-cover border-2 border-background"
                    />
                    <span
                      title={t.topChefs.verifiedTooltip}
                      className="absolute -bottom-0.5 -left-0.5 flex h-6.5 w-6.5 items-center justify-center rounded-full border-3 border-card bg-[#2B8A3E] text-xs font-extrabold text-white"
                    >
                      <Check className="h-3.5 w-3.5 stroke-3" />
                    </span>
                  </div>

                  {/* Chef Info */}
                  <h3 className="mb-2 text-base font-bold text-foreground">{chef.full_name}</h3>
                  <p className="mb-4 min-h-14 text-xs leading-relaxed text-muted-foreground">{chef.bio}</p>

                  {/* Location Badge (Replaces Phone) */}
                  {chef.location && (
                    <span className="mb-4.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1 text-right">{chef.location}</span>
                    </span>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="mt-auto w-full border-secondary bg-transparent font-bold text-secondary shadow-xs hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-secondary/10"
                  >
                    {t.topChefs.viewFullMenu}
                  </Button>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
