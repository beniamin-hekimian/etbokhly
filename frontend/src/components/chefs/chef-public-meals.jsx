import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChefPublicMeals({ meals = [] }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const handleAddToCart = async (mealId) => {
    setAddingId(mealId);
    await addToCart(mealId, 1);
    setAddingId(null);
  };

  if (meals.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex min-h-36 items-center justify-center p-6 text-muted-foreground">
          {t.chefProfile.noMeals}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {meals.map((meal) => {
        const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";

        return (
          <Card
            key={meal.id}
            className="group flex flex-col overflow-hidden border-border bg-card p-0 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            {/* Image */}
            <Link href={`/meals/${meal.id}`} className="relative h-47.5 w-full overflow-hidden bg-muted block">
              <Image
                src={mealPhotoSrc}
                alt={meal.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Tags */}
              {meal.tags && meal.tags.length > 0 && (
                <div className="absolute top-3.5 inset-e-3.5 z-10 flex flex-wrap gap-1.5 justify-end">
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

            {/* Card Body */}
            <CardContent className="flex flex-1 flex-col p-5.5 pb-6">
              {/* Title */}
              <Link href={`/meals/${meal.id}`} className="hover:text-primary transition-colors">
                <h3 className="mb-2 text-lg font-bold text-foreground leading-snug">{meal.title}</h3>
              </Link>

              {/* Description */}
              <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {meal.content || t.chefProfile.noDescription}
              </p>

              {/* Card Footer */}
              <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                <span className="text-base font-extrabold text-foreground">
                  {meal.price} {t.latestMeals?.priceLabel || "SYP"}
                </span>

                <Button
                  className="font-bold shadow-xs"
                  disabled={addingId === meal.id}
                  onClick={() => handleAddToCart(meal.id)}
                >
                  {addingId === meal.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t.latestMeals?.addToCart || "Add to Cart"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
