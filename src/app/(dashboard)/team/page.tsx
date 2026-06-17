import { redirect } from 'next/navigation'
import { getUserRole } from '@/app/(dashboard)/delivery/actions'
import { getTeamMembersExtended } from './actions'
import { TeamClientPage } from './TeamClientPage'

export default async function TeamPage() {
  // 1. Validar se o usuário logado tem permissão para gerenciar a equipe
  const role = await getUserRole()
  if (!['admin', 'dev', 'gestao'].includes(role)) {
    redirect('/delivery')
  }

  // 2. Buscar a lista estendida de perfis da equipe
  const members = await getTeamMembersExtended()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit mb-2">Equipe</h1>
        <p className="text-zinc-400">Gerenciamento de membros da equipe, cadastros e atribuições de funções.</p>
      </div>

      <TeamClientPage initialMembers={members} />
    </div>
  )
}
