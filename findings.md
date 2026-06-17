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

### Rolagem Horizontal do Kanban (Drag-to-Scroll)
- **Implementação:** Para melhorar a usabilidade em desktops sem trackpads, foi programado um hook de manipulação de eventos de mouse (`onMouseDown`, `onMouseUp`, `onMouseLeave`, `onMouseMove`) no contêiner do Kanban. Ele permite rolar horizontalmente arrastando o cursor.
- **Evitar Conflito de Clique:** O manipulador verifica se o alvo (`target`) possui o seletor `[data-project-id]` para não prejudicar ou anular a abertura de gaveta de detalhes ao clicar em um card.
- **Cursores Premium:** Uso das propriedades CSS `cursor-grab`, `cursor-grabbing` e da classe `select-none` durante o arraste para garantir um toque orgânico de manipulação direta.

---

## Efeito Dopamina e Micro-Gamificação (Projetos & CRM)

Para maximizar a satisfação no uso diário do AtlasOps e gerar o estímulo de "dever cumprido" (liberação de dopamina), identificamos as seguintes abordagens baseadas em UX psicológica e neurodesign:

### 1. Recompensa Auditiva (Sons Premium e Sutis)
A resposta física à comemoração é intensificada quando há sincronia entre o estímulo visual (confete) e o sonoro.
- **Implementação:** Um breve e limpo som de "pop/plim" gerado nativamente com a **Web Audio API** do navegador (evita requisições de rede ou arquivos estáticos).
- **Frequência:** Tons suaves e ascendentes (ex: senoidal curta transitando de 440Hz para 880Hz em 0.1s) que soam agradáveis e não cansativos.

### 2. Comemoração de Milestones (Explosão Épica)
Tarefas comuns merecem comemoração localizada, mas o fechamento de metas importantes (ex: completar a última tarefa de uma fase, ou assinar o contrato do lead no CRM) deve disparar uma comemoração de escala superior.
- **Implementação:** Quando a última tarefa da fase atual for marcada como concluída, disparar uma cortina de confetes dourados cruzando a tela inteira com efeitos de brilho adicionais (`gold confetti burst`).

### 3. Sistema de Streak (Contadores e Combo de Produtividade)
Introduzir métricas que recompensem o progresso sequencial diário ou semanal.
- **Implementação:** Exibir na aba "Minhas Tarefas" um pequeno ícone de fogo (🔥) com o texto "Combo de Hoje: X concluídas" ou "Y dias ativos".
- **Psicologia:** O ser humano odeia quebrar sequências ativas, o que gera o incentivo de abrir o painel diariamente para manter o "fogo" aceso.

### 4. Copywriting de Suporte e Incentivo (Humor Interno)
Substituir mensagens neutras de conclusão por feedbacks dinâmicos que gerem micro-sorrisos.
- **Implementação:** Textos de toast ou placeholder de "Tudo concluído" dinâmicos e aleatórios (ex: *"Menos uma planilha no mundo!"*, *"Detlef de hoje orgulhoso do Detlef de amanhã!"*, *"Sua sócia curtiu isso!"*, *"Status: Voando baixo 🚀"*).

---

## Gestão Administrativa de Usuários (Painel Equipe)

### 1. Criação Administrativa de Contas
No Supabase, a criação padrão de contas (`auth.signUp`) faz login imediato do novo usuário no navegador. Para cadastrar membros da equipe mantendo a sessão do administrador conectada:
- **Solução:** Utilizar a API de administração do Supabase (`auth.admin.createUser`) no servidor.
- **Segurança:** Requer a chave restrita de backend `SUPABASE_SERVICE_ROLE_KEY`. Essa chave nunca deve ser exposta no frontend e seu uso é blindado por Server Actions com validação prévia do perfil de permissão do usuário solicitante (permitindo apenas `dev` ou `gestao`).

### 2. Sincronização de E-mail de Equipe
Por padrão, a tabela de perfis `profiles` não guardava o e-mail dos usuários, que residia apenas na tabela privada do Supabase Auth.
- **Solução:** Foi adicionada a coluna `email` na tabela `profiles` com migração SQL.
- **Gatilho automático:** A função de trigger de criação de perfil (`handle_new_user`) foi estendida para clonar o e-mail do Auth para o perfil público automaticamente a cada novo cadastro.
