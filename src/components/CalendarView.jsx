import { useState } from "react";

export default function CalendarView({ trades }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tradeMap = {};
  trades.forEach((t) => {
    if (!t.date) return;
    const d = t.date.slice(0, 10);
    const [y, m, day] = d.split("-").map(Number);
    if (y === year && m - 1 === month) {
      if (!tradeMap[day]) tradeMap[day] = [];
      tradeMap[day].push(t);
    }
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-view">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <h2 className="cal-title">{MONTHS[month]} {year}</h2>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>

      <div className="cal-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="cal-cell empty" />;
          const dayTrades = tradeMap[day] || [];
          const dayPnL = dayTrades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

          return (
            <div key={day} className={`cal-cell ${isToday ? "today" : ""} ${dayTrades.length ? (dayPnL >= 0 ? "profit-day" : "loss-day") : ""}`}>
              <div className="cal-date">{day}</div>
              {dayTrades.map((t, j) => (
                <div key={j} className={`cal-trade ${t.outcome?.toLowerCase()}`}>
                  <span className="cal-pair">{t.pair}</span>
                  <span className={`cal-pnl ${parseFloat(t.pnl) >= 0 ? "pos" : "neg"}`}>
                    {parseFloat(t.pnl) >= 0 ? "+" : ""}{parseFloat(t.pnl || 0).toFixed(1)}%
                  </span>
                </div>
              ))}
              {dayTrades.length > 0 && (
                <div className={`cal-total ${dayPnL >= 0 ? "pos" : "neg"}`}>
                  {dayPnL >= 0 ? "+" : ""}${dayPnL.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
