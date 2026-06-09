import { getProjects, getMyTasks } from './actions'
import { DeliveryClientPage } from './DeliveryClientPage'

export default async function DeliveryPage() {
  const [projects, myTasks] = await Promise.all([
    getProjects(),
    getMyTasks(),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit mb-2">Projetos</h1>
        <p className="text-zinc-400">Gestão e acompanhamento de todos os projetos em andamento.</p>
      </div>

      <DeliveryClientPage initialProjects={projects} initialMyTasks={myTasks} />
    </div>
  )
}
