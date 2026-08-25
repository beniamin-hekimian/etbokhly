import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAdminMeals } from "@/hooks/useAdmin";
import { useTranslation } from "@/hooks/useTranslation";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MealCard from "@/components/admin/meal-card";
import RejectMealDialog from "@/components/admin/reject-meal-dialog";

export default function AdminMealsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { meals, loading, error, actionLoading, fetchMealRequests, approveMeal, rejectMeal } = useAdminMeals();
  const { t } = useTranslation();

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "ADMIN") {
      queueMicrotask(() => fetchMealRequests());
    }
  }, [authLoading, isAuthenticated, user, fetchMealRequests]);

  if (authLoading || loading) return <Loading />;

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">{t.admin.meals.accessDeniedTitle}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.admin.meals.accessDeniedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/profile">
              <Button>{t.admin.meals.backToProfile}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">{t.admin.meals.title}</CardTitle>
            <CardDescription className="text-xs font-medium text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {t.admin.meals.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleRejectConfirm() {
    if (!selectedMeal || !rejectReason.trim()) return;
    const ok = await rejectMeal(selectedMeal.id, rejectReason);
    if (ok) {
      setRejectDialogOpen(false);
      setSelectedMeal(null);
      setRejectReason("");
    }
  }

  return (
    <>
      <Head>
        <title>{t.admin.meals.metaTitle}</title>
      </Head>
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.admin.meals.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.admin.meals.description}</p>
        </div>

        {meals.length === 0 ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">{t.admin.meals.emptyState}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                actionLoading={actionLoading}
                onApprove={approveMeal}
                onOpenReject={(m) => {
                  setSelectedMeal(m);
                  setRejectReason("");
                  setRejectDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <RejectMealDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        meal={selectedMeal}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
