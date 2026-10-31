
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
  ArrowRight,
  Landmark,
  Clock3,
  MessageCircle,
  Mail,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

import api, { getMessage } from "./api";

// Helpers
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const list = (d) =>
  Array.isArray(d)
    ? d
    : d?.transactions ||
      d?.payouts ||
      d?.data?.transactions ||
      d?.data?.payouts ||
      d?.items ||
      d?.data?.items ||
      [];

const date = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const titleCase = (s) =>
  String(s || "pending")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const statusClass = (s) =>
  ["approved", "paid", "completed", "success"].includes(
    String(s).toLowerCase()
  )
    ? "good"
    : ["rejected", "failed"].includes(String(s).toLowerCase())
      ? "bad"
      : "pending";

function walletShape(d) {
  const w = d?.wallet || d?.data?.wallet || d?.data || d || {};

  return {
    balance: Number(w.balance || 0),
    reserved: Number(w.reservedBalance || 0),
    available: Number(
      w.availableBalance ??
        (Number(w.balance || 0) - Number(w.reservedBalance || 0))
    ),
  };
}

// Brand
function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "light" : ""}`}>
      <span className="mark">V</span>
      VELOOP
    </div>
  );
}

// Authentication
function Auth({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const { data } = await api.post(
        register ? "/auth/register" : "/auth/login",
        register ? { name, email, password } : { email, password }
      );

      const token =
        data.token || data.accessToken || data.data?.token;

      const user =
        data.user || data.data?.user || { name, email };

      if (!token) {
        throw new Error(
          data.message || "No token returned by API."
        );
      }

      localStorage.setItem("veloop_token", token);
      localStorage.setItem("veloop_user", JSON.stringify(user));

      onAuth(user, token);
      nav("/");
    } catch (e) {
      setError(getMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <section className="auth-art">
        <Brand light />

        <div className="art-copy">
          <span className="eyebrow">VELOOP REWARDS WALLET</span>
          <h1>
            Earn.
            <br />
            Engage.
            <br />
            <em>Get rewarded.</em>
          </h1>

          <p>
            Your rewards. Your wallet.
            <br />
            Your growth.
          </p>

          <div className="wallet-art">
            <span>₹</span>
            <Wallet size={60} />
          </div>
        </div>

        <small>Simple rewards. Meaningful progress.</small>
      </section>

      <section className="auth-side">
        <Brand />

        <form className="auth-card" onSubmit={submit}>
          <div className="center">
            <span className="eyebrow">
              {register ? "GET STARTED" : "WELCOME BACK"}
            </span>

            <h2>
              {register ? "Create account" : "Welcome back"}
            </h2>

            <p>
              {register
                ? "Join VELOOP Wallet and start earning"
                : "Log in to your VELOOP Wallet"}
            </p>
          </div>

          {register && (
            <label>
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {error && <div className="alert error">{error}</div>}

          <button className="primary wide" disabled={busy}>
            {busy
              ? "Please wait…"
              : register
                ? "Create account"
                : "Login to wallet"}
            <ArrowRight size={16} />
          </button>

          <p className="switch">
            {register
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Log in" : "Sign up"}
            </button>
          </p>
        </form>

        <small className="secure">
          <ShieldCheck size={14} />
          Your account and wallet information are protected.
        </small>
      </section>
    </main>
  );
}

// Sidebar navigation
function Sidebar({ admin, logout }) {
  const loc = useLocation();

  const items = [
    ["Dashboard", "/", Home],
    ["Transactions", "/transactions", Activity],
    ["Payouts", "/payouts", CreditCard],
    ...(admin
      ? [["Payout review", "/admin/payouts", ShieldCheck]]
      : []),
    ["Profile", "/profile", UserRound],
  ];

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <Brand light />
      </div>

      <nav>
        {items.map(([label, to, Icon]) => (
          <Link
            key={to}
            title={label}
            aria-label={label}
            className={
              loc.pathname === to ? "nav active" : "nav"
            }
            to={to}
          >
            <Icon size={19} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="side-bottom">
        <button className="nav" title="Messages">
          <MessageCircle size={19} />
          <span>Messages</span>
        </button>

        <button
          className="nav logout"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>
      </div>

      <small className="side-foot">VELOOP · v1.0</small>
    </aside>
  );
}

// Main application layout
function Shell({ user, admin, logout, children }) {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();

  return (
    <div className="shell">
      <Sidebar admin={admin} logout={logout} />

      <div className="main">
        <header className="topbar">
          <button
            className="hamb"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>

          <label className="global-search">
            <Search size={17} />
            <input placeholder="Search transactions, payouts..." />
            <kbd>⌘ + K</kbd>
          </label>

          <div className="top-actions">
            <button className="icon-button" aria-label="Messages">
              <Mail size={18} />
            </button>

            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>

            <div className="user">
              <i>
                {(user?.name || user?.email || "C")[0].toUpperCase()}
              </i>

              <span>
                {user?.name ||
                  user?.fullName ||
                  user?.email ||
                  "Wallet user"}

                <small>
                  {admin ? "Administrator" : "Wallet user"}
                </small>
              </span>

              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {menu && (
          <div className="mobile-nav">
            <Link to="/" onClick={() => setMenu(false)}>Dashboard</Link>
            <Link to="/transactions" onClick={() => setMenu(false)}>Transactions</Link>
            <Link to="/payouts" onClick={() => setMenu(false)}>Payouts</Link>
            {admin && (
              <Link to="/admin/payouts" onClick={() => setMenu(false)}>
                Payout review
              </Link>
            )}
            <Link to="/profile" onClick={() => setMenu(false)}>Profile</Link>
          </div>
        )}

        <main className="content">{children}</main>

        <footer>
          © 2026 VELOOP Rewards
          <span>
            <ShieldCheck size={13} />
            Secure wallet workspace
          </span>
        </footer>
      </div>
    </div>
  );
}

// Page heading
function Heading({ kicker = "OVERVIEW", title, sub, action }) {
  return (
    <div className="heading">
      <div>
        <small className="eyebrow">{kicker}</small>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

// Status badge
function Badge({ value }) {
  return (
    <span className={`badge ${statusClass(value)}`}>
      {titleCase(value)}
    </span>
  );
}

// Transactions table
function TxTable({ items }) {
  if (!items.length) {
    return (
      <div className="empty">
        <Activity size={27} />
        <b>No transactions yet</b>
        <p>Your wallet activity will appear here.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th className="right">Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {items.map((t, i) => {
            const credit = ["credit", "earning", "reward"].includes(
              String(t.type || t.transactionType).toLowerCase()
            );

            return (
              <tr key={t._id || t.id || i}>
                <td>{date(t.createdAt || t.date)}</td>

                <td>
                  <span className={`type ${credit ? "credit" : "debit"}`}>
                    {credit ? (
                      <ArrowDownLeft size={13} />
                    ) : (
                      <ArrowUpRight size={13} />
                    )}
                    {titleCase(t.type || t.transactionType)}
                  </span>
                </td>

                <td>
                  <b>
                    {t.description || t.reason || "Wallet transaction"}
                  </b>
                </td>

                <td className={`right amount ${credit ? "positive" : "negative"}`}>
                  {credit ? "+" : "−"} {money(t.amount)}
                </td>

                <td>
                  <Badge value={t.status || "completed"} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Balance chart
function BalanceChart() {
  return (
    <div className="chart-area">
      <div className="chart-y">
        <span>₹15k</span>
        <span>₹10k</span>
        <span>₹5k</span>
        <span>₹1k</span>
      </div>

      <svg
        className="balance-chart"
        viewBox="0 0 620 190"
        preserveAspectRatio="none"
        role="img"
        aria-label="Illustrative wallet balance trend"
      >
        <defs>
          <linearGradient
            id="chartFill"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#18d6a0" stopOpacity=".2" />
            <stop offset="100%" stopColor="#18d6a0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[25, 70, 115, 160].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="620"
            y2={y}
            stroke="rgba(148,163,184,.14)"
            strokeDasharray="4 5"
          />
        ))}

        <path
          d="M0 118 C35 92 45 105 70 120 S110 133 135 111 S170 85 195 102 S230 120 255 95 S300 105 325 82 S360 91 385 66 S420 82 445 75 S480 100 505 73 S550 63 575 50 S600 55 620 38 L620 180 L0 180Z"
          fill="url(#chartFill)"
        />

        <path
          d="M0 118 C35 92 45 105 70 120 S110 133 135 111 S170 85 195 102 S230 120 255 95 S300 105 325 82 S360 91 385 66 S420 82 445 75 S480 100 505 73 S550 63 575 50 S600 55 620 38"
          fill="none"
          stroke="#21d6a0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle
          cx="195"
          cy="102"
          r="5"
          fill="#21d6a0"
          stroke="#d8fff3"
          strokeWidth="2"
        />
      </svg>

      <div className="chart-x">
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard({ user }) {
  const [wallet, setWallet] = useState({
    balance: 0,
    reserved: 0,
    available: 0,
  });

  const [tx, setTx] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      api.get("/wallet"),
      api.get("/transactions?page=1&limit=5"),
    ]).then(([w, t]) => {
      if (w.status === "fulfilled") {
        setWallet(walletShape(w.value.data));
      } else {
        setError(getMessage(w.reason));
      }

      if (t.status === "fulfilled") {
        setTx(list(t.value.data));
      }
    });
  }, []);

  const credits = tx
    .filter((t) =>
      ["credit", "earning", "reward"].includes(
        String(t.type || t.transactionType).toLowerCase()
      )
    )
    .reduce((a, t) => a + Number(t.amount || 0), 0);

  const debits = tx
    .filter((t) =>
      ["debit", "payout"].includes(
        String(t.type || t.transactionType).toLowerCase()
      )
    )
    .reduce((a, t) => a + Number(t.amount || 0), 0);

  const categoryRows = [
    { name: "Wallet credits", amount: credits, color: "blue" },
    { name: "Wallet debits", amount: debits, color: "green" },
    { name: "Reserved payouts", amount: wallet.reserved, color: "yellow" },
  ].filter((x) => x.amount > 0);

  return (
    <>
      <Heading
        kicker="YOUR FINANCIAL OVERVIEW"
        title={`Good to see you, ${(user?.name || user?.fullName || "there").split(" ")[0]}.`}
        sub="Here’s what’s happening with your VELOOP wallet today."
        action={
          <Link className="primary" to="/payouts">
            <Plus size={16} /> Request payout
          </Link>
        }
      />

      {error && (
        <div className="alert info">
          {error} Make sure the backend is running.
        </div>
      )}

      <div className="dashboard-grid">
        <section className="panel balance-panel">
          <div className="panel-head">
            <div>
              <h2>Total wallet balance</h2>
              <p>Your current wallet value</p>
            </div>
            <span className="period-pill">Current balance</span>
          </div>

          <div className="balance-value">{money(wallet.balance)}</div>

          <BalanceChart />

          <div className="chart-legend">
            <span>
              <i className="legend-green" />
              Available balance <b>{money(wallet.available)}</b>
            </span>
            <span>
              <i className="legend-stripe" />
              Reserved <b>{money(wallet.reserved)}</b>
            </span>
          </div>
        </section>

        <section className="panel cards-panel">
          <div className="panel-head">
            <div>
              <h2>My wallet</h2>
              <p>Wallet account overview</p>
            </div>
            <span className="live-pill">● Active</span>
          </div>

          <div className="virtual-card">
            <div className="card-top">
              <span className="card-chip"><span /></span>
              <span className="card-mark">V</span>
            </div>

            <div className="card-label">Available balance</div>
            <div className="card-amount">{money(wallet.available)}</div>

            <div className="card-bottom">
              <span>VELOOP WALLET</span>
              <span>•••• &nbsp; ••••</span>
            </div>
          </div>

          <div className="card-foot">
            <span>
              <LockKeyhole size={15} /> Protected wallet account
            </span>
            <Link to="/profile">
              View profile <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <section className="panel transactions-panel">
          <div className="panel-head">
            <div>
              <h2>Recent transactions</h2>
              <p>Your latest wallet activity</p>
            </div>
            <Link to="/transactions">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <TxTable items={tx} />
        </section>

        <section className="panel categories-panel">
          <div className="panel-head">
            <div>
              <h2>Wallet summary</h2>
              <p>Activity from recent transactions</p>
            </div>
            <Link to="/transactions">See all</Link>
          </div>

          <div className="summary-total">
            {money(credits + debits)}
            <small>Recent movement</small>
          </div>

          <div className="category-bars">
            <span
              style={{
                width: `${
                  credits + debits
                    ? (credits / (credits + debits)) * 100
                    : 0
                }%`,
              }}
            />
            <span
              style={{
                width: `${
                  credits + debits
                    ? (debits / (credits + debits)) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="category-list">
            {categoryRows.length ? (
              categoryRows.map((row) => (
                <div className="category-row" key={row.name}>
                  <i className={`category-dot ${row.color}`} />
                  <span>
                    <b>{row.name}</b>
                    <small>{money(row.amount)}</small>
                  </span>
                  <ArrowRight size={15} />
                </div>
              ))
            ) : (
              <div className="empty compact">
                No wallet activity to summarize yet.
              </div>
            )}
          </div>
        </section>

        <aside className="promo-panel">
          <div className="promo-orb">
            <Sparkles size={32} />
          </div>

          <span className="eyebrow">VELOOP WALLET</span>

          <h2>
            Your rewards,
            <br />
            all in one place.
          </h2>

          <p>
            Track your balance, review transactions, and manage
            payouts from one secure workspace.
          </p>

          <Link to="/payouts" className="promo-link">
            Manage wallet <ArrowRight size={15} />
          </Link>
        </aside>
      </div>

      <div className="metrics compact-metrics">
        <Metric
          title="Available balance"
          value={money(wallet.available)}
          detail="Ready for payout"
          icon={Wallet}
          color="blue"
        />

        <Metric
          title="Reserved balance"
          value={money(wallet.reserved)}
          detail="Pending payouts"
          icon={Clock3}
          color="amber"
        />

        <Metric
          title="Recent credits"
          value={money(credits)}
          detail="Latest 5 transactions"
          icon={ArrowDownLeft}
          color="green"
        />

        <Metric
          title="Recent debits"
          value={money(debits)}
          detail="Latest 5 transactions"
          icon={ArrowUpRight}
          color="violet"
        />
      </div>
    </>
  );
}

