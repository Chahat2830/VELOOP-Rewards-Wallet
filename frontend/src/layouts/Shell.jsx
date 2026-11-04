import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, Gamepad2, ReceiptText, ArrowDownToLine, Gift, Trophy, UserRound, Shield, LogOut, Menu, X, Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const nav = [
  ['Dashboard', '/', LayoutDashboard], ['Wallet', '/wallet', Wallet], ['Games', '/games', Gamepad2, 'HOT'], ['Transactions', '/transactions', ReceiptText], ['Withdrawals', '/withdrawals', ArrowDownToLine], ['Rewards', '/rewards', Gift], ['Leaderboard', '/leaderboard', Trophy], ['Profile', '/profile', UserRound],
];
export default function Shell() {
  const { user, isAdmin, logout } = useAuth(); const navigate = useNavigate(); const [mobileOpen, setMobileOpen] = useState(false);
  const leave = () => { logout(); navigate('/login'); };
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">V</span><div><b>VELOOP</b><small>Gaming Rewards</small></div><button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X/></button></div>
      <div className="sidebar-user"><div className="avatar">{(user?.name || user?.email || 'V')[0].toUpperCase()}</div><div><b>{user?.name || 'Player'}</b><small>{isAdmin ? 'Admin access' : 'Player account'} <span className="online-dot"/></small></div><span className="user-level">LV.12</span></div>
      <div className="nav-label">MAIN MENU</div><nav className="side-nav">{nav.map(([name, path, Icon, badge]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{name}</span>{badge && <em>{badge}</em>}</NavLink>)}{isAdmin && <><div className="nav-label admin-label">ADMINISTRATION</div><NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Shield size={18}/><span>Admin console</span></NavLink></>}</nav>
      <div className="sidebar-bottom"><div className="sidebar-promo"><Sparkles size={17}/><b>Nightfall Season</b><small>New rewards are waiting</small><div className="promo-progress"><i/></div><span>Season pass · 68%</span></div><button className="logout-btn" onClick={leave}><LogOut size={17}/> Sign out</button><small className="sidebar-version">VELOOP UI · v1.0</small></div>
    </aside>
    {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu/></button><div className="breadcrumb"><span>VELOOP</span><i>/</i><b>Gaming Hub</b></div></div><div className="topbar-actions"><div className="searchbox"><Search size={15}/><input placeholder="Search games, rewards…" aria-label="Search"/></div><button className="icon-btn notification-btn" aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-user"><div className="avatar small-avatar">{(user?.name || 'V')[0].toUpperCase()}</div><div><b>{user?.name?.split(' ')[0] || 'Player'}</b><small>{isAdmin ? 'Administrator' : 'Level 12'}</small></div></div></div></header>
      <div className="page-content"><motion.div key={window.location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}><Outlet/></motion.div></div>
    </main>
  </div>;
}
