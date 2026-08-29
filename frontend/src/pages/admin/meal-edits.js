import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useAdminMeals, isPendingMealEditRequest } from "@/hooks/useAdmin";
import { useTranslation } from "@/hooks/useTranslation";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MealEditCard from "@/components/admin/meal-edit-card";
import RejectMealDialog from "@/components/admin/reject-meal-dialog";

export default function AdminMealEditsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { meals, loading, error, actionLoading, fetchMealRequests, approveMeal, rejectMeal } = useAdminMeals();
  const { t } = useTranslation();

  const editRequests = meals.filter(isPendingMealEditRequest);

  const [tagNameById, setTagNameById] = useState({});
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "ADMIN") {
      queueMicrotask(() => fetchMealRequests());
    }
  }, [authLoading, isAuthenticated, user, fetchMealRequests]);

  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/tag", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const tagList = Array.isArray(result.data) ? result.data : [];

        if (!cancelled) {
          const map = {};
          tagList.forEach((tag) => {
            if (tag?.id) map[tag.id] = tag.name;
          });
          setTagNameById(map);
        }
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    }

    if (isAuthenticated && user?.role === "ADMIN") {
      loadTags();
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) return <Loading />;

  if (user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">
              {t.admin.mealEdits.accessDeniedTitle}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.admin.mealEdits.accessDeniedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/profile">
              <Button>{t.admin.mealEdits.backToProfile}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">{t.admin.mealEdits.title}</CardTitle>
            <CardDescription className="text-xs font-medium text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {t.admin.mealEdits.retry}
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
        <title>{t.admin.mealEdits.metaTitle}</title>
      </Head>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col p-4">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.admin.mealEdits.title}
            </h1>
            <p className="text-sm text-muted-foreground">{t.admin.mealEdits.description}</p>
          </div>

          {editRequests.length === 0 ? (
            <Card className="border-border/60 bg-card shadow-sm">
              <CardContent className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">{t.admin.mealEdits.emptyState}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5">
              {editRequests.map((meal) => (
                <MealEditCard
                  key={meal.id}
                  meal={meal}
                  tagNameById={tagNameById}
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