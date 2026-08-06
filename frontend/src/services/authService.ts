import { apiClient } from "@/lib/apiClient";

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiClient("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
