import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Circle, Loader2 } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"; // MUST be Context, NOT @/hooks/useAuth

export default function ChefMealsGrid() {
  const authContext = useAuth();
  // Get token from context OR fallback to localStorage
  const token = authContext?.token || (typeof window !== "undefined" && localStorage.getItem("token"));

  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChefMeals() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const res = await fetch("/api/meal/getcreatemealstatus", {
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

  const getStatusConfig = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          dotColor: "fill-emerald-500",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          dotColor: "fill-red-500",
        };
      case "PENDING":
      default:
        return {
          label: "Pending",
          dotColor: "fill-amber-500",
        };
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
    return <Card className="p-6 text-center text-sm text-destructive">Could not load your meals right now.</Card>;
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl text-secondary sm:text-5xl">My Meals</h2>
        <Link href="/chef/meals/create">
          <Button>Create Meal</Button>
        </Link>
      </div>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-36 items-center justify-center p-6 text-muted-foreground">
            No meals added yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => {
            const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
            const statusConfig = getStatusConfig(meal.mealRequestStatus);

            return (
              <Link key={meal.id} href={`/meals/${meal.id}`} className="group block">
                <Card className="flex flex-col gap-0 h-full overflow-hidden border transition-all duration-200 group-hover:shadow-md group-hover:border-primary/40 py-0">
                  {/* Top Image Box */}
                  <div className="relative aspect-16/10 w-full bg-muted overflow-hidden">
                    <Image
                      src={mealPhotoSrc}
                      alt={meal.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Status Badge Over Image */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-background/90 backdrop-blur-md border gap-1.5 px-2.5 py-1 text-xs font-medium shadow-sm"
                      >
                        <Circle className={`h-2.5 w-2.5 animate-pulse ${statusConfig.dotColor} stroke-none`} />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="flex flex-1 flex-col justify-between p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-lg font-bold group-hover:text-primary transition-colors">
                          {meal.title}
                        </CardTitle>
                        <span className="font-bold text-base text-primary shrink-0">${meal.price}</span>
                      </div>

                      <p className="text-muted-foreground line-clamp-2">{meal.content || "No description provided."}</p>
                    </div>

                    {/* Rejection Alert Box */}
                    {meal.mealRequestStatus === "REJECTED" && meal.mealRequestRejectReason && (
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive mt-auto">
                        <span className="font-semibold">Reason: </span>
                        {meal.mealRequestRejectReason}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
