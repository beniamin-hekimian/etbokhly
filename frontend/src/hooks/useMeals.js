import { useEffect, useState } from "react";

const PAGE_SIZE = 9;

function buildUrl(id, q, tag, page) {
  if (id) {
    return `/api/meal/${id}`;
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  return `/api/meal?${params.toString()}`;
}

// Hook for fetching a single meal (when id given) or a paginated,
// server-filtered list of meals (otherwise).
export default function useMeals(id = null, { query = "", tag = "" } = {}) {
  const [meals, setMeals] = useState([]);
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(
    function () {
      let cancelled = false;

      async function fetchData() {
        try {
          setIsLoading(true);
          setError(null);

          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          const url = buildUrl(id, query, tag, page);
          const response = await fetch(url, { headers });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result = await response.json();

          if (result.status !== "success") {
            throw new Error(result.message || "Failed to load meals.");
          }

          if (!cancelled) {
            if (id) {
              setMeal(result.data);
            } else {
              setMeals(Array.isArray(result.data) ? result.data : []);
              setMeta(result.meta || null);
            }
          }
        } catch (err) {
          console.error("Failed to fetch meal data:", err);

          if (!cancelled) {
            setError(err.message || "Failed to load meal data.");
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      fetchData();

      return function () {
        cancelled = true;
      };
    },
    [id, query, tag, page],
  );

  return {
    meals,
    meal,
    isLoading,
    error,
    page,
    setPage,
    meta,
  };
}
