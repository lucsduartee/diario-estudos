// Valida roadmap/<área>.json contra as regras de roadmap/schema.json e o plano semanal de plan.js.
// Uso: node scripts/check-roadmap.mjs   (sai com código 1 se houver erro; avisos não bloqueiam)
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";

const root = new URL("..", import.meta.url);
const { START, AREAS, PLAN } = runInNewContext(readFileSync(new URL("plan.js", root), "utf8") + ";({ START, AREAS, PLAN })");
const KINDS = ["study", "practice", "deliverable", "review"];
const UNIT_KEYS = ["id", "phase", "title", "objectives", "topics", "resources", "deliverable", "doneWhen", "sessions"];
const SESSION_KEYS = ["kind", "minutes", "what", "exercises"];

const errors = [], warnings = [];
const isText = v => typeof v === "string" && v.trim() !== "";
const isTexts = v => v === undefined || (Array.isArray(v) && v.every(isText));
const isLink = v => v && isText(v.title) && (v.url === undefined || /^https?:\/\//.test(v.url));

// blocos da área em ordem de calendário, como occurrences() em app.js
function* blocks(area) {
  for (let d = new Date(START); ; d.setDate(d.getDate() + 1))
    for (const s of PLAN[(d.getDay() + 6) % 7])
      if (s.area === area) yield { date: d.toISOString().slice(0, 10), slot: s };
}

for (const file of readdirSync(new URL("roadmap/", root)).filter(f => f.endsWith(".json") && f !== "schema.json")) {
  const area = file.replace(/\.json$/, "");
  const at = path => errors.push(`${file}: ${path}`);
  let doc;
  try { doc = JSON.parse(readFileSync(new URL(`roadmap/${file}`, root), "utf8")); } catch (e) { at(`JSON inválido (${e.message})`); continue; }
  if (!AREAS[area]) at(`"${area}" não é uma área de plan.js`);
  if (doc.area !== area) at(`area deve ser "${area}"`);
  if (!isText(doc.title)) at("title obrigatório");
  if (doc.source !== undefined && !isLink(doc.source)) at("source precisa de title e url http(s)");
  if (!Array.isArray(doc.units)) { at("units deve ser uma lista"); continue; }
  const ids = new Set(), next = blocks(area);
  doc.units.forEach((u, i) => {
    const p = `units[${i}]${u?.id ? ` (${u.id})` : ""}`;
    Object.keys(u).filter(k => !UNIT_KEYS.includes(k)).forEach(k => at(`${p}.${k} não existe no schema`));
    if (!/^[a-z]+-[0-9]{2,}$/.test(u.id ?? "")) at(`${p}.id deve ser como "${area}-01"`);
    else if (ids.has(u.id)) at(`${p}.id repetido`);
    ids.add(u.id);
    if (!isText(u.title)) at(`${p}.title obrigatório`);
    for (const k of ["phase", "deliverable", "doneWhen"]) if (u[k] !== undefined && !isText(u[k])) at(`${p}.${k} deve ser texto`);
    for (const k of ["objectives", "topics"]) if (!isTexts(u[k])) at(`${p}.${k} deve ser lista de textos`);
    if (u.resources !== undefined && !(Array.isArray(u.resources) && u.resources.every(isLink))) at(`${p}.resources: cada item precisa de title e url http(s)`);
    if (!Array.isArray(u.sessions) || !u.sessions.length) { at(`${p}.sessions precisa de ao menos uma sessão`); return; }
    u.sessions.forEach((s, j) => {
      const q = `${p}.sessions[${j}]`;
      Object.keys(s).filter(k => !SESSION_KEYS.includes(k)).forEach(k => at(`${q}.${k} não existe no schema`));
      if (!KINDS.includes(s.kind)) at(`${q}.kind deve ser ${KINDS.join(", ")}`);
      if (!Number.isInteger(s.minutes) || s.minutes < 1) at(`${q}.minutes deve ser inteiro positivo`);
      if (!isText(s.what)) at(`${q}.what obrigatório`);
      if (!isTexts(s.exercises)) at(`${q}.exercises deve ser lista de textos`);
      const b = next.next().value;
      if (Number.isInteger(s.minutes) && s.minutes !== b.slot.h * 60)
        warnings.push(`${file}: ${q} tem ${s.minutes} min e cai em ${b.date} (${b.slot.when}), bloco de ${b.slot.h * 60} min`);
    });
  });
  console.log(`${file}: ${doc.units.length} semanas, ${doc.units.reduce((n, u) => n + (u.sessions?.length || 0), 0)} sessões`);
}

warnings.forEach(w => console.warn(`aviso: ${w}`));
errors.forEach(e => console.error(`erro: ${e}`));
console.log(errors.length ? `${errors.length} erro(s)` : "ok");
process.exit(errors.length ? 1 : 0);
