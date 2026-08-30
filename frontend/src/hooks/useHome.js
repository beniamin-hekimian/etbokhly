import { useEffect, useState } from "react";

export default function useHome() {
  const [latestMeals, setLatestMeals] = useState([]);
  const [topChefs, setTopChefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch("/api/home", { headers });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const result = await response.json();

        if (!cancelled) {
          setLatestMeals(result.data?.meals || []);
          setTopChefs(result.data?.chefs || []);
        }
      } catch (err) {
        console.error("Failed to fetch home data:", err);
        if (!cancelled) setError(err.message || "Failed to load data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { latestMeals, topChefs, isLoading, error };
}
