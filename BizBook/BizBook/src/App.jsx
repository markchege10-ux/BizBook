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
  { path: "/",         label: "Home",     icon: "🏠" },
  { path: "/books",    label: "Books",    icon: "📊" },
  { path: "/scanner",  label: "Scan",     icon: "📷" },
  { path: "/reports",  label: "Reports",  icon: "📈" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

const ROUTES = {
  "/":          <Dashboard />,
  "/scanner":   <Scanner />,
  "/books":     <Books />,
  "/cashflow":  <CashFlow />,
  "/receipts":  <Receipts />,
  "/reports":   <Reports />,
  "/settings":  <Settings />,
  "/login":     <Login />,
};

const PAGE_TITLES = {
  "/":          "Home",
  "/scanner":   "Scan Receipt",
  "/books":     "Books",
  "/cashflow":  "Cash Flow",
  "/receipts":  "Receipts",
  "/reports":   "Reports",
  "/settings":  "Settings",
};

export default function App() {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");
  const isLoggedIn = true; // TODO: replace with useAuth()

  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (to) => { window.location.hash = to; };

  if (!isLoggedIn) return <Login />;

  const Page = ROUTES[path] ?? <Dashboard />;

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div>
          <div className="logo">Biz<span>Book</span></div>
          <div className="sub-badge">⚡ Starter</div>
        </div>
        <div className="topbar-right">
          <button className="notif-btn" aria-label="Notifications">🔔</button>
          <div className="avatar">JK</div>
        </div>
      </header>

      {/* Page title */}
      {path !== "/" && (
        <div className="page-title-bar">
          <span>{PAGE_TITLES[path] ?? ""}</span>
        </div>
      )}

      {/* Main content */}
      <main className="main-content">{Page}</main>

      {/* Scan FAB */}
      {path !== "/scanner" && (
        <button className="fab" onClick={() => navigate("/scanner")}>
          📷 Scan Receipt
        </button>
      )}

      {/* Bottom nav */}
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
