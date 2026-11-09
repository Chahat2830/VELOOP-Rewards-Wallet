import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function Auth({ register = false }) {
  const { login, register: signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      if (register) {
        await signUp(form); setSuccess('Account created. Please sign in.'); setTimeout(() => navigate('/login'), 900);
      } else {
        const result = await login({ email: form.email, password: form.password });
        navigate(result.user?.role === 'admin' ? '/admin' : '/');
      }
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };
  return <div className="auth-page">
    <div className="auth-card">
      <div className="auth-logo"><span className="brand-mark">V</span><div><b>VELOOP</b><small>Rewards Wallet</small></div></div>
      <div className="auth-card-top"><span className="secure-label"><ShieldCheck size={14}/> SECURE ACCESS</span></div>
      <div className="eyebrow">WALLET PORTAL</div>
      <h1>{register ? 'Create account' : 'Welcome back'}</h1>
      <p>{register ? 'Create your VELOOP rewards account.' : 'Sign in to manage your rewards wallet.'}</p>
      {error && <div className="alert error-alert">{error}</div>}{success && <div className="alert success-alert">{success}</div>}
      <form onSubmit={submit}>
        {register && <label className="field-label">Full name<input name="name" value={form.name} onChange={update} required minLength={2} placeholder="Your name" autoComplete="name"/></label>}
        <label className="field-label">Email address<input name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" autoComplete="email"/></label>
        <label className="field-label">Password<div className="password-wrap"><input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={update} required minLength={8} placeholder="Enter password" autoComplete={register ? 'new-password' : 'current-password'}/><button type="button" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
        <button className="btn-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} </button>
      </form>
      <div className="auth-footer">{register ? 'Already have an account?' : 'New to VELOOP?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create account'}</Link></div>
      {!register && <div className="auth-note">Protected by backend authentication. Admin access is provisioned securely.</div>}
    </div>
  </div>;
}
