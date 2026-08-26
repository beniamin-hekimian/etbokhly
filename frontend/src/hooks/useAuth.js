import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth as useAuthContext } from "@/context/AuthContext";

export default function useAuth() {
  const router = useRouter();
  const { login } = useAuthContext();
  const { t } = useTranslation();

  // Login state
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleLogin = async (data) => {
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid email or password");
      }

      if (result.status === "success") {
        login(result.token, result.data.user);

        toast.success(t.toast.welcomeBack.replace("{{name}}", result.data.user.full_name));

        router.push("/");
      }
    } catch (err) {
      setLoginError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (data) => {
    setIsRegistering(true);
    setRegisterError("");

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      if (result.status === "success") {
        login(result.token, result.data.user);

        toast.success(t.toast.welcomeNew.replace("{{name}}", result.data.user.full_name));

        router.push("/");
      }
    } catch (err) {
      setRegisterError(err.message);
      toast.error(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    // Login
    handleLogin,
    isLoggingIn,
    loginError,

    // Signup
    handleSignup,
    isRegistering,
    registerError,
  };
}
