'use client'

import { useState, useTransition } from 'react'
import { toggleTask } from '@/app/(dashboard)/delivery/actions'
import { Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'

interface Task {
  id: string
  description: string
  is_done: boolean
  phase: number
  task_index: number
}

interface ProjectGroup {
  project_id: string
  project_name: string
  client_name: string
  types: string[]
  current_phase: number
  estimated_end_date: string | null
  status: string
  tasks: Task[]
}

const phases = ['Diagnóstico', 'Escopo', 'Desenho', 'Construção', 'Validação', 'Ativação']

const typeColors: Record<string, string> = {
  automation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  website: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  saas: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  ecommerce: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  traffic: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr)
  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getUrgencyInfo(days: number | null): { color: string; borderColor: string; label: string; icon: string } {
  if (days === null) return { color: 'text-zinc-500', borderColor: 'border-l-zinc-600', label: 'Sem prazo', icon: '⏸️' }
  if (days < 0) return { color: 'text-red-400', borderColor: 'border-l-red-500', label: `${Math.abs(days)}d atrasado`, icon: '🔴' }
  if (days <= 3) return { color: 'text-red-400', borderColor: 'border-l-red-500', label: `${days}d restantes`, icon: '🔴' }
  if (days <= 7) return { color: 'text-yellow-400', borderColor: 'border-l-yellow-500', label: `${days}d restantes`, icon: '🟡' }
  return { color: 'text-green-400', borderColor: 'border-l-green-500', label: `${days}d restantes`, icon: '🟢' }
}

export function MyTasks({ projectGroups }: { projectGroups: ProjectGroup[] }) {
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const toggleCollapse = (projectId: string) => {
    setCollapsedProjects(prev => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const handleToggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev)
      next.add(taskId)
      return next
    })

    startTransition(async () => {
      await toggleTask(taskId, true)
    })
  }

  // Sort by urgency (most urgent first)
  const sorted = [...projectGroups].sort((a, b) => {
    const daysA = getDaysRemaining(a.estimated_end_date)
    const daysB = getDaysRemaining(b.estimated_end_date)
    if (daysA === null && daysB === null) return 0
    if (daysA === null) return 1
    if (daysB === null) return -1
    return daysA - daysB
  })

  const totalPending = sorted.reduce((sum, g) => sum + g.tasks.filter(t => !completedTasks.has(t.id)).length, 0)
  const urgentProjects = sorted.filter(g => {
    const d = getDaysRemaining(g.estimated_end_date)
    return d !== null && d <= 7
  }).length

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500/30 mb-4" />
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">Tudo em dia! 🎉</h3>
        <p className="text-zinc-500 max-w-md">
          Você não tem tarefas pendentes atribuídas a você no momento. 
          Aproveite para revisar os projetos no Kanban ou na Lista.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Tarefas Pendentes</p>
          <p className="text-2xl font-bold text-zinc-100 font-outfit">{totalPending}</p>
        </div>
        <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Projetos Ativos</p>
          <p className="text-2xl font-bold text-zinc-100 font-outfit">{sorted.length}</p>
        </div>
        <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Urgentes</p>
          <p className={`text-2xl font-bold font-outfit ${urgentProjects > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {urgentProjects}
          </p>
        </div>
      </div>

      {/* Project groups */}
      <div className="space-y-4">
        {sorted.map(group => {
          const days = getDaysRemaining(group.estimated_end_date)
          const urgency = getUrgencyInfo(days)
          const isCollapsed = collapsedProjects.has(group.project_id)
          const pendingTasks = group.tasks.filter(t => !completedTasks.has(t.id))
          const completedCount = group.tasks.length - pendingTasks.length

          return (
            <div
              key={group.project_id}
              className={`bg-[#111113] border border-white/5 rounded-xl overflow-hidden border-l-4 ${urgency.borderColor} transition-all duration-300`}
            >
              {/* Project header */}
              <button
                onClick={() => toggleCollapse(group.project_id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  )}
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{urgency.icon}</span>
                      <h3 className="font-semibold text-zinc-200 truncate">{group.project_name}</h3>
                      <span className="text-zinc-500 text-sm">— {group.client_name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-zinc-500">
                        Fase: <span className="text-zinc-400">{phases[group.current_phase]}</span>
                      </span>
                      <span className="text-xs text-zinc-600">·</span>
                      <span className={`text-xs ${urgency.color} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" />
                        {urgency.label}
                      </span>
                      <span className="text-xs text-zinc-600">·</span>
                      <div className="flex gap-1">
                        {group.types?.map(t => (
                          <span
                            key={t}
                            className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${typeColors[t] || 'bg-white/5 text-zinc-400 border-white/10'}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-zinc-500">
                    {completedCount}/{group.tasks.length} concluídas
                  </span>
                  <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${group.tasks.length > 0 ? (completedCount / group.tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Tasks */}
              {!isCollapsed && (
                <div className="border-t border-white/5 divide-y divide-white/[0.03]">
                  {pendingTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-all duration-200 group"
                    >
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        disabled={isPending}
                        className="flex-shrink-0 w-5 h-5 rounded border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition-colors flex items-center justify-center group-hover:border-white/20"
                      >
                        <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-blue-400 transition-colors" />
                      </button>
                      <span className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">
                        {task.description}
                      </span>
                      <span className="text-[10px] text-zinc-600 ml-auto">
                        {phases[task.phase]}
                      </span>
                    </div>
                  ))}

                  {pendingTasks.length === 0 && (
                    <div className="px-6 py-4 text-center">
                      <span className="text-sm text-green-500/70 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Todas as tarefas deste projeto foram concluídas!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
