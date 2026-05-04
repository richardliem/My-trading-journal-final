import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const MOCK_TRADES = [
  { id:"1", pair:"TRUMP/USDT", outcome:"WIN", position:"Long", date:"2026-03-01T09:00", entry:"12.50", stopLoss:"11.80", takeProfit:"14.50", pnl:"63.2", pnlPercent:"5.76", strategy:"Strategy #1", rr:"1:3", notes:"Clean breakout setup" },
  { id:"2", pair:"INJ/USDT", outcome:"WIN", position:"Long", date:"2026-03-02T10:30", entry:"22.10", stopLoss:"21.00", takeProfit:"26.00", pnl:"88.4", pnlPercent:"95.52", strategy:"Strategy #1", rr:"1:3.5", notes:"Strong bullish structure" },
  { id:"3", pair:"XMR/USDT", outcome:"LOSS", position:"Short", date:"2026-03-03T14:00", entry:"185.00", stopLoss:"192.00", takeProfit:"168.00", pnl:"-29.0", pnlPercent:"-23.81", strategy:"Strategy #2", rr:"1:2.4", notes:"Stopped out" },
  { id:"4", pair:"ADA/USDT", outcome:"WIN", position:"Long", date:"2026-03-04T08:15", entry:"0.720", stopLoss:"0.690", takeProfit:"0.810", pnl:"38.5", pnlPercent:"3.28", strategy:"Strategy #2", rr:"1:3", notes:"" },
  { id:"5", pair:"CRV/USDT", outcome:"WIN", position:"Short", date:"2026-03-05T11:00", entry:"0.580", stopLoss:"0.610", takeProfit:"0.490", pnl:"52.0", pnlPercent:"9.20", strategy:"Strategy #1", rr:"1:3", notes:"HTF resistance" },
  { id:"6", pair:"XRP/USDT", outcome:"WIN", position:"Short", date:"2026-03-06T09:45", entry:"2.450", stopLoss:"2.550", takeProfit:"2.150", pnl:"70.0", pnlPercent:"8.40", strategy:"Strategy #3", rr:"1:3", notes:"Liquidity sweep" },
  { id:"7", pair:"ARB/USDT", outcome:"WIN", position:"Short", date:"2026-03-07T13:20", entry:"0.420", stopLoss:"0.445", takeProfit:"0.345", pnl:"82.0", pnlPercent:"8.40", strategy:"Strategy #2", rr:"1:3", notes:"BOS confirmed" },
  { id:"8", pair:"BTC/USDT", outcome:"WIN", position:"Long", date:"2026-03-10T10:00", entry:"82000", stopLoss:"80000", takeProfit:"88000", pnl:"221.0", pnlPercent:"12.5", strategy:"Strategy #1", rr:"1:3", notes:"Weekly support hold" },
  { id:"9", pair:"ETH/USDT", outcome:"WIN", position:"Long", date:"2026-03-11T09:00", entry:"2100", stopLoss:"2020", takeProfit:"2340", pnl:"303.0", pnlPercent:"14.3", strategy:"Strategy #1", rr:"1:3", notes:"Accumulation zone" },
];

