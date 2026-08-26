import { useState, useCallback } from "react";
import { toast } from "sonner";

function useOrdersFetcher(endpoint) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
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
        throw new Error(result.message || "فشل تحميل الطلبات");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
      toast.error(err.message || "حدث خطأ أثناء تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

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
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
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
        throw new Error(result.message || "فشل تحميل تفاصيل الطلب");
      }
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err.message);
      toast.error(err.message || "حدث خطأ أثناء تحميل تفاصيل الطلب");
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { order, loading, error, fetchOrder };
}

export function useChefOrderActions() {
  const [actionLoading, setActionLoading] = useState(false);

  const updateStatus = useCallback(async (orderId, action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
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
        toast.success("تم تحديث حالة الطلب بنجاح");
        return result.data;
      } else {
        throw new Error(result.message || "فشل تحديث حالة الطلب");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(err.message || "حدث خطأ أثناء تحديث حالة الطلب");
      return null;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const acceptOrder = useCallback((orderId) => updateStatus(orderId, "accept"), [updateStatus]);
  const rejectOrder = useCallback((orderId) => updateStatus(orderId, "reject"), [updateStatus]);
  const deliverOrder = useCallback((orderId) => updateStatus(orderId, "deliver"), [updateStatus]);

  return { actionLoading, acceptOrder, rejectOrder, deliverOrder };
}
