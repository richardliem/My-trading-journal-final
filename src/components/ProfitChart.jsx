import { getCumulativePnL, getDailyPnL } from "../utils/stats";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useState } from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{label}</div>
      <div className={`tooltip-val ${payload[0].value >= 0 ? "pos" : "neg"}`}>
        ${payload[0].value?.toFixed(2)}
      </div>
    </div>
  );
};

export default function ProfitChart({ trades }) {
  const [mode, setMode] = useState("cumulative");
  const cumData = getCumulativePnL(trades);
  const dailyData = getDailyPnL(trades);
  const data = mode === "cumulative" ? cumData : dailyData;

  const formatted = data.map((d) => ({
    date: d.date.slice(5),
    pnl: d.pnl,
  }));

  if (!trades.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">◬</div>
        <p>No trades to chart yet.</p>
      </div>
    );
  }

  return (
    <div className="profit-chart">
      <div className="chart-toolbar">
        <div className="toggle-group">
          <button className={`toggle-btn ${mode === "cumulative" ? "active-pos" : ""}`} onClick={() => setMode("cumulative")}>Cumulative</button>
          <button className={`toggle-btn ${mode === "daily" ? "active-pos" : ""}`} onClick={() => setMode("daily")}>Daily P&L</button>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={340}>
          {mode === "cumulative" ? (
            <LineChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Line type="monotone" dataKey="pnl" stroke="#22d3a0" strokeWidth={2.5} dot={{ fill: "#22d3a0", r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          ) : (
            <BarChart data={formatted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}
                fill="#22d3a0"
                label={false}
                isAnimationActive={true}
                // Color bars based on value
                shape={(props) => {
                  const { x, y, width, height, value } = props;
                  const color = value >= 0 ? "#22d3a0" : "#f87171";
                  const barY = value >= 0 ? y : y + height;
                  const barH = Math.abs(height);
                  return <rect x={x} y={barY} width={width} height={barH} fill={color} rx={4} />;
                }}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats summary */}
      <div className="chart-summary">
        {[
          { label: "Total Days", value: data.length },
          { label: "Best Day", value: `$${Math.max(...data.map(d => d.pnl)).toFixed(2)}` },
          { label: "Worst Day", value: `$${Math.min(...data.map(d => d.pnl)).toFixed(2)}` },
          { label: "Avg Daily", value: `$${(data.reduce((s, d) => s + d.pnl, 0) / (data.length || 1)).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="chart-stat">
            <div className="chart-stat-label">{s.label}</div>
            <div className="chart-stat-value">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
