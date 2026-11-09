import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Shell from './layouts/Shell';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WalletPage from './pages/Wallet';
import Transactions from './pages/Transactions';
import Withdrawals from './pages/Withdrawals';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';

function Guard({ children, admin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
function HomeRedirect() {
  const { isAuthenticated, isAdmin } = useAuth();
  return <Navigate to={!isAuthenticated ? '/login' : isAdmin ? '/admin' : '/'} replace />;
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<Auth />} />
    <Route path="/register" element={<Auth register />} />
    <Route element={<Guard><Shell /></Guard>}>
      <Route index element={<Dashboard />} />
      <Route path="wallet" element={<WalletPage />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="withdrawals" element={<Withdrawals />} />
      <Route path="profile" element={<Profile />} />
      <Route path="ai-assistant" element={<AIAssistant />} />
      <Route path="admin" element={<Guard admin><Admin /></Guard>} />
    </Route>
    <Route path="*" element={<HomeRedirect />} />
  </Routes>;
}
