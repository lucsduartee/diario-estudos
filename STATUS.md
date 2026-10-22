# Status do Diário de Estudos

Checkpoint da sessão de 20 e 21/10/2026.

- App no ar: https://lucsduartee.github.io/diario-estudos/
- Origem: port do artifact do Claude https://claude.ai/artifact/RT5oAz8BkWtSqF1ELhXU5A

## O que existe

PWA em HTML, CSS e JS puros, sem build. Funciona offline e é instalável.

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura e textos fixos (seção "Como chegamos aqui") |
| `plan.js` | Data de início, áreas e plano semanal, compartilhados com `scripts/check-roadmap.mjs` |
| `app.js` | Trilha, hábitos, roadmap, persistência, backup e render |
| `roadmap/` | Um JSON por área, no formato de `roadmap/schema.json` |
| `scripts/check-roadmap.mjs` | Valida os JSON do roadmap |
| `scripts/import-univesp.mjs` | Gera `roadmap/fac.json` a partir do bimestre extraído pela skill `/univesp` |
| `app.css` | Visual de caderno pontilhado, com tema claro e escuro |
| `sw.js` | Service worker cache-first, incluindo as Google Fonts |
| `manifest.webmanifest` e `icons/` | Instalação como app |

### Funções

- Semana com navegação ‹ › e botão Hoje. Cada bloco de estudo tem check, o dia tem energia de 1 a 5 e uma nota salva automaticamente.
- Metas de estudo da semana: cyber 4 h, eletrônica 4 h, faculdade 4 h, desenho 3 h, total 15 h.
- Hábitos por dia, com metas:
  - Água: 8 copos de 250 ml por dia.
  - Exercício: 150 min por semana.
  - Sono: 7 h por noite, anotado no dia em que você acorda.
- Rastreador do mês, com estudo e hábitos.
- Trilha por área gerada dos roadmaps: uma fase por trecho seguido de semanas com o mesmo `phase`, com datas, a fase da semana em tela destacada e, quando o roadmap traz `sourcePace`, o aviso de que a fonte supõe mais horas do que a área tem.
- Roadmap por área, lido de `roadmap/<área>.json`: semanas com sessões em ordem. A primeira sessão cai no primeiro bloco da área a partir de 20/10/2026, a segunda no seguinte, e o card mostra a sessão (tipo, minutos, o que fazer e exercícios), com links clicáveis. O botão Roadmap do cabeçalho mostra cada semana completa, com as datas das sessões, só para leitura.
- Botões de exportar e importar backup em JSON, só com os dias. O import também aceita o formato `{days, roadmap}` de `c645ae3`, e usa só os `days`.

## Decisões

- **Dados só no aparelho**, no `localStorage` com a chave `diario-estudos-v1` e um documento por data ISO (`{done, mood, note, water, exercise, sleep}`). Campo ausente conta como zero, então backups antigos continuam valendo.
- **Roadmap no repo, não no aparelho.** Um arquivo por área (`cyber`, `elet`, `fac`, `des`, as chaves de `AREAS`), no formato de `roadmap/schema.json`. Fica igual em todos os aparelhos e não entra no backup. O editor local de `c645ae3` saiu, junto com a chave `diario-estudos-roadmap-v1`.
- **Encaixe pelo calendário, não pelo check:** bloco perdido não empurra os próximos itens.
- **Hospedagem no GitHub Pages**, a partir da branch `main` na raiz. O Pages grátis exige repo público.
- **Nada migrado do artifact.** O banco dele só tinha um dia vazio.
- **Metas de hábito com fonte:** OMS para exercício (150 min por semana), AASM para sono (7 h ou mais), EFSA para água (2,0 a 2,5 L por dia).

## Como publicar

1. Altere os arquivos.
2. **Suba a versão do `CACHE` em `sw.js`** (hoje é `diario-v9`). Sem isso, quem tem o app instalado continua vendo a versão antiga.
3. Faça commit e push na `main`. O Pages publica sozinho em cerca de 1 minuto.

