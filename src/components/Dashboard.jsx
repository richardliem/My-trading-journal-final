import { getDailyPnL } from "../utils/stats";

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card ${accent || ""}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export default function Dashboard({ stats, trades }) {
  const recent = [...trades].slice(0, 5);
  const daily = getDailyPnL(trades);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayPnL = daily.find((d) => d.date === todayKey)?.pnl || 0;

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.wins}W / ${stats.losses}L`} accent="accent-green" />
        <StatCard label="Net P&L" value={`$${stats.netPnL}`} sub={`Profit Factor: ${stats.profitFactor}`} accent={parseFloat(stats.netPnL) >= 0 ? "accent-green" : "accent-red"} />
        <StatCard label="Total Trades" value={stats.totalTrades} sub={`Today: $${todayPnL.toFixed(2)}`} />
        <StatCard label="Best Trade" value={`$${stats.bestTrade}`} sub={`Worst: $${stats.worstTrade}`} accent="accent-blue" />
        <StatCard label="Avg Win" value={`$${stats.avgWin}`} sub="per winning trade" accent="accent-green" />
        <StatCard label="Avg Loss" value={`-$${stats.avgLoss}`} sub="per losing trade" accent="accent-red" />
      </div>

      {/* Strategy Breakdown */}
      {Object.keys(stats.byStrategy).length > 0 && (
        <div className="section">
          <h2 className="section-title">Strategy Performance</h2>
          <div className="strategy-bars">
            {Object.entries(stats.byStrategy).map(([name, s]) => {
              const total = s.wins + s.losses;
              const wr = total ? ((s.wins / total) * 100).toFixed(0) : 0;
              return (
                <div key={name} className="strategy-row">
                  <div className="strategy-name">{name}</div>
                  <div className="strategy-bar-wrap">
                    <div className="strategy-bar" style={{ width: `${wr}%` }} />
                  </div>
                  <div className="strategy-stats">
                    <span className={s.pnl >= 0 ? "pos" : "neg"}>${s.pnl.toFixed(2)}</span>
                    <span className="wr">{wr}% WR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      {recent.length > 0 && (
        <div className="section">
          <h2 className="section-title">Recent Trades</h2>
          <div className="recent-list">
            {recent.map((t) => (
              <div key={t.id} className="recent-row">
                <div className="recent-pair">{t.pair}</div>
                <div className={`pill ${t.outcome === "WIN" ? "pill-win" : "pill-loss"}`}>{t.outcome}</div>
                <div className={`recent-pnl ${parseFloat(t.pnl) >= 0 ? "pos" : "neg"}`}>${parseFloat(t.pnl).toFixed(2)}</div>
                <div className="recent-date">{t.date?.slice(0, 10)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trades.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>No trades yet. Click <strong>+ New Trade</strong> to start journaling.</p>
        </div>
      )}
    </div>
  );
}
