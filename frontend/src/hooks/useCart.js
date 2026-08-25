import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useCart() {
  const [cartData, setCartData] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
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

  return { cartData, cartTotal, fetchCart, addToCart, loading, error };
}
