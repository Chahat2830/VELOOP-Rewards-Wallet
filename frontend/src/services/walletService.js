import { api } from "./api";
export const getWallet = () => api("/wallet");
export const getWalletSummary = () => api("/wallet/summary");
