const START = new Date(2026, 9, 20);
const AREAS = {
  cyber: { name: "Cybersecurity", goal: 4 },
  elet:  { name: "Eletrônica", goal: 4 },
  fac:   { name: "Faculdade", goal: 4 },
  des:   { name: "Desenho", goal: 3 },
};
// índice 0 = segunda
const PLAN = [
  [{ id: "am", area: "des", h: 1, when: "manhã", focus: "Linhas e elipses (aquecimento + exercício)" },
   { id: "pm", area: "fac", h: 1, when: "noite", focus: "Videoaulas e leitura" }],
  [{ id: "am", area: "cyber", h: 1, when: "manhã", focus: "Teoria do tema da fase" },
   { id: "pm", area: "elet", h: 1, when: "noite", focus: "Teoria e cálculo" }],
  [{ id: "am", area: "des", h: 1, when: "manhã", focus: "Lição da semana" },
   { id: "pm", area: "fac", h: 1, when: "noite", focus: "Atividades e exercícios" }],
  [{ id: "am", area: "cyber", h: 1, when: "manhã", focus: "Labs curtos" },
   { id: "pm", area: "elet", h: 1, when: "noite", focus: "Montagem na protoboard" }],
  [{ id: "pm", area: "fac", h: 1, when: "noite", focus: "Revisão e entregas" }],
  [{ id: "a", area: "cyber", h: 2, when: "manhã", focus: "Lab longo + write-up" },
   { id: "b", area: "elet", h: 2, when: "tarde", focus: "Projeto da fase" }],
  [{ id: "a", area: "fac", h: 1, when: "manhã", focus: "Planejar a semana da faculdade" },
   { id: "b", area: "des", h: 1, when: "tarde", focus: "Desenho livre de observação" }],
];
const FREE = { 4: "Manhã livre: reponha um bloco perdido" };
const DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MONTHS = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];

const TRAIL = [
  { area: "cyber", pace: "4 h por semana · terça, quinta e sábado", phases: [
    { from: 1, to: 3, what: "Web e AppSec", html: 'Labs da <a href="https://portswigger.net/web-security" target="_blank" rel="noopener">PortSwigger Academy</a> guiados pelo <a href="https://owasp.org/Top10/" target="_blank" rel="noopener">OWASP Top 10</a>. Inclua <a href="https://portswigger.net/web-security/prototype-pollution" target="_blank" rel="noopener">prototype pollution</a> (Node) e o <a href="https://guides.rubyonrails.org/security.html" target="_blank" rel="noopener">Rails Security Guide</a>.' },
    { from: 4, to: 6, what: "Linux, redes e Python", html: 'Trilhas iniciais do <a href="https://tryhackme.com/" target="_blank" rel="noopener">TryHackMe</a>, Nmap e enumeração. Escreva seus scripts de exploit em Python.' },
    { from: 7, to: 9, what: "Escalação de privilégio e Active Directory", html: 'Máquinas Easy do <a href="https://www.hackthebox.com/" target="_blank" rel="noopener">Hack The Box</a>, Kerberoasting e BloodHound. Um write-up por máquina.' },
    { from: 10, to: 12, what: "Certificação prática", html: '<a href="https://ine.com/learning/certifications/internal-penetration-testing-ejpt" target="_blank" rel="noopener">eJPT</a> ou <a href="https://certifications.tcm-sec.com/pnpt/" target="_blank" rel="noopener">PNPT</a>, com um relatório de pentest no portfólio.' },
    { from: 13, to: 99, what: "C, C++ e binário", html: 'Assembly, C e exploração binária no <a href="https://pwn.college/" target="_blank" rel="noopener">pwn.college</a>. C++ moderno entra aqui.' },
  ]},
  { area: "elet", pace: "4 h por semana · terça, quinta e sábado", phases: [
    { from: 1, to: 2, what: "Fundamentos", html: '<a href="https://learn.sparkfun.com/tutorials/voltage-current-resistance-and-ohms-law" target="_blank" rel="noopener">Lei de Ohm</a>, multímetro, circuitos em série e paralelo, LEDs e resistores na protoboard.' },
    { from: 3, to: 4, what: "Arduino", html: 'Entrada e saída digital, PWM e sensores analógicos com os <a href="https://docs.arduino.cc/built-in-examples/" target="_blank" rel="noopener">exemplos oficiais</a>.' },
    { from: 5, to: 6, what: "Solda e projeto fechado", html: '<a href="https://learn.sparkfun.com/tutorials/how-to-solder-through-hole-soldering" target="_blank" rel="noopener">Solda through-hole</a> e um projeto completo em placa perfurada.' },
    { from: 7, to: 99, what: "Hardware hacking", html: 'UART, analisador lógico e dump de firmware. É aqui que eletrônica encontra cyber.' },
  ]},
  { area: "des", pace: "3 h por semana · segunda, quarta e domingo", phases: [
    { from: 1, to: 3, what: "Linhas, elipses e caixas", html: 'Lições 0 e 1 do <a href="https://drawabox.com/" target="_blank" rel="noopener">Drawabox</a>. O bloco de domingo é desenho livre, como o próprio método pede.' },
    { from: 4, to: 6, what: "Formas e perspectiva", html: 'Lição 2 do Drawabox e perspectiva de dois pontos aplicada a objetos da sua mesa.' },
    { from: 7, to: 99, what: "Observação", html: 'Objetos, mãos e ambientes do natural. Escolha um tema por mês.' },
  ]},
  { area: "fac", pace: "4 h por semana · segunda, quarta, sexta e domingo", phases: [
    { from: 1, to: 99, what: "Calendário da faculdade", html: 'Segue as semanas do AVA. Domingo de manhã você planeja as entregas da semana.' },
  ]},
];

