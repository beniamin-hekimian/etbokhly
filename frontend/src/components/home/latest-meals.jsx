import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/reveal";
import { useCart } from "@/hooks/useCart";
import LikeButton from "@/components/meals/like-button";

export function LatestMeals({ meals = [] }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = async (mealId) => {
    setAddingId(mealId);
    await addToCart(mealId, 1);
    setAddingId(null);
  };

  return (
    <section className="py-12 md:py-16" id="meals">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          {/* Section Head */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              {t.latestMeals.eyebrow}
            </span>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.latestMeals.title}</h2>
            <p className="mt-3 text-base text-muted-foreground">{t.latestMeals.description}</p>
          </div>

          {/* Meals Grid */}
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <Card
                key={meal.id}
                className="group flex flex-col overflow-hidden border-border bg-card p-0 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Image & Tags Container */}
                <div className="relative">
                  <Link href={`/meals/${meal.id}`} className="relative block h-47.5 w-full overflow-hidden bg-muted">
                    <Image
                      src={meal.photo}
                      alt={meal.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="eager"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Tags */}
                    {meal.tags && meal.tags.length > 0 && (
                      <div className="absolute bottom-3.5 inset-s-3.5 z-10 flex flex-wrap justify-start gap-1.5">
                        {meal.tags.map((item, idx) => (
                          <Badge
                            key={item.tag?.id || idx}
                            variant="secondary"
                            className="border-0 bg-[#1F2937]/75 text-[0.72rem] font-bold text-white backdrop-blur-xs"
                          >
                            {item.tag?.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Likes */}
                  <LikeButton
                    meal={meal}
                    className="absolute top-3.5 inset-s-3.5 z-10 bg-[#1F2937]/75 text-white hover:bg-[#1F2937]"
                  />
                </div>

                {/* Card Body */}
                <CardContent className="flex flex-1 flex-col p-5.5 pb-6">
                  {/* Title */}
                  <Link href={`/meals/${meal.id}`} className="hover:text-primary transition-colors">
                    <h3 className="mb-2 text-lg font-bold text-foreground leading-snug">{meal.title}</h3>
                  </Link>

                  {/* Description */}
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">{meal.content}</p>

                  {/* Card Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                    <span className="text-base font-extrabold text-foreground">
                      {meal.price} {t.latestMeals.priceLabel}
                    </span>

                    <Button
                      className="font-bold shadow-xs"
                      disabled={addingId === meal.id}
                      onClick={() => handleAddToCart(meal.id)}
                    >
                      {addingId === meal.id ? "..." : t.latestMeals.addToCart}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
