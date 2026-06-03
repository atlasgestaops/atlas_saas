'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/delivery/KanbanBoard'
import { ListView } from '@/components/delivery/ListView'
import { ProjectDrawer } from '@/components/delivery/ProjectDrawer'
import { NewProjectModal } from '@/components/delivery/NewProjectModal'
import { LayoutGrid, List } from 'lucide-react'

export function DeliveryClientPage({ initialProjects }: { initialProjects: any[] }) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        </div>

        <div className="flex gap-3">
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

      <div onClick={(e) => {
        // Simple delegator for project clicks
        const target = e.target as HTMLElement
        const card = target.closest('[data-project-id]')
        if (card) {
          const id = card.getAttribute('data-project-id')
          const proj = initialProjects.find(p => p.id === id)
          if (proj) setSelectedProject(proj)
        }
      }}>
        {view === 'kanban' ? (
          <KanbanBoard projects={initialProjects} />
        ) : (
          <ListView projects={initialProjects} />
        )}
      </div>

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
