import { useState, useEffect, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import TradeForm from "./components/TradeForm";
import TradeList from "./components/TradeList";
import CalendarView from "./components/CalendarView";
import ProfitChart from "./components/ProfitChart";
import Settings from "./components/Settings";
import { GitHubStorage } from "./utils/github";
import { calculateStats } from "./utils/stats";
import "./index.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "trades", label: "Trades", icon: "◈" },
  { id: "calendar", label: "Calendar", icon: "◻" },
  { id: "chart", label: "Chart", icon: "◬" },
  { id: "settings", label: "Settings", icon: "◎" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [trades, setTrades] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [githubConfig, setGithubConfig] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load config & trades on mount
  useEffect(() => {
    const cfg = localStorage.getItem("gh_config");
    if (cfg) {
      const parsed = JSON.parse(cfg);
      setGithubConfig(parsed);
      loadFromGitHub(parsed);
    } else {
      const local = localStorage.getItem("trades");
      if (local) setTrades(JSON.parse(local));
      setLoading(false);
    }
  }, []);

  const loadFromGitHub = async (cfg) => {
    try {
      setLoading(true);
      const gh = new GitHubStorage(cfg);
      const data = await gh.loadTrades();
      setTrades(data);
    } catch (e) {
      const local = localStorage.getItem("trades");
      if (local) setTrades(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const saveTrades = useCallback(async (newTrades) => {
    setTrades(newTrades);
    localStorage.setItem("trades", JSON.stringify(newTrades));
    const cfg = JSON.parse(localStorage.getItem("gh_config") || "null");
    if (cfg) {
      setSyncing(true);
      setSyncStatus(null);
      try {
        const gh = new GitHubStorage(cfg);
        await gh.saveTrades(newTrades);
        setSyncStatus("success");
      } catch {
        setSyncStatus("error");
      } finally {
        setSyncing(false);
        setTimeout(() => setSyncStatus(null), 3000);
      }
    }
  }, []);

  const handleAddTrade = (trade) => {
    const updated = editTrade
      ? trades.map((t) => (t.id === trade.id ? trade : t))
      : [{ ...trade, id: Date.now().toString() }, ...trades];
    saveTrades(updated);
    setShowForm(false);
    setEditTrade(null);
  };

  const handleDeleteTrade = (id) => {
    saveTrades(trades.filter((t) => t.id !== id));
  };

  const handleEdit = (trade) => {
    setEditTrade(trade);
    setShowForm(true);
  };

  const stats = calculateStats(trades);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">TJ</div>
        <div className="loading-bar"><div className="loading-fill" /></div>
        <p>Loading your journal...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-mark">TJ</span>
          <span className="logo-text">Trading<br/>Journal</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className={`sync-indicator ${syncing ? "syncing" : syncStatus || ""}`}>
            <span className="sync-dot" />
            <span className="sync-text">
              {syncing ? "Syncing..." : syncStatus === "success" ? "Synced" : syncStatus === "error" ? "Sync failed" : githubConfig ? "GitHub connected" : "Local only"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1>{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
            <span className="trade-count">{trades.length} trades</span>
          </div>
          {activeTab !== "settings" && (
            <button className="btn-add" onClick={() => { setEditTrade(null); setShowForm(true); }}>
              + New Trade
            </button>
          )}
        </header>

        <div className="content">
          {activeTab === "dashboard" && <Dashboard stats={stats} trades={trades} />}
          {activeTab === "trades" && (
            <TradeList trades={trades} onEdit={handleEdit} onDelete={handleDeleteTrade} />
          )}
          {activeTab === "calendar" && <CalendarView trades={trades} />}
          {activeTab === "chart" && <ProfitChart trades={trades} />}
          {activeTab === "settings" && (
            <Settings
              config={githubConfig}
              onSave={(cfg) => {
                setGithubConfig(cfg);
                localStorage.setItem("gh_config", JSON.stringify(cfg));
                loadFromGitHub(cfg);
              }}
            />
          )}
        </div>
      </main>

      {/* Trade Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditTrade(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <TradeForm
              initial={editTrade}
              onSubmit={handleAddTrade}
              onCancel={() => { setShowForm(false); setEditTrade(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
