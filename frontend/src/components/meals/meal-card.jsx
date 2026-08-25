import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

export default function MealCard({ meal }) {
  const { t } = useTranslation();
  const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
  const chefAvatarSrc = meal.user?.profile_image?.trim() ? meal.user.profile_image : "/avatar.webp";

  return (
    <Link href={`/meals/${meal.id}`} className="group block">
      <Card className="flex h-full flex-col gap-0 overflow-hidden border border-border/60 bg-card py-0 transition-all duration-200 group-hover:border-primary/40 group-hover:shadow-md">
        {/* Meal Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          <Image
            src={mealPhotoSrc}
            alt={meal.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Tags */}
          {meal.tags?.length > 0 && (
            <div className="absolute bottom-3 ltr:left-3 rtl:right-3 flex max-w-[85%] flex-wrap gap-1.5">
              {meal.tags.slice(0, 3).map((item) => (
                <Badge
                  key={item.tag?.id || item.tag_id}
                  variant="secondary"
                  className="border border-border/60 px-3 py-1 text-xs font-medium"
                >
                  {item.tag?.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Card Body */}
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                {meal.title}
              </CardTitle>

              <span className="shrink-0 text-base font-bold text-primary">
                {meal.price}
                &nbsp;
                {t.latestMeals?.priceLabel || "SYP"}
              </span>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">{meal.content || t.meals.card.noDescription}</p>
          </div>

          {/* Chef details */}
          <div className="mt-auto flex items-center gap-2.5 border-t border-border/60 pt-3">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <Image
                src={chefAvatarSrc}
                alt={`${meal.user?.full_name || t.meals.card.chefRole} avatar`}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {meal.user?.full_name || t.meals.card.unknownChef}
              </p>
              <p className="text-[11px] text-muted-foreground">{t.meals.card.chefRole}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
