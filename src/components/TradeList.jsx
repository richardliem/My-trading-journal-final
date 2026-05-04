import { useState } from "react";

export default function TradeList({ trades, onEdit, onDelete }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const filtered = trades
    .filter((t) => filter === "ALL" || t.outcome === filter)
    .filter((t) => t.pair?.toLowerCase().includes(search.toLowerCase()) || t.strategy?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "pnl") return parseFloat(b.pnl) - parseFloat(a.pnl);
      return 0;
    });

  return (
    <div className="trade-list">
      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="Search pair or strategy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {["ALL", "WIN", "LOSS", "BE"].map((f) => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort: Date</option>
          <option value="pnl">Sort: P&L</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>No trades found.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="trades-table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Outcome</th>
                <th>Position</th>
                <th>Date</th>
                <th>Entry</th>
                <th>SL</th>
                <th>TP</th>
                <th>R:R</th>
                <th>P&L</th>
                <th>%</th>
                <th>Strategy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="pair-cell">{t.pair}</td>
                  <td><span className={`pill pill-${t.outcome?.toLowerCase()}`}>{t.outcome}</span></td>
                  <td><span className={`pill pill-${t.position?.toLowerCase()}`}>{t.position}</span></td>
                  <td className="date-cell">{t.date?.slice(0, 10)}</td>
                  <td>{t.entry || "—"}</td>
                  <td className="neg">{t.stopLoss || "—"}</td>
                  <td className="pos">{t.takeProfit || "—"}</td>
                  <td>{t.rr || "—"}</td>
                  <td className={parseFloat(t.pnl) >= 0 ? "pos" : "neg"}>
                    {parseFloat(t.pnl) >= 0 ? "+" : ""}${parseFloat(t.pnl || 0).toFixed(2)}
                  </td>
                  <td className={parseFloat(t.pnlPercent) >= 0 ? "pos" : "neg"}>
                    {t.pnlPercent ? `${t.pnlPercent}%` : "—"}
                  </td>
                  <td className="strategy-cell">{t.strategy || "—"}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEdit(t)}>✎</button>
                    <button className="btn-del" onClick={() => { if (confirm("Delete this trade?")) onDelete(t.id); }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
