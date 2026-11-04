import { api } from "./api";
export const loginRequest = (form) =>
  api("/auth/login", { method: "POST", body: form });
export const registerRequest = (form) =>
  api("/auth/register", { method: "POST", body: form });
