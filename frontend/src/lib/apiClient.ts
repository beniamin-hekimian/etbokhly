export function apiClient(url: string, options?: RequestInit) {
  return fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  }).then((res) => res.json());
}
