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

### Ambiente de Desenvolvimento Local (SSL/Certificados)
- O ambiente local do Next.js no Windows (dev server) encontra problemas de validação SSL ao bater nas requisições do banco de dados/Auth hospedados na VPS via Coolify, lançando o erro `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- **Solução:** Rodar o servidor local desativando temporariamente a rejeição de certificados não autorizados: `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run dev` no PowerShell.

---

## Decisões de Design

### Dark Mode
O protótipo já usa dark mode. Manter como tema ÚNICO (sem toggle light/dark) para o MVP. Simplifica CSS e mantém consistência.

### Tipografia
- **Inter** (body, UI) — excelente legibilidade em telas
- **Outfit** (headings, logo) — geométrica, moderna, se destaca

### Cores por módulo/etapa
| Etapa do Projeto | Cor | Hex |
|--------------|-----|-----|
| Diagnóstico | Purple | #7F77DD |
| Escopo | Green | #1D9E75 |
| Desenho | Amber | #BA7517 |
| Construção | Blue | #378ADD |
| Validação | Olive | #639922 |
| Ativação | Orange | #D85A30 |

### Status
| Status | Cor | Uso |
|--------|-----|-----|
| No prazo | Green #8BC34A | Projeto dentro do cronograma |
| Atenção | Amber #EF9F27 | Atraso leve ou risco identificado |
| Atrasado | Red #E24B4A | Prazo estourado |

### Comportamento do Flexbox & Menu Lateral
- **Largura Mínima da Sidebar:** Para evitar que o menu lateral seja esmagado e empurrado para fora da tela devido à largura do Kanban de 6 colunas, a Sidebar deve conter obrigatoriamente a classe `shrink-0` e uma largura fixa (definida como `w-[240px]`).
- **Overflow de Conteúdo:** O container principal do layout (`main`) precisa de `min-w-0` para confinar o overflow horizontal dentro dos filhos flex (a grade do Kanban), evitando empurrar outros elementos estáticos do DOM.
- **Offset do Drawer:** O `ProjectDrawer` em desktops deve usar o offset `left-[240px]` permanentemente para coincidir com a largura física do menu e não sobrepor a navegação lateral.