const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"⊞" },
  { id:"trades", label:"Trades", icon:"◈" },
  { id:"calendar", label:"Calendar", icon:"◻" },
  { id:"chart", label:"Chart", icon:"◬" },
  { id:"add", label:"Add", icon:"＋" },
  { id:"settings", label:"Settings", icon:"◎" },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function calcStats(trades) {
  if (!trades.length) return { totalTrades:0,wins:0,losses:0,winRate:0,netPnL:0,profitFactor:0,avgWin:0,avgLoss:0,bestTrade:0,worstTrade:0,byStrategy:{} };
  const wins = trades.filter(t=>t.outcome==="WIN");
  const losses = trades.filter(t=>t.outcome==="LOSS");
  const totalProfit = wins.reduce((s,t)=>s+parseFloat(t.pnl),0);
  const totalLoss = Math.abs(losses.reduce((s,t)=>s+parseFloat(t.pnl),0));
  const byStrategy = {};
  trades.forEach(t=>{
    if (!byStrategy[t.strategy]) byStrategy[t.strategy]={wins:0,losses:0,pnl:0};
    byStrategy[t.strategy].pnl+=parseFloat(t.pnl);
    if (t.outcome==="WIN") byStrategy[t.strategy].wins++; else byStrategy[t.strategy].losses++;
  });
  return {
    totalTrades:trades.length, wins:wins.length, losses:losses.length,
    winRate:((wins.length/trades.length)*100).toFixed(1),
    netPnL:(totalProfit-totalLoss).toFixed(2),
    profitFactor:totalLoss?(totalProfit/totalLoss).toFixed(2):"∞",
    avgWin:wins.length?(totalProfit/wins.length).toFixed(2):0,
    avgLoss:losses.length?(totalLoss/losses.length).toFixed(2):0,
    bestTrade:Math.max(...trades.map(t=>parseFloat(t.pnl))).toFixed(2),
    worstTrade:Math.min(...trades.map(t=>parseFloat(t.pnl))).toFixed(2),
    byStrategy,
  };
}

function getCumulative(trades) {
  const map={};
  trades.forEach(t=>{ const d=t.date.slice(0,10); map[d]=(map[d]||0)+parseFloat(t.pnl); });
  let cum=0;
  return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([date,pnl])=>{ cum+=pnl; return {date:date.slice(5),pnl:parseFloat(cum.toFixed(2))}; });
}

function getDaily(trades) {
  const map={};
  trades.forEach(t=>{ const d=t.date.slice(0,10); map[d]=(map[d]||0)+parseFloat(t.pnl); });
  return Object.entries(map).sort(([a],[b])=>a.localeCompare(b)).map(([date,pnl])=>({date:date.slice(5),pnl:parseFloat(pnl.toFixed(2))}));
}

const TT = ({active,payload,label})=>{
  if (!active||!payload?.length) return null;
  return <div style={{background:"#1c2330",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"9px 12px"}}>
    <div style={{fontSize:10,color:"#8b949e",marginBottom:3}}>{label}</div>
    <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:payload[0].value>=0?"#22d3a0":"#f87171"}}>${payload[0].value?.toFixed(2)}</div>
  </div>;
};

