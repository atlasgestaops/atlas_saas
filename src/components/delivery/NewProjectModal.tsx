'use client'

import { useState, useTransition } from 'react'
import { createProject } from '@/app/(dashboard)/delivery/actions'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const services = [
    { id: 'automation', label: 'Automação (RPA / IA)' },
    { id: 'website', label: 'Website / Landing Page' },
    { id: 'saas', label: 'SaaS / Web App' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'traffic', label: 'Tráfego Pago' },
  ]

  const toggleType = (id: string) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedTypes.length === 0) {
      alert("Selecione ao menos um tipo de serviço")
      return
    }

    const formData = new FormData(e.currentTarget)
    // append types as JSON or comma separated so server can parse it
    formData.append('types', JSON.stringify(selectedTypes))
    
    startTransition(async () => {
      await createProject(formData)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#111113] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-outfit text-white">Novo Projeto</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Cliente / Empresa</label>
              <Input name="clientName" required placeholder="Ex: Acme Corp" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Projeto</label>
              <Input name="projectName" required placeholder="Ex: Portal de Vendas" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">Tipos de Serviço (Múltipla Seleção)</label>
            <div className="grid grid-cols-2 gap-3">
              {services.map(svc => {
                const isSelected = selectedTypes.includes(svc.id)
                return (
                  <div 
                    key={svc.id}
                    onClick={() => toggleType(svc.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-blue-500/10 border-blue-500 text-white' 
                        : 'bg-[#18181b] border-white/5 text-zinc-400 hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-zinc-600 bg-black/50'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-medium">{svc.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending || selectedTypes.length === 0}>
              {isPending ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
