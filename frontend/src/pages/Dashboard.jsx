import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Coins, Gem, Layers3, Ticket, ArrowUpRight, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getWallet } from '../services/walletService';
import { getTransactions } from '../services/transactionService';
import { errorMessage } from '../services/api';
import { money } from '../utils/format';
import TransactionTable from '../components/TransactionTable';
import { PageIntro, Card, Alert, Loading } from '../components/Ui';

const assets = [
  {code:'VES', label:'Main balance', Icon:Wallet, tone:'blue'},
  {code:'SVES', label:'Stable balance', Icon:Coins, tone:'cyan'},
  {code:'GEMS', label:'Gems', Icon:Gem, tone:'violet'},
  {code:'TOKENS', label:'Tokens', Icon:Layers3, tone:'blue'},
  {code:'SPINS', label:'Spins', Icon:Ticket, tone:'cyan'},
];
export default function Dashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null), [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [w, t] = await Promise.all([getWallet(), getTransactions(1, 5)]);
      setWallet(w); setTransactions(Array.isArray(t) ? t : t?.transactions || []);
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const balances = wallet?.balances || {};
  const available = wallet?.availableBalances || {};
  const reserved = wallet?.reservedBalances || {};
  return <div className="page-stack">
    <PageIntro eyebrow="ACCOUNT OVERVIEW" title={<>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Member'}</span></>} description="Your VELOOP wallet and rewards, all in one place." action={<button className="btn-ghost" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh data</button>} />
    <Alert error={error}/>
    <section className="dashboard-hero">
      <div className="hero-glow"/>
      <div className="hero-content">
        <div className="hero-kicker"><ShieldCheck size={15}/> VELOOP REWARDS WALLET</div>
        <h2>Your rewards.<br/><span>One secure wallet.</span></h2>
        <p>Track balances, review activity, and redeem your eligible rewards.</p>
        <div className="hero-actions"><Link to="/wallet" className="btn-primary">View wallet <ArrowRight size={16}/></Link><Link to="/withdrawals" className="btn-outline">Withdraw funds <ArrowUpRight size={16}/></Link></div>
      </div>
      <div className="hero-abstract"><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><div className="hero-coin">V</div></div>
    </section>
    <div className="section-heading"><div><div className="eyebrow">YOUR ASSETS</div><h2>Wallet summary</h2></div><Link to="/wallet" className="text-link">Open wallet <ArrowUpRight size={14}/></Link></div>
    <div className="asset-grid">{assets.map(({code,label,Icon,tone},i)=><Card key={code} className={`asset-card ${tone}`} delay={i*.04}><div className="asset-card-head"><span className="asset-icon"><Icon size={19}/></span><span className="asset-code">{code}</span></div><small>{label}</small><h3>{loading&&!wallet?'—':money(balances[code],code)}</h3><div className="asset-card-footer"><span>Available</span><b>{loading&&!wallet?'—':money(available[code],code)}</b></div></Card>)}</div>
    <div className="dashboard-lower">
      <Card className="balance-overview"><div className="section-heading"><div><div className="eyebrow">VES BALANCE</div><h2>Main wallet</h2></div><span className="pill pill-blue">Live backend data</span></div><div className="main-balance">{loading&&!wallet?'••••••':money(balances.VES)}</div><div className="balance-detail-grid"><div><small>Available</small><b>{loading&&!wallet?'—':money(available.VES)}</b></div><div><small>Reserved</small><b>{loading&&!wallet?'—':money(reserved.VES)}</b></div></div><div className="card-actions"><Link to="/wallet" className="btn-primary">Wallet details <ArrowRight size={15}/></Link><Link to="/withdrawals" className="text-link">Redeem / withdraw</Link></div></Card>
      <Card className="quick-actions"><div className="eyebrow">QUICK ACTIONS</div><h2>Manage your account</h2><Link to="/wallet" className="quick-action"><span className="quick-icon"><Wallet size={18}/></span><span><b>View wallet</b><small>Check your available balances</small></span><ArrowUpRight size={16}/></Link><Link to="/transactions" className="quick-action"><span className="quick-icon"><Layers3 size={18}/></span><span><b>Transaction history</b><small>Review credits and debits</small></span><ArrowUpRight size={16}/></Link><Link to="/withdrawals" className="quick-action"><span className="quick-icon"><ArrowUpRight size={18}/></span><span><b>Request withdrawal</b><small>Submit and track a payout</small></span><ArrowUpRight size={16}/></Link></Card>
    </div>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>Latest transactions</h2></div><Link to="/transactions" className="text-link">View all <ArrowUpRight size={14}/></Link></div><Card className="table-card">{loading&&!wallet?<Loading/>:<TransactionTable items={transactions}/>}</Card></section>
  </div>;
}
