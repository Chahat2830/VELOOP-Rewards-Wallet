import { api } from "./api";
export const getPayouts = (page = 1, limit = 100) =>
  api(`/payouts?page=${page}&limit=${limit}`).then(
    (x) => x.payouts || x.items || x.withdrawals || x.data || x,
  );
export const getPayoutOptions = () => api("/payouts/options");
export const createPayout = (payload) =>
  api("/payouts", { method: "POST", body: payload });
export const payoutAction = (id, action, payload = {}) =>
  api(`/payouts/${id}/${action}`, { method: "PATCH", body: payload });
