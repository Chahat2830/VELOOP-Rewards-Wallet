import { api } from "./api";

// Fetch payouts with backend-compatible pagination
export const getPayouts = (page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 20));

  return api(`/payouts?page=${safePage}&limit=${safeLimit}`).then(
    (x) => x.payouts || x.items || x.withdrawals || x.data || x,
  );
};

export const getPayoutOptions = () => api("/payouts/options");

export const createPayout = (payload) =>
  api("/payouts", {
    method: "POST",
    body: payload,
  });

export const payoutAction = (id, action, payload = {}) =>
  api(`/payouts/${id}/${action}`, {
    method: "PATCH",
    body: payload,
  });