const pill = (type, text) => {
  const styles = {
    WIN:{bg:"rgba(34,211,160,0.15)",color:"#22d3a0"},
    LOSS:{bg:"rgba(248,113,113,0.15)",color:"#f87171"},
    BE:{bg:"rgba(251,191,36,0.15)",color:"#fbbf24"},
    Long:{bg:"rgba(34,211,160,0.1)",color:"#22d3a0"},
    Short:{bg:"rgba(248,113,113,0.1)",color:"#f87171"},
  };
  const s = styles[text]||{bg:"rgba(255,255,255,0.08)",color:"#8b949e"};
  return <span style={{display:"inline-block",padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,fontFamily:"monospace",textTransform:"uppercase",background:s.bg,color:s.color}}>{text}</span>;
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [trades] = useState(MOCK_TRADES);
  const [chartMode, setChartMode] = useState("cumulative");
  const [calMonth, setCalMonth] = useState(2);
  const [calYear, setCalYear] = useState(2026);
  const [filter, setFilter] = useState("ALL");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({pair:"BTC/USDT",outcome:"WIN",position:"Long",date:"2026-03-12T09:00",entry:"",sl:"",tp:"",pnl:"",pct:"",strategy:"Strategy #1",rr:""});

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  const stats = calcStats(trades);
  const cumData = getCumulative(trades);
  const dailyData = getDaily(trades);
  const chartData = chartMode==="cumulative"?cumData:dailyData;
  const filtered = trades.filter(t=>filter==="ALL"||t.outcome===filter);

  // calendar
  const firstDay = new Date(calYear,calMonth,1).getDay();
  const daysInMonth = new Date(calYear,calMonth+1,0).getDate();
  const tradeMap = {};
  trades.forEach(t=>{
    const [y,m,day]=t.date.slice(0,10).split("-").map(Number);
    if (y===calYear&&m-1===calMonth){ if(!tradeMap[day])tradeMap[day]=[]; tradeMap[day].push(t); }
  });
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let d=1;d<=daysInMonth;d++)cells.push(d);

  const V = {
    bg:"#090c10", bg2:"#0d1117", bg3:"#161b22", bg4:"#1c2330",
    border:"rgba(255,255,255,0.07)", text:"#e6edf3", text2:"#8b949e", text3:"#484f58",
    green:"#22d3a0", red:"#f87171", blue:"#60a5fa",
  };

  const navGo = (id) => { setTab(id); setSidebarOpen(false); };

  // ── SHARED STYLES ──
  const S = {
    app:{display:"flex",height:"100vh",overflow:"hidden",background:V.bg,fontFamily:"'DM Sans',sans-serif",fontSize:14,color:V.text,position:"relative"},
    // Sidebar desktop
    sidebar:{width:210,flexShrink:0,background:V.bg2,borderRight:`1px solid ${V.border}`,display:"flex",flexDirection:"column",padding:"20px 0",height:"100%",zIndex:50},
    // Sidebar mobile (drawer)
    sidebarMobile:{position:"fixed",top:0,left:0,height:"100%",width:220,background:V.bg2,borderRight:`1px solid ${V.border}`,display:"flex",flexDirection:"column",padding:"20px 0",zIndex:200,transition:"transform 0.25s ease",boxShadow:"4px 0 24px rgba(0,0,0,0.4)"},
    overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:150,backdropFilter:"blur(2px)"},
    logo:{display:"flex",alignItems:"center",gap:10,padding:"0 18px 22px",borderBottom:`1px solid ${V.border}`},
    logoMark:{fontFamily:"monospace",fontSize:18,fontWeight:700,color:V.green,background:"rgba(34,211,160,0.12)",width:36,height:36,display:"grid",placeItems:"center",borderRadius:8,flexShrink:0},
    logoText:{fontSize:11,fontWeight:600,color:V.text2,lineHeight:1.4},
    nav:{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:3},
    navBtn:(active)=>({display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,border:"none",background:active?"rgba(34,211,160,0.12)":"transparent",color:active?V.green:V.text2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,transition:"all 0.15s",textAlign:"left",width:"100%"}),
    sbFooter:{padding:"14px 18px",borderTop:`1px solid ${V.border}`},
    // Mobile topbar
    mobileTop:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:V.bg2,borderBottom:`1px solid ${V.border}`,flexShrink:0},
    hamburger:{background:"none",border:`1px solid ${V.border}`,color:V.text,borderRadius:8,width:36,height:36,display:"grid",placeItems:"center",cursor:"pointer",fontSize:18},
    // Desktop topbar
    topbar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 26px",background:V.bg2,borderBottom:`1px solid ${V.border}`,flexShrink:0},
    main:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0},
    content:{flex:1,overflowY:"auto",padding:isMobile?"14px 14px":"22px 26px"},
    // Cards
    statsGrid:{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)",gap:isMobile?10:12,marginBottom:isMobile?14:18},
    stat:(accent)=>({background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:isMobile?"13px 14px":"16px 18px",borderLeft:accent?`3px solid ${accent}`:"1px solid rgba(255,255,255,0.07)"}),
    statLbl:{fontSize:10,color:V.text3,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6},
    statVal:{fontFamily:"monospace",fontSize:isMobile?18:22,fontWeight:700},
    statSub:{fontSize:10,color:V.text2,marginTop:3},
    section:{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:isMobile?14:18,marginBottom:isMobile?12:16},
    secTitle:{fontSize:10,fontWeight:600,color:V.text2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12},
    btnAdd:{padding:isMobile?"7px 13px":"8px 16px",background:V.green,color:"#000",border:"none",borderRadius:8,fontSize:isMobile?11:13,fontWeight:700,cursor:"pointer"},
  };

  const SidebarContent = () => (
    <>
      <div style={S.logo}>
        <span style={S.logoMark}>TJ</span>
        <span style={S.logoText}>Trading<br/>Journal</span>
      </div>
      <nav style={S.nav}>
        {NAV.map(n=>(
          <button key={n.id} style={S.navBtn(tab===n.id)} onClick={()=>navGo(n.id)}>
            <span style={{fontSize:15,width:18,textAlign:"center"}}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div style={S.sbFooter}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:V.green,display:"inline-block"}}/>
          <span style={{fontSize:11,color:V.text2}}>GitHub connected</span>
        </div>
      </div>
    </>
  );

  return (
    <div style={S.app}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && <aside style={S.sidebar}><SidebarContent/></aside>}

      {/* MOBILE DRAWER */}
      {isMobile && sidebarOpen && <>
        <div style={S.overlay} onClick={()=>setSidebarOpen(false)}/>
        <aside style={S.sidebarMobile}><SidebarContent/></aside>
      </>}

      {/* MAIN */}
      <main style={S.main}>
        {/* MOBILE TOPBAR */}
        {isMobile ? (
          <div style={S.mobileTop}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button style={S.hamburger} onClick={()=>setSidebarOpen(true)}>☰</button>
              <div>
                <div style={{fontSize:15,fontWeight:600}}>{NAV.find(n=>n.id===tab)?.label}</div>
                <div style={{fontSize:10,color:V.text3,fontFamily:"monospace"}}>{trades.length} trades</div>
              </div>
            </div>
            {tab!=="settings"&&tab!=="add"&&<button style={S.btnAdd} onClick={()=>setTab("add")}>+ Add</button>}
          </div>
        ) : (
          <header style={S.topbar}>
            <div style={{display:"flex",alignItems:"baseline",gap:10}}>
              <h1 style={{fontSize:19,fontWeight:600}}>{NAV.find(n=>n.id===tab)?.label}</h1>
              <span style={{fontSize:11,color:V.text3,fontFamily:"monospace"}}>{trades.length} trades</span>
            </div>
            {tab!=="settings"&&tab!=="add"&&<button style={S.btnAdd} onClick={()=>setTab("add")}>+ New Trade</button>}
          </header>
        )}

        <div style={S.content}>

          {/* ── DASHBOARD ── */}
          {tab==="dashboard"&&<div>
            <div style={S.statsGrid}>
              {[
                {label:"Win Rate",val:`${stats.winRate}%`,sub:`${stats.wins}W / ${stats.losses}L`,accent:V.green},
                {label:"Net P&L",val:`$${stats.netPnL}`,sub:`PF: ${stats.profitFactor}`,accent:parseFloat(stats.netPnL)>=0?V.green:V.red},
                {label:"Total Trades",val:stats.totalTrades,sub:"March 2026",accent:null},
                {label:"Best Trade",val:`$${stats.bestTrade}`,sub:`Worst: $${stats.worstTrade}`,accent:V.blue},
                {label:"Avg Win",val:`$${stats.avgWin}`,sub:"per win",accent:V.green},
                {label:"Avg Loss",val:`-$${stats.avgLoss}`,sub:"per loss",accent:V.red},
              ].map(s=>(
                <div key={s.label} style={S.stat(s.accent)}>
                  <div style={S.statLbl}>{s.label}</div>
                  <div style={S.statVal}>{s.val}</div>
                  <div style={S.statSub}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={S.section}>
              <div style={S.secTitle}>Strategy Performance</div>
              {Object.entries(stats.byStrategy).map(([name,s])=>{
                const total=s.wins+s.losses;
                const wr=total?((s.wins/total)*100).toFixed(0):0;
                return <div key={name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:isMobile?80:95,fontSize:11,color:V.text2,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                  <div style={{flex:1,height:5,background:V.bg4,borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${wr}%`,background:V.green,borderRadius:3}}/>
                  </div>
                  <div style={{display:"flex",gap:8,fontSize:11,fontFamily:"monospace",flexShrink:0}}>
                    <span style={{color:s.pnl>=0?V.green:V.red}}>${s.pnl.toFixed(0)}</span>
                    <span style={{color:V.text3}}>{wr}%</span>
                  </div>
                </div>;
              })}
            </div>

            <div style={S.section}>
              <div style={S.secTitle}>Recent Trades</div>
              {trades.slice(0,5).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:6,background:V.bg4,marginBottom:2}}>
                  <div style={{fontFamily:"monospace",fontSize:isMobile?11:12,fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.pair}</div>
                  {pill("outcome",t.outcome)}
                  <div style={{fontFamily:"monospace",fontSize:12,color:parseFloat(t.pnl)>=0?V.green:V.red,flexShrink:0}}>${parseFloat(t.pnl).toFixed(0)}</div>
                  {!isMobile&&<div style={{fontSize:10,color:V.text3,minWidth:75,textAlign:"right"}}>{t.date.slice(0,10)}</div>}
                </div>
              ))}
            </div>
          </div>}

          {/* ── TRADES ── */}
          {tab==="trades"&&<div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <input style={{flex:1,minWidth:140,background:V.bg3,border:`1px solid ${V.border}`,color:V.text,padding:"8px 12px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}} placeholder="Search pair..."/>
              <div style={{display:"flex",gap:4}}>
                {["ALL","WIN","LOSS","BE"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 10px",borderRadius:7,border:`1px solid ${filter===f?V.green:V.border}`,background:filter===f?"rgba(34,211,160,0.12)":V.bg3,color:filter===f?V.green:V.text2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>{f}</button>
                ))}
              </div>
            </div>

            {isMobile ? (
              // Mobile: card list
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filtered.map(t=>(
                  <div key={t.id} style={{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{fontFamily:"monospace",fontWeight:700,fontSize:14}}>{t.pair}</span>
                      <div style={{display:"flex",gap:6}}>
                        {pill("outcome",t.outcome)}
                        {pill("pos",t.position)}
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      {[
                        {l:"Entry",v:t.entry},
                        {l:"SL",v:t.stopLoss,c:V.red},
                        {l:"TP",v:t.takeProfit,c:V.green},
                        {l:"R:R",v:t.rr},
                        {l:"P&L",v:`$${parseFloat(t.pnl).toFixed(1)}`,c:parseFloat(t.pnl)>=0?V.green:V.red},
                        {l:"%",v:`${t.pnlPercent}%`,c:parseFloat(t.pnlPercent)>=0?V.green:V.red},
                      ].map(item=>(
                        <div key={item.l}>
                          <div style={{fontSize:9,color:V.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:2}}>{item.l}</div>
                          <div style={{fontSize:12,fontFamily:"monospace",fontWeight:600,color:item.c||V.text}}>{item.v||"—"}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:10,color:V.text3}}>{t.date.slice(0,10)} · {t.strategy}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop: table
              <div style={{overflowX:"auto",borderRadius:10,border:`1px solid ${V.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>
                      {["Pair","Outcome","Position","Date","Entry","SL","TP","R:R","P&L $","P&L %","Strategy"].map(h=>(
                        <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:600,color:V.text3,textTransform:"uppercase",letterSpacing:"0.5px",background:V.bg3,borderBottom:`1px solid ${V.border}`,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t=>(
                      <tr key={t.id} style={{}}>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontFamily:"monospace",fontWeight:700,fontSize:12}}>{t.pair}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2}}>{pill("o",t.outcome)}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2}}>{pill("p",t.position)}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:11,color:V.text2,whiteSpace:"nowrap"}}>{t.date.slice(0,10)}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:12}}>{t.entry}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:12,color:V.red}}>{t.stopLoss}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:12,color:V.green}}>{t.takeProfit}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:11,fontFamily:"monospace"}}>{t.rr}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontFamily:"monospace",fontSize:12,color:parseFloat(t.pnl)>=0?V.green:V.red}}>{parseFloat(t.pnl)>=0?"+":""}${parseFloat(t.pnl).toFixed(2)}</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontFamily:"monospace",fontSize:12,color:parseFloat(t.pnlPercent)>=0?V.green:V.red}}>{t.pnlPercent}%</td>
                        <td style={{padding:"10px 12px",borderBottom:`1px solid rgba(255,255,255,0.04)`,background:V.bg2,fontSize:11,color:V.text2}}>{t.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>}

          {/* ── CALENDAR ── */}
          {tab==="calendar"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:18}}>
              <button onClick={()=>calMonth===0?(setCalMonth(11),setCalYear(y=>y-1)):setCalMonth(m=>m-1)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${V.border}`,background:V.bg3,color:V.text,fontSize:18,cursor:"pointer",display:"grid",placeItems:"center"}}>‹</button>
              <h2 style={{fontFamily:"monospace",fontSize:isMobile?14:16,fontWeight:700,minWidth:isMobile?150:180,textAlign:"center"}}>{MONTHS[calMonth].slice(0,isMobile?3:9)} {calYear}</h2>
              <button onClick={()=>calMonth===11?(setCalMonth(0),setCalYear(y=>y+1)):setCalMonth(m=>m+1)} style={{width:34,height:34,borderRadius:8,border:`1px solid ${V.border}`,background:V.bg3,color:V.text,fontSize:18,cursor:"pointer",display:"grid",placeItems:"center"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:isMobile?2:3}}>
              {["S","M","T","W","T","F","S"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:9,fontWeight:600,color:V.text3,padding:"6px 0",textTransform:"uppercase"}}>{d}</div>
              ))}
              {cells.map((day,i)=>{
                if (!day) return <div key={`e${i}`} style={{minHeight:isMobile?60:88,background:"transparent"}}/>;
                const dt=tradeMap[day]||[];
                const pnl=dt.reduce((s,t)=>s+(parseFloat(t.pnl)||0),0);
                return <div key={day} style={{minHeight:isMobile?60:88,background:dt.length?(pnl>=0?"rgba(34,211,160,0.04)":"rgba(248,113,113,0.04)"):V.bg3,border:`1px solid ${dt.length?(pnl>=0?"rgba(34,211,160,0.15)":"rgba(248,113,113,0.15)"):V.border}`,borderRadius:isMobile?6:8,padding:isMobile?5:7,display:"flex",flexDirection:"column",gap:2}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:V.text3}}>{day}</div>
                  {dt.map((t,j)=>(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",background:V.bg4,padding:"2px 4px",borderRadius:3,borderLeft:`2px solid ${t.outcome==="WIN"?V.green:V.red}`}}>
                      <span style={{fontSize:8,fontFamily:"monospace",color:V.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.pair.replace("/USDT","")}</span>
                      {!isMobile&&<span style={{fontSize:8,fontFamily:"monospace",color:parseFloat(t.pnl)>=0?V.green:V.red,flexShrink:0}}>{t.pnlPercent}%</span>}
                    </div>
                  ))}
                  {dt.length>0&&<div style={{fontSize:9,fontFamily:"monospace",fontWeight:700,marginTop:"auto",color:pnl>=0?V.green:V.red}}>{pnl>=0?"+":""}${pnl.toFixed(0)}</div>}
                </div>;
              })}
            </div>
          </div>}

          {/* ── CHART ── */}
          {tab==="chart"&&<div>
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {["cumulative","daily"].map(m=>(
                <button key={m} onClick={()=>setChartMode(m)} style={{padding:"8px 14px",borderRadius:7,border:`1px solid ${chartMode===m?V.green:V.border}`,background:chartMode===m?"rgba(34,211,160,0.12)":V.bg3,color:chartMode===m?V.green:V.text2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{m==="cumulative"?"Cumulative":"Daily P&L"}</button>
              ))}
            </div>
            <div style={{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:isMobile?12:18,marginBottom:14}}>
              <ResponsiveContainer width="100%" height={isMobile?220:300}>
                {chartMode==="cumulative"?(
                  <LineChart data={chartData} margin={{top:10,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="date" tick={{fill:"#484f58",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#484f58",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={45}/>
                    <Tooltip content={<TT/>}/>
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)"/>
                    <Line type="monotone" dataKey="pnl" stroke={V.green} strokeWidth={2.5} dot={{fill:V.green,r:3}} activeDot={{r:6}}/>
                  </LineChart>
                ):(
                  <BarChart data={chartData} margin={{top:10,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                    <XAxis dataKey="date" tick={{fill:"#484f58",fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#484f58",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={45}/>
                    <Tooltip content={<TT/>}/>
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)"/>
                    <Bar dataKey="pnl" radius={[4,4,0,0]} shape={props=>{
                      const{x,y,width,height,value}=props;
                      const color=value>=0?V.green:V.red;
                      return <rect x={x} y={value>=0?y:y+height} width={width} height={Math.abs(height)} fill={color} rx={4}/>;
                    }}/>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:10}}>
              {[
                {l:"Total Days",v:chartData.length},
                {l:"Best Day",v:`$${Math.max(...chartData.map(d=>d.pnl)).toFixed(0)}`},
                {l:"Worst Day",v:`$${Math.min(...chartData.map(d=>d.pnl)).toFixed(0)}`},
                {l:"Avg Daily",v:`$${(chartData.reduce((s,d)=>s+d.pnl,0)/(chartData.length||1)).toFixed(0)}`},
              ].map(s=>(
                <div key={s.l} style={{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:V.text3,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:5}}>{s.l}</div>
                  <div style={{fontFamily:"monospace",fontSize:isMobile?16:18,fontWeight:700}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* ── ADD TRADE ── */}
          {tab==="add"&&<div style={{maxWidth:600}}>
            <div style={{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:12,padding:isMobile?16:22}}>
              <h2 style={{fontSize:17,fontWeight:600,marginBottom:18}}>New Trade</h2>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:14}}>
                {[
                  {label:"Pair",type:"select",opts:["BTC/USDT","ETH/USDT","SOL/USDT","XRP/USDT","INJ/USDT","ARB/USDT","TRUMP/USDT","ADA/USDT","CRV/USDT"]},
                  {label:"Date & Time",type:"datetime-local"},
                ].map(f=>(
                  <div key={f.label}>
                    <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>{f.label}</div>
                    {f.type==="select"
                      ?<select style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                        {f.opts.map(o=><option key={o}>{o}</option>)}
                      </select>
                      :<input type={f.type} defaultValue={f.type==="datetime-local"?"2026-03-12T09:00":""} style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                    }
                  </div>
                ))}

                {/* Outcome toggle */}
                <div>
                  <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>Outcome</div>
                  <div style={{display:"flex",gap:5}}>
                    {["WIN","LOSS","BE"].map(o=>{
                      const active=form.outcome===o;
                      const c=o==="WIN"?V.green:o==="LOSS"?V.red:"#fbbf24";
                      return <button key={o} onClick={()=>setForm(f=>({...f,outcome:o}))} style={{flex:1,padding:"8px",borderRadius:7,border:`1px solid ${active?c:V.border}`,background:active?`${c}22`:V.bg2,color:active?c:V.text2,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>{o}</button>;
                    })}
                  </div>
                </div>

                {/* Position toggle */}
                <div>
                  <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>Position</div>
                  <div style={{display:"flex",gap:5}}>
                    {["Long","Short"].map(p=>{
                      const active=form.position===p;
                      const c=p==="Long"?V.green:V.red;
                      return <button key={p} onClick={()=>setForm(f=>({...f,position:p}))} style={{flex:1,padding:"8px",borderRadius:7,border:`1px solid ${active?c:V.border}`,background:active?`${c}22`:V.bg2,color:active?c:V.text2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"monospace"}}>{p}</button>;
                    })}
                  </div>
                </div>

                {/* Number fields */}
                {[
                  {l:"Entry Price",ph:"0.00"},{l:"Stop Loss",ph:"0.00"},
                  {l:"Take Profit",ph:"0.00"},{l:"R:R Ratio",ph:"e.g. 1:3"},
                  {l:"P&L ($)",ph:"0.00"},{l:"P&L (%)",ph:"0.00"},
                ].map(f=>(
                  <div key={f.l}>
                    <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>{f.l}</div>
                    <input placeholder={f.ph} style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                  </div>
                ))}

                {/* Strategy */}
                <div style={{gridColumn:isMobile?"1":"1/3"}}>
                  <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>Strategy</div>
                  <select style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                    {["Strategy #1","Strategy #2","Strategy #3","Scalp","Swing","Breakout","Reversal"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Notes */}
                <div style={{gridColumn:isMobile?"1":"1/3"}}>
                  <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>Notes</div>
                  <textarea rows={3} placeholder="Trade notes, observations..." style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif",resize:"vertical"}}/>
                </div>
              </div>

              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setTab("dashboard")} style={{flex:1,padding:"11px",borderRadius:8,background:V.bg4,border:`1px solid ${V.border}`,color:V.text2,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                <button onClick={()=>setTab("dashboard")} style={{flex:1,padding:"11px",borderRadius:8,background:V.green,border:"none",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>Add Trade</button>
              </div>
            </div>
          </div>}

          {/* ── SETTINGS ── */}
          {tab==="settings"&&<div>
            <div style={{background:V.bg3,border:`1px solid ${V.border}`,borderRadius:10,padding:isMobile?16:22,marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:600,color:V.text2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>GitHub Storage</div>
              <div style={{fontSize:13,color:V.text2,marginBottom:16,lineHeight:1.6}}>
                Connect your GitHub repo to sync trades across all devices.
              </div>
              {[1,2,3,4].map((n,i)=>(
                <div key={n} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:9,fontSize:12,color:V.text2,lineHeight:1.5}}>
                  <span style={{width:20,height:20,borderRadius:"50%",background:"rgba(34,211,160,0.12)",color:V.green,fontSize:10,fontWeight:700,display:"grid",placeItems:"center",flexShrink:0,fontFamily:"monospace"}}>{n}</span>
                  <span>{["Create a private GitHub repository",`Go to Settings → Developer Settings → Personal Access Tokens`,"Create token with Contents: Read & Write","Paste token below and save"][i]}</span>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginTop:16}}>
                {[
                  {l:"Personal Access Token",ph:"github_pat_...",type:"password",full:true},
                  {l:"GitHub Username",ph:"your-username"},
                  {l:"Repository Name",ph:"my-trading-journal"},
                  {l:"Branch",ph:"main"},
                ].map(f=>(
                  <div key={f.l} style={{gridColumn:f.full&&!isMobile?"1/3":"auto"}}>
                    <div style={{fontSize:10,color:V.text2,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:5}}>{f.l}</div>
                    <input type={f.type||"text"} placeholder={f.ph} style={{width:"100%",background:V.bg2,border:`1px solid ${V.border}`,color:V.text,padding:"8px 11px",borderRadius:8,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <button style={{flex:1,padding:"10px",borderRadius:8,background:V.bg4,border:`1px solid ${V.border}`,color:V.text2,fontSize:12,fontWeight:600,cursor:"pointer"}}>Test Connection</button>
                <button style={{flex:1,padding:"10px",borderRadius:8,background:V.green,border:"none",color:"#000",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save & Connect</button>
              </div>
              <div style={{marginTop:10,padding:"9px 12px",borderRadius:8,background:"rgba(34,211,160,0.12)",color:V.green,fontSize:12}}>✓ Connection successful!</div>
            </div>
            <div style={{background:V.bg3,border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:isMobile?16:22}}>
              <div style={{fontSize:10,fontWeight:600,color:V.text2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>Danger Zone</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>Clear Local Data</div>
                  <div style={{fontSize:11,color:V.text2,marginTop:3}}>Remove all trades from localStorage</div>
                </div>
                <button style={{padding:"8px 16px",background:"rgba(248,113,113,0.15)",border:`1px solid ${V.red}`,color:V.red,borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>Clear All</button>
              </div>
            </div>
          </div>}

        </div>

        {/* MOBILE BOTTOM NAV */}
        {isMobile&&(
          <nav style={{display:"flex",background:V.bg2,borderTop:`1px solid ${V.border}`,flexShrink:0}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",border:"none",background:tab===n.id?"rgba(34,211,160,0.08)":V.bg2,color:tab===n.id?V.green:V.text3,cursor:"pointer",borderTop:tab===n.id?`2px solid ${V.green}`:"2px solid transparent",transition:"all 0.15s"}}>
                <span style={{fontSize:16}}>{n.icon}</span>
                <span style={{fontSize:9,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{n.label}</span>
              </button>
            ))}
          </nav>
        )}
      </main>
    </div>
  );
}
