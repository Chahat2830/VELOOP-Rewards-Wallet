import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ReceiptText, ArrowDownToLine, UserRound, Shield, LogOut, Menu, X, Bell, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  ['Overview', '/', LayoutDashboard],
  ['Wallet', '/wallet', Wallet],
  ['Transactions', '/transactions', ReceiptText],
  ['Withdrawals', '/withdrawals', ArrowDownToLine],
  ['Profile', '/profile', UserRound],
  ['AI Assistant', '/ai-assistant', Bot],
];
export default function Shell() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const leave = () => { logout(); navigate('/login'); };
  const initial = (user?.name || user?.email || 'V').charAt(0).toUpperCase();
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <span className="brand-mark">V</span>
        <div><b>VELOOP</b><small>Rewards Wallet</small></div>
        <button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button>
      </div>
      <div className="sidebar-user">
        <div className="avatar">{initial}</div>
        <div className="sidebar-user-info"><b>{user?.name || user?.email || 'Account'}</b><small>{isAdmin ? 'Administrator' : 'Member account'}</small></div>
      </div>
      <div className="nav-label">MENU</div>
      <nav className="side-nav">
        {nav.map(([name, path, Icon]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{name}</span></NavLink>)}
        {isAdmin && <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Shield size={18}/><span>Admin Console</span></NavLink>}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="status-dot"/><div><b>Wallet secured</b><small>Backend connected session</small></div></div>
        <button className="logout-btn" onClick={leave}><LogOut size={17}/> Sign out</button>
        <small className="sidebar-version">VELOOP · Rewards Platform</small>
      </div>
    </aside>
    {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb"><span>VELOOP</span><i>/</i><b>Wallet Portal</b></div></div>
        <div className="topbar-actions"><span className="topbar-secure"><span className="status-dot"/> Secure session</span><button className="icon-btn" aria-label="Notifications"><Bell size={18}/></button><div className="top-user"><div className="avatar small-avatar">{initial}</div><div><b>{user?.name?.split(' ')[0] || 'Member'}</b><small>{isAdmin ? 'Admin' : 'Account'}</small></div></div></div>
      </header>
      <div className="page-content"><Outlet/></div>
    </main>
  </div>;
}
