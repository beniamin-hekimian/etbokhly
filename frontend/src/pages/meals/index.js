import Head from "next/head";
import Loading from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import useMeals from "@/hooks/useMeals";
import MealCard from "@/components/meals/meal-card";

export default function MealsPage() {
  const { meals, isLoading, error } = useMeals();
  const { t } = useTranslation();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>{t.meals.metaTitle}</title>
        </Head>

        <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-36 flex-col items-center justify-center gap-2 p-6 text-center">
              <p className="font-medium text-foreground">{t.meals.errorTitle}</p>
              <p className="text-sm text-muted-foreground">{t.meals.errorDescription}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{t.meals.metaTitle}</title>
        <meta name="description" content={t.meals.metaDescription} />
      </Head>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
        {/* Page Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t.meals.title}</h1>

          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{t.meals.description}</p>
        </div>

        {meals.length === 0 ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-40 items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">{t.meals.emptyState}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
