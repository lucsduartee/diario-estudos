const FREE = { 4: "Manhã livre: reponha um bloco perdido" };
// água e sono: meta diária; exercício: meta semanal (OMS, 150 min)
const HABITS = {
  water:    { name: "Água", label: "Água", unit: "copos", goal: 8, step: 1, max: 30, per: "day" },
  exercise: { name: "Exercício", label: "Exercício", unit: "min", goal: 150, step: 10, max: 600, per: "week" },
  sleep:    { name: "Sono", label: "Sono (noite)", unit: "h", goal: 7, step: 0.5, max: 14, per: "day" },
};
const habitMet = (k, v) => HABITS[k].per === "day" ? v >= HABITS[k].goal : v > 0;
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
let showingRoadmap = false;

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

// ---------- roadmap ----------
// Vem do repo: roadmap/<área>.json segue roadmap/schema.json. Cada unidade é uma semana do roadmap,
// e suas sessões ocupam, em ordem, os próximos blocos da área (schedule em plan.js).
let roadmap = {};
let scheduled = {};
const KINDS = { study: "Estudo", practice: "Prática", deliverable: "Entregável", review: "Revisão" };

async function loadRoadmap() {
  const entries = await Promise.all(Object.keys(AREAS).map(async area => {
    try {
      const doc = await (await fetch(`roadmap/${area}.json`)).json();
      return [area, Array.isArray(doc.units) ? doc : null];
    } catch {
      return [area, null];
    }
  }));
  return Object.fromEntries(entries);
}

const scheduleOf = area => scheduled[area] || (scheduled[area] = schedule(roadmap[area]?.units || [], area).items);
const roadmapItem = (key, slot) => scheduleOf(slot.area).find(o => o.key === key && o.slot.id === slot.id);

const sessionHtml = ({ n, session: s }) => `<span class="kind">Semana ${n} · ${KINDS[s.kind] || s.kind} · ${s.minutes} min</span>${linkify(s.what)}` +
  (s.exercises?.length ? `<ul class="exercises">${s.exercises.map(e => `<li>${linkify(e)}</li>`).join("")}</ul>` : "");

const escapeHtml = t => t.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const linkify = t => escapeHtml(t).replace(/https?:\/\/[^\s<]*[^\s<.,;:!?)]/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);

function dayState(key) { return { done: {}, mood: 0, note: "", water: 0, exercise: 0, sleep: 0, ...days[key] }; }
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
    // backups de c645ae3 a 2c5afb6 vieram como {days, roadmap}; o roadmap agora mora no repo
    days = imported.days || imported;
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

function goalCard(cls, name, val, goal, unit, extra = "") {
  return `<div class="goal ${cls} ${extra}">${ring(val / goal, cls)}
      <div><div class="name">${name}</div><div class="val">${val} <small>de ${goal} ${unit}</small></div></div></div>`;
}

function renderGoals() {
  const done = { cyber: 0, elet: 0, fac: 0, des: 0 };
  const week = [...Array(7)].map((_, i) => dayState(iso(addDays(weekStart, i))));
  week.forEach((st, i) => PLAN[i].forEach(s => { if (st.done[s.id]) done[s.area] += s.h; }));
  const total = Object.values(done).reduce((a, b) => a + b, 0);
  const goalTotal = Object.values(AREAS).reduce((a, b) => a + b.goal, 0);
  const cards = Object.entries(AREAS).map(([k, a]) => goalCard("a-" + k, a.name, done[k], a.goal, "h"));
  cards.push(goalCard("", "Total", total, goalTotal, "h", "total"));
  document.getElementById("goals").innerHTML = cards.join("");

  const minutes = week.reduce((sum, st) => sum + st.exercise, 0);
  document.getElementById("habit-goals").innerHTML = [
    goalCard("a-water", "Água", week.filter(st => habitMet("water", st.water)).length, 7, "dias"),
    goalCard("a-exercise", "Exercício", minutes, HABITS.exercise.goal, "min"),
    goalCard("a-sleep", "Sono", week.filter(st => habitMet("sleep", st.sleep)).length, 7, "noites"),
  ].join("");
}

