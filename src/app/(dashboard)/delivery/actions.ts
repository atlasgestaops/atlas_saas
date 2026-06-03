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
  const tasksToInsert: any[] = []
  
  // Helper to add tasks avoiding duplicates logic
  let currentIndexes = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  const addTask = (phase: number, description: string) => {
    tasksToInsert.push({ project_id: project.id, phase, task_index: currentIndexes[phase as keyof typeof currentIndexes], description })
    currentIndexes[phase as keyof typeof currentIndexes]++
  }

  // Baseline task for everyone
  addTask(0, 'Reunião de Kickoff')
  addTask(1, 'Aprovação de Proposta/Escopo')

  if (types.includes('website')) {
    addTask(0, 'Website: Briefing de Negócio')
    addTask(0, 'Website: Estrutura de Seções (Wireframe Textual)')
    addTask(2, 'Website: Aprovação de Identidade Visual')
    addTask(2, 'Website: Catalogação de Ativos (Mídias)')
    addTask(2, 'Website: Configuração de Estilos Globais')
    addTask(3, 'Website: Construção Segregada')
    addTask(3, 'Website: Congelamento de Código')
    addTask(4, 'Website: Otimização Mobile (Responsivo)')
    addTask(4, 'Website: Testes de Velocidade e Animações')
    addTask(5, 'Website: Publicação de Domínio (Go-Live)')
  }

  if (types.includes('automation')) {
    addTask(0, 'Automação: Mapeamento AS-IS e Volume')
    addTask(2, 'Automação: Dicionário de Dados Simplificado')
    addTask(2, 'Automação: Estruturação Postgres/Sheets')
    addTask(3, 'Automação: Setup Inicial Docker/Infra')
    addTask(3, 'Automação: Construção da Lógica no n8n')
    addTask(3, 'Automação: Criação de Prompts para IA')
    addTask(4, 'Automação: Execução da Matriz de Testes')
    addTask(4, 'Automação: Ajuste de Fallbacks e Loops')
    addTask(5, 'Automação: Manual de Operação (POP) Finalizado')
    addTask(5, 'Automação: Configuração de Handoff Humano')
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
