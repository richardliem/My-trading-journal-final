import { useState } from "react";

const PAIRS = ["BTC/USDT","ETH/USDT","SOL/USDT","XRP/USDT","BNB/USDT","ADA/USDT","DOGE/USDT","INJ/USDT","ARB/USDT","TRUMP/USDT","XMR/USDT","CRV/USDT","DOT/USDT","AVAX/USDT","Other"];
const STRATEGIES = ["Strategy #1", "Strategy #2", "Strategy #3", "Scalp", "Swing", "Breakout", "Reversal"];

export default function TradeForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    pair: "BTC/USDT",
    outcome: "WIN",
    position: "Long",
    date: new Date().toISOString().slice(0, 16),
    entry: "",
    stopLoss: "",
    takeProfit: "",
    pnl: "",
    pnlPercent: "",
    strategy: "Strategy #1",
    notes: "",
    rr: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.pair || !form.date || !form.pnl) return;
    onSubmit(form);
  };

  return (
    <div className="trade-form">
      <div className="form-header">
        <h2>{initial ? "Edit Trade" : "New Trade"}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Pair</label>
          <select value={form.pair} onChange={(e) => set("pair", e.target.value)}>
            {PAIRS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </div>

        <div className="form-group">
          <label>Outcome</label>
          <div className="toggle-group">
            {["WIN", "LOSS", "BE"].map((o) => (
              <button key={o} className={`toggle-btn ${form.outcome === o ? "active-" + o.toLowerCase() : ""}`} onClick={() => set("outcome", o)}>{o}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Position</label>
          <div className="toggle-group">
            {["Long", "Short"].map((p) => (
              <button key={p} className={`toggle-btn ${form.position === p ? "active-pos" : ""}`} onClick={() => set("position", p)}>{p}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Entry Price</label>
          <input type="number" placeholder="0.00" value={form.entry} onChange={(e) => set("entry", e.target.value)} />
        </div>

        <div className="form-group">
          <label>Stop Loss</label>
          <input type="number" placeholder="0.00" value={form.stopLoss} onChange={(e) => set("stopLoss", e.target.value)} />
        </div>

        <div className="form-group">
          <label>Take Profit</label>
          <input type="number" placeholder="0.00" value={form.takeProfit} onChange={(e) => set("takeProfit", e.target.value)} />
        </div>

        <div className="form-group">
          <label>R:R Ratio</label>
          <input type="text" placeholder="e.g. 1:3" value={form.rr} onChange={(e) => set("rr", e.target.value)} />
        </div>

        <div className="form-group">
          <label>P&L ($)</label>
          <input type="number" placeholder="0.00" value={form.pnl} onChange={(e) => set("pnl", e.target.value)} />
        </div>

        <div className="form-group">
          <label>P&L (%)</label>
          <input type="number" placeholder="0.00" value={form.pnlPercent} onChange={(e) => set("pnlPercent", e.target.value)} />
        </div>

        <div className="form-group">
          <label>Strategy</label>
          <select value={form.strategy} onChange={(e) => set("strategy", e.target.value)}>
            {STRATEGIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group full">
        <label>Notes</label>
        <textarea rows={3} placeholder="Trade notes, observations, lessons..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="form-actions">
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button className="btn-submit" onClick={handleSubmit}>{initial ? "Update Trade" : "Add Trade"}</button>
      </div>
    </div>
  );
}
