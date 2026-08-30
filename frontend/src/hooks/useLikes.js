import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

// =========================
// useLike — toggle like state for a single meal
// =========================

export function useLike({ mealId, initialLiked = false, initialCount = 0, onRequireLogin }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [liked, setLiked] = useState(Boolean(initialLiked));
  const [likesCount, setLikesCount] = useState(Number(initialCount) || 0);
  const [pending, setPending] = useState(false);

  const toggle = useCallback(
    async () => {
      const token = localStorage.getItem("token");

      if (!token || !isAuthenticated) {
        if (typeof onRequireLogin === "function") onRequireLogin();
        return;
      }

      if (pending) return;

      setPending(true);

      const previous = { liked, likesCount };
      const nextLiked = !liked;
      setLiked(nextLiked);
      setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));

      try {
        const response = await fetch(`/api/like/${mealId}`, {
          method: nextLiked ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || (nextLiked ? t.toast.likeError : t.toast.unlikeError));
        }

        if (typeof result.data?.likesCount === "number") {
          setLikesCount(result.data.likesCount);
        }
        setLiked(Boolean(result.data?.liked));
      } catch (err) {
        console.error("Failed to update like:", err);
        setLiked(previous.liked);
        setLikesCount(previous.likesCount);
        toast.error(err.message || (previous.liked ? t.toast.likeError : t.toast.unlikeError));
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, pending, liked, likesCount, mealId, t, onRequireLogin],
  );

  return {
    liked,
    likesCount,
    toggle,
    pending,
  };
}

// =========================
// useMyLikes — paginated list of meals I liked
// =========================

export function useMyLikes() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLikes() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) toast.error(t.toast.loginRequired);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/like?page=${page}&limit=9`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          if (!cancelled) {
            setMeals(result.data || []);
            setMeta(result.meta || null);
          }
        } else {
          throw new Error(result.message || t.toast.likesLoadError);
        }
      } catch (err) {
        console.error("Error fetching liked meals:", err);

        if (!cancelled) {
          setError(err.message);
          toast.error(err.message || t.toast.likesLoadCatch);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLikes();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, t]);

  return {
    meals,
    loading,
    error,
    page,
    setPage,
    meta,
    retry: () => setReloadKey((key) => key + 1),
  };
}