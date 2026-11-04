import { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../services/authService';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('velop_user') || 'null'); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('velop_token'));
  const login = async credentials => {
    const response = await loginRequest(credentials);
    const data = response.data || response;
    const authToken = data.token || data.accessToken || data.jwt;
    const account = data.user || data.account;
    if (!authToken) throw new Error('Login succeeded but no token was returned by the API.');
    localStorage.setItem('velop_token', authToken);
    if (account) localStorage.setItem('velop_user', JSON.stringify(account));
    setToken(authToken); setUser(account || null); return { ...data, token: authToken, user: account };
  };
  const logout = () => { localStorage.removeItem('velop_token'); localStorage.removeItem('velop_user'); setToken(null); setUser(null); };
  const value = useMemo(() => ({ user, token, isAuthenticated: Boolean(token), isAdmin: user?.role === 'admin', login, logout, register: registerRequest }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