O app instalado só pega a versão nova na segunda vez que é aberto.

### Como atualizar o roadmap

1. Edite `roadmap/<área>.json` seguindo `roadmap/schema.json` (o editor dá autocomplete pelo campo `$schema`). Cada item de `units` é uma semana:
   - obrigatórios: `id` (como `cyber-01`, único), `title` e `sessions`;
   - opcionais: `startsOn` (data AAAA-MM-DD: a semana começa no primeiro bloco a partir dela, para conteúdo preso ao calendário), `phase`, `objectives`, `topics`, `resources` (`{title, url}`), `deliverable` e `doneWhen`;
   - cada sessão tem `kind` (`study`, `practice`, `deliverable` ou `review`), `minutes`, `what` e, opcional, `exercises`.
   Link `http(s)` vira clicável e `\n` quebra a linha.
2. Rode `node scripts/check-roadmap.mjs`. Erro bloqueia (sai com código 1). Aviso não bloqueia: aparece quando os minutos de uma sessão diferem do bloco em que ela cai.
3. Suba o `CACHE` em `sw.js` e publique como acima. Sem isso, o app instalado continua com o roadmap antigo, porque o service worker é cache-first.
4. **Faculdade não se edita à mão.** `roadmap/fac.json` sai de `node scripts/import-univesp.mjs ~/Documents/projetos/univesp-<bimestre>`, que a skill `/univesp` roda depois de publicar o Painel do Bimestre. Cada semana do AVA vira uma unidade com `startsOn` na segunda-feira; as disciplinas de maior carga ganham um bloco cada (seg, qua e sex à noite) e o domingo junta as demais com as atividades avaliativas. Resumos, transcrições e perguntas ficam só no painel, porque o repo é público.
5. Área sem semanas fica com `"units": []`. Não apague o arquivo: ele está no `ASSETS` do `sw.js`, e um arquivo faltando faz a instalação do service worker falhar.

Para testar local: `python3 -m http.server 8765` nesta pasta e abrir http://127.0.0.1:8765/

## Cuidados

- Cada aparelho tem o próprio diário. Para levar os dados de um para outro, use exportar e importar backup.
- No iPhone, o Safari pode apagar os dados de um site que fica cerca de 7 dias sem uso. Exporte backup de vez em quando.

## Próximos passos

- [ ] **Sincronizar entre aparelhos com o Supabase.** O plano grátis tem até 2 projetos ativos, 500 MB de banco e 50 mil usuários ativos por mês, mas pausa o projeto depois de 1 semana sem uso. Ideia: trocar `loadDays`/`saveDays` por uma tabela `days` com login por magic link.
- [ ] Levar os blocos de estudo para o Google Calendar.
- [ ] Confirmar em qual área já existe base. Por enquanto, desenho e eletrônica começam do zero.

## Histórico

- `83573b3`: PWA portado do artifact.
- `8f33aac`: hábitos de água, exercício e sono, com metas.
- Roadmap por área encaixado nos blocos da semana, com cache `diario-v3`.
- Roadmap passa a vir de `roadmap/<área>.json` no repo, com a view só de leitura e cache `diario-v5`.
- Roadmap de cyber (48 semanas, plano de 12 meses do relatório de pentest e red team) e de eletrônica (52 semanas de automação residencial), com cache `diario-v6`.
- Roadmap padronizado em `roadmap/schema.json` (semanas com sessões), validado por `scripts/check-roadmap.mjs`, com o plano movido para `plan.js`.
- Faculdade importada do Painel do Bimestre (4º bimestre de 2026) com `startsOn` por semana do AVA, com cache `diario-v7`.
- Roadmap de desenho (51 semanas em 3 ciclos de 17, currículo em espiral com master copies), começando em 26/10/2026, com cache `diario-v8`.
- Trilha passa a vir dos roadmaps; o foco fixo do bloco só aparece sem sessão; bloco depois do fim do roadmap avisa para atualizar o JSON; `sourcePace` em cyber e eletrônica; cache `diario-v9`.
