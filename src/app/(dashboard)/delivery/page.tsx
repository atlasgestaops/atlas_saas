import { getProjects } from './actions'
import { DeliveryClientPage } from './DeliveryClientPage'

export default async function DeliveryPage() {
  const projects = await getProjects()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit mb-2">Delivery</h1>
        <p className="text-zinc-400">Gestão e acompanhamento de todos os projetos em andamento.</p>
      </div>

      <DeliveryClientPage initialProjects={projects} />
    </div>
  )
}
