'use client'

import { useState, useTransition } from 'react'
import { createTeamMember } from './actions'
import { User, Mail, Shield, Key, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Member {
  id: string
  full_name: string
  role: string
  email: string | null
  avatar_url: string | null
  created_at: string
}

const roleBadges: Record<string, { label: string; style: string }> = {
  gestao: { label: 'Gestão', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  dev: { label: 'Dev / RPA', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  comercial: { label: 'Comercial / CS', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  admin: { label: 'Admin', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
}

export function TeamClientPage({ initialMembers }: { initialMembers: Member[] }) {
  const [members] = useState<Member[]>(initialMembers)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const res = await createTeamMember(formData)
      if (res.success) {
        setSuccessMsg('Membro cadastrado com sucesso!')
        form.reset()
        // Recarregar a página para atualizar a lista através do Server Component
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setErrorMsg(res.error || 'Ocorreu um erro ao cadastrar.')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulário de Cadastro */}
      <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 h-fit shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Novo Membro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <Input 
                name="fullName" 
                required 
                placeholder="Ex: Lucas Detlef" 
                className="pl-9 bg-[#18181b] border-white/5 text-zinc-300 focus:border-blue-500 w-full" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">E-mail corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <Input 
                type="email" 
                name="email" 
                required 
                placeholder="email@atlasbot.tech" 
                className="pl-9 bg-[#18181b] border-white/5 text-zinc-300 focus:border-blue-500 w-full" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Senha Inicial</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <Input 
                type="password" 
                name="password" 
                required 
                placeholder="Mínimo 6 caracteres" 
                className="pl-9 bg-[#18181b] border-white/5 text-zinc-300 focus:border-blue-500 w-full" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Função / Papel</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <select
                name="role"
                required
                className="w-full bg-[#18181b] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500 cursor-pointer h-10"
              >
                <option value="comercial">Comercial / CS</option>
                <option value="dev">Dev / RPA</option>
                <option value="gestao">Gestão</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
              {successMsg}
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors mt-2 h-10 rounded-lg">
            {isPending ? 'Cadastrando...' : 'Cadastrar Membro'}
          </Button>
        </form>
      </div>

      {/* Lista de Membros */}
      <div className="lg:col-span-2 bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-100 mb-6">Membros da Equipe</h2>

        <div className="space-y-4">
          {members.map(member => {
            const roleInfo = roleBadges[member.role] || { label: member.role, style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
            const initials = member.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            const dateJoined = new Date(member.created_at).toLocaleDateString('pt-BR')

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-[#18181b] border border-white/5 rounded-xl hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-outfit text-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-200 truncate">{member.full_name}</h3>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{member.email || 'Sem e-mail cadastrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded border capitalize font-semibold tracking-wider ${roleInfo.style}`}>
                      {roleInfo.label}
                    </span>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Entrou em {dateJoined}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
