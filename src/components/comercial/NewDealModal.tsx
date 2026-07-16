'use client'

import { useState, useTransition } from 'react'
import { createDeal } from '@/app/(dashboard)/comercial/actions'
import { X } from 'lucide-react'

interface Client {
  id: string
  name: string
}

export function NewDealModal({ 
  clients, 
  onClose 
}: { 
  clients: Client[]
  onClose: () => void 
}) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [estimatedMrr, setEstimatedMrr] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [nextActionDate, setNextActionDate] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMessage('Por favor, informe o título da oportunidade.')
      return
    }

    setErrorMessage(null)

    startTransition(async () => {
      const res = await createDeal({
        title,
        clientId: clientId || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        estimatedMrr: estimatedMrr ? parseFloat(estimatedMrr) : null,
        nextAction: nextAction || null,
        nextActionDate: nextActionDate || null,
        notes: notes || null
      })

      if (res.success) {
        onClose()
      } else {
        setErrorMessage(res.error || 'Erro ao criar oportunidade.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-[#111113] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold font-outfit text-white">Novo Lead / Oportunidade</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Título da Oportunidade *</label>
            <input
              type="text"
              required
              placeholder="Ex: Robô Conciliação Bancária"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Cliente / Empresa Associada</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#18181b] text-zinc-500">Sem Empresa / Lead Avulso</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-[#18181b] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Valor Estimado (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 15000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">MRR Mensal (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 1800"
                value={estimatedMrr}
                onChange={(e) => setEstimatedMrr(e.target.value)}
                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Próxima Ação</label>
              <input
                type="text"
                placeholder="Ex: Enviar proposta"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Data da Próxima Ação</label>
              <input
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
                className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors cursor-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Notas Iniciais</label>
            <textarea
              placeholder="Descreva detalhes como dores do cliente, budget ou escopo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#18181b] border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors min-h-[70px] max-h-[140px] resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              {isPending ? 'Criando...' : 'Criar Oportunidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
