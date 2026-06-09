'use client'

import { X, CheckCircle2, Circle, Paperclip, Link as LinkIcon, FileText, UserCircle, Calendar } from 'lucide-react'
import { useState, useEffect, useTransition } from 'react'
import { getProjectTasks, toggleTask, updateProjectPhase, getTeamMembers, updateTaskField, updateTaskAssignment, updateTaskDueDate } from '@/app/(dashboard)/delivery/actions'

function TaskItem({ task, team, onChange }: { task: any, team: any[], onChange: (task: any) => void }) {
  const [fieldValue, setFieldValue] = useState(task.field_value || '')
  
  const handleToggleDone = async () => {
    const newVal = !task.is_done
    onChange({ ...task, is_done: newVal })
    if (task.field_type === 'checkbox') {
      await toggleTask(task.id, newVal)
    } else {
      await updateTaskField(task.id, newVal, fieldValue)
    }
  }

  const handleFieldBlur = async () => {
    if (fieldValue !== task.field_value) {
      onChange({ ...task, field_value: fieldValue })
      await updateTaskField(task.id, task.is_done, fieldValue)
    }
  }

  const handleAssign = async (userId: string) => {
    const newVal = userId === 'unassigned' ? null : userId
    onChange({ ...task, assigned_to: newVal })
    await updateTaskAssignment(task.id, newVal)
  }

  const handleDateChange = async (date: string) => {
    const newVal = date || null
    onChange({ ...task, due_date: newVal })
    await updateTaskDueDate(task.id, newVal)
  }

  return (
    <div className={`p-4 rounded-xl border transition-colors ${task.is_done ? 'bg-blue-500/5 border-blue-500/20' : 'bg-[#18181b] border-white/5'}`}>
      <div className="flex items-start gap-3">
        <button className="mt-0.5 focus:outline-none" onClick={handleToggleDone}>
          {task.is_done ? (
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          ) : (
            <Circle className="w-5 h-5 text-zinc-500" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${task.is_done ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
            {task.description}
          </div>
          
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Responsável */}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-md px-2 py-1.5 border border-white/5">
              <UserCircle className="w-3.5 h-3.5 text-zinc-500" />
              <select 
                value={task.assigned_to || 'unassigned'} 
                onChange={(e) => handleAssign(e.target.value)}
                className="bg-transparent text-xs text-zinc-400 focus:outline-none focus:text-white cursor-pointer w-28 truncate"
              >
                <option value="unassigned">Sem responsável</option>
                {team.map(member => (
                  <option key={member.id} value={member.id}>{member.full_name}</option>
                ))}
              </select>
            </div>

            {/* Prazo */}
            <div className="flex items-center gap-1.5 bg-black/40 rounded-md px-2 py-1.5 border border-white/5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="date" 
                value={task.due_date || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent text-xs text-zinc-400 focus:outline-none focus:text-white cursor-text w-[110px]"
              />
            </div>
          </div>

          {/* Campo Especial Baseado no Tipo */}
          {task.field_type !== 'checkbox' && (
            <div className="mt-3">
              {task.field_type === 'text' && (
                <div className="flex gap-2 items-start bg-black/20 p-1.5 rounded-lg border border-white/5">
                  <FileText className="w-4 h-4 text-zinc-500 mt-1.5 ml-1" />
                  <textarea
                    placeholder="Adicione notas, credenciais ou detalhes da entrega..."
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="w-full bg-transparent border-none p-1 text-xs text-zinc-300 focus:outline-none focus:ring-0 min-h-[60px] resize-y"
                  />
                </div>
              )}
              {task.field_type === 'link' && (
                <div className="flex gap-2 items-center bg-black/20 p-1.5 rounded-lg border border-white/5">
                  <LinkIcon className="w-4 h-4 text-zinc-500 ml-1" />
                  <input
                    type="url"
                    placeholder="Cole a URL do documento, repo ou design..."
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="flex-1 bg-transparent border-none p-1 text-xs text-zinc-300 focus:outline-none focus:ring-0"
                  />
                  {fieldValue && (
                    <a href={fieldValue} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 bg-blue-500/10 rounded mr-1">Abrir Link</a>
                  )}
                </div>
              )}
              {task.field_type === 'file' && (
                <div className="flex gap-2 items-center bg-black/20 p-1.5 rounded-lg border border-white/5">
                  <Paperclip className="w-4 h-4 text-zinc-500 ml-1" />
                  <input
                    type="url"
                    placeholder="Cole o link do anexo ou Google Drive..."
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="flex-1 bg-transparent border-none p-1 text-xs text-zinc-300 focus:outline-none focus:ring-0"
                  />
                   {fieldValue && (
                    <a href={fieldValue} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors px-2 py-1 bg-white/5 rounded mr-1">Acessar</a>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export function ProjectDrawer({ project, onClose }: { project: any, onClose: () => void }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [viewingPhase, setViewingPhase] = useState(project?.current_phase || 0)
  const [lastProjectId, setLastProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (project) {
      if (project.id !== lastProjectId) {
        setViewingPhase(project.current_phase)
        setLastProjectId(project.id)
      }
      
      setLoading(true)
      Promise.all([
        getProjectTasks(project.id),
        getTeamMembers()
      ]).then(([tasksData, teamData]) => {
        setTasks(tasksData)
        setTeam(teamData)
        setLoading(false)
      })
    }
  }, [project?.id])

  if (!project) return null

  const handleTaskChange = (updatedTask: any) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
  }

  const phaseNames = ['Diagnóstico', 'Escopo', 'Desenho', 'Construção', 'Validação', 'Ativação']
  
  const viewedTasks = tasks.filter(t => t.phase === viewingPhase)
  const currentPhaseTasks = tasks.filter(t => t.phase === project.current_phase)
  const allCurrentPhaseTasksDone = currentPhaseTasks.length > 0 && currentPhaseTasks.every(t => t.is_done)
  const isFinalPhase = project.current_phase === 5

  // Links e arquivos preenchidos de todas as fases para o Cofre
  const vaultLinks = tasks.filter(t => (t.field_type === 'link' || t.field_type === 'file') && t.field_value && t.field_value.trim() !== '')
  // Notas e credenciais de todas as fases para o Cofre
  const vaultTexts = tasks.filter(t => t.field_type === 'text' && t.field_value && t.field_value.trim() !== '')

  const handleAdvancePhase = () => {
    if (!allCurrentPhaseTasksDone || isFinalPhase) return
    startTransition(async () => {
      await updateProjectPhase(project.id, project.current_phase + 1)
      onClose() // Fechar a gaveta para forçar a atualização visual
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 left-0 md:left-[280px] z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-[1050px] h-full bg-[#111113] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{project.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-zinc-400">{project.clients?.name}</span>
              <span className="text-zinc-600">•</span>
              <div className="flex gap-1 flex-wrap max-w-[600px]">
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

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          
          {/* Coluna Esquerda: O Cofre / Visão Global */}
          <div className="w-full md:w-[420px] shrink-0 border-r border-white/5 bg-[#0b0b0c] p-6 overflow-y-auto flex flex-col gap-6" style={{ scrollbarWidth: 'thin' }}>
            
            {/* Status do Projeto */}
            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status do Projeto</div>
                <div className="text-sm font-semibold text-white mt-1.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  Fase Atual: {phaseNames[project.current_phase]}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {allCurrentPhaseTasksDone 
                    ? 'Checklist completo! Pronto para avançar.' 
                    : 'Conclua o checklist da fase para avançar.'}
                </div>
              </div>
              {!isFinalPhase && (
                <button 
                  onClick={handleAdvancePhase}
                  disabled={!allCurrentPhaseTasksDone || isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {isPending ? 'Avançando...' : 'Avançar para Próxima Fase'}
                </button>
              )}
            </div>

            {/* Cofre de Links e Arquivos */}
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                Cofre de Links e Arquivos
              </h3>
              {vaultLinks.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 px-3 bg-white/[0.02] rounded-xl border border-white/5 border-dashed text-center">
                  Nenhum link ou documento anexado ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {vaultLinks.map(t => (
                    <a 
                      key={t.id}
                      href={t.field_value} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="group block p-3 bg-black/40 hover:bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{t.description}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{t.field_value}</div>
                        </div>
                        <div className="shrink-0 text-[10px] font-medium text-blue-400 group-hover:text-blue-300 transition-colors px-2 py-1 bg-blue-500/10 rounded-md flex items-center gap-1">
                          {t.field_type === 'file' ? <Paperclip className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                          Abrir
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-medium">
                          Fase {t.phase}: {phaseNames[t.phase]}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Notas e Credenciais */}
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Notas & Credenciais
              </h3>
              {vaultTexts.length === 0 ? (
                <div className="text-xs text-zinc-500 py-6 px-3 bg-white/[0.02] rounded-xl border border-white/5 border-dashed text-center">
                  Nenhuma nota ou credencial salva ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {vaultTexts.map(t => (
                    <div key={t.id} className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-zinc-300 truncate">{t.description}</div>
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-medium shrink-0">
                          Fase {t.phase}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 whitespace-pre-wrap bg-zinc-900/60 p-2.5 rounded-lg font-mono border border-white/[0.02] select-all break-all max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {t.field_value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Coluna Direita: Checklist / Operações */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6" style={{ scrollbarWidth: 'thin' }}>
            
            {/* Phase Navigation Tabs */}
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">Etapas do Projeto</h3>
              <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {phaseNames.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => setViewingPhase(idx)}
                    className={`px-3 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                      viewingPhase === idx 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : idx < project.current_phase
                          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          : idx === project.current_phase
                            ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                            : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                  >
                    {idx}. {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                {viewingPhase === project.current_phase ? 'Checklist Atual' : `Checklist - ${phaseNames[viewingPhase]}`}
              </h3>
              
              {loading ? (
                <div className="text-sm text-zinc-500 text-center py-6 bg-white/5 rounded-xl border border-white/5">
                  Carregando tarefas e time...
                </div>
              ) : viewedTasks.length === 0 ? (
                <div className="text-sm text-zinc-500 text-center py-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
                  Nenhuma tarefa mapeada nesta fase.
                </div>
              ) : (
                <div className="space-y-3">
                  {viewedTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      team={team} 
                      onChange={handleTaskChange} 
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
