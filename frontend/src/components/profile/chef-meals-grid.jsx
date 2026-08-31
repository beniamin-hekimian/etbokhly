import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Circle, Loader2, Pen, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChefMealsGrid() {
  const authContext = useAuth();
  const { t } = useTranslation();

  const token = authContext?.token || (typeof window !== "undefined" && localStorage.getItem("token"));

  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function fetchChefMeals() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const res = await fetch("/api/chef/getcreatemealstatus", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const result = await res.json();
        const mealList = Array.isArray(result.data) ? result.data : [];

        const sortedMeals = [...mealList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setMeals(sortedMeals);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChefMeals();
  }, [token]);

  const getStatusConfig = (meal) => {
    if (meal.mealRequestStatus === "APPROVED" && meal.editRequestStatus === "PENDING") {
      return {
        label: t.profile.statusEditPending,
        dotColor: "fill-sky-500",
      };
    }

    switch (meal.mealRequestStatus) {
      case "APPROVED":
        return {
          label: t.profile.statusApproved,
          dotColor: "fill-emerald-500",
        };

      case "REJECTED":
        return {
          label: t.profile.statusRejected,
          dotColor: "fill-red-500",
        };

      case "PENDING":
      default:
        return {
          label: t.profile.statusPending,
          dotColor: "fill-amber-500",
        };
    }
  };

  const handleOpenDeleteDialog = (meal) => {
    setSelectedMeal(meal);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMeal || !token) return;

    try {
      setDeleteLoading(true);

      const res = await fetch(`/api/chef/${selectedMeal.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete meal.");
      }

      setMeals((currentMeals) => currentMeals.filter((meal) => meal.id !== selectedMeal.id));
      setDeleteDialogOpen(false);
      setSelectedMeal(null);

      toast.success("Meal deleted successfully.");
    } catch (err) {
      console.error("Failed to delete meal:", err);
      toast.error(err.message || "Failed to delete meal.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <Card className="p-6 text-center text-sm text-destructive">{t.profile.loadMealsError}</Card>;
  }

  return (
    <>
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">{t.profile.myMeals}</h2>

          <Link href="/chef/meals/create">
            <Button className="font-bold shadow-xs">{t.profile.createMeal}</Button>
          </Link>
        </div>

        {meals.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex min-h-36 items-center justify-center p-6 text-muted-foreground">
              {t.profile.noMealsYet}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {meals.map((meal) => {
              const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
              const statusConfig = getStatusConfig(meal);

              return (
                <Card
                  key={meal.id}
                  className="group flex flex-col overflow-hidden border-border bg-card p-0 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  {/* Visual Image Header */}
                  <div className="relative h-47.5 w-full overflow-hidden bg-muted">
                    <Link href={`/meals/${meal.id}`} className="relative block h-full w-full">
                      <Image
                        src={mealPhotoSrc}
                        alt={meal.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Status Badge */}
                    <div className="absolute top-3.5 inset-s-3.5 flex items-center">
                      <Badge
                        variant="secondary"
                        className="gap-1.5 border-0 bg-[#1F2937]/72 px-2.5 py-1 text-[0.72rem] font-bold text-white backdrop-blur-xs shadow-xs"
                      >
                        <Circle className={`h-2.5 w-2.5 animate-pulse ${statusConfig.dotColor} stroke-none`} />
                        {statusConfig.label}
                      </Badge>
                    </div>

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

                    {/* Meal Emoji fallback/badge if available */}
                    {meal.emoji && (
                      <span className="absolute bottom-2 inset-e-3.5 text-4xl transition-transform duration-350 drop-shadow-[0_8px_14px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-4">
                        {meal.emoji}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <CardContent className="flex flex-1 flex-col p-5.5 pb-6">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Link href={`/meals/${meal.id}`} className="flex-1">
                        <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {meal.title}
                        </h3>
                      </Link>

                      {meal.rating && (
                        <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary whitespace-nowrap pt-0.5">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span>{meal.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {meal.content || meal.description || t.profile.noDescription}
                    </p>

                    {/* Rejection Reason */}
                    {meal.mealRequestStatus === "REJECTED" && meal.mealRequestRejectReason && (
                      <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                        <span className="font-semibold">{t.profile.reasonLabel}: </span>
                        {meal.mealRequestRejectReason}
                      </div>
                    )}

                    {/* Edit Rejection Reason */}
                    {meal.editRequestStatus === "REJECTED" && meal.editRequestRejectReason && (
                      <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                        <span className="font-semibold">{t.profile.editRejectReasonLabel}: </span>
                        {meal.editRequestRejectReason}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4">
                      <span className="text-base font-extrabold text-foreground">
                        {meal.price} {t.latestMeals?.priceLabel || "SYP"}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link href={`/chef/meals/${meal.id}/edit`} onClick={(event) => event.stopPropagation()}>
                          <Button type="button" variant="outline" size="sm" className="gap-1.5 font-bold shadow-xs">
                            <Pen className="h-3.5 w-3.5" />
                            {t.profile.editMealBtn}
                          </Button>
                        </Link>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="gap-1.5 font-bold shadow-xs"
                          onClick={() => handleOpenDeleteDialog(meal)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t.profile.delete}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteLoading) {
            setDeleteDialogOpen(open);
            if (!open) setSelectedMeal(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.profile.deleteMealTitle}</DialogTitle>
            <DialogDescription>
              {t.profile.deleteMealConfirm}{" "}
              <span className="font-semibold text-foreground">&quot;{selectedMeal?.title}&quot;</span>?{" "}
              {t.profile.cannotBeUndone}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
              {t.profile.cancel}
            </Button>

            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.profile.deleting}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {t.profile.deleteMealTitle}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
