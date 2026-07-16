'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDeals() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      clients ( id, name, segment )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }

  return data
}

export async function getClients() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, segment')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data
}

export async function createDeal(formData: {
  title: string
  clientId: string | null
  estimatedValue: number | null
  estimatedMrr: number | null
  nextAction: string | null
  nextActionDate: string | null
  notes: string | null
}) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { data, error } = await supabase
    .from('deals')
    .insert({
      title: formData.title,
      client_id: formData.clientId || null,
      estimated_value: formData.estimatedValue || null,
      estimated_mrr: formData.estimatedMrr || null,
      owner_id: user.id,
      next_action: formData.nextAction || null,
      next_action_date: formData.nextActionDate || null,
      notes: formData.notes || null,
      stage: 'lead'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating deal:', error)
    return { success: false, error: error.message }
  }

  // Registrar atividade inicial
  await supabase.from('deal_activities').insert({
    deal_id: data.id,
    type: 'stage_change',
    content: 'Oportunidade criada no funil como Lead',
    created_by: user.id
  })

  revalidatePath('/comercial')
  return { success: true, data }
}

export async function updateDealStage(dealId: string, newStage: string, lostReason?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado' }

  // 1. Atualizar o deal
  const { error } = await supabase
    .from('deals')
    .update({
      stage: newStage,
      lost_reason: newStage === 'lost' ? (lostReason || 'Não informado') : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', dealId)

  if (error) {
    console.error('Error updating deal stage:', error)
    return { success: false, error: error.message }
  }

  // Traduzir etapa para o histórico
  const stageLabels: Record<string, string> = {
    lead: 'Lead Identificado',
    contacted: 'Contato Iniciado',
    meeting: 'Reunião Agendada',
    discovery: 'Discovery Realizado',
    proposal: 'Proposta Enviada',
    negotiation: 'Em Negociação',
    won: 'Contrato Assinado (Ganho) 🎉',
    lost: 'Negócio Perdido ❌'
  }

  const stageLabel = stageLabels[newStage] || newStage
  const content = newStage === 'lost' 
    ? `Estágio alterado para: ${stageLabel}. Motivo: ${lostReason}`
    : `Estágio alterado para: ${stageLabel}`

  // 2. Criar a atividade de mudança de fase
  await supabase.from('deal_activities').insert({
    deal_id: dealId,
    type: 'stage_change',
    content,
    created_by: user.id
  })

  revalidatePath('/comercial')
  return { success: true }
}

export async function updateDeal(dealId: string, formData: {
  title: string
  clientId: string | null
  estimatedValue: number | null
  estimatedMrr: number | null
  nextAction: string | null
  nextActionDate: string | null
  notes: string | null
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('deals')
    .update({
      title: formData.title,
      client_id: formData.clientId || null,
      estimated_value: formData.estimatedValue || null,
      estimated_mrr: formData.estimatedMrr || null,
      next_action: formData.nextAction || null,
      next_action_date: formData.nextActionDate || null,
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', dealId)

  if (error) {
    console.error('Error updating deal:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/comercial')
  return { success: true }
}

export async function getDealActivities(dealId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('deal_activities')
    .select(`
      *,
      profiles ( full_name )
    `)
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data
}

export async function addDealActivity(dealId: string, type: 'note' | 'call' | 'email' | 'meeting', content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { data, error } = await supabase
    .from('deal_activities')
    .insert({
      deal_id: dealId,
      type,
      content,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding activity:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/comercial')
  return { success: true, data }
}

export async function seedMockDeals() {
  const supabase = await createClient()
  
  const { data: existingDeals } = await supabase.from('deals').select('id').limit(1)
  if (existingDeals && existingDeals.length > 0) {
    return { success: true, message: 'Já existem deals no banco.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado para rodar o seed' }

  // 1. Obter ou criar um cliente para teste
  const { data: existingClients } = await supabase.from('clients').select('id').limit(3)
  let clientIds: string[] = []

  if (existingClients && existingClients.length > 0) {
    clientIds = existingClients.map(c => c.id)
  } else {
    // Criar clientes de teste
    const mockClients = [
      { name: 'CleanUp Serviços Gerais', segment: 'Serviços', size: 'Médio', notes: 'Contato por indicação' },
      { name: 'DentalClinic Odontologia', segment: 'Saúde', size: 'PME', notes: 'Focado em SaaS de agendamento' },
      { name: 'StudioGold Fotografia', segment: 'Eventos', size: 'PME', notes: 'Gostaram do portfólio' }
    ]
    const { data: newClients } = await supabase.from('clients').insert(mockClients).select()
    if (newClients) clientIds = newClients.map(c => c.id)
  }

  if (clientIds.length === 0) return { success: false, error: 'Não foi possível obter ou criar clientes para o seed.' }

  const mockDeals = [
    {
      title: 'Automação Financeira (Contas a Pagar)',
      client_id: clientIds[0] || null,
      stage: 'lead',
      estimated_value: 12000,
      estimated_mrr: 1500,
      owner_id: user.id,
      next_action: 'Enviar mensagem de introdução no LinkedIn',
      next_action_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      notes: 'Empresa com alto volume de notas fiscais manuais. Processo ideal para automação RPA.'
    },
    {
      title: 'SaaS CRM Sob Medida',
      client_id: clientIds[1] || null,
      stage: 'meeting',
      estimated_value: 28000,
      estimated_mrr: 2900,
      owner_id: user.id,
      next_action: 'Reunião de Discovery agendada para sexta-feira',
      next_action_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
      notes: 'Interesse em um sistema simples para gerenciar consultas de pacientes integrando agenda com WhatsApp.'
    },
    {
      title: 'Site Institucional + Tráfego Pago',
      client_id: clientIds[2] || null,
      stage: 'proposal',
      estimated_value: 8500,
      estimated_mrr: 1200,
      owner_id: user.id,
      next_action: 'Apresentar proposta e fazer o pitch comercial',
      next_action_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
      notes: 'Proposta montada. Foco em mostrar o retorno em leads qualificados que o tráfego gerará.'
    },
    {
      title: 'Robô RPA Conciliação Bancária',
      client_id: clientIds[0] || null,
      stage: 'negotiation',
      estimated_value: 15000,
      estimated_mrr: 1800,
      owner_id: user.id,
      next_action: 'Ajustar o cronograma de entrega conforme solicitado',
      next_action_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
      notes: 'Negociação avançada. Discutindo se faremos em duas parcelas ou entrada + mensalidade.'
    }
  ]

  const { data: createdDeals, error: insertError } = await supabase.from('deals').insert(mockDeals).select()
  if (insertError) {
    console.error('Error inserting seed deals:', insertError)
    return { success: false, error: insertError.message }
  }

  // Adicionar atividades iniciais para cada um
  for (const deal of createdDeals) {
    await supabase.from('deal_activities').insert({
      deal_id: deal.id,
      type: 'stage_change',
      content: `Oportunidade importada no estágio: ${deal.stage}`,
      created_by: user.id
    })
    
    await supabase.from('deal_activities').insert({
      deal_id: deal.id,
      type: 'note',
      content: `Anotação inicial: ${deal.notes}`,
      created_by: user.id
    })
  }

  revalidatePath('/comercial')
  return { success: true }
}
