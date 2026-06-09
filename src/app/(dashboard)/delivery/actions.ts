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

  // 3. Create project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      client_id: client.id,
      name: projectName,
      types: types,
      responsible_id: user?.id
    })
    .select('id')
    .single()

  if (projErr || !project) {
    return { success: false, error: projErr?.message }
  }

  // 4. Generate dynamic checklist based on services
  const tasksByPhase: Record<number, Map<string, { description: string, field_type: string }>> = {
    0: new Map(), 1: new Map(), 2: new Map(), 3: new Map(), 4: new Map(), 5: new Map()
  };

  const addTask = (phase: number, description: string, field_type: string = 'checkbox') => {
    if (!tasksByPhase[phase].has(description)) {
      tasksByPhase[phase].set(description, { description, field_type });
    }
  }

  // TAREFAS COMUNS (inseridas se qualquer serviço for selecionado)
  if (types.length > 0) {
    // Fase 0
    addTask(0, 'Reunião de Kickoff');
    addTask(0, 'Levantamento de requisitos com o cliente');
    addTask(0, 'Validar acesso técnico aos sistemas do cliente', 'text');
    // Fase 1
    addTask(1, 'Definir escopo: o que faz e o que NÃO faz');
    addTask(1, 'Estimar horas com buffer de 20%');
    addTask(1, 'Redigir proposta (escopo, prazo, preço, SLA, exclusões)');
    addTask(1, 'Enviar proposta e agendar alinhamento');
    addTask(1, 'Contrato de prestação de serviço assinado', 'file');
    addTask(1, 'NDA assinado (quando aplicável)', 'file');
    // Fase 4
    addTask(4, 'Conduzir validação final com usuário-chave do cliente');
    addTask(4, 'Documentar ajustes e correções aplicadas', 'text');
    addTask(4, 'Termo de aceite assinado pelo cliente', 'file');
    // Fase 5
    addTask(5, 'Treinar usuário responsável no cliente');
    addTask(5, 'Definir canal de suporte pós-entrega');
    addTask(5, 'Agendar check-in de 30 dias');
  }

  if (types.includes('automation')) {
    addTask(0, 'Mapear processo AS-IS: quem faz, frequência, tempo');
    addTask(0, 'Identificar sistemas envolvidos (ERP, planilhas, portais)', 'text');
    addTask(0, 'Levantar volume de transações por mês');
    addTask(0, 'Identificar exceções e variações do processo');
    addTask(0, 'Calcular ROI estimado (horas economizadas × custo hora)');
    addTask(2, 'Criar Desenho de Processo (Desenho Técnico) — fluxo detalhado', 'file');
    addTask(2, 'Mapear cada passo: input, ação, output, condição de erro');
    addTask(2, 'Definir regras de negócio e exceções tratadas');
    addTask(2, 'Documentar credenciais e acessos necessários', 'text');
    addTask(2, 'Dicionário de dados simplificado', 'file');
    addTask(2, 'Estruturação do banco (Postgres/Sheets)', 'text');
    addTask(2, 'Desenho de processo aprovado pelo cliente', 'file');
    addTask(2, 'Critérios de aceite definidos');
    addTask(3, 'Setup inicial Docker/Infra', 'link');
    addTask(3, 'Construção do fluxo principal (happy path)');
    addTask(3, 'Construção da lógica no n8n');
    addTask(3, 'Criação de prompts para IA (quando aplicável)', 'text');
    addTask(3, 'Implementar tratamento de erros e exceções');
    addTask(3, 'Configurar logs de execução e alertas de falha');
    addTask(3, 'Versionamento no GitHub (branch do projeto)', 'link');
    addTask(3, 'Status report semanal ao cliente');
    addTask(4, 'Executar testes unitários em cada etapa do fluxo');
    addTask(4, 'Testar cenários de exceção mapeados no Desenho');
    addTask(4, 'Teste de volume com dados reais do cliente');
    addTask(4, 'Execução da matriz de testes', 'file');
    addTask(4, 'Ajuste de fallbacks e loops');
    addTask(4, 'Relatório de performance (tempo, taxa de erro)', 'text');
    addTask(5, 'Migrar bot para ambiente de produção');
    addTask(5, 'Configurar agendamento (scheduler)');
    addTask(5, 'Dashboard de monitoramento ativo', 'link');
    addTask(5, 'Manual de operação (POP) finalizado', 'file');
    addTask(5, 'Configuração de handoff humano');
  }

  if (types.includes('website')) {
    addTask(0, 'Briefing de negócio (público-alvo, tom de voz, referências)', 'text');
    addTask(0, 'Definir estrutura de seções (wireframe textual)');
    addTask(0, 'Levantar conteúdo existente (textos, fotos, vídeos)');
    addTask(0, 'Definir integrações (formulário, WhatsApp, analytics)');
    addTask(2, 'Criação do wireframe / layout (Figma ou similar)', 'link');
    addTask(2, 'Aprovação da identidade visual pelo cliente', 'file');
    addTask(2, 'Catalogação de ativos (mídias: fotos, vídeos, ícones)');
    addTask(2, 'Definição de estilos globais (cores, fontes, espaçamentos)');
    addTask(2, 'Revisão de textos / copywriting');
    addTask(3, 'Setup do projeto (framework, repositório, domínio de dev)', 'link');
    addTask(3, 'Construção segregada de seções');
    addTask(3, 'Implementação de animações e interações');
    addTask(3, 'Integração de formulários e CTAs');
    addTask(3, 'Configuração de SEO (meta tags, OG, sitemap)');
    addTask(3, 'Congelamento de código (code freeze)');
    addTask(4, 'Otimização mobile (responsivo)');
    addTask(4, 'Testes cross-browser (Chrome, Safari, Firefox)');
    addTask(4, 'Testes de velocidade (Lighthouse / PageSpeed)', 'text');
    addTask(4, 'Revisão de conteúdo final com o cliente');
    addTask(5, 'Configuração de domínio e DNS', 'text');
    addTask(5, 'Publicação (Go-Live)');
    addTask(5, 'Configuração de analytics (GA, GTM, Pixel)');
    addTask(5, 'Entrega de acessos ao cliente (CMS, painel)', 'text');
  }

  if (types.includes('saas')) {
    addTask(0, 'Definir funcionalidades core (user stories ou lista de features)', 'text');
    addTask(0, 'Definir personas e fluxos de usuário');
    addTask(0, 'Definir modelo de autenticação (login, roles, permissões)');
    addTask(0, 'Definir integrações externas (APIs, pagamento, e-mail)', 'text');
    addTask(2, 'Wireframes / protótipo navegável (Figma)', 'link');
    addTask(2, 'Design System definido (cores, tipografia, componentes)');
    addTask(2, 'Modelagem do banco de dados (ERD)', 'file');
    addTask(2, 'Definição de endpoints / API', 'text');
    addTask(2, 'Aprovação do protótipo pelo cliente', 'file');
    addTask(3, 'Setup do projeto (framework, CI/CD, repositório)', 'link');
    addTask(3, 'Criação do banco de dados', 'text');
    addTask(3, 'Implementação do sistema de autenticação');
    addTask(3, 'Desenvolvimento dos módulos/features core');
    addTask(3, 'Implementação de integrações externas');
    addTask(3, 'Configuração de deploy (Coolify/Vercel)', 'link');
    addTask(3, 'Status report semanal ao cliente');
    addTask(4, 'Testes funcionais de cada módulo');
    addTask(4, 'Testes de segurança (auth, permissões, SQL injection)');
    addTask(4, 'Testes de performance e carga', 'text');
    addTask(4, 'Teste de fluxo completo com dados reais');
    addTask(5, 'Deploy em produção');
    addTask(5, 'Configuração de domínio e SSL', 'text');
    addTask(5, 'Configuração de backups automáticos');
    addTask(5, 'Documentação técnica (API, arquitetura)', 'file');
    addTask(5, 'Onboarding do cliente (treinamento na plataforma)');
  }

  if (types.includes('ecommerce')) {
    addTask(0, 'Definir plataforma (Shopify, WooCommerce, customizado)');
    addTask(0, 'Levantamento de catálogo (quantidade de produtos, categorias)');
    addTask(0, 'Definir meios de pagamento e frete');
    addTask(0, 'Definir integrações (ERP, estoque, nota fiscal)', 'text');
    addTask(2, 'Layout da loja (home, PDP, carrinho, checkout)', 'link');
    addTask(2, 'Identidade visual da loja aprovada', 'file');
    addTask(2, 'Estrutura de categorias e filtros');
    addTask(2, 'Definição de fluxo de checkout');
    addTask(2, 'Estratégia de frete e regiões de entrega');
    addTask(3, 'Setup da plataforma + tema', 'link');
    addTask(3, 'Cadastro de produtos (ou importação em massa)');
    addTask(3, 'Configuração de pagamentos (gateway)', 'text');
    addTask(3, 'Configuração de frete e logística');
    addTask(3, 'Integração com ERP / sistema de estoque');
    addTask(3, 'Implementação de e-mails transacionais');
    addTask(4, 'Pedido teste completo (do carrinho à confirmação)');
    addTask(4, 'Teste de pagamento em sandbox');
    addTask(4, 'Teste de cálculo de frete');
    addTask(4, 'Teste mobile (responsividade da loja)');
    addTask(4, 'Revisão de conteúdo de produtos');
    addTask(5, 'Configuração de domínio e SSL', 'text');
    addTask(5, 'Ativação de pagamento real (sair de sandbox)');
    addTask(5, 'Configuração de analytics e pixel de conversão');
    addTask(5, 'Treinamento do operador da loja');
    addTask(5, 'Manual de operação (cadastrar produtos, processar pedidos)', 'file');
  }

  if (types.includes('traffic')) {
    addTask(0, 'Definir objetivo da campanha (leads, vendas, branding)');
    addTask(0, 'Definir público-alvo e personas');
    addTask(0, 'Definir canais (Google Ads, Meta Ads, LinkedIn, TikTok)');
    addTask(0, 'Definir orçamento mensal e período');
    addTask(0, 'Acesso às contas de anúncio do cliente', 'text');
    addTask(2, 'Criação da estratégia de campanha', 'file');
    addTask(2, 'Definição de criativos (textos + imagens/vídeos)');
    addTask(2, 'Criação/revisão da landing page de destino', 'link');
    addTask(2, 'Configuração de pixel e eventos de conversão');
    addTask(2, 'Aprovação dos criativos pelo cliente', 'file');
    addTask(3, 'Estruturação das campanhas na plataforma');
    addTask(3, 'Upload de criativos e configuração de segmentação');
    addTask(3, 'Configuração de UTMs e rastreamento');
    addTask(3, 'Ativação das campanhas');
    addTask(3, 'Monitoramento inicial (primeiras 48h)');
    addTask(4, 'Análise de métricas (CTR, CPC, CPA, ROAS)', 'text');
    addTask(4, 'Testes A/B de criativos');
    addTask(4, 'Otimização de públicos e lances');
    addTask(4, 'Relatório de performance da primeira semana', 'file');
    addTask(5, 'Relatório final de campanha', 'file');
    addTask(5, 'Documentação de aprendizados (o que funcionou/não)', 'text');
    addTask(5, 'Transferência de acesso das contas (se aplicável)', 'text');
    addTask(5, 'Proposta de continuidade / próximo ciclo');
  }

  const tasksToInsert: any[] = []
  
  for (let phase = 0; phase <= 5; phase++) {
    let index = 0;
    for (const [_, taskObj] of tasksByPhase[phase]) {
      tasksToInsert.push({ 
        project_id: project.id, 
        phase, 
        task_index: index, 
        description: taskObj.description,
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

  // Get all active projects where the user is responsible
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      types,
      current_phase,
      estimated_end_date,
      status,
      clients ( name )
    `)
    .eq('responsible_id', user.id)
    .in('status', ['on-track', 'attention', 'delayed'])
    .order('estimated_end_date', { ascending: true, nullsFirst: false })

  if (projErr || !projects) {
    console.error('Error fetching my projects:', projErr)
    return []
  }

  // Get pending tasks for the current phase of each project, assigned to the user
  const projectGroups = []

  for (const project of projects) {
    const { data: tasks, error: taskErr } = await supabase
      .from('project_tasks')
      .select('id, description, is_done, phase, task_index')
      .eq('project_id', project.id)
      .eq('phase', project.current_phase)
      .eq('is_done', false)
      .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
      .order('task_index', { ascending: true })

    if (taskErr) continue

    if (tasks && tasks.length > 0) {
      projectGroups.push({
        project_id: project.id,
        project_name: project.name,
        client_name: (project.clients as any)?.name || 'Sem cliente',
        types: project.types || [],
        current_phase: project.current_phase,
        estimated_end_date: project.estimated_end_date,
        status: project.status,
        tasks,
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
  
  const { error } = await supabase
    .from('project_tasks')
    .update({ due_date: dueDate })
    .eq('id', taskId)

  if (error) {
    console.error('Error updating task due date:', error)
    return { success: false, error: error.message }
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
