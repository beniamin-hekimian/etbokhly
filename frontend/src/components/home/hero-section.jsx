import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";

const DISHES = [
  { src: "/hero/kabsa.webp", alt: "Kabsa" },
  { src: "/hero/mansaf.webp", alt: "Mansaf" },
  { src: "/hero/maqluba.webp", alt: "Maqluba" },
];

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const [currentDishIndex, setCurrentDishIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDishIndex((prev) => (prev + 1) % DISHES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/meals?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-16" id="home">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Copy Side */}
          <div className="lg:col-span-6">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {t.hero.titlePrefix}
              <span className="text-primary">{t.hero.titleHighlight}</span>
              {t.hero.titleSuffix}
            </h1>

            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t.hero.description}</p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full border bg-card p-1.5 shadow-md transition-shadow focus-within:ring-2 focus-within:ring-primary/20"
            >
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.hero.searchPlaceholder}
                  className="border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button type="submit" className="px-4 font-bold shadow-sm">
                {t.hero.searchButton}
              </Button>
            </form>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap items-center gap-8 border-t pt-6">
              <div>
                <strong className="block text-2xl font-extrabold text-foreground">{t.hero.stats.chefsCount}</strong>
                <span className="text-sm font-medium text-muted-foreground">{t.hero.stats.chefsLabel}</span>
              </div>
              <div>
                <strong className="block text-2xl font-extrabold text-foreground">{t.hero.stats.mealsCount}</strong>
                <span className="text-sm font-medium text-muted-foreground">{t.hero.stats.mealsLabel}</span>
              </div>
              <div>
                <strong className="block text-2xl font-extrabold text-primary">{t.hero.stats.ratingCount}</strong>
                <span className="text-sm font-medium text-muted-foreground">{t.hero.stats.ratingLabel}</span>
              </div>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative flex h-115 items-center justify-center lg:col-span-6" aria-hidden="true">
            {/* Scaled Animated Blob Background */}
            <div className="hero-blob absolute h-96 w-96 rounded-[42%_58%_63%_37%/41%_44%_56%_59%] bg-linear-to-tr from-primary/20 to-accent/20 animate-blob" />

            {/* Steam Animation Elements */}
            <div className="absolute top-[20%] z-10 flex gap-2.5">
              <span className="steam s1 h-9 w-2.5 rounded-full bg-linear-to-t from-transparent to-background animate-rise" />
              <span className="steam s2 h-9 w-2.5 rounded-full bg-linear-to-t from-transparent to-background animate-rise [animation-delay:0.9s]" />
              <span className="steam s3 h-9 w-2.5 rounded-full bg-linear-to-t from-transparent to-background animate-rise [animation-delay:1.8s]" />
            </div>

            {/* Scaled Center Plate */}
            <div className="relative flex h-72 w-72 animate-bounce-slow items-center justify-center rounded-full border-4 border-background bg-card shadow-xl before:absolute before:inset-3.5 before:rounded-full before:border-2 before:border-dashed before:border-primary/30 overflow-hidden">
              {DISHES.map((dish, index) => (
                <Image
                  key={dish.src}
                  src={dish.src}
                  alt={dish.alt}
                  width={250}
                  height={250}
                  priority={index === 0}
                  className={`absolute h-56 w-56 object-contain drop-shadow-lg transition-all duration-700 ease-in-out ${
                    index === currentDishIndex
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-90 -rotate-12 pointer-events-none"
                  }`}
                />
              ))}
            </div>

            {/* Balanced Floating Chips */}
            <div className="floating-chip absolute top-6 inset-s-8 animate-bounce-slow rounded-full border bg-card px-4 py-2.5 text-xs font-bold shadow-md">
              {t.hero.chips.rating}
            </div>
            <div className="floating-chip absolute bottom-14 inset-e-4 animate-bounce-slow rounded-full border bg-card px-4 py-2.5 text-xs font-bold shadow-md [animation-delay:1.1s]">
              {t.hero.chips.delivery}
            </div>
            <div className="floating-chip absolute bottom-2 inset-s-12 animate-bounce-slow rounded-full border bg-card px-4 py-2.5 text-xs font-bold shadow-md [animation-delay:2s]">
              {t.hero.chips.chefs}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
