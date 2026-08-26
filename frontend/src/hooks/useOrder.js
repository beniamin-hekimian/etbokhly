import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

function useOrdersFetcher(endpoint) {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setOrders(result.data || []);
      } else {
        throw new Error(result.message || t.toast.ordersLoadError);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      toast.error(err.message || t.toast.ordersLoadCatch);
    } finally {
      setLoading(false);
    }
  }, [endpoint, t]);

  return { orders, loading, error, fetchOrders };
}

export function useMyOrders() {
  return useOrdersFetcher("/api/order/me");
}

export function useMyCurrentOrders() {
  return useOrdersFetcher("/api/order/me/current");
}

export function useMyPreviousOrders() {
  return useOrdersFetcher("/api/order/me/previous");
}

export function useChefOrders() {
  return useOrdersFetcher("/api/order/chef");
}

export function useChefCurrentOrders() {
  return useOrdersFetcher("/api/order/chef/current");
}

export function useChefPreviousOrders() {
  return useOrdersFetcher("/api/order/chef/previous");
}

export function useOrderDetail(id) {
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setOrder(result.data || null);
      } else {
        throw new Error(result.message || t.toast.orderDetailError);
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err.message);
      toast.error(err.message || t.toast.orderDetailCatch);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  return { order, loading, error, fetchOrder };
}

export function useChefOrderActions() {
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState(false);

  const updateStatus = useCallback(async (orderId, action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return null;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`/api/order/${orderId}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(t.toast.orderStatusSuccess);
        return result.data;
      } else {
        throw new Error(result.message || t.toast.orderStatusError);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(err.message || t.toast.orderStatusCatch);
      return null;
    } finally {
      setActionLoading(false);
    }
  }, [t]);

  const acceptOrder = useCallback((orderId) => updateStatus(orderId, "accept"), [updateStatus]);
  const rejectOrder = useCallback((orderId) => updateStatus(orderId, "reject"), [updateStatus]);
  const deliverOrder = useCallback((orderId) => updateStatus(orderId, "deliver"), [updateStatus]);

  return { actionLoading, acceptOrder, rejectOrder, deliverOrder };
}
