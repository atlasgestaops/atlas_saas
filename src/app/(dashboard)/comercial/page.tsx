import { getDeals, getClients, seedMockDeals } from './actions'
import { ComercialClientPage } from './ComercialClientPage'

export const revalidate = 0 // Forçar busca em tempo real sem cache agressivo do Next.js

export default async function ComercialPage() {
  let deals = await getDeals()
  const clients = await getClients()

  // Se o funil de vendas estiver vazio, rodar o seed automático
  if (deals.length === 0) {
    console.log('Nenhum negócio comercial encontrado. Rodando seed de demonstração...')
    const seedResult = await seedMockDeals()
    if (seedResult.success) {
      deals = await getDeals()
    }
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-w-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-outfit text-white mb-1.5">Módulo Comercial</h1>
        <p className="text-sm text-zinc-400">Gerencie leads, agende discoveries, calibres objeções e acompanhe o pipeline de vendas.</p>
      </div>
      
      <ComercialClientPage initialDeals={deals} clients={clients} />
    </div>
  )
}
