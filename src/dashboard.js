'use strict'

/**
 * Generate a self-contained HTML dashboard from history data.
 * @param {Array}  history  - array of daily entries (up to 30)
 * @param {string} lang     - 'en' | 'vi'
 * @param {Object} loc      - locale.dashboard object
 * @returns {string} full HTML string
 */
function generateDashboardHTML(history, lang, loc) {
  // Escape </script> sequences so embedded JSON cannot break out of the script block
  function safeJSON(val) {
    return JSON.stringify(val).replace(/<\//g, '<\\/')
  }

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${loc.title} — HealthBreak</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; background: #f5f5f5; color: #1a1a1a; min-height: 100vh }
  .header { background: #fff; border-bottom: 1px solid #e8e8e8; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between }
  .header-left h1 { font-size: 22px; font-weight: 700; color: #1a1a1a }
  .header-left p  { font-size: 13px; color: #888; margin-top: 2px }
  .toggle-group { display: flex; gap: 0; background: #f0f0f0; border-radius: 8px; padding: 3px }
  .toggle-btn { border: none; background: none; padding: 6px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #888; cursor: pointer; transition: all 0.15s }
  .toggle-btn.active { background: #fff; color: #1a1a1a; box-shadow: 0 1px 4px rgba(0,0,0,0.1) }
  .main { max-width: 720px; margin: 0 auto; padding: 28px 24px }
  .card { background: #fff; border-radius: 14px; padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06) }
  .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px }
  .card-icon { font-size: 24px }
  .card-title { font-size: 16px; font-weight: 700 }
  .card-meta  { font-size: 12px; color: #aaa; margin-left: auto }
  .no-data { text-align: center; color: #bbb; font-size: 14px; padding: 24px 0 }
  .skip-section .card-header { margin-bottom: 12px }
  .skip-desc { font-size: 12px; color: #aaa; margin-bottom: 16px }
  .pills { display: flex; gap: 12px; flex-wrap: wrap }
  .pill { background: #f8f8f8; border-radius: 10px; padding: 12px 18px; flex: 1; min-width: 140px }
  .pill-label { display: block; font-size: 12px; color: #888; margin-bottom: 4px }
  .pill-val { font-size: 26px; font-weight: 700 }
  .pill-sub { display: block; font-size: 11px; color: #bbb; margin-top: 2px }
  .footer { text-align: center; font-size: 11px; color: #ccc; padding: 24px 0 }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>💚 ${loc.title}</h1>
    <p id="subtitle-text"></p>
  </div>
  <div class="toggle-group">
    <button class="toggle-btn active" id="btn7"  onclick="setRange(7)">${loc.toggle7}</button>
    <button class="toggle-btn"        id="btn30" onclick="setRange(30)">${loc.toggle30}</button>
  </div>
</div>

<div class="main">
  <div class="card" id="card-water"></div>
  <div class="card" id="card-eyes"></div>
  <div class="card" id="card-move"></div>
  <div class="card skip-section" id="card-skip"></div>
</div>

<div class="footer">HealthBreak — ${loc.title}</div>

<script>
const LOC     = ${safeJSON(loc)};
const HISTORY = ${safeJSON(history)};

// Returns last N days as local YYYY-MM-DD strings
function lastNDays(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    return d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
  });
}

function fmtDate(s) {
  const [, m, d] = s.split('-');
  return d + '/' + m;
}

function byDate() {
  const map = {};
  HISTORY.forEach(e => { map[e.date] = e; });
  return map;
}

function getEntry(map, date) {
  return map[date] || { date, water: { confirms:0, skips:0, intervalMin:30 }, move: { confirms:0, skips:0, intervalMin:60 }, eyes: { confirms:0, skips:0, intervalMin:20 } };
}

function svgBar(dates, values, color, unit) {
  const W=640, H=160, PL=48, PB=28, PT=12, PR=8;
  const cW=W-PL-PR, cH=H-PB-PT;
  const max=Math.max(...values,1);
  const bW=Math.max(4,Math.floor(cW/values.length)-3);
  const step=cW/values.length;
  let bars='', yAxis='', xLabs='';
  values.forEach((v,i)=>{
    const bh=Math.round((v/max)*cH);
    const x=PL+i*step+(step-bW)/2;
    const y=PT+cH-bh;
    bars+=\`<rect x="\${x.toFixed(1)}" y="\${y}" width="\${bW}" height="\${bh}" fill="\${color}" rx="2" opacity="0.85"><title>\${fmtDate(dates[i])}: \${v} \${unit}</title></rect>\`;
  });
  [0,0.5,1].forEach(t=>{
    const val=Math.round(max*t);
    const y=PT+cH-Math.round(t*cH);
    yAxis+=\`<line x1="\${PL-4}" y1="\${y}" x2="\${PL+cW}" y2="\${y}" stroke="#eee" stroke-width="1"/><text x="\${PL-6}" y="\${y+4}" text-anchor="end" font-size="10" fill="#999">\${val}</text>\`;
  });
  const sl=values.length>14?5:values.length>7?2:1;
  dates.forEach((d,i)=>{
    if(i%sl!==0&&i!==dates.length-1)return;
    const x=PL+i*step+step/2;
    xLabs+=\`<text x="\${x.toFixed(1)}" y="\${H-6}" text-anchor="middle" font-size="9" fill="#aaa">\${fmtDate(d)}</text>\`;
  });
  return \`<svg viewBox="0 0 \${W} \${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">\${yAxis}<line x1="\${PL}" y1="\${PT}" x2="\${PL}" y2="\${PT+cH}" stroke="#ddd" stroke-width="1"/>\${bars}\${xLabs}</svg>\`;
}

function skipPill(key, label, entries) {
  const tc=entries.reduce((s,e)=>s+(e[key]?.confirms||0),0);
  const ts=entries.reduce((s,e)=>s+(e[key]?.skips||0),0);
  const tot=tc+ts;
  if(!tot) return \`<div class="pill"><span class="pill-label">\${label}</span><span class="pill-val">—</span></div>\`;
  const rate=((ts/tot)*100).toFixed(1);
  const col=rate>50?'#e53935':rate>25?'#fb8c00':'#43a047';
  return \`<div class="pill"><span class="pill-label">\${label}</span><span class="pill-val" style="color:\${col}">\${rate}%</span><span class="pill-sub">\${ts} \${LOC.skips} / \${tot}</span></div>\`;
}

let currentRange = 7;

function setRange(n) {
  currentRange = n;
  document.getElementById('btn7').className  = 'toggle-btn' + (n===7?' active':'');
  document.getElementById('btn30').className = 'toggle-btn' + (n===30?' active':'');
  render(n);
}

function render(n) {
  const dates   = lastNDays(n);
  const map     = byDate();
  const entries = dates.map(d => getEntry(map, d));

  document.getElementById('subtitle-text').textContent =
    LOC.subtitle + ' ' + n + ' ' + LOC.days;

  // Water chart
  const waterMl = entries.map(e => (e.water.confirms||0) * (e.water.intervalMin>=20 ? 250 : 250));
  const waterSum = waterMl.reduce((a,b)=>a+b,0);
  document.getElementById('card-water').innerHTML =
    \`<div class="card-header"><span class="card-icon">💧</span><span class="card-title">\${LOC.water}</span><span class="card-meta">\${waterSum} \${LOC.waterUnit}</span></div>\` +
    (waterSum > 0 ? svgBar(dates, waterMl, '#1e88e5', LOC.waterUnit) : \`<div class="no-data">\${LOC.noData}</div>\`);

  // Eyes chart
  const eyesMin = entries.map(e => Math.round((e.eyes.confirms||0) * (e.eyes.intervalMin||20)));
  const eyesSum = eyesMin.reduce((a,b)=>a+b,0);
  document.getElementById('card-eyes').innerHTML =
    \`<div class="card-header"><span class="card-icon">👁️</span><span class="card-title">\${LOC.eyes}</span><span class="card-meta">\${eyesSum} \${LOC.eyesUnit}</span></div>\` +
    (eyesSum > 0 ? svgBar(dates, eyesMin, '#fb8c00', LOC.eyesUnit) : \`<div class="no-data">\${LOC.noData}</div>\`);

  // Move chart
  const moveTimes = entries.map(e => e.move.confirms||0);
  const moveMin   = entries.map(e => Math.round((e.move.confirms||0) * (e.move.intervalMin||60)));
  const moveSum   = moveTimes.reduce((a,b)=>a+b,0);
  const moveSumMin = moveMin.reduce((a,b)=>a+b,0);
  document.getElementById('card-move').innerHTML =
    \`<div class="card-header"><span class="card-icon">🏃</span><span class="card-title">\${LOC.move}</span><span class="card-meta">\${moveSum} \${LOC.moveUnitTimes} · \${moveSumMin} \${LOC.moveUnitMin}</span></div>\` +
    (moveSum > 0 ? svgBar(dates, moveTimes, '#4caf50', LOC.moveUnitTimes) : \`<div class="no-data">\${LOC.noData}</div>\`);

  // Skip rate
  document.getElementById('card-skip').innerHTML =
    \`<div class="card-header"><span class="card-icon">⏭️</span><span class="card-title">\${LOC.skipRate}</span></div>\` +
    \`<p class="skip-desc">\${LOC.skipRateDesc}</p>\` +
    \`<div class="pills">\${skipPill('water','💧 '+LOC.water,entries)}\${skipPill('eyes','👁️ '+LOC.eyes,entries)}\${skipPill('move','🏃 '+LOC.move,entries)}</div>\`;
}

render(7);
</script>
</body>
</html>`
}

module.exports = { generateDashboardHTML }