function habitRow(key, st, k) {
  const h = HABITS[k];
  const row = document.createElement("div");
  row.className = `habit a-${k}` + (h.per === "day" && habitMet(k, st[k]) ? " met" : "");
  row.innerHTML = `<span class="label">${h.label}</span>
    <button aria-label="Menos ${h.name.toLowerCase()}">−</button>
    <span class="num">${st[k]}${h.per === "day" ? `/${h.goal}` : ""} ${h.unit}</span>
    <button aria-label="Mais ${h.name.toLowerCase()}">+</button>`;
  const [minus, plus] = row.querySelectorAll("button");
  const set = v => { patchDay(key, { [k]: Math.min(h.max, Math.max(0, v)) }); render(); };
  minus.onclick = () => set(st[k] - h.step);
  plus.onclick = () => set(st[k] + h.step);
  return row;
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
      <div class="habits" role="group" aria-label="Hábitos do dia"></div>
      <div class="mood" role="group" aria-label="Energia do dia">energia</div>`;
    const habits = card.querySelector(".habits");
    Object.keys(HABITS).forEach(k => habits.append(habitRow(key, st, k)));
    const ul = card.querySelector(".slots");
    PLAN[i].forEach(s => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = `slot a-${s.area}` + (st.done[s.id] ? " done" : "");
      b.setAttribute("aria-pressed", st.done[s.id] ? "true" : "false");
      b.innerHTML = `<span class="box">${CHECK}</span><span><span class="meta">${AREAS[s.area].name} · ${s.when} · ${s.h} h</span><span class="focus"></span></span>`;
      b.querySelector(".focus").textContent = s.focus;
      b.onclick = () => { patchDay(key, { done: { [s.id]: !st.done[s.id] } }); render(); };
      li.append(b);
      const item = roadmapItem(key, s);
      if (item) {
        const p = document.createElement("p");
        p.className = `todo a-${s.area}`;
        p.innerHTML = sessionHtml(item);
        li.append(p);
      }
      ul.append(li);
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
  const rows = [
    ...Object.entries(AREAS).map(([k, a]) => [k, a.name, (date, st) => {
      const slots = PLAN[(date.getDay() + 6) % 7].filter(s => s.area === k);
      return slots.some(s => st.done[s.id]) ? "done" : slots.length ? "planned" : "off";
    }]),
    ...Object.entries(HABITS).map(([k, h]) => [k, h.name, (date, st) => habitMet(k, st[k]) ? "done" : "planned"]),
  ];
  for (const [k, name, cellClass] of rows) {
    html += `<tr class="a-${k}"><th class="row" scope="row">${name}</th>`;
    for (let d = 1; d <= n; d++) {
      const date = new Date(y, mo, d);
      html += `<td><i class="cell ${cellClass(date, dayState(iso(date)))}"></i></td>`;
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

const shortDate = d => `${DAY_NAMES[(d.getDay() + 6) % 7].slice(0, 3).toLowerCase()} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const list = (label, xs, fmt = linkify) => xs?.length ? `<div class="label">${label}</div><ul>${xs.map(x => `<li>${fmt(x)}</li>`).join("")}</ul>` : "";
const resourceHtml = r => `<a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.title)}</a>`;

function renderRoadmap() {
  document.getElementById("roadmap-areas").innerHTML = Object.entries(AREAS).map(([area, a]) => {
    const doc = roadmap[area];
    const when = scheduleOf(area).values();
    const units = (doc?.units || []).map((unit, u) => {
      const sessions = (unit.sessions || []).map(s => {
        const o = when.next().value;
        return `<li><span class="kind">${shortDate(o.date)} · ${o.slot.when} · ${KINDS[s.kind] || s.kind} · ${s.minutes} min</span>${linkify(s.what)}${list("Exercícios", s.exercises)}</li>`;
      }).join("");
      return `<li class="road-item">
        <div class="when">Semana ${u + 1}${unit.phase ? ` · ${escapeHtml(unit.phase)}` : ""}</div>
        <div class="what">${escapeHtml(unit.title)}</div>
        ${list("Objetivos", unit.objectives)}${list("Tópicos", unit.topics)}${list("Recursos", unit.resources, resourceHtml)}
        ${unit.deliverable ? `<p><b>Entregável:</b> ${linkify(unit.deliverable)}</p>` : ""}
        ${unit.doneWhen ? `<p><b>Pronto quando:</b> ${linkify(unit.doneWhen)}</p>` : ""}
        <ol class="sessions">${sessions}</ol></li>`;
    }).join("");
    const head = `<h3>${a.name}</h3>` + (doc?.title ? `<p class="pace">${escapeHtml(doc.title)}${doc.source ? ` · fonte: ${doc.source.url ? resourceHtml(doc.source) : escapeHtml(doc.source.title)}` : ""}</p>` : "");
    return `<div class="track road a-${area}">${head}
      ${units ? `<ol>${units}</ol>` : `<p class="pace">Sem semanas em roadmap/${area}.json.</p>`}</div>`;
  }).join("");
}

function render() {
  const end = addDays(weekStart, 6);
  document.getElementById("range").textContent =
    `${pad(weekStart.getDate())}/${pad(weekStart.getMonth() + 1)} – ${pad(end.getDate())}/${pad(end.getMonth() + 1)}`;
  document.body.classList.toggle("roadmap-view", showingRoadmap);
  document.getElementById("toggle-roadmap").textContent = showingRoadmap ? "Voltar ao diário" : "Roadmap";
  if (showingRoadmap) { renderRoadmap(); return; }
  renderGoals(); renderWeek(); renderTracker(); renderTrail();
}

document.getElementById("prev").onclick = () => { weekStart = addDays(weekStart, -7); render(); };
document.getElementById("next").onclick = () => { weekStart = addDays(weekStart, 7); render(); };
document.getElementById("today").onclick = () => { weekStart = mondayOf(today); render(); };
document.getElementById("toggle-roadmap").onclick = () => { showingRoadmap = !showingRoadmap; render(); scrollTo(0, 0); };
document.getElementById("export").onclick = exportBackup;
document.getElementById("import").onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ""; };

render();
setStatus("Salvo neste aparelho");
loadRoadmap().then(r => { roadmap = r; scheduled = {}; render(); });

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
