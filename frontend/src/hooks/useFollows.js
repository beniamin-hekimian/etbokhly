import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";

// =========================
// useFollow — toggle follow state for a single chef
// =========================

export function useFollow({ chefId, initialFollowing = false, initialCount = 0, onRequireLogin }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [followersCount, setFollowersCount] = useState(Number(initialCount) || 0);
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

      const previous = { following, followersCount };
      const nextFollowing = !following;
      setFollowing(nextFollowing);
      setFollowersCount((count) => Math.max(0, count + (nextFollowing ? 1 : -1)));

      try {
        const response = await fetch(`/api/follow/${chefId}`, {
          method: nextFollowing ? "POST" : "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || (nextFollowing ? t.toast.followError : t.toast.unfollowError));
        }

        if (typeof result.data?.followersCount === "number") {
          setFollowersCount(result.data.followersCount);
        }
        setFollowing(Boolean(result.data?.followed));
      } catch (err) {
        console.error("Failed to update follow:", err);
        setFollowing(previous.following);
        setFollowersCount(previous.followersCount);
        toast.error(err.message || (previous.following ? t.toast.unfollowError : t.toast.followError));
      } finally {
        setPending(false);
      }
    },
    [isAuthenticated, pending, following, followersCount, chefId, t, onRequireLogin],
  );

  return {
    following,
    followersCount,
    toggle,
    pending,
  };
}

// =========================
// useMyFollowing — paginated list of chefs I follow
// =========================

export function useMyFollowing() {
  const { t } = useTranslation();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFollowing() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) toast.error(t.toast.loginRequired);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/follow/following?page=${page}&limit=9`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          if (!cancelled) {
            setChefs(result.data || []);
            setMeta(result.meta || null);
          }
        } else {
          throw new Error(result.message || t.toast.followLoadError);
        }
      } catch (err) {
        console.error("Error fetching following chefs:", err);

        if (!cancelled) {
          setError(err.message);
          toast.error(err.message || t.toast.followLoadCatch);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFollowing();

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey, t]);

  return {
    chefs,
    loading,
    error,
    page,
    setPage,
    meta,
    retry: () => setReloadKey((key) => key + 1),
  };
}

// =========================
// useUserList — paginated list for a chef's followers/following tabs
// =========================

export function useUserList(endpoint) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${endpoint}?page=${page}&limit=12`, { headers });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          if (!cancelled) {
            setUsers(result.data || []);
            setMeta(result.meta || null);
          }
        } else {
          throw new Error(result.message || t.toast.followLoadError);
        }
      } catch (err) {
        console.error("Error fetching user list:", err);

        if (!cancelled) {
          setError(err.message);
          toast.error(err.message || t.toast.followLoadCatch);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [endpoint, page, reloadKey, t]);

  return {
    users,
    loading,
    error,
    page,
    setPage,
    meta,
    retry: () => setReloadKey((key) => key + 1),
  };
}