'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Valida se o usuário logado tem papel administrativo ('dev', 'gestao' ou 'admin')
 */
async function requireAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile || !['dev', 'gestao', 'admin'].includes(profile.role)) {
    throw new Error('Acesso não autorizado. Apenas administradores e desenvolvedores podem gerenciar a equipe.')
  }

  return user.id
}

/**
 * Cria um novo membro na equipe utilizando o cliente administrativo do Supabase
 */
export async function createTeamMember(formData: FormData) {
  try {
    // 1. Validar permissões
    await requireAdminRole()
    
    // 2. Coletar dados do formulário
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!fullName || !email || !password || !role) {
      return { success: false, error: 'Preencha todos os campos.' }
    }

    if (password.length < 6) {
      return { success: false, error: 'A senha deve conter pelo menos 6 caracteres.' }
    }

    // 3. Criar usuário administrativamente
    const adminClient = createAdminClient()
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar e-mail
      user_metadata: {
        full_name: fullName,
        role: role
      }
    })

    if (error) {
      console.error('Error creating user via Admin API:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/team')
    return { success: true }
  } catch (err: any) {
    console.error('Error in createTeamMember:', err)
    return { success: false, error: err.message || 'Erro interno do servidor.' }
  }
}

/**
 * Obtém a lista estendida de todos os membros cadastrados na tabela profiles
 */
export async function getTeamMembersExtended() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email, avatar_url, created_at')
      .order('full_name')

    if (error) {
      console.error('Error fetching extended team members:', error)
      return []
    }

    return data || []
  } catch (e) {
    console.error('Error in getTeamMembersExtended:', e)
    return []
  }
}
