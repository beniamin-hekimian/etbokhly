import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

const CartContext = createContext(null);

export function CartProvider({ children }) {
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
        const cartResult = await fetchCart();
        return cartResult;
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

  const applyOrderResponse = useCallback((order) => {
    if (!order) return;

    setCartData((prev) => {
      const next =
        order.items?.length === 0
          ? prev.filter((entry) => entry.id !== order.id)
          : prev.map((entry) => (entry.id === order.id ? order : entry));

      setCartTotal(
        next.reduce((sum, entry) => sum + Number(entry.total || entry.price || 0), 0)
      );

      return next;
    });
  }, []);

  const updateItemQuantity = async (orderId, itemId, quantity) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return false;
    }

    try {
      const response = await fetch(`/api/order/${orderId}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        applyOrderResponse(result.data);
        toast.success(t.toast.cartUpdateSuccess);
        return true;
      } else {
        throw new Error(result.message || t.toast.cartUpdateError);
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
      toast.error(err.message || t.toast.cartUpdateCatch);
      return false;
    }
  };

  const removeCartItem = async (orderId, itemId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error(t.toast.loginRequired);
      return false;
    }

    try {
      const response = await fetch(`/api/order/${orderId}/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        applyOrderResponse(result.data);
        toast.success(t.toast.cartRemoveSuccess);
        return true;
      } else {
        throw new Error(result.message || t.toast.cartRemoveError);
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      toast.error(err.message || t.toast.cartRemoveCatch);
      return false;
    }
  };

  const checkout = useCallback(async (note) => {
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
        body: JSON.stringify({ note: note ?? "" }),
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

  const value = {
    cartData,
    cartTotal,
    checkoutData,
    checkoutTotal,
    fetchCart,
    fetchCheckoutSummary,
    addToCart,
    updateItemQuantity,
    removeCartItem,
    checkout,
    loading,
    error,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};