// Gera roadmap/fac.json a partir do material que a skill /univesp extrai do AVA.
// Uso: node scripts/import-univesp.mjs <diretório do bimestre, ex.: ~/Documents/projetos/univesp-2026B4>
// Lê <dir>/artifact/data.json (disciplinas e semanas) e <dir>/exams.json (início do bimestre).
// Cada semana do AVA vira uma unidade presa ao calendário (startsOn). As disciplinas de maior carga
// ganham um bloco cada, na ordem dos blocos de faculdade em plan.js; o último bloco junta as demais
// disciplinas e as atividades avaliativas da semana. Resumos, transcrições e perguntas ficam no painel.
import { readFileSync, writeFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const PANEL = { title: "Painel do Bimestre", url: "https://claude.ai/artifact/AnURHthRTQn4FZNrxdN5VL" };
const AREA = "fac";

const dir = process.argv[2];
if (!dir) {
  console.error("uso: node scripts/import-univesp.mjs <diretório do bimestre>");
  process.exit(1);
}
const root = new URL("..", import.meta.url);
const { PLAN, isoDate } = runInNewContext(readFileSync(new URL("plan.js", root), "utf8") + ";({ PLAN, isoDate })");
const data = JSON.parse(readFileSync(`${dir}/artifact/data.json`, "utf8"));
const { start } = JSON.parse(readFileSync(`${dir}/exams.json`, "utf8"));

const blocks = PLAN.flat().filter(s => s.area === AREA);
const byHours = [...data.courses].sort((a, b) => b.hours - a.hours);
const own = byHours.slice(0, blocks.length - 1);
const shared = byHours.slice(blocks.length - 1);
const weekOf = (course, n) => course.weeks.find(w => w.number === n);
const isUrl = u => /^https?:\/\//.test(u || "");

const line = (course, n) => {
  const week = weekOf(course, n);
  if (!week) return `${course.name}: sem semana ${n} no AVA`;
  const videos = week.videos || [];
  return `${course.name} · S${n}: ${week.theme}. ` +
    (videos.length ? `Videoaulas: ${videos.map(v => `${v.n}. ${v.title}`).join("; ")}` : "Material da semana no AVA");
};
const quizzes = n => data.courses.flatMap(c => (weekOf(c, n)?.links || []).filter(l => l.kind === "quiz" && isUrl(l.href)).map(l => ({ course: c, link: l })));

const [y, m, d] = start.split("-").map(Number);
const numbers = [...new Set(data.courses.flatMap(c => c.weeks.map(w => w.number)).filter(Number.isInteger))].sort((a, b) => a - b);

const units = numbers.map(n => {
  const quiz = quizzes(n);
  const objectives = data.courses.flatMap(c => (weekOf(c, n)?.study?.objectives || []).map(o => `${c.name}: ${o}`));
  const resources = [
    ...data.courses.flatMap(c => (weekOf(c, n)?.videos || []).filter(v => isUrl(v.watch)).map(v => ({ title: `${c.name} · videoaula ${v.n}: ${v.title}`, url: v.watch }))),
    ...quiz.map(({ course, link }) => ({ title: `${course.name} · atividade avaliativa S${n}`, url: link.href })),
    PANEL,
  ];
  const sessions = blocks.map((slot, i) => i < own.length
    ? { kind: "study", minutes: slot.h * 60, what: line(own[i], n) }
    : {
        kind: "review",
        minutes: slot.h * 60,
        what: shared.map(c => line(c, n)).join("\n"),
        ...(quiz.length ? { exercises: quiz.map(({ course }) => `Atividade avaliativa de ${course.name}`) } : {}),
      });
  return {
    id: `${AREA}-${String(n).padStart(2, "0")}`,
    startsOn: isoDate(new Date(y, m - 1, d + 7 * (n - 1))),
    phase: data.term,
    title: `Semana ${n}: ${data.courses.map(c => weekOf(c, n)?.theme).filter(Boolean).join(" · ")}`,
    ...(objectives.length ? { objectives } : {}),
    resources,
    deliverable: `Atividades avaliativas da semana ${n} no AVA`,
    sessions,
  };
});

const doc = { $schema: "./schema.json", area: AREA, title: `Faculdade · ${data.term}`, source: { title: `${PANEL.title} (${data.term})`, url: PANEL.url }, units };
writeFileSync(new URL(`roadmap/${AREA}.json`, root), JSON.stringify(doc, null, 2) + "\n");
console.log(`roadmap/${AREA}.json: ${units.length} semanas a partir de ${start}; blocos: ${blocks.map((s, i) => `${s.when} → ${i < own.length ? own[i].code : shared.map(c => c.code).join("+")}`).join(", ")}`);
