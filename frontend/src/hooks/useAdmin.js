import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

// Manage admin chef operations
export function useAdminChefs() {
  const { t } = useTranslation();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchChefRequests = useCallback(async function () {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/chefs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to load chef requests.");
      }
      setChefs(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load chef requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function approveChef(chefId) {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/chefs/${chefId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || t.toast.adminChefApproveError);
      }
      toast.success(t.toast.adminChefApproveSuccess);
      await fetchChefRequests();
    } catch (err) {
      toast.error(err.message || t.toast.adminChefApproveError);
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectChef(chefId, reason) {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/chefs/${chefId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || t.toast.adminChefRejectError);
      }
      toast.success(t.toast.adminChefRejectSuccess);
      await fetchChefRequests();
      return true;
    } catch (err) {
      toast.error(err.message || t.toast.adminChefRejectError);
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  return { chefs, loading, error, actionLoading, fetchChefRequests, approveChef, rejectChef };
}

// Manage admin meal operations
export function useAdminMeals() {
  const { t } = useTranslation();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMealRequests = useCallback(async function () {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/meals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to load meal requests.");
      }
      setMeals(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load meal requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function approveMeal(mealId) {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/meals/${mealId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || t.toast.adminMealApproveError);
      }
      toast.success(t.toast.adminMealApproveSuccess);
      await fetchMealRequests();
    } catch (err) {
      toast.error(err.message || t.toast.adminMealApproveError);
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectMeal(mealId, reason) {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/meals/${mealId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const result = await res.json();
      if (!res.ok || result.status !== "success") {
        throw new Error(result.message || t.toast.adminMealRejectError);
      }
      toast.success(t.toast.adminMealRejectSuccess);
      await fetchMealRequests();
      return true;
    } catch (err) {
      toast.error(err.message || t.toast.adminMealRejectError);
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  return { meals, loading, error, actionLoading, fetchMealRequests, approveMeal, rejectMeal };
}
