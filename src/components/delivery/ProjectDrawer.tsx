'use client'

import { X, CheckCircle2, Circle } from 'lucide-react'
import { useState, useEffect, useTransition } from 'react'
import { getProjectTasks, toggleTask, updateProjectPhase } from '@/app/(dashboard)/delivery/actions'

export function ProjectDrawer({ project, onClose }: { project: any, onClose: () => void }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (project) {
      setLoading(true)
      getProjectTasks(project.id).then(data => {
        setTasks(data)
        setLoading(false)
      })
    }
  }, [project])

  if (!project) return null

  const handleToggle = async (task: any) => {
    const newVal = !task.is_done
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: newVal } : t))
    await toggleTask(task.id, newVal)
  }

  const phaseTasks = tasks.filter(t => t.phase === project.current_phase)
  const allPhaseTasksDone = phaseTasks.length > 0 && phaseTasks.every(t => t.is_done)
  const isFinalPhase = project.current_phase === 5

  const handleAdvancePhase = () => {
    if (!allPhaseTasksDone || isFinalPhase) return
    startTransition(async () => {
      await updateProjectPhase(project.id, project.current_phase + 1)
      onClose() // Fechar a gaveta pra forçar a atualização visual (ou poderia usar roteamento)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-[500px] h-full bg-[#111113] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">{project.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-zinc-400">{project.clients?.name}</span>
              <span className="text-zinc-600">•</span>
              <div className="flex gap-1">
                {project.types?.map((t: string) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 capitalize border border-white/5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Status Atual</h3>
            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-white">Fase {project.current_phase}</div>
                <div className="text-xs mt-1 text-zinc-400">
                  {allPhaseTasksDone 
                    ? 'Checklist completo! Pronto para avançar.' 
                    : 'Conclua o checklist abaixo para liberar a próxima fase.'}
                </div>
              </div>
              {!isFinalPhase && (
                <button 
                  onClick={handleAdvancePhase}
                  disabled={!allPhaseTasksDone || isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {isPending ? 'Avançando...' : 'Avançar Fase'}
                </button>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Checklist da Fase</h3>
            
            {loading ? (
              <div className="text-sm text-zinc-500 text-center py-4">Carregando tarefas...</div>
            ) : phaseTasks.length === 0 ? (
              <div className="text-sm text-zinc-500 text-center py-4 bg-white/5 rounded-lg border border-white/5 border-dashed">
                Nenhuma tarefa para esta fase.
              </div>
            ) : (
              <div className="space-y-2">
                {phaseTasks.map(task => (
                  <label 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${task.is_done ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#18181b] border-white/5 hover:border-white/10'}`}
                  >
                    <div className="mt-0.5" onClick={() => handleToggle(task)}>
                      {task.is_done ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div className={`text-sm ${task.is_done ? 'text-zinc-300 line-through' : 'text-zinc-200'}`}>
                      {task.description}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
