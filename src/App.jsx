import { useState, useEffect } from "react";
import Dashboard  from "./pages/Dashboard";
import Scanner    from "./pages/Scanner";
import Books      from "./pages/Books";
import CashFlow   from "./pages/CashFlow";
import Receipts   from "./pages/Receipts";
import Reports    from "./pages/Reports";
import Settings   from "./pages/Settings";
import Login      from "./pages/Login";
import "./App.css";

const NAV = [
  { path: "/",         label: "Home",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { path: "/books",    label: "Books",    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  { path: "/scanner",  label: "Scan",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
  { path: "/reports",  label: "Reports",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { path: "/settings", label: "Settings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

const PAGE_TITLES = {
  "/":          "Dashboard",
  "/scanner":   "Scan Receipt",
  "/books":     "Books",
  "/cashflow":  "Cash Flow",
  "/receipts":  "Receipts",
  "/reports":   "Reports",
  "/settings":  "Settings",
};

export default function App() {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (to) => { window.location.hash = to; };

  const pages = {
    "/":          <Dashboard navigate={navigate} />,
    "/scanner":   <Scanner />,
    "/books":     <Books />,
    "/cashflow":  <CashFlow />,
    "/receipts":  <Receipts />,
    "/reports":   <Reports />,
    "/settings":  <Settings />,
    "/login":     <Login />,
  };

  const Page = pages[path] ?? <Dashboard navigate={navigate} />;

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">Biz<span>Book</span></div>
          <div className="sub-badge">⚡ Starter</div>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="notif-dot" />
          </button>
          <div className="avatar">JK</div>
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Sidebar — desktop only */}
        <aside className="sidebar">
          <button className="sidebar-scan" onClick={() => navigate("/scanner")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan Receipt
          </button>
          {NAV.map((n) => (
            <button
              key={n.path}
              className={`sidebar-item ${path === n.path ? "active" : ""}`}
              onClick={() => navigate(n.path)}
            >
              <span className="sidebar-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main className="main-content">
          {path !== "/" && (
            <div className="page-title-bar">{PAGE_TITLES[path] ?? ""}</div>
          )}
          {Page}
        </main>
      </div>

      {/* FAB — mobile/tablet */}
      {path !== "/scanner" && (
        <button className="fab" onClick={() => navigate("/scanner")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Scan Receipt
        </button>
      )}

      {/* Bottom nav — mobile/tablet */}
      <nav className="bottom-nav">
        {NAV.map((n) => (
          <button
            key={n.path}
            className={`nav-item ${path === n.path ? "active" : ""}`}
            onClick={() => navigate(n.path)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
