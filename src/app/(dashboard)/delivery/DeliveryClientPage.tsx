'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/delivery/KanbanBoard'
import { ListView } from '@/components/delivery/ListView'
import { MyTasks } from '@/components/delivery/MyTasks'
import { ProjectDrawer } from '@/components/delivery/ProjectDrawer'
import { NewProjectModal } from '@/components/delivery/NewProjectModal'
import { LayoutGrid, List, ClipboardCheck } from 'lucide-react'

export function DeliveryClientPage({ initialProjects, initialMyTasks }: { initialProjects: any[]; initialMyTasks: any[] }) {
  const [view, setView] = useState<'kanban' | 'list' | 'mytasks'>('kanban')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const filteredProjects = showArchived 
    ? initialProjects 
    : initialProjects.filter(p => p.status === 'on-track' || p.status === 'attention' || p.status === 'delayed')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-[#111113] border border-white/5 rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === 'kanban' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === 'list' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <List className="w-4 h-4" />
            Lista
          </button>
          <button
            onClick={() => setView('mytasks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === 'mytasks' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Minhas Tarefas
            {initialMyTasks.length > 0 && (
              <span className="ml-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {initialMyTasks.reduce((sum: number, g: any) => sum + g.tasks.length, 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-[#111113] border border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-400 cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
            />
            Mostrar Arquivados
          </label>
          <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Playbook
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Novo Projeto
          </button>
        </div>
      </div>

      {view === 'mytasks' ? (
        <MyTasks projectGroups={initialMyTasks} />
      ) : (
        <div onClick={(e) => {
          const target = e.target as HTMLElement
          const card = target.closest('[data-project-id]')
          if (card) {
            const id = card.getAttribute('data-project-id')
            const proj = initialProjects.find(p => p.id === id)
            if (proj) setSelectedProject(proj)
          }
        }}>
          {view === 'kanban' ? (
            <KanbanBoard projects={filteredProjects} />
          ) : (
            <ListView projects={filteredProjects} />
          )}
        </div>
      )}

      {selectedProject && (
        <ProjectDrawer 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {isModalOpen && (
        <NewProjectModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
