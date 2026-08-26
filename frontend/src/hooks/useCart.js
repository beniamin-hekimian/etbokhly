import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCart() {
  const [cartData, setCartData] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [checkoutData, setCheckoutData] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً لتصفح السلة");
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
        throw new Error(result.message || "فشل تحميل بيانات السلة");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message);
      toast.error(err.message || "حدث خطأ أثناء تحميل السلة");
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (mealId, quantity = 1) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة الوجبات إلى السلة");
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
        toast.success("تمت إضافة الوجبة إلى السلة بنجاح");
        return result;
      } else {
        throw new Error(result.message || "فشلت إضافة الوجبة إلى السلة");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.message || "حدث خطأ أثناء الإضافة إلى السلة");
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckoutSummary = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
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
        throw new Error(result.message || "فشل تحميل ملخص الطلب");
      }
    } catch (err) {
      console.error("Error fetching checkout summary:", err);
      setError(err.message);
      toast.error(err.message || "حدث خطأ أثناء تحميل ملخص الطلب");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkout = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("يرجى تسجيل الدخول أولاً");
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
        toast.success("تم تأكيد طلبك بنجاح!");
        setCartData([]);
        setCartTotal(0);
        return result;
      } else {
        throw new Error(result.message || "فشل تأكيد الطلب");
      }
    } catch (err) {
      console.error("Error checking out:", err);
      toast.error(err.message || "حدث خطأ أثناء تأكيد الطلب");
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