// Dashboard metric
function Metric({ title, value, detail, icon: Icon, color }) {
  return (
    <article className={`metric ${color}`}>
      <div className="metric-top">
        <span>{title}</span>
        <i><Icon size={19} /></i>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

// Transactions page
function Transactions() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions?page=1&limit=100")
      .then((r) => setItems(list(r.data)))
      .catch((e) => setError(getMessage(e)));
  }, []);

  const shown = items.filter((t) => {
    const matchesFilter =
      filter === "all" ||
      String(t.type || t.transactionType).toLowerCase() === filter;

    const text =
      `${t.description || t.reason || ""} ${t.type || ""} ${t.status || ""}`.toLowerCase();

    return matchesFilter && text.includes(search.toLowerCase());
  });

  return (
    <>
      <Heading
        kicker="ACTIVITY"
        title="Transactions"
        sub="Review your wallet credits, debits, and reward history."
        action={
          <button className="secondary" onClick={() => window.print()}>
            Export / print
          </button>
        }
      />

      <section className="panel">
        <div className="filters">
          <div>
            {["all", "credit", "debit"].map((f) => (
              <button
                className={filter === f ? "tab selected" : "tab"}
                onClick={() => setFilter(f)}
                key={f}
              >
                {titleCase(f)}
              </button>
            ))}
          </div>

          <label className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity…"
            />
          </label>
        </div>

        {error && <div className="alert error">{error}</div>}

        <TxTable items={shown} />

        <small className="footnote">
          Showing {shown.length} transactions returned by the API.
        </small>
      </section>
    </>
  );
}

