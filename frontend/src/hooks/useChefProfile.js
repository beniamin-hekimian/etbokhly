import { useEffect, useState } from "react";

export default function useChefProfile(id) {
  const [chef, setChef] = useState(null);
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(
    function () {
      let cancelled = false;

      async function fetchChefProfile() {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch(`/api/chef/profile/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const result = await response.json();

          if (result.status !== "success") {
            throw new Error(result.message || "Failed to load chef profile.");
          }

          if (!cancelled) {
            setChef(result.data);
            setMeals(Array.isArray(result.meals) ? result.meals : []);
          }
        } catch (err) {
          console.error("Failed to fetch chef profile:", err);

          if (!cancelled) {
            setError(err.message || "Failed to load chef profile.");
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      }

      if (id) {
        fetchChefProfile();
      }

      return function () {
        cancelled = true;
      };
    },
    [id],
  );

  return {
    chef,
    meals,
    isLoading,
    error,
  };
}
