export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit mb-2">Visão Geral</h1>
        <p className="text-zinc-400">Bem-vindo à Torre de Controle AtlasOps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-2">Projetos Ativos</div>
          <div className="text-3xl font-bold">12</div>
        </div>
        
        <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-2">Leads em Negociação</div>
          <div className="text-3xl font-bold">5</div>
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
          <div className="text-zinc-400 text-sm mb-2">Saúde Geral (CS)</div>
          <div className="text-3xl font-bold text-green-500">92%</div>
        </div>
      </div>
    </div>
  )
}
