// Plano semanal: compartilhado por app.js e scripts/check-roadmap.mjs.
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