// Payout page
function Payouts() {
  const [wallet, setWallet] = useState({ available: 0 });
  const [payouts, setPayouts] = useState([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [upi, setUpi] = useState("");
  const [holder, setHolder] = useState("");
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [w, p] = await Promise.allSettled([
      api.get("/wallet"),
      api.get("/payouts?page=1&limit=20"),
    ]);

    if (w.status === "fulfilled") {
      setWallet(walletShape(w.value.data));
    }

    if (p.status === "fulfilled") {
      setPayouts(list(p.value.data));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    const payoutDetails =
      method === "UPI"
        ? { upiId: upi.trim() }
        : {
            accountHolderName: holder.trim(),
            accountNumber: account.trim(),
            ifscCode: ifsc.trim().toUpperCase(),
          };

    const body = {
      amount: Number(amount),
      payoutMethod: method,
      payoutDetails,
    };

    try {
      await api.post("/payouts", body);

      setNotice("Payout request submitted.");
      setAmount("");
      setUpi("");
      setHolder("");
      setAccount("");
      setIfsc("");

      await load();
    } catch (e) {
      setError(getMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading
        kicker="WITHDRAW REWARDS"
        title="Payouts"
        sub="Request a payout and track its status."
      />

      <div className="payout-grid">
        <div>
          <div className="balance-banner">
            <Wallet />
            <div>
              <small>Available for payout</small>
              <strong>{money(wallet.available)}</strong>
              <p>Reserved funds are excluded.</p>
            </div>
          </div>

          <form className="panel payout-form" onSubmit={submit}>
            <div className="panel-head">
              <div>
                <h2>Request a payout</h2>
                <p>Choose an amount and payment method.</p>
              </div>
            </div>

            <label>
              Amount (₹)
              <input
                type="number"
                min="1"
                step=".01"
                max={wallet.available || undefined}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
              />
            </label>

            <label>
              Payment method
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="UPI">UPI transfer</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </label>

            {method === "UPI" ? (
              <label>
                UPI ID
                <input
                  required
                  value={upi}
                  onChange={(e) => setUpi(e.target.value)}
                  placeholder="name@bank"
                />
              </label>
            ) : (
              <>
                <label>
                  Account holder name
                  <input
                    required
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="Name on bank account"
                  />
                </label>

                <div className="two">
                  <label>
                    Account number
                    <input
                      required
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="Account number"
                    />
                  </label>

                  <label>
                    IFSC code
                    <input
                      required
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="IFSC code"
                    />
                  </label>
                </div>
              </>
            )}

            {error && <div className="alert error">{error}</div>}
            {notice && <div className="alert success">{notice}</div>}

            <button className="primary wide" disabled={busy}>
              {busy ? "Submitting…" : "Submit payout request"}
              <ArrowRight size={16} />
            </button>

            <small className="secure">
              <ShieldCheck size={13} />
              Payment details are masked in API responses.
            </small>
          </form>
        </div>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>My payout requests</h2>
              <p>Recent and past withdrawals</p>
            </div>
            <span className="count">{payouts.length}</span>
          </div>

          {payouts.length ? (
            payouts.map((p, i) => (
              <div className="payout-item" key={p._id || p.id || i}>
                <i><Landmark size={17} /></i>
                <span>
                  <b>{money(p.amount)}</b>
                  <small>
                    {titleCase(p.payoutMethod || "payout")} ·{" "}
                    {date(p.createdAt || p.requestedAt)}
                  </small>
                </span>
                <Badge value={p.status} />
              </div>
            ))
          ) : (
            <div className="empty">
              <CreditCard />
              <b>No payout requests</b>
              <p>Your requests will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// Admin payout review
function AdminPayouts() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const r = await api.get("/payouts?page=1&limit=100");
      setItems(list(r.data));
    } catch (e) {
      setError(getMessage(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(p, action) {
    setError("");
    setNotice("");

    let payload = {};

    if (action === "reject") {
      const reason = window.prompt(
        "Enter a reason for rejecting this payout:"
      );

      if (reason === null) return;

      if (!reason.trim()) {
        setError("A rejection reason is required.");
        return;
      }

      payload = { reason: reason.trim() };
    }

    try {
      await api.patch(
        `/payouts/${p._id || p.id}/${action}`,
        payload
      );

      setNotice(
        `Payout ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`
      );

      await load();
    } catch (e) {
      setError(getMessage(e));
    }
  }

  const shown = items.filter(
    (p) => String(p.status || "pending").toLowerCase() === filter
  );

  return (
    <>
      <Heading
        kicker="ADMIN WORKSPACE"
        title="Payout review"
        sub="Review customer requests and approve or reject payouts."
        action={
          <button className="secondary" onClick={load}>
            Refresh
          </button>
        }
      />

      <div className="admin-stats">
        <div>
          Pending
          <strong>
            {items.filter((p) => p.status === "pending").length}
          </strong>
        </div>

        <div>
          Approved
          <strong>
            {items.filter((p) => p.status === "approved").length}
          </strong>
        </div>

        <div>
          Rejected
          <strong>
            {items.filter((p) => p.status === "rejected").length}
          </strong>
        </div>
      </div>

      <section className="panel">
        <div className="filters">
          <div>
            {["pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                className={filter === f ? "tab selected" : "tab"}
                onClick={() => setFilter(f)}
              >
                {titleCase(f)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        {shown.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {shown.map((p, i) => (
                  <tr key={p._id || p.id || i}>
                    <td>
                      <b>
                        {p.user?.name ||
                          p.user?.email ||
                          p.userId ||
                          "Wallet user"}
                      </b>
                    </td>

                    <td>{money(p.amount)}</td>
                    <td>{titleCase(p.payoutMethod || "—")}</td>
                    <td>{date(p.createdAt || p.requestedAt)}</td>
                    <td><Badge value={p.status} /></td>

                    <td>
                      {p.status === "pending" && (
                        <div className="actions">
                          <button
                            className="approve"
                            onClick={() => decide(p, "approve")}
                          >
                            <Check size={13} /> Approve
                          </button>

                          <button
                            className="reject"
                            onClick={() => decide(p, "reject")}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <ShieldCheck />
            <b>No {filter} requests</b>
            <p>There are no requests in this category.</p>
          </div>
        )}
      </section>
    </>
  );
}

// Profile page
function Profile({ user }) {
  return (
    <>
      <Heading
        kicker="ACCOUNT SETTINGS"
        title="Your profile"
        sub="Account information associated with your VELOOP Wallet."
      />

      <section className="panel profile">
        <i>
          {(user?.name || user?.email || "U")[0].toUpperCase()}
        </i>

        <div>
          <h2>
            {user?.name || user?.fullName || "Wallet user"}
          </h2>

          <p>{user?.email || "No email returned by API"}</p>

          <div className="alert info">
            Profile editing is not enabled because the current backend
            has no profile-update endpoint.
          </div>
        </div>
      </section>
    </>
  );
}

// Authentication guard
function Guard({ token, children }) {
  return token ? children : <Navigate to="/login" replace />;
}

// Main application
export default function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("veloop_token")
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("veloop_user") || "null"
      );
    } catch {
      return null;
    }
  });

  const admin = user?.role === "admin";

  function onAuth(u, t) {
    setUser(u);
    setToken(t);
  }

  function logout() {
    localStorage.removeItem("veloop_token");
    localStorage.removeItem("veloop_user");
    setToken(null);
    setUser(null);
  }

  const shell = (node) => (
    <Guard token={token}>
      <Shell user={user} admin={admin} logout={logout}>
        {node}
      </Shell>
    </Guard>
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <Auth onAuth={onAuth} />
          )
        }
      />

      <Route
        path="/register"
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <Auth onAuth={onAuth} />
          )
        }
      />

      <Route
        path="/"
        element={shell(<Dashboard user={user} />)}
      />

      <Route
        path="/transactions"
        element={shell(<Transactions />)}
      />

      <Route
        path="/payouts"
        element={shell(<Payouts />)}
      />

      <Route
        path="/admin/payouts"
        element={
          admin ? (
            shell(<AdminPayouts />)
          ) : (
            <Navigate to={token ? "/" : "/login"} replace />
          )
        }
      />

      <Route
        path="/profile"
        element={shell(<Profile user={user} />)}
      />

      <Route
        path="*"
        element={
          <Navigate to={token ? "/" : "/login"} replace />
        }
      />
    </Routes>
  );
}
