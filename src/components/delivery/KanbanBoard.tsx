'use client'

import { useState } from 'react'

export function KanbanBoard({ projects }: { projects: any[] }) {
  const phases = [
    { id: 0, name: 'Diagnóstico' },
    { id: 1, name: 'Escopo' },
    { id: 2, name: 'Desenho' },
    { id: 3, name: 'Construção' },
    { id: 4, name: 'Validação' },
    { id: 5, name: 'Ativação' },
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 h-[calc(100vh-200px)]">
      {phases.map(phase => (
        <div key={phase.id} className="min-w-[300px] flex flex-col bg-[#111113]/50 rounded-xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-zinc-300">{phase.name}</h3>
            <span className="text-xs bg-black/50 px-2 py-1 rounded text-zinc-500">
              {projects.filter(p => p.current_phase === phase.id).length}
            </span>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {projects.filter(p => p.current_phase === phase.id).map(project => (
              <div 
                key={project.id} 
                data-project-id={project.id}
                className="bg-[#18181b] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors"
              >
                <div className="text-xs text-zinc-500 mb-1">{project.clients?.name || 'Sem cliente'}</div>
                <div className="font-medium text-sm text-zinc-200 mb-3">{project.name}</div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.types?.map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 capitalize border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'on-track' ? 'bg-green-500/10 text-green-500' :
                    project.status === 'delayed' ? 'bg-red-500/10 text-red-500' :
                    project.status === 'attention' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-white/10 text-zinc-400'
                  }`}>
                    {project.status === 'on-track' ? 'No Prazo' :
                     project.status === 'delayed' ? 'Atrasado' :
                     project.status === 'attention' ? 'Atenção' :
                     project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
