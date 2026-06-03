# AtlasOps — Progress Log
> O que foi feito, bugs, testes, resultados de cada sprint.

---

## Sprint 0 — Prototipagem Visual (anterior ao VLAEG)
**Período:** Até 02/Jun/2026  
**Responsável:** Detlef  

### ✅ Concluído
- Protótipo HTML/CSS/JS completo da "Torre de Controle" com 7 módulos na sidebar
- Módulo Comercial: Funil de vendas (7 etapas), cadência de prospecção, roteiro de discovery, objeções
- Módulo Delivery: Redesign completo com 3 visões (Kanban, Lista com pipeline progress, Playbook)
- Drawer de detalhes do projeto com stepper, checklists interativos e entregáveis
- 5 projetos mockados para teste visual
- Módulos Customer Success, Marketing, Precificação, Planejamento e Contratos (conteúdo estático)
- Documento de arquitetura consolidada (`arquitetura_saas.md`)
- Pitch para sócia (`Visao_SaaS_Atlas_Para_Socia.md`)

### 📋 Decisões
- Design dark mode com palette baseada em Zinc (--color-bg: #09090b)
- Fontes: Inter (body) + Outfit (headings)
- Ícones: Tabler Icons via CDN
- Layout: Sidebar 280px + content area max 1200px

### ⚠️ Limitações
- Tudo é HTML estático — sem persistência, sem auth, sem backend
- Dados mockados em JavaScript dentro do HTML
- Arquivo monolítico (~175KB)

---

## Sprint 1 — Inicialização VLAEG
**Data:** 02/Jun/2026  
**Responsável:** Detlef + Antigravity  

### ✅ Concluído
- Protocolo VLAEG Fase 0 executado
- Criados: `gemini.md`, `task_plan.md`, `progress.md`, `findings.md`, `manager.md`
- Perguntas de Descoberta (Fase V) respondidas:
  - Personas: 2 (Admin + Comercial)
  - Stack: Next.js + Supabase + n8n
  - MVP: Delivery + Comercial
  - Uso interno (não é SaaS multi-tenant)
  - Integrações: n8n, WhatsApp, GitHub
- Schema de banco desenhado (draft) em `gemini.md`

### 🔜 Próximo
- Aguardar aprovação do Schema e do Roadmap
- Iniciar Fase L (criar projeto Next.js + Supabase)

---

## Sprint 2 — Infraestrutura e Link (Fase 2)
**Data:** 02/Jun/2026  
**Responsável:** Antigravity  

### ✅ Concluído
- Next.js (App Router, Tailwind, TS) scaffolded no diretório base
- Projeto Supabase conectado via MCP
- Migrations executadas com sucesso: 6 tabelas, triggers para `updated_at`, RLS, e function de auto-criação de profile
- Variáveis de ambiente configuradas no `.env.local` e `manager.md`
- Pacotes `@supabase/supabase-js` e `@supabase/ssr` instalados

---

## Sprint 3 — Fundação, Módulo 1 (Delivery) e Deploy
**Data:** 03/Jun/2026  
**Responsável:** Antigravity  

### ✅ Concluído
- **Módulo Fundação:**
  - Login/Logout (Supabase Auth via Server Actions).
  - Proxy.ts configurado para proteger rotas da dashboard.
  - Componentes de UI construídos (`Button`, `Input`, `Card`, `Sidebar`, Layout Mestre).
- **Módulo 1 — Delivery:**
  - Visualização Kanban e Lista totalmente integradas com o banco de dados.
  - Drawer do projeto com painel lateral dinâmico.
  - Quality Gates implementados (Avanço de fase travado por aprovação de PDD e UAT).
- **Atualização Arquitetural de Múltiplos Serviços:**
  - Coluna `projects.type` alterada para `text[]` suportando projetos híbridos.
  - UI de Novo Projeto convertida de Select para Checkboxes de múltipla escolha.
  - Injeção dinâmica de Checklists (Gerador lê os PDFs de Automação e Website e cria as tasks corretas para o projeto de acordo com o serviço contratado).
- **Correção de Bugs no Banco:**
  - Atualização do gatilho `handle_new_user` no Supabase para preencher o `full_name` de usuários criados via Painel Administrativo.
- **Deploy via Coolify (Fase 5 - Parcial):**
  - Repositório Git inicializado e subido pro GitHub (`atlas_saas.git`).
  - `Dockerfile` criado para Next.js 16 Standalone (Node 20).
  - Aplicação Coolify conectada ao repo e à VPS.
  - Integração de domínio configurada para `app.atlasbot.tech`.

### 🔜 Próximo
- Iniciar **Módulo 2 (Comercial / CRM Básico)**.
- Desdobrar o Kanban de vendas e cartões de *Deals*.
