import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

const Dashboard  = lazy(() => import("./pages/Dashboard"));
const Scanner    = lazy(() => import("./pages/Scanner"));
const Books      = lazy(() => import("./pages/Books"));
const CashFlow   = lazy(() => import("./pages/CashFlow"));
const Receipts   = lazy(() => import("./pages/Receipts"));
const Reports    = lazy(() => import("./pages/Reports"));
const Settings   = lazy(() => import("./pages/Settings"));
const Budget     = lazy(() => import("./pages/Budget"));
const Clients    = lazy(() => import("./pages/Clients"));
const Support    = lazy(() => import("./pages/Support"));
const Login      = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const NAV = [
  { path: "/",         label: "Home",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { path: "/books",    label: "Books",    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { path: "/scanner",  label: "Scan",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
  { path: "/reports",  label: "Reports",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { path: "/settings", label: "More",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
];

const SIDEBAR_NAV = [
  { path: "/",          label: "Dashboard",  icon: "🏠" },
  { path: "/books",     label: "Books",      icon: "📊" },
  { path: "/scanner",   label: "Scan",       icon: "📷" },
  { path: "/cashflow",  label: "Cash Flow",  icon: "💹" },
  { path: "/budget",    label: "Budget",     icon: "💰" },
  { path: "/clients",   label: "Clients",    icon: "👥" },
  { path: "/receipts",  label: "Receipts",   icon: "🧾" },
  { path: "/reports",   label: "Reports",    icon: "📈" },
  { path: "/support",   label: "Support",    icon: "💬" },
  { path: "/settings",  label: "Settings",   icon: "⚙️" },
];

const PAGE_TITLES = {
  "/": "Dashboard", "/scanner": "Scan Receipt", "/books": "Books",
  "/cashflow": "Cash Flow", "/receipts": "Receipts", "/reports": "Reports",
  "/settings": "Settings", "/budget": "Budget", "/clients": "Clients",
  "/support": "Support",
};

function PageLoader() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"4rem", flexDirection:"column", gap:"1rem" }}>
      <div style={{ width:"28px", height:"28px", border:"2px solid var(--border2)", borderTop:"2px solid var(--accent)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );
}

// More menu for mobile (shows extra pages)
function MoreMenu({ navigate, path, onClose }) {
  const extras = [
    { path: "/cashflow", label: "Cash Flow",  icon: "💹" },
    { path: "/budget",   label: "Budget",     icon: "💰" },
    { path: "/clients",  label: "Clients",    icon: "👥" },
    { path: "/receipts", label: "Receipts",   icon: "🧾" },
    { path: "/support",  label: "Support",    icon: "💬" },
    { path: "/settings", label: "Settings",   icon: "⚙️" },
  ];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:30, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div className="card" style={{ width:"100%", borderRadius:"16px 16px 0 0", paddingBottom:"2rem" }} onClick={e => e.stopPropagation()}>
        <p className="section-title" style={{ marginBottom:"1rem" }}>More</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
          {extras.map(n => (
            <button key={n.path} className="qa-btn" style={{ border: path === n.path ? "1px solid var(--accent)" : undefined }}
              onClick={() => { navigate(n.path); onClose(); }}>
              <span style={{ fontSize:"24px" }}>{n.icon}</span>
              <span className="qa-label">{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const { user, profile, logout } = useAuth();
  const [path,       setPath]       = useState(window.location.hash.slice(1) || "/");
  const [showMore,   setShowMore]   = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (user && !localStorage.getItem(`onboarded_${user.uid}`)) {
      setShowOnboarding(true);
    }
  }, [user]);

  function finishOnboarding() {
    localStorage.setItem(`onboarded_${user.uid}`, "1");
    setShowOnboarding(false);
  }

  const navigate = (to) => { window.location.hash = to; };

  if (!user) return <Suspense fallback={<PageLoader />}><Login /></Suspense>;

  if (showOnboarding) return (
    <Suspense fallback={<PageLoader />}>
      <Onboarding onFinish={finishOnboarding} />
    </Suspense>
  );

  const initials = (profile?.name ?? user.displayName ?? "U").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const photoURL = user.photoURL;

  const pages = {
    "/":          <Dashboard navigate={navigate} />,
    "/scanner":   <Scanner />,
    "/books":     <Books navigate={navigate} />,
    "/cashflow":  <CashFlow />,
    "/receipts":  <Receipts />,
    "/reports":   <Reports />,
    "/settings":  <Settings />,
    "/budget":    <Budget />,
    "/clients":   <Clients />,
    "/support":   <Support />,
  };

  const Page = pages[path] ?? <Dashboard navigate={navigate} />;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">Biz<span>Book</span></div>
          <div className="sub-badge">⚡ {profile?.plan ?? "Starter"}</div>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" aria-label="Support" onClick={() => navigate("/support")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </button>
          {photoURL
            ? <img src={photoURL} className="avatar avatar-img" alt="profile" referrerPolicy="no-referrer" />
            : <div className="avatar" onClick={() => navigate("/settings")} style={{ cursor:"pointer" }}>{initials}</div>
          }
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <button className="sidebar-scan" onClick={() => navigate("/scanner")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan Receipt
          </button>
          {SIDEBAR_NAV.map((n) => (
            <button key={n.path} className={`sidebar-item ${path === n.path ? "active" : ""}`} onClick={() => navigate(n.path)}>
              <span className="sidebar-icon" style={{ fontSize:"16px", width:"20px", textAlign:"center" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
          <button className="sidebar-item sidebar-logout" onClick={logout}>
            <span className="sidebar-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            Sign Out
          </button>
        </aside>

        <main className="main-content">
          {path !== "/" && <div className="page-title-bar">{PAGE_TITLES[path] ?? ""}</div>}
          <Suspense fallback={<PageLoader />}>{Page}</Suspense>
        </main>
      </div>

      {path !== "/scanner" && (
        <button className="fab" onClick={() => navigate("/scanner")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Scan Receipt
        </button>
      )}

      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button key={n.path}
            className={`nav-item ${(n.path === "/settings" ? ["/settings","/budget","/clients","/receipts","/cashflow","/support"].includes(path) : path === n.path) ? "active" : ""}`}
            onClick={() => n.path === "/settings" ? setShowMore(true) : navigate(n.path)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {showMore && <MoreMenu navigate={navigate} path={path} onClose={() => setShowMore(false)} />}
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
