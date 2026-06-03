# AtlasOps — Findings
> Pesquisas de mercado, benchmarks de UX, limitações técnicas descobertas.

---

## UX Benchmarks — SaaS de Gestão de Projetos

### Referências Visuais
| SaaS | O que copiar | O que evitar |
|------|-------------|-------------|
| **Linear** | Kanban limpo, atalhos de teclado, transições suaves, dark mode premium | Complexidade excessiva para 2 usuários |
| **Notion** | Drawer lateral para detalhes, views alternáveis (table/kanban/list) | Curva de aprendizado |
| **ClickUp** | Status customizáveis, timeline visual | Interface poluída, muitas opções |
| **Monday.com** | Cores por status, barra de progresso em cards | Excesso de automações no MVP |

### Padrões de UI a implementar
- **Kanban com drag-and-drop:** react-beautiful-dnd ou @dnd-kit/core
- **Drawer lateral:** Panel que desliza da direita (como no protótipo atual)
- **Pipeline progress:** Barra horizontal com pontos de milestone (design validado no protótipo)
- **Command palette (K):** Para navegação rápida entre projetos/deals
- **Toasts para feedback:** Ações confirmadas com toast (não alert/modal)

---

## Limitações Técnicas Descobertas

### Supabase
- RLS não permite JOINs diretos em policies — usar functions ou views
- Realtime tem limite de 200 conexões no plano Free
- Edge Functions tem cold start de ~200ms
- `gen_random_uuid()` disponível nativamente no PostgreSQL 14+

### Next.js App Router
- Server Components não podem usar hooks React (useState, useEffect)
- Client Components precisam do `'use client'` directive
- Middleware roda no Edge Runtime — limitações de Node.js APIs
- Route Handlers (`app/api/`) são a alternativa a páginas de API

### n8n
- Webhooks precisam de URL fixa (configurar no Coolify com domínio)
- Rate limit do WhatsApp Business API: atenção ao envio em massa
- GitHub API: autenticação via Personal Access Token ou GitHub App

---

## Decisões de Design

### Dark Mode
O protótipo já usa dark mode. Manter como tema ÚNICO (sem toggle light/dark) para o MVP. Simplifica CSS e mantém consistência.

### Tipografia
- **Inter** (body, UI) — excelente legibilidade em telas
- **Outfit** (headings, logo) — geométrica, moderna, se destaca

### Cores por módulo/fase
| Fase Delivery | Cor | Hex |
|--------------|-----|-----|
| Discovery | Purple | #7F77DD |
| Proposta | Green | #1D9E75 |
| Design (PDD) | Amber | #BA7517 |
| Desenvolvimento | Blue | #378ADD |
| Testes (UAT) | Olive | #639922 |
| Deploy | Orange | #D85A30 |

### Status
| Status | Cor | Uso |
|--------|-----|-----|
| No prazo | Green #8BC34A | Projeto dentro do cronograma |
| Atenção | Amber #EF9F27 | Atraso leve ou risco identificado |
| Atrasado | Red #E24B4A | Prazo estourado |
