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
  - **Aba "Minhas Tarefas":** Visualização centralizada de afazeres ordenados por prazo e urgência do usuário ativo, integrada com a nova coluna `assigned_to` na tabela `project_tasks`.
- **Atualização Arquitetural de Múltiplos Serviços:**
  - Coluna `projects.type` alterada para `text[]` suportando projetos híbridos.
  - UI de Novo Projeto convertida de Select para Checkboxes de múltipla escolha.
  - Injeção dinâmica de Checklists (Gerador lê os PDFs de Automação e Website e cria as tasks corretas para o projeto de acordo com o serviço contratado).
- **Mapeamento de Checklists por Serviço:**
  - Levantamento completo das tarefas estruturadas das 5 verticais de negócio (Automação, Website, SaaS, E-commerce, Tráfego Pago).
  - Configuração de tipos de campo (upload, texto longo, link) e atribuição de papéis de responsabilidade.
  - Geração automatizada do PDF de processos (`checklist_delivery_por_servico.pdf`) estilizado para a equipe.
- **Correção de Bugs no Banco:**
  - Atualização do gatilho `handle_new_user` no Supabase para preencher o `full_name` de usuários criados via Painel Administrativo.
- **Deploy via Coolify (Fase 5):**
  - Repositório Git inicializado e subido pro GitHub (`atlas_saas.git`).
  - `Dockerfile` criado para Next.js 16 Standalone (Node 20).
  - Aplicação Coolify conectada ao repo e à VPS.
  - Integração de domínio configurada para `app.atlasbot.tech`.

### 🔜 Próximo
- Iniciar **Módulo 2 (Comercial / CRM Básico)**.
- Desdobrar o Kanban de vendas e cartões de *Deals*.

---

## Sprint 4 — Checklists Dinâmicos no Banco & Novo Layout do Drawer (Cofre)
**Data:** 09/Jun/2026  
**Responsável:** Antigravity  

### ✅ Concluído
- **Checklist Dinâmico no Banco:**
  - Criadas e aplicadas migrações para adicionar `due_date`, `field_type` e `field_value` às tarefas (`project_tasks`).
  - Implementado server action para extrair templates estruturados específicos para cada um dos 5 serviços contratados.
  - Injeção dinâmica no banco ao criar um novo projeto.
  - Alterado o tipo da tarefa "Definir escopo: o que faz e o que NÃO faz" de `checkbox` para `text` (texto longo), permitindo documentar/colar o escopo do projeto diretamente na etapa de Escopo (aplicado retroativamente no banco de dados para projetos existentes).
- **Refatoração do ProjectDrawer (Cofre & Duas Colunas):**
  - Layout do painel expandido para `1050px` de largura com estrutura de duas colunas fixas lado a lado.
  - **Coluna Esquerda (Cofre / Visão Geral):** Mantém visível o cabeçalho, status geral de delivery, ações de avanço de fase, o cofre reativo de links/documentos e a gaveta de notas/credenciais agregadas de todas as fases.
  - **Coluna Direita (Operações):** Controle exclusivo de checklists e abas para navegar livremente entre as fases do projeto.
  - Os campos especiais atualizados na direita refletem-se no Cofre instantaneamente ao salvar (onBlur).
  - Adicionado recuo de `240px` (`left-[240px]`) no container principal e no backdrop do Drawer para evitar a sobreposição da Sidebar. O menu lateral agora permanece fixo, visível e clicável o tempo todo.
- **Correção de Overflow e Encolhimento de Sidebar:**
  - Adicionadas as propriedades `shrink-0` à Sidebar e `min-w-0` ao container principal (`main`) para resolver o bug de flexbox que comprimia e ocultava o menu lateral na extrema esquerda ao renderizar elementos horizontais largos (como o quadro Kanban).
  - Reduzida a largura da Sidebar de `280px` para `240px` para otimizar o espaço do painel, ajustando o padding interno de `p-6` para `p-5`.
- **Renomeação de Fases e Módulos:**
  - Renomeado o módulo geral 'Delivery' para 'Projetos' na barra lateral e cabeçalho da dashboard.
  - Alterada a nomenclatura das etapas (0 a 5) para: Diagnóstico ➜ Escopo ➜ Desenho ➜ Construção ➜ Validação ➜ Ativação.
  - Removidos termos e siglas excessivamente técnicos (como UAT, PDD, Bugs, Deploy) das descrições de tarefas automáticas geradas no banco, tornando a interface acessível para clientes e equipe comercial.
- **Autonomia de Exclusão e Arquivamento:**
  - Criada Server Action `deleteProject` protegida com validação de perfil (apenas a role `'admin'` pode excluir permanentemente do banco de dados).
  - Integrada uma **Zona de Perigo (Danger Zone)** com dupla confirmação no final da coluna esquerda do Drawer de projetos, exibida exclusivamente para administradores.
  - Criado um seletor de **Status Geral do Projeto** no Drawer (No Prazo, Atenção, Atrasado, Pausado, Concluído) para possibilitar o arquivamento de projetos pelo time.
  - Implementado o switch **"Mostrar Arquivados"** na tela de Projetos, que oculta projetos pausados ou concluídos do Kanban e da Lista por padrão, permitindo focar na esteira ativa mas preservando o histórico para consultas futuras.
