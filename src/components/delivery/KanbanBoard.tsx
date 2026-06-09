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

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evitar drag se clicar dentro de um card de projeto para não travar a abertura dele
    const target = e.target as HTMLElement
    if (target.closest('[data-project-id]')) return

    setIsMouseDown(true)
    const container = e.currentTarget
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsMouseDown(false)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return
    e.preventDefault()
    const container = e.currentTarget
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 1.5 // Sensibilidade do arraste
    container.scrollLeft = scrollLeft - walk
  }

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 h-[calc(100vh-200px)] cursor-grab ${
        isMouseDown ? 'cursor-grabbing select-none' : ''
      }`}
      style={{ scrollbarWidth: 'thin' }}
    >
      {phases.map(phase => (
        <div key={phase.id} className="min-w-[260px] max-w-[260px] flex flex-col bg-[#111113]/50 rounded-xl border border-white/5 p-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-xs text-zinc-300">{phase.name}</h3>
            <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-zinc-500 font-semibold">
              {projects.filter(p => p.current_phase === phase.id).length}
            </span>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {projects.filter(p => p.current_phase === phase.id).map(project => (
              <div 
                key={project.id} 
                data-project-id={project.id}
                className="bg-[#18181b] border border-white/10 rounded-lg p-3.5 cursor-pointer hover:border-blue-500/50 transition-colors select-none"
              >
                <div className="text-[10px] text-zinc-500 mb-1 truncate">{project.clients?.name || 'Sem cliente'}</div>
                <div className="font-medium text-xs text-zinc-200 mb-2.5 truncate">{project.name}</div>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {project.types?.map((t: string) => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 capitalize border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
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
