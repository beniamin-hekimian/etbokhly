import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function useCart() {
  const { t } = useTranslation();
  const [cartData, setCartData] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [checkoutData, setCheckoutData] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequiredCart);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/order/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setCartData(result.data || []);
        setCartTotal(result.cartTotal || 0);
      } else {
        throw new Error(result.message || t.toast.cartLoadError);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message);
      toast.error(err.message || t.toast.cartLoadCatch);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const addToCart = async (mealId, quantity = 1) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequiredAdd);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/order/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ mealId, quantity }],
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(t.toast.addToCartSuccess);
        return result;
      } else {
        throw new Error(result.message || t.toast.addToCartError);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.message || t.toast.addToCartCatch);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckoutSummary = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/order/checkout/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setCheckoutData(result.data || []);
        setCheckoutTotal(result.checkoutTotal || 0);
      } else {
        throw new Error(result.message || t.toast.checkoutSummaryError);
      }
    } catch (err) {
      console.error("Error fetching checkout summary:", err);
      setError(err.message);
      toast.error(err.message || t.toast.checkoutSummaryCatch);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const checkout = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/order/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(t.toast.checkoutSuccess);
        setCartData([]);
        setCartTotal(0);
        return result;
      } else {
        throw new Error(result.message || t.toast.checkoutError);
      }
    } catch (err) {
      console.error("Error checking out:", err);
      toast.error(err.message || t.toast.checkoutCatch);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    cartData,
    cartTotal,
    checkoutData,
    checkoutTotal,
    fetchCart,
    fetchCheckoutSummary,
    addToCart,
    checkout,
    loading,
    error,
  };
}
