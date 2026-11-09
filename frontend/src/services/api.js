const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://veloop-rewards-wallet.onrender.com/api"
).replace(/\/$/, "");

// Get authentication token
export function getToken() {
  return localStorage.getItem("velop_token");
}

// Save authentication token
export function setToken(token) {
  if (token) {
    localStorage.setItem("velop_token", token);
  }
}

// Remove authentication token
export function removeToken() {
  localStorage.removeItem("velop_token");
}

// Format error messages
export function errorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

// Main API request function
export async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  // Add JWT authentication
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the VELOOP backend. Check whether the server is running.",
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.message ||
        payload.error ||
        `API request failed with status ${response.status}`,
    );
  }

  return payload.data ?? payload;
}

export default api;
