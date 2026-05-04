export function calculateStats(trades) {
  if (!trades.length) return {
    totalTrades: 0, wins: 0, losses: 0, winRate: 0,
    totalProfit: 0, totalLoss: 0, netPnL: 0,
    avgWin: 0, avgLoss: 0, profitFactor: 0,
    bestTrade: 0, worstTrade: 0, byStrategy: {},
  };

  const wins = trades.filter((t) => t.outcome === "WIN");
  const losses = trades.filter((t) => t.outcome === "LOSS");
  const totalProfit = wins.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const totalLoss = Math.abs(losses.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0));
  const allPnl = trades.map((t) => parseFloat(t.pnl) || 0);

  const byStrategy = {};
  trades.forEach((t) => {
    if (!t.strategy) return;
    if (!byStrategy[t.strategy]) byStrategy[t.strategy] = { wins: 0, losses: 0, pnl: 0 };
    byStrategy[t.strategy].pnl += parseFloat(t.pnl) || 0;
    if (t.outcome === "WIN") byStrategy[t.strategy].wins++;
    else byStrategy[t.strategy].losses++;
  });

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: ((wins.length / trades.length) * 100).toFixed(1),
    totalProfit: totalProfit.toFixed(2),
    totalLoss: totalLoss.toFixed(2),
    netPnL: (totalProfit - totalLoss).toFixed(2),
    avgWin: wins.length ? (totalProfit / wins.length).toFixed(2) : 0,
    avgLoss: losses.length ? (totalLoss / losses.length).toFixed(2) : 0,
    profitFactor: totalLoss ? (totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? "∞" : 0,
    bestTrade: Math.max(...allPnl).toFixed(2),
    worstTrade: Math.min(...allPnl).toFixed(2),
    byStrategy,
  };
}

export function getDailyPnL(trades) {
  const map = {};
  trades.forEach((t) => {
    if (!t.date) return;
    const d = t.date.slice(0, 10);
    map[d] = (map[d] || 0) + (parseFloat(t.pnl) || 0);
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl }));
}

export function getCumulativePnL(trades) {
  const daily = getDailyPnL(trades);
  let cumulative = 0;
  return daily.map(({ date, pnl }) => {
    cumulative += pnl;
    return { date, pnl: parseFloat(cumulative.toFixed(2)) };
  });
}
