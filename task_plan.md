# AtlasOps — Task Plan (Roadmap de Módulos)
> Fases, módulos, features e checklists de entrega.

---

## Fase 0: Inicialização VLAEG ✅
- [x] Criar `gemini.md` (Constituição do Produto)
- [x] Criar `task_plan.md` (este arquivo)
- [x] Criar `progress.md`
- [x] Criar `findings.md`
- [x] Criar `manager.md`
- [x] Perguntas de Descoberta respondidas e Estrela Guia ajustada
- [x] Schema do banco aprovado pelo usuário
- [x] Roadmap aprovado pelo usuário

---

## Fase 1: V — Visão (Produto) ✅
- [x] Definir Estrela Guia (Ajustado para englobar SaaS, Websites, etc.)
- [x] Definir Personas e Permissões (2 papéis: Admin, Comercial)
- [x] Definir Modelo (uso interno, sem monetização)
- [x] Definir Stack (Next.js + Supabase + n8n)
- [x] Definir MVP (Delivery + Comercial)
- [x] Definir Schema do banco (6 tabelas principais)
- [x] Pesquisa de UX/Benchmarks (SaaS de gestão de projetos RPA)
- [x] Aprovação final do Schema

---

## Fase 2: L — Link (Infraestrutura) ✅
- [x] Criar projeto Next.js com TypeScript
- [x] Criar projeto Supabase (Conectado via MCP)
- [x] Configurar Supabase Auth (email/senha)
- [x] Executar migrations (tabelas e RLS criados via MCP)
- [x] Testar conexão frontend ↔ Supabase (Credenciais prontas)
- [x] Configurar variáveis de ambiente (`.env.local`)
- [ ] Configurar Coolify para deploy (Agendado para Fase 5)
- [x] Registrar URLs em `manager.md`

---

## Fase 3: A — Arquitetura (Construção P.D.S.)

### Módulo 0: Fundação
- [ ] Layout master (sidebar + content area)
- [ ] Sistema de roteamento (App Router)
- [ ] Componente de Auth (login/logout)
- [ ] Middleware de proteção de rotas
- [ ] Provider do Supabase
- [ ] Componentes base: Button, Card, Input, Modal, Badge, Table

### Módulo 1: Delivery (Gestão de Projetos)
- [ ] Página `/delivery` — pipeline de projetos
- [ ] Visão Kanban (6 colunas por fase)
- [ ] Visão Lista (com barra de progresso pipeline)
- [ ] Tab Playbook (referência de processo)
- [ ] Drawer de detalhes do projeto
  - [ ] Stepper de fases
  - [ ] Checklist interativo por fase
  - [ ] Entregáveis por fase
  - [ ] Quality Gates visuais (PDD, UAT)
- [ ] CRUD de projetos (criar, editar, arquivar)
- [ ] CRUD de clientes (criar, editar)
- [ ] Integração Supabase (queries reais)
- [ ] Real-time updates (Supabase Realtime)

### Módulo 2: Comercial (CRM Básico)
- [ ] Página `/comercial` — funil de vendas
- [ ] Kanban de oportunidades (7 etapas)
- [ ] Card de deal com detalhes
- [ ] Histórico de atividades por deal
- [ ] Cadência de prospecção (template)
- [ ] Roteiro de discovery embutido
- [ ] Banco de objeções
- [ ] CRUD de deals
- [ ] Integração Supabase

---

## Fase 4: E — Estilo (Design Premium)
- [ ] Design System: tokens, cores, tipografia
- [ ] Componentes estilizados e responsivos
- [ ] Micro-animações e transições
- [ ] Dark mode (já no protótipo)
- [ ] Loading states e empty states
- [ ] Validação de fluxos de usuário completos
- [ ] Feedback do stakeholder (sócia)

---

## Fase 5: G — Gatilho (Deploy e Operação)
- [ ] Deploy em produção via Coolify
- [ ] Configurar domínio + SSL
- [ ] Workflows n8n de produção
  - [ ] Alerta quando projeto muda de status
  - [ ] Notificação WhatsApp para sócia
  - [ ] Integração GitHub (status dos repos)
- [ ] Monitoramento (uptime, erros)
- [ ] Backup automático do banco
- [ ] Seed de dados reais (migrar dados atuais)
- [ ] Onboarding da sócia
- [ ] Documentação de operação (runbooks)
