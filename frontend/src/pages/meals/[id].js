import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { ArrowLeft, ArrowRight, ShoppingCart, Loader2 } from "lucide-react";

import Loading from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";

import useMeals from "@/hooks/useMeals";
import ChefSidebar from "@/components/meals/chef-sidebar";
import FormattedDate from "@/components/meals/formatted-date";
import { QuantityInput, MAX_QUANTITY } from "@/components/ui/quantity-input";

export default function MealDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, isRTL } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const { meal, isLoading, error } = useMeals(id);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const finalQuantity = Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number(quantity) || 1)));

    try {
      setIsAdding(true);
      await addToCart(meal.id, finalQuantity);
    } catch (err) {
      console.error("Failed to add meal to cart:", err);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !meal) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardContent className="flex min-h-36 flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="font-medium text-destructive">{error || t.meals.details.notFound}</p>

            <Button variant="outline" onClick={() => router.push("/meals")}>
              <BackIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t.meals.details.backToMeals}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
  const metaDescription =
    meal.content || (t.meals.details.metaDescriptionFallback || "").replace("{title}", meal.title || "");

  return (
    <>
      <Head>
        <title>{`${meal.title} | Etbokhly`}</title>
        <meta name="description" content={metaDescription} />
      </Head>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
        {/* Navigation Link */}
        <Link
          href="/meals"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <BackIcon className="h-4 w-4" />
          {t.meals.details.backToDiscover}
        </Link>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Details Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Meal Image */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm">
              <Image
                src={mealPhotoSrc}
                alt={meal.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            {/* Description Details */}
            <div className="space-y-6">
              {meal.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {meal.tags.map((item, index) => (
                    <Badge
                      key={item.tag?.id || index}
                      variant="secondary"
                      className="border border-border/60 px-3 py-1 text-xs font-medium"
                    >
                      {item.tag?.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {meal.title}
                </h1>

                <span className="shrink-0 text-2xl font-extrabold text-primary">
                  {meal.price}
                  &nbsp;
                  {t.latestMeals?.priceLabel || "SYP"}
                </span>
              </div>

              {/* Add to Cart Actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <QuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  disabled={isAdding}
                  ariaLabel={t.cart?.quantityLabel}
                />

                <Button
                  size="lg"
                  className="w-full gap-2 font-bold shadow-md shadow-primary/20 sm:w-auto"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                  {t.meals?.details?.addToCart || "Add to Cart"}
                </Button>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">{t.meals.details.descriptionTitle}</h2>

                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {meal.content || t.meals.details.noDescription}
                </p>
              </div>

              <FormattedDate date={meal.createdAt} />
            </div>
          </div>

          {/* Sidebar Column */}
          <ChefSidebar user={meal.user} />
        </div>
      </main>
    </>
  );
}
