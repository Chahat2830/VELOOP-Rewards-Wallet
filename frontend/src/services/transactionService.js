import { api } from "./api";
export const getTransactions = (page = 1, limit = 10) =>
  api(`/transactions?page=${page}&limit=${limit}`).then(
    (x) => x.transactions || x.items || x.data || x,
  );
export const adjustWallet = (payload, operation = "credit") =>
  api(`/transactions/${operation}`, { method: "POST", body: payload });
