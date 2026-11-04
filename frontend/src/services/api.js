const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://veloop-rewards-wallet.onrender.com/api"
).replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("velop_token");
}
export function errorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(
    `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.message || payload.error || `Request failed (${response.status})`,
    );
  }
  return payload.data ?? payload;
}
