'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients ( name, segment )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const clientName = formData.get('clientName') as string
  const projectName = formData.get('projectName') as string
  const typesRaw = formData.get('types') as string
  const startDateStr = formData.get('startDate') as string
  const estimatedEndDateStr = formData.get('estimatedEndDate') as string

  let types = []
  try {
    if (typesRaw) types = JSON.parse(typesRaw)
  } catch (e) {}

  // 1. Create client first
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({ name: clientName })
    .select('id')
    .single()

  if (clientErr || !client) {
    console.error('Error creating client:', clientErr)
    return { success: false, error: clientErr?.message }
  }

  // 2. Get current user for responsible_id
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Create project with start_date and estimated_end_date
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      client_id: client.id,
      name: projectName,
      types: types,
      responsible_id: user?.id,
      start_date: startDateStr || new Date().toISOString().split('T')[0],
      estimated_end_date: estimatedEndDateStr || null
    })
    .select('id, start_date, estimated_end_date')
    .single()

  if (projErr || !project) {
    return { success: false, error: projErr?.message }
  }

  // --- CALCULO DOS PRESETS DE DATAS PARA CADA FASE ---
  const start = new Date(project.start_date || new Date())
  const end = project.estimated_end_date ? new Date(project.estimated_end_date) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
  // Intervalo total de dias do projeto (mínimo de 6 dias para comportar 1 dia por fase)
  const totalDays = Math.max(6, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))

  // Proporção de dias por fase
  const phasePercentages = [0.10, 0.15, 0.15, 0.40, 0.10, 0.10]
  const phaseDurations = phasePercentages.map((pct, idx) => {
    const days = Math.round(totalDays * pct)
    if (idx === 3) return Math.max(2, days) // Construção mínimo de 2 dias
    return Math.max(1, days)
  })

  // Criar os intervalos de data para cada fase sequencialmente
  const phaseRanges: { start: Date; end: Date }[] = []
  let currentCursor = new Date(start.getTime())
  for (let phase = 0; phase <= 5; phase++) {
    const duration = phaseDurations[phase]
    const phaseStart = new Date(currentCursor.getTime())
    const phaseEnd = new Date(currentCursor.getTime())
    phaseEnd.setDate(phaseEnd.getDate() + duration - 1)
    
    phaseRanges.push({ start: phaseStart, end: phaseEnd })
    
    // Próxima fase começa no dia seguinte
    const nextCursor = new Date(phaseEnd.getTime())
    nextCursor.setDate(nextCursor.getDate() + 1)
    currentCursor = nextCursor
  }
  // ----------------------------------------------------

  // 4. Generate dynamic checklist based on services
  const tasksByPhase: Record<number, Map<string, { description: string, field_type: string, assigned_role: string | null }>> = {
    0: new Map(), 1: new Map(), 2: new Map(), 3: new Map(), 4: new Map(), 5: new Map()
  };

  const addTask = (phase: number, description: string, field_type: string = 'checkbox', assigned_role: string | null = null) => {
    if (!tasksByPhase[phase].has(description)) {
      tasksByPhase[phase].set(description, { description, field_type, assigned_role });
    }
  }

  // TAREFAS COMUNS (inseridas se qualquer serviço for selecionado)
  if (types.length > 0) {
    // Fase 0
    addTask(0, 'Reunião de Kickoff', 'checkbox', 'gestao');
    addTask(0, 'Levantamento de requisitos com o cliente', 'checkbox', 'gestao');
    addTask(0, 'Validar acesso técnico aos sistemas do cliente', 'text', 'dev');
    // Fase 1
    addTask(1, 'Definir escopo: o que faz e o que NÃO faz', 'text', 'gestao');
    addTask(1, 'Estimar horas com buffer de 20%', 'checkbox', 'dev');
    addTask(1, 'Redigir proposta (escopo, prazo, preço, SLA, exclusões)', 'checkbox', 'comercial');
    addTask(1, 'Enviar proposta e agendar alinhamento', 'checkbox', 'comercial');
    addTask(1, 'Contrato de prestação de serviço assinado', 'file', 'comercial');
    addTask(1, 'NDA assinado (quando aplicável)', 'file', 'comercial');
    // Fase 4
    addTask(4, 'Conduzir validação final com usuário-chave do cliente', 'checkbox', 'comercial');
    addTask(4, 'Documentar ajustes e correções aplicadas', 'text', 'dev');
    addTask(4, 'Termo de aceite assinado pelo cliente', 'file', 'comercial');
    // Fase 5
    addTask(5, 'Treinar usuário responsável no cliente', 'checkbox', 'comercial');
    addTask(5, 'Definir canal de suporte pós-entrega', 'checkbox', 'comercial');
    addTask(5, 'Agendar check-in de 30 dias', 'checkbox', 'comercial');
  }

  if (types.includes('automation')) {
    addTask(0, 'Mapear processo AS-IS: quem faz, frequência, tempo', 'checkbox', 'gestao');
    addTask(0, 'Identificar sistemas envolvidos (ERP, planilhas, portais)', 'text', 'dev');
    addTask(0, 'Levantar volume de transações por mês', 'checkbox', 'dev');
    addTask(0, 'Identificar exceções e variações do processo', 'checkbox', 'dev');
    addTask(0, 'Calcular ROI estimado (horas economizadas × custo hora)', 'checkbox', 'gestao');
    addTask(2, 'Criar Desenho de Processo (Desenho Técnico) — fluxo detalhado', 'text', 'dev');
    addTask(2, 'Mapear cada passo: input, ação, output, condição de erro', 'checkbox', 'dev');
    addTask(2, 'Definir regras de negócio e exceções tratadas', 'checkbox', 'dev');
    addTask(2, 'Documentar credenciais e acessos necessários', 'text', 'dev');
    addTask(2, 'Dicionário de dados simplificado', 'file', 'dev');
    addTask(2, 'Estruturação do banco (Postgres/Sheets)', 'text', 'dev');
    addTask(2, 'Desenho de processo aprovado pelo cliente', 'file', 'comercial');
    addTask(2, 'Critérios de aceite definidos', 'checkbox', 'gestao');
    addTask(3, 'Setup inicial Docker/Infra', 'link', 'dev');
    addTask(3, 'Construção do fluxo principal (happy path)', 'checkbox', 'dev');
    addTask(3, 'Construção da lógica no n8n', 'checkbox', 'dev');
    addTask(3, 'Criação de prompts para IA (quando aplicável)', 'text', 'dev');
    addTask(3, 'Implementar tratamento de erros e exceções', 'checkbox', 'dev');
    addTask(3, 'Configurar logs de execução e alertas de falha', 'checkbox', 'dev');
    addTask(3, 'Versionamento no GitHub (branch do projeto)', 'link', 'dev');
    addTask(3, 'Status report semanal ao cliente', 'checkbox', 'comercial');
    addTask(4, 'Executar testes unitários em cada etapa do fluxo', 'checkbox', 'dev');
    addTask(4, 'Testar cenários de exceção mapeados no Desenho', 'checkbox', 'dev');
    addTask(4, 'Teste de volume com dados reais do cliente', 'checkbox', 'dev');
    addTask(4, 'Execução da matriz de testes', 'file', 'dev');
    addTask(4, 'Ajuste de fallbacks e loops', 'checkbox', 'dev');
    addTask(4, 'Relatório de performance (tempo, taxa de erro)', 'text', 'dev');
    addTask(5, 'Migrar bot para ambiente de produção', 'checkbox', 'dev');
    addTask(5, 'Configurar agendamento (scheduler)', 'checkbox', 'dev');
    addTask(5, 'Dashboard de monitoramento ativo', 'link', 'dev');
    addTask(5, 'Manual de operação (POP) finalizado', 'file', 'dev');
    addTask(5, 'Configuração de handoff humano', 'checkbox', 'dev');
  }

  if (types.includes('website')) {
    addTask(0, 'Briefing de negócio (público-alvo, tom de voz, referências)', 'text', 'comercial');
    addTask(0, 'Definir estrutura de seções (wireframe textual)', 'checkbox', 'comercial');
    addTask(0, 'Levantar conteúdo existente (textos, fotos, vídeos)', 'checkbox', 'comercial');
    addTask(0, 'Definir integrações (formulário, WhatsApp, analytics)', 'checkbox', 'dev');
    addTask(2, 'Criação do wireframe / layout (Figma ou similar)', 'link', 'dev');
    addTask(2, 'Aprovação da identidade visual pelo cliente', 'file', 'comercial');
    addTask(2, 'Catalogação de ativos (mídias: fotos, vídeos, ícones)', 'checkbox', 'dev');
    addTask(2, 'Definição de styles globais (cores, fontes, espaçamentos)', 'checkbox', 'dev');
    addTask(2, 'Revisão de textos / copywriting', 'checkbox', 'comercial');
    addTask(3, 'Setup do projeto (framework, repositório, domínio de dev)', 'link', 'dev');
    addTask(3, 'Construção segregada de seções', 'checkbox', 'dev');
    addTask(3, 'Implementação de animações e interações', 'checkbox', 'dev');
    addTask(3, 'Integração de formulários e CTAs', 'checkbox', 'dev');
    addTask(3, 'Configuração de SEO (meta tags, OG, sitemap)', 'checkbox', 'dev');
    addTask(3, 'Congelamento de código (code freeze)', 'checkbox', 'dev');
    addTask(4, 'Otimização mobile (responsivo)', 'checkbox', 'dev');
    addTask(4, 'Testes cross-browser (Chrome, Safari, Firefox)', 'checkbox', 'dev');
    addTask(4, 'Testes de velocidade (Lighthouse / PageSpeed)', 'text', 'dev');
    addTask(4, 'Revisão de conteúdo final com o cliente', 'checkbox', 'comercial');
    addTask(5, 'Configuração de domínio e DNS', 'text', 'dev');
    addTask(5, 'Publicação (Go-Live)', 'checkbox', 'dev');
    addTask(5, 'Configuração de analytics (GA, GTM, Pixel)', 'checkbox', 'dev');
    addTask(5, 'Entrega de acessos ao cliente (CMS, painel)', 'text', 'comercial');
  }

  if (types.includes('saas')) {
    addTask(0, 'Definir functionalities core (user stories ou lista de features)', 'text', 'gestao');
    addTask(0, 'Definir personas e fluxos de usuário', 'checkbox', 'gestao');
    addTask(0, 'Definir modelo de autenticação (login, roles, permissões)', 'checkbox', 'dev');
    addTask(0, 'Definir integrações externas (APIs, pagamento, e-mail)', 'text', 'dev');
    addTask(2, 'Wireframes / protótipo navegável (Figma)', 'link', 'dev');
    addTask(2, 'Design System definido (cores, tipografia, componentes)', 'checkbox', 'dev');
    addTask(2, 'Modelagem do banco de dados (ERD)', 'file', 'dev');
    addTask(2, 'Definição de endpoints / API', 'text', 'dev');
    addTask(2, 'Aprovação do protótipo pelo cliente', 'file', 'comercial');
    addTask(3, 'Setup do projeto (framework, CI/CD, repositório)', 'link', 'dev');
    addTask(3, 'Criação do banco de dados', 'text', 'dev');
    addTask(3, 'Implementação do sistema de autenticação', 'checkbox', 'dev');
    addTask(3, 'Desenvolvimento dos módulos/features core', 'checkbox', 'dev');
    addTask(3, 'Implementação de integrações externas', 'checkbox', 'dev');
    addTask(3, 'Configuração de deploy (Coolify/Vercel)', 'link', 'dev');
    addTask(3, 'Status report semanal ao cliente', 'checkbox', 'comercial');
    addTask(4, 'Testes funcionais de cada módulo', 'checkbox', 'dev');
    addTask(4, 'Testes de segurança (auth, permissões, SQL injection)', 'checkbox', 'dev');
    addTask(4, 'Testes de performance e carga', 'text', 'dev');
    addTask(4, 'Teste de fluxo completo com dados reais', 'checkbox', 'dev');
    addTask(5, 'Deploy em produção', 'checkbox', 'dev');
    addTask(5, 'Configuração de domínio e SSL', 'text', 'dev');
    addTask(5, 'Configuração de backups automáticos', 'checkbox', 'dev');
    addTask(5, 'Documentação técnica (API, arquitetura)', 'file', 'dev');
    addTask(5, 'Onboarding do cliente (treinamento na plataforma)', 'checkbox', 'comercial');
  }

  if (types.includes('ecommerce')) {
    addTask(0, 'Definir plataforma (Shopify, WooCommerce, customizado)', 'checkbox', 'gestao');
    addTask(0, 'Levantamento de catálogo (quantidade de produtos, categorias)', 'checkbox', 'comercial');
    addTask(0, 'Definir meios de pagamento e frete', 'checkbox', 'comercial');
    addTask(0, 'Definir integrações (ERP, estoque, nota fiscal)', 'text', 'dev');
    addTask(2, 'Layout da loja (home, PDP, carrinho, checkout)', 'link', 'dev');
    addTask(2, 'Identidade visual da loja aprovada', 'file', 'comercial');
    addTask(2, 'Estrutura de categorias e filtros', 'checkbox', 'dev');
    addTask(2, 'Definição de fluxo de checkout', 'checkbox', 'dev');
    addTask(2, 'Estratégia de frete e regiões de entrega', 'checkbox', 'comercial');
    addTask(3, 'Setup da plataforma + tema', 'link', 'dev');
    addTask(3, 'Cadastro de produtos (ou importação em massa)', 'checkbox', 'comercial');
    addTask(3, 'Configuração de pagamentos (gateway)', 'text', 'dev');
    addTask(3, 'Configuração de frete e logística', 'checkbox', 'dev');
    addTask(3, 'Integração com ERP / sistema de estoque', 'checkbox', 'dev');
    addTask(3, 'Implementação de e-mails transacionais', 'checkbox', 'dev');
    addTask(4, 'Pedido teste completo (do carrinho à confirmação)', 'checkbox', 'comercial');
    addTask(4, 'Teste de pagamento em sandbox', 'checkbox', 'dev');
    addTask(4, 'Teste de cálculo de frete', 'checkbox', 'dev');
    addTask(4, 'Teste mobile (responsividade da loja)', 'checkbox', 'dev');
    addTask(4, 'Revisão de conteúdo de produtos', 'checkbox', 'comercial');
    addTask(5, 'Configuração de domínio e SSL', 'text', 'dev');
    addTask(5, 'Ativação de pagamento real (sair de sandbox)', 'checkbox', 'dev');
    addTask(5, 'Configuração de analytics e pixel de conversão', 'checkbox', 'dev');
    addTask(5, 'Treinamento do operador da loja', 'checkbox', 'comercial');
    addTask(5, 'Manual de operação (cadastrar produtos, processar pedidos)', 'file', 'comercial');
  }

  if (types.includes('traffic')) {
    addTask(0, 'Definir objetivo da campanha (leads, vendas, branding)', 'checkbox', 'comercial');
    addTask(0, 'Definir público-alvo e personas', 'checkbox', 'comercial');
    addTask(0, 'Definir canais (Google Ads, Meta Ads, LinkedIn, TikTok)', 'checkbox', 'comercial');
    addTask(0, 'Definir orçamento mensal e período', 'checkbox', 'comercial');
    addTask(0, 'Acesso às contas de anúncio do cliente', 'text', 'comercial');
    addTask(2, 'Criação da estratégia de campanha', 'file', 'comercial');
    addTask(2, 'Definição de criativos (textos + imagens/vídeos)', 'checkbox', 'comercial');
    addTask(2, 'Criação/revisão da landing page de destino', 'link', 'dev');
    addTask(2, 'Configuração de pixel e eventos de conversão', 'checkbox', 'dev');
    addTask(2, 'Aprovação dos criativos pelo cliente', 'file', 'comercial');
    addTask(3, 'Estruturação das campanhas na plataforma', 'checkbox', 'dev');
    addTask(3, 'Upload de criativos e configuração de segmentação', 'checkbox', 'dev');
    addTask(3, 'Configuração de UTMs e rastreamento', 'checkbox', 'dev');
    addTask(3, 'Ativação das campanhas', 'checkbox', 'dev');
    addTask(3, 'Monitoramento inicial (primeiras 48h)', 'checkbox', 'dev');
    addTask(4, 'Análise de métricas (CTR, CPC, CPA, ROAS)', 'text', 'comercial');
    addTask(4, 'Testes A/B de criativos', 'checkbox', 'dev');
    addTask(4, 'Otimização de públicos e lances', 'checkbox', 'dev');
    addTask(4, 'Relatório de performance da primeira semana', 'file', 'comercial');
    addTask(5, 'Relatório final de campanha', 'file', 'comercial');
    addTask(5, 'Documentação de aprendizados (o que funcionou/não)', 'text', 'comercial');
    addTask(5, 'Transferência de acesso das contas (se aplicável)', 'text', 'comercial');
    addTask(5, 'Proposta de continuidade / próximo ciclo', 'checkbox', 'comercial');
  }

  const tasksToInsert: any[] = []
  
  for (let phase = 0; phase <= 5; phase++) {
    const totalTasksInPhase = tasksByPhase[phase].size
    const phaseRange = phaseRanges[phase]
    const daysInPhase = phaseDurations[phase]
    
    let index = 0;
    for (const [_, taskObj] of tasksByPhase[phase]) {
      // Distribuição uniforme e sequencial das datas limite dentro do intervalo da fase
      let dueDateStr: string | null = null
      if (totalTasksInPhase > 0 && phaseRange) {
        const dayOffset = Math.min(daysInPhase - 1, Math.round(((index + 1) / totalTasksInPhase) * (daysInPhase - 1)))
        const taskDate = new Date(phaseRange.start.getTime())
        taskDate.setDate(taskDate.getDate() + dayOffset)
        dueDateStr = taskDate.toISOString().split('T')[0]
      }

      tasksToInsert.push({ 
        project_id: project.id, 
        phase, 
        task_index: index, 
        description: taskObj.description,
        field_type: taskObj.field_type,
        assigned_role: taskObj.assigned_role,
        due_date: dueDateStr
      })
      index++;
    }
  }

  if (tasksToInsert.length > 0) {
    await supabase.from('project_tasks').insert(tasksToInsert)
  }

  revalidatePath('/delivery')
  return { success: true }
},
        field_type: taskObj.field_type
      })
      index++;
    }
  }

  if (tasksToInsert.length > 0) {
    await supabase.from('project_tasks').insert(tasksToInsert)
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function updateProjectPhase(projectId: string, newPhase: number) {
  const supabase = await createClient()
  
  // Quality Gate Check logic could go here
  
  const { error } = await supabase
    .from('projects')
    .update({ current_phase: newPhase })
    .eq('id', projectId)

  if (error) {
    console.error('Error updating project phase:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('phase', { ascending: true })
    .order('task_index', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data
}

export async function toggleTask(taskId: string, isDone: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_tasks')
    .update({ 
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      // completed_by would require getting the current user session
    })
    .eq('id', taskId)

  if (error) {
    console.error('Error toggling task:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function getMyTasks() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get user role
  const userRole = await getUserRole()

  // Get all active projects
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      types,
      current_phase,
      estimated_end_date,
      status,
      responsible_id,
      clients ( name )
    `)
    .in('status', ['on-track', 'attention', 'delayed'])
    .order('estimated_end_date', { ascending: true, nullsFirst: false })

  if (projErr || !projects) {
    console.error('Error fetching my projects:', projErr)
    return []
  }

  const projectGroups = []

  for (const project of projects) {
    // Get all pending tasks for the current phase
    const { data: tasks, error: taskErr } = await supabase
      .from('project_tasks')
      .select('id, description, is_done, phase, task_index, assigned_to, assigned_role, due_date')
      .eq('project_id', project.id)
      .eq('phase', project.current_phase)
      .eq('is_done', false)
      .order('task_index', { ascending: true })

    if (taskErr || !tasks) continue

    // Filter tasks based on assignment rules
    const filteredTasks = tasks.filter(task => {
      // 1. Explicitly assigned to current user
      const isAssignedToMe = task.assigned_to === user.id
      
      // 2. Unassigned task matching the user's role
      const isMyRoleUnassigned = !task.assigned_to && task.assigned_role === userRole
      
      // 3. Unassigned task in a project where the user is responsible
      const isMyProjectUnassigned = !task.assigned_to && project.responsible_id === user.id

      return isAssignedToMe || isMyRoleUnassigned || isMyProjectUnassigned
    })

    if (filteredTasks.length > 0) {
      projectGroups.push({
        project_id: project.id,
        project_name: project.name,
        client_name: (project.clients as any)?.name || 'Sem cliente',
        types: project.types || [],
        current_phase: project.current_phase,
        estimated_end_date: project.estimated_end_date,
        status: project.status,
        tasks: filteredTasks,
      })
    }
  }

  return projectGroups
}

export async function updateTaskField(taskId: string, isDone: boolean, fieldValue: string | null) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_tasks')
    .update({ 
      is_done: isDone,
      field_value: fieldValue,
      completed_at: isDone ? new Date().toISOString() : null,
    })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task field:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function updateTaskAssignment(taskId: string, assignedTo: string | null) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_tasks')
    .update({ assigned_to: assignedTo })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task assignment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function updateTaskDueDate(taskId: string, dueDate: string | null) {
  const supabase = await createClient()
  
  // 1. Atualizar a tarefa atual e pegar seus detalhes
  const { data: currentTask, error } = await supabase
    .from('project_tasks')
    .update({ due_date: dueDate })
    .eq('id', taskId)
    .select('project_id, phase, task_index, due_date')
    .single()

  if (error || !currentTask) {
    console.error('Error updating task due date:', error)
    return { success: false, error: error?.message }
  }

  // Se a data alterada for nula, não temos o que propagar
  if (!dueDate) {
    revalidatePath('/delivery')
    return { success: true }
  }

  // 2. Buscar todas as tarefas pendentes do mesmo projeto que estão na sequência lógica posterior
  const { data: siblingTasks, error: siblingErr } = await supabase
    .from('project_tasks')
    .select('id, phase, task_index, due_date, description')
    .eq('project_id', currentTask.project_id)
    .eq('is_done', false)
    .or(`phase.gt.${currentTask.phase},and(phase.eq.${currentTask.phase},task_index.gt.${currentTask.task_index})`)
    .order('phase', { ascending: true })
    .order('task_index', { ascending: true })

  if (siblingErr || !siblingTasks || siblingTasks.length === 0) {
    revalidatePath('/delivery')
    return { success: true }
  }

  // 3. Efeito dominó: empurrar as datas limite subsequentes
  let currentLimitDate = new Date(dueDate)
  
  for (const task of siblingTasks) {
    // A próxima tarefa deve vencer pelo menos 1 dia após a anterior
    const minDate = new Date(currentLimitDate.getTime())
    minDate.setDate(minDate.getDate() + 1)
    const minDateStr = minDate.toISOString().split('T')[0]

    // Se o prazo da tarefa subsequente for menor que o minDate (ou for nulo), nós empurramos
    if (!task.due_date || task.due_date < minDateStr) {
      await supabase
        .from('project_tasks')
        .update({ due_date: minDateStr })
        .eq('id', task.id)
      
      currentLimitDate = minDate
    } else {
      // Se já era maior, ela define o novo limite para as próximas
      currentLimitDate = new Date(task.due_date)
    }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function getTeamMembers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .order('full_name')

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data
}

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'comercial'
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (error || !data) return 'comercial'
  return data.role
}

export async function updateProjectStatus(projectId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({ status: status })
    .eq('id', projectId)

  if (error) {
    console.error('Error updating project status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile || profile.role !== 'admin') {
    return { success: false, error: 'Apenas administradores podem excluir projetos' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/delivery')
  return { success: true }
}
