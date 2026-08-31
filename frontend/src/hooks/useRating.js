import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

// =========================
// useRating — submit or update a star rating for a chef
// =========================

export function useRating({ chefId, initialMyScore = null, initialAvgRating = 0, initialRatingCount = 0 }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [myScore, setMyScore] = useState(initialMyScore ? Number(initialMyScore) : null);
  const [avgRating, setAvgRating] = useState(Number(initialAvgRating) || 0);
  const [ratingCount, setRatingCount] = useState(Number(initialRatingCount) || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequireLogin = useCallback(() => {
    if (typeof router?.push === "function") {
      router.push("/auth/login");
    }
  }, [router]);

  const submit = useCallback(
    async (score) => {
      const token = localStorage.getItem("token");

      if (!token || !isAuthenticated) {
        handleRequireLogin();
        return;
      }

      const numericScore = Number(score);
      if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
        return;
      }

      if (isSubmitting) return;

      const previous = { myScore, avgRating, ratingCount };
      setMyScore(numericScore);
      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/rating/chef/${chefId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score: numericScore }),
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || t.toast.ratingError);
        }

        if (typeof result.data?.avgRating === "number") {
          setAvgRating(result.data.avgRating);
        }
        if (typeof result.data?.ratingCount === "number") {
          setRatingCount(result.data.ratingCount);
        }
        setMyScore(Number(result.data?.rating?.score ?? numericScore));

        toast.success(t.toast.ratingSaved);
      } catch (err) {
        console.error("Failed to submit rating:", err);
        setMyScore(previous.myScore);
        setAvgRating(previous.avgRating);
        setRatingCount(previous.ratingCount);
        toast.error(err.message || t.toast.ratingError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [chefId, isAuthenticated, isSubmitting, myScore, avgRating, ratingCount, t, handleRequireLogin],
  );

  const remove = useCallback(
    async () => {
      const token = localStorage.getItem("token");

      if (!token || !isAuthenticated) {
        handleRequireLogin();
        return;
      }

      if (!myScore || isSubmitting) return;

      const previous = { myScore, avgRating, ratingCount };
      setMyScore(null);
      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/rating/chef/${chefId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || t.toast.ratingError);
        }

        if (typeof result.data?.avgRating === "number") {
          setAvgRating(result.data.avgRating);
        }
        if (typeof result.data?.ratingCount === "number") {
          setRatingCount(result.data.ratingCount);
        }
        setMyScore(null);

        toast.success(t.toast.ratingRemoved);
      } catch (err) {
        console.error("Failed to remove rating:", err);
        setMyScore(previous.myScore);
        setAvgRating(previous.avgRating);
        setRatingCount(previous.ratingCount);
        toast.error(err.message || t.toast.ratingError);
      } finally {
        setIsSubmitting(false);
      }
    },
    [chefId, isAuthenticated, isSubmitting, myScore, avgRating, ratingCount, t, handleRequireLogin],
  );

  return {
    myScore,
    avgRating,
    ratingCount,
    submit,
    remove,
    isSubmitting,
  };
}