- **Melhorias de Usabilidade no Kanban:**
  - Reduzida a largura das colunas do Kanban de `300px` para `260px`, melhorando o aproveitamento de espaço em tela e reduzindo o scroll horizontal desnecessário.
  - Implementado scroll horizontal por clique e arraste (Drag-to-Scroll) nativo no container, com alteração dinâmica de cursores de mouse (`grab` e `grabbing`) e proteção de seleção de texto para garantir gestos de arraste fluidos e orgânicos.

---

## Sprint 5 — Renderização Dinâmica de Diagramas Mermaid
**Data:** 10/Jun/2026  
**Responsável:** Antigravity  

### ✅ Concluído
- **Suporte a Mermaid no Checklist e Cofre:**
  - Alterada a tarefa "Criar Desenho de Processo (Desenho Técnico) — fluxo detalhado" de tipo `'file'` (link do anexo) para tipo `'text'` (texto longo) no banco de dados e nos geradores de checklists dinâmicos (`actions.ts`). Isso permite que o usuário cole o código do diagrama Mermaid diretamente.
  - Implementada detecção de código Mermaid e integração com a API segura de renderização de SVG `mermaid.ink` no `ProjectDrawer.tsx`.
  - **Coluna Esquerda (Cofre):** Detecção automática de códigos de diagramas Mermaid inseridos em tarefas de texto longo. Se detectado, o diagrama é renderizado visualmente em um bloco responsivo escuro, mantendo o código-fonte original recolhido em um elemento `<details>` retrátil.
  - **Coluna Direita (Checklist):** Inclusão de um painel de visualização em tempo real (Preview) abaixo da área de texto na própria tarefa do checklist à medida que o usuário edita ou cola o código Mermaid, fornecendo feedback visual imediato antes de perder o foco.

## Sprint 6 — Gestão por Perfis, Vencimentos em Cascata e Gamificação
**Data:** 17/Jun/2026  
**Responsável:** Antigravity  

### ✅ Concluído
- **Filtro de Tarefas por Perfis (`dev`, `comercial`, `gestao`):**
  - Criada e aplicada migration SQL para adicionar a coluna `assigned_role` à tabela `project_tasks`.
  - Atualizada a constituição do produto (`gemini.md`) para contemplar as novas roles e os ajustes das políticas de RLS.
  - Atualizada a lógica de criação de projeto (`createProject`) para classificar automaticamente cada tarefa padrão de acordo com a responsabilidade do papel (`comercial`, `dev` ou `gestao`).
  - Reformulada a consulta central de tarefas do usuário (`getMyTasks`) para listar tarefas de projetos ativos onde o usuário está explicitamente atribuído (`assigned_to = user.id`) ou onde a tarefa sem atribuição individual corresponde à sua role (`assigned_role = user_role`).
- **Prazos Presets Proporcionais e Cascata de Vencimento:**
  - Adicionados campos de `Data de Início` e `Prazo Estimado de Entrega` no modal de Novo Projeto.
  - Implementado algoritmo no `createProject` que distribui os dias totais proporcionalmente entre as 6 fases do projeto e gera as datas de vencimento (`due_date`) de cada tarefa de forma espaçada e sequencial.
  - Criado mecanismo de efeito cascata na action `updateTaskDueDate`: ao prorrogar a data de uma tarefa, os prazos de todas as tarefas pendentes subsequentes (mesma fase de index superior ou fases posteriores) são automaticamente empurrados de forma a manter o sequenciamento lógico consecutivo.
- **Ação Dopaminérgica de Conclusão (UX Gamificada):**
  - Mapeado layout de checklist para o lado direito da tarefa: botões de ação `"Concluir"` pulsantes em tarefas pendentes e `"Concluída ✓"` discretos que mudam para `"Desfazer"` sob hover em tarefas concluídas.
  - Desenvolvido arquivo de utilitário nativo `/src/lib/confetti.ts` em HTML5 Canvas e `requestAnimationFrame` que gera explosões de confete localizadas a partir das coordenadas exatas do clique do mouse.
  - Integrado o disparo de confete nos componentes `ProjectDrawer.tsx` e `MyTasks.tsx` ao clicar em `"Concluir"`.
  - Realizada e registrada pesquisa teórica de técnicas de gamificação de neurodesign (sons nativos com Web Audio API, combos/streaks de produtividade 🔥, copywriting descontraído) em `findings.md`.

### 🔜 Próximo
- Iniciar **Módulo 2 (Comercial / CRM Básico)**.
- Desdobrar o Kanban de vendas e cartões de *Deals*.

