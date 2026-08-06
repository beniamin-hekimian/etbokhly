import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";

export function useAuth() {
  const router = useRouter();

  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
  } = useMutation({
    mutationFn: authService.register,
    onSuccess: () => router.push("/"),
  });

  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
  } = useMutation({
    mutationFn: authService.login,
    onSuccess: () => router.push("/"),
  });

  return {
    register,
    isRegistering,
    registerError,
    login,
    isLoggingIn,
    loginError,
  };
}
