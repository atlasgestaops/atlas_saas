'use client'

export function ListView({ projects }: { projects: any[] }) {
  const phases = ['Discovery', 'Proposta', 'Design', 'Dev', 'Testes', 'Deploy']

  return (
    <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/20 border-b border-white/5 text-zinc-400">
          <tr>
            <th className="font-medium p-4 pl-6">Projeto</th>
            <th className="font-medium p-4">Cliente</th>
            <th className="font-medium p-4">Tipo</th>
            <th className="font-medium p-4 w-[400px]">Progresso (Fases)</th>
            <th className="font-medium p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projects.map(project => (
            <tr key={project.id} data-project-id={project.id} className="hover:bg-white/[0.02] cursor-pointer transition-colors">
              <td className="p-4 pl-6 font-medium text-zinc-200">{project.name}</td>
              <td className="p-4 text-zinc-400">{project.clients?.name}</td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  {project.types?.map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-400 capitalize border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4">
                <div className="relative h-2 w-full bg-black rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.max(5, (project.current_phase / 5) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 px-1">
                  {phases.map((phase, idx) => (
                    <span key={idx} className={idx <= project.current_phase ? 'text-blue-400 font-medium' : ''}>
                      {idx === project.current_phase ? `▶ ${phase}` : phase}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-4">
                <span className={`text-xs px-2 py-1 rounded ${
                    project.status === 'on-track' ? 'bg-green-500/10 text-green-500' :
                    project.status === 'delayed' ? 'bg-red-500/10 text-red-500' :
                    project.status === 'attention' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-white/10 text-zinc-400'
                  }`}>
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-zinc-500">
                Nenhum projeto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
