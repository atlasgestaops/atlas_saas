import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata = {
  title: 'AtlasOps — Torre de Controle',
  description: 'Sistema centralizado para gestão operacional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
