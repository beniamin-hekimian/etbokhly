import { useEffect, useState } from "react";

// Hook for fetching all meals or single meal details
export default function useMeals(id = null) {
  const [meals, setMeals] = useState([]);
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    function () {
      let cancelled = false;

      async function fetchData() {
        try {
          setIsLoading(true);
          setError(null);

          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          // Single meal fetch
          if (id) {
            const response = await fetch(`/api/meal/${id}`, { headers });

            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }

            const result = await response.json();

            if (result.status !== "success") {
              throw new Error(result.message || "Failed to load meal details.");
            }

            if (!cancelled) {
              setMeal(result.data);
            }
            return;
          }

          // All meals fetch
          const response = await fetch("/api/meal", { headers });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result = await response.json();

          if (result.status !== "success") {
            throw new Error(result.message || "Failed to load meals.");
          }

          const mealList = Array.isArray(result.data) ? result.data : [];

          const approvedMeals = mealList.filter(function (item) {
            return item.mealRequestStatus === "APPROVED";
          });

          const sortedMeals = [...approvedMeals].sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          if (!cancelled) {
            setMeals(sortedMeals);
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
    [id],
  );

  return {
    meals,
    meal,
    isLoading,
    error,
  };
}
