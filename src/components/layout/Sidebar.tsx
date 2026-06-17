'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { 
  Briefcase, 
  Rocket, 
  Handshake, 
  Megaphone, 
  Coins, 
  Calendar, 
  Gavel,
  LogOut,
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Comercial', href: '/comercial', icon: Briefcase },
  { name: 'Projetos', href: '/delivery', icon: Rocket },
  { name: 'Customer Success', href: '/cs', icon: Handshake },
  { name: 'Marketing', href: '/marketing', icon: Megaphone },
  { name: 'Precificação', href: '/precificacao', icon: Coins },
  { name: 'Planejamento', href: '/planejamento', icon: Calendar },
  { name: 'Contratos', href: '/contratos', icon: Gavel },
]

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()

  const isAdmin = userRole && ['admin', 'dev', 'gestao'].includes(userRole)
  const currentNavigation = [
    ...navigation,
    ...(isAdmin ? [{ name: 'Equipe', href: '/team', icon: Users }] : [])
  ]

  return (
    <aside className="w-[240px] shrink-0 bg-[#18181b] border-r border-white/10 sticky top-0 h-screen flex flex-col p-5 overflow-y-auto z-50">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold">
          ∞
        </div>
        <div className="text-xl font-bold font-outfit">AtlasOps</div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {currentNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-500 font-medium' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="pt-6 mt-6 border-t border-white/10">
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  )
}