// ---------- datas ----------
const pad = n => String(n).padStart(2, "0");
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
const today = new Date(); today.setHours(0, 0, 0, 0);
const trailMonth = d => Math.max(1, Math.floor((d - START) / 86400000 / 30.44) + 1);

let weekStart = mondayOf(today);
const pendingNotes = {};

// ---------- persistência ----------
const LOCAL_KEY = "diario-estudos-v1";
const setStatus = t => { document.getElementById("status").textContent = t; };

function loadDays() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}
let days = loadDays();

function saveDays() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(days));
    setStatus("Salvo neste aparelho");
  } catch {
    setStatus("Não foi possível salvar neste aparelho");
  }
}

function dayState(key) { return days[key] || { done: {}, mood: 0, note: "" }; }
function patchDay(key, patch) {
  const cur = dayState(key);
  days[key] = { ...cur, ...patch, done: { ...cur.done, ...(patch.done || {}) } };
  saveDays();
}

// ---------- backup ----------
function exportBackup() {
  const blob = new Blob([JSON.stringify(days, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `diario-estudos-${iso(today)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importBackup(file) {
  try {
    const imported = JSON.parse(await file.text());
    if (!imported || typeof imported !== "object" || Array.isArray(imported)) throw new Error("invalid backup");
    days = imported;
    saveDays();
    render();
    setStatus("Backup importado");
  } catch {
    setStatus("Arquivo de backup inválido");
  }
}

// ---------- render ----------
const CHECK = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7.5 5.5 11 12 3" fill="none" stroke="var(--card)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function ring(pct, cls) {
  const r = 20, c = 2 * Math.PI * r, p = Math.min(1, pct);
  return `<svg width="52" height="52" viewBox="0 0 52 52" class="${cls}" aria-hidden="true">
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/>
    <circle cx="26" cy="26" r="${r}" fill="none" stroke="${cls ? "var(--c)" : "var(--ink)"}" stroke-width="6" stroke-linecap="round"
      stroke-dasharray="${c * p} ${c}" transform="rotate(-90 26 26)"/></svg>`;
}

function renderGoals() {
  const done = { cyber: 0, elet: 0, fac: 0, des: 0 };
  for (let i = 0; i < 7; i++) {
    const st = dayState(iso(addDays(weekStart, i)));
    PLAN[i].forEach(s => { if (st.done[s.id]) done[s.area] += s.h; });
  }
  const total = Object.values(done).reduce((a, b) => a + b, 0);
  const goalTotal = Object.values(AREAS).reduce((a, b) => a + b.goal, 0);
  const cards = Object.entries(AREAS).map(([k, a]) => `
    <div class="goal a-${k}">${ring(done[k] / a.goal, "a-" + k)}
      <div><div class="name">${a.name}</div><div class="val">${done[k]} <small>de ${a.goal} h</small></div></div></div>`);
  cards.push(`<div class="goal total">${ring(total / goalTotal, "")}
      <div><div class="name">Total</div><div class="val">${total} <small>de ${goalTotal} h</small></div></div></div>`);
  document.getElementById("goals").innerHTML = cards.join("");
}

function renderWeek() {
  const focused = document.activeElement?.dataset?.note;
  const sel = focused ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
  const week = document.getElementById("week");
  week.replaceChildren();
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i), key = iso(d), st = dayState(key);
    const card = document.createElement("article");
    card.className = "day" + (key === iso(today) ? " today" : "");
    card.innerHTML = `
      <div class="day-head"><span class="day-name">${DAY_NAMES[i]}</span>
        ${key === iso(today) ? '<span class="today-tag">hoje</span>' : ""}
        <span class="day-date">${pad(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)}</span></div>
      <ul class="slots"></ul>
      <div class="mood" role="group" aria-label="Energia do dia">energia</div>`;
    const ul = card.querySelector(".slots");
    PLAN[i].forEach(s => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = `slot a-${s.area}` + (st.done[s.id] ? " done" : "");
      b.setAttribute("aria-pressed", st.done[s.id] ? "true" : "false");
      b.innerHTML = `<span class="box">${CHECK}</span><span><span class="meta">${AREAS[s.area].name} · ${s.when} · ${s.h} h</span><span class="focus"></span></span>`;
      b.querySelector(".focus").textContent = s.focus;
      b.onclick = () => { patchDay(key, { done: { [s.id]: !st.done[s.id] } }); render(); };
      li.append(b); ul.append(li);
    });
    if (FREE[i]) {
      const li = document.createElement("li");
      li.className = "free"; li.textContent = FREE[i];
      ul.prepend(li);
    }
    const mood = card.querySelector(".mood");
    for (let m = 1; m <= 5; m++) {
      const b = document.createElement("button");
      b.className = m <= st.mood ? "on" : "";
      b.setAttribute("aria-label", `Energia ${m} de 5`);
      b.onclick = () => { patchDay(key, { mood: st.mood === m ? 0 : m }); render(); };
      mood.append(b);
    }
    const note = document.createElement("textarea");
    note.className = "note"; note.id = "note-" + key; note.dataset.note = key;
    note.placeholder = "Anote o que aprendeu…";
    note.setAttribute("aria-label", `Anotação de ${DAY_NAMES[i].toLowerCase()}`);
    note.value = pendingNotes[key]?.value ?? st.note ?? "";
    note.oninput = () => {
      clearTimeout(pendingNotes[key]?.t);
      pendingNotes[key] = { value: note.value, t: setTimeout(() => {
        const v = pendingNotes[key].value; delete pendingNotes[key];
        patchDay(key, { note: v });
      }, 700) };
    };
    card.append(note);
    week.append(card);
  }
  if (focused) {
    const el = document.getElementById("note-" + focused);
    if (el) { el.focus(); el.setSelectionRange(sel[0], sel[1]); }
  }
}

function renderTracker() {
  const ref = addDays(weekStart, 3);
  const y = ref.getFullYear(), mo = ref.getMonth();
  const n = new Date(y, mo + 1, 0).getDate();
  document.getElementById("month-title").textContent = `Rastreador de ${MONTHS[mo]}`;
  let html = "<thead><tr><th></th>";
  for (let d = 1; d <= n; d++) {
    const now = iso(new Date(y, mo, d)) === iso(today);
    html += `<th class="${now ? "now" : ""}" scope="col">${d}</th>`;
  }
  html += "</tr></thead><tbody>";
  for (const [k, a] of Object.entries(AREAS)) {
    html += `<tr class="a-${k}"><th class="row" scope="row">${a.name}</th>`;
    for (let d = 1; d <= n; d++) {
      const date = new Date(y, mo, d), wd = (date.getDay() + 6) % 7;
      const slots = PLAN[wd].filter(s => s.area === k);
      const st = dayState(iso(date));
      const cls = slots.some(s => st.done[s.id]) ? "done" : slots.length ? "planned" : "off";
      html += `<td><i class="cell ${cls}"></i></td>`;
    }
    html += "</tr>";
  }
  document.getElementById("tracker").innerHTML = html + "</tbody>";
}

function renderTrail() {
  const m = trailMonth(addDays(weekStart, 3));
  document.getElementById("trail-month").textContent = `Mês ${m} da trilha · 15 horas por semana`;
  document.getElementById("trail").innerHTML = TRAIL.map(t => `
    <div class="track a-${t.area}"><span class="tape" aria-hidden="true"></span>
      <h3>${AREAS[t.area].name}</h3><p class="pace">${t.pace}</p>
      <ol>${t.phases.map(p => `
        <li class="phase ${m >= p.from && m <= p.to ? "current" : m > p.to ? "past" : ""}">
          <div class="when">${p.to >= 99 ? (p.from === 1 ? "sempre" : `mês ${p.from} em diante`) : `meses ${p.from}–${p.to}`}</div>
          <div class="what">${p.what}</div><p>${p.html}</p></li>`).join("")}</ol></div>`).join("");
}

function render() {
  const end = addDays(weekStart, 6);
  document.getElementById("range").textContent =
    `${pad(weekStart.getDate())}/${pad(weekStart.getMonth() + 1)} – ${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;
  renderGoals(); renderWeek(); renderTracker(); renderTrail();
}

document.getElementById("prev").onclick = () => { weekStart = addDays(weekStart, -7); render(); };
document.getElementById("next").onclick = () => { weekStart = addDays(weekStart, 7); render(); };
document.getElementById("today").onclick = () => { weekStart = mondayOf(today); render(); };
document.getElementById("export").onclick = exportBackup;
document.getElementById("import").onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ""; };

render();
setStatus("Salvo neste aparelho");

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
