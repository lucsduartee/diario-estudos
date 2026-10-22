# Status do Diário de Estudos

Checkpoint da sessão de 20 e 21/10/2026.

- App no ar: https://lucsduartee.github.io/diario-estudos/
- Origem: port do artifact do Claude https://claude.ai/artifact/RT5oAz8BkWtSqF1ELhXU5A

## O que existe

PWA em HTML, CSS e JS puros, sem build. Funciona offline e é instalável.

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura e textos fixos (seção "Como chegamos aqui") |
| `app.js` | Plano semanal, trilha, hábitos, persistência, backup e render |
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
- Trilha por área, com a fase calculada a partir de 20/10/2026.
- Roadmap por área, lido de `roadmap/<área>.json`: lista ordenada do que fazer em cada bloco. O item 1 cai no primeiro bloco da área a partir de 20/10/2026, o item 2 no seguinte, e a descrição aparece no card, com links clicáveis. O botão Roadmap do cabeçalho mostra cada item com a data em que cai, só para leitura.
- Botões de exportar e importar backup em JSON, só com os dias. O import também aceita o formato `{days, roadmap}` de `c645ae3`, e usa só os `days`.

## Decisões

- **Dados só no aparelho**, no `localStorage` com a chave `diario-estudos-v1` e um documento por data ISO (`{done, mood, note, water, exercise, sleep}`). Campo ausente conta como zero, então backups antigos continuam valendo.
- **Roadmap no repo, não no aparelho.** Um arquivo por área (`cyber`, `elet`, `fac`, `des`, as chaves de `AREAS`), cada um uma lista de textos. Fica igual em todos os aparelhos e não entra no backup. O editor local de `c645ae3` saiu, junto com a chave `diario-estudos-roadmap-v1`.
- **Encaixe pelo calendário, não pelo check:** bloco perdido não empurra os próximos itens.
- **Hospedagem no GitHub Pages**, a partir da branch `main` na raiz. O Pages grátis exige repo público.
- **Nada migrado do artifact.** O banco dele só tinha um dia vazio.
- **Metas de hábito com fonte:** OMS para exercício (150 min por semana), AASM para sono (7 h ou mais), EFSA para água (2,0 a 2,5 L por dia).

## Como publicar

1. Altere os arquivos.
2. **Suba a versão do `CACHE` em `sw.js`** (hoje é `diario-v5`). Sem isso, quem tem o app instalado continua vendo a versão antiga.
3. Faça commit e push na `main`. O Pages publica sozinho em cerca de 1 minuto.

O app instalado só pega a versão nova na segunda vez que é aberto.

### Como atualizar o roadmap

1. Edite `roadmap/<área>.json`, uma lista de textos em ordem. Link `http(s)` vira clicável e `\n` quebra a linha.
2. Suba o `CACHE` em `sw.js` e publique como acima. Sem isso, o app instalado continua com o roadmap antigo, porque o service worker é cache-first.
3. Área sem itens fica com `[]`. Não apague o arquivo: ele está no `ASSETS` do `sw.js`, e um arquivo faltando faz a instalação do service worker falhar.

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
