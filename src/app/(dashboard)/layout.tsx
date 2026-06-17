import { Sidebar } from '@/components/layout/Sidebar'
import { getUserRole } from '@/app/(dashboard)/delivery/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={role} />
      <main className="flex-1 p-12 max-w-7xl min-w-0">
        {children}
      </main>
    </div>
  )
}
