import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";
import LikeButton from "@/components/meals/like-button";

export default function MealCard({ meal }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState(null);

  const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(meal.id);
    await addToCart(meal.id, 1);
    setAddingId(null);
  };

  return (
    <Card className="group flex flex-col overflow-hidden border-border bg-card p-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Image & Tags Container */}
      <div className="relative">
        <Link href={`/meals/${meal.id}`} className="relative block h-47.5 w-full overflow-hidden bg-muted">
          <Image
            src={mealPhotoSrc}
            alt={meal.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {meal.content || t.meals.card.noDescription}
        </p>

        {/* Card Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-base font-extrabold text-foreground">
            {meal.price} {t.latestMeals?.priceLabel || "SYP"}
          </span>

          <Button
            className="font-bold shadow-xs"
            disabled={addingId === meal.id}
            onClick={handleAddToCart}
          >
            {addingId === meal.id ? "..." : t.latestMeals.addToCart}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
