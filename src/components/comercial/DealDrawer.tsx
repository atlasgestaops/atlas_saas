'use client'

import { X, DollarSign, Calendar, MessageSquare, ClipboardList, Phone, Mail, Users, ChevronRight, FileText, Settings } from 'lucide-react'
import { useState, useEffect, useTransition } from 'react'
import { updateDealStage, updateDeal, getDealActivities, addDealActivity } from '@/app/(dashboard)/comercial/actions'
import { playPopSound, playVictorySound } from '@/lib/audio'
import { triggerConfetti } from '@/lib/confetti'

interface Deal {
  id: string
  client_id: string | null
  title: string
  stage: string
  estimated_value: number | null
  estimated_mrr: number | null
  owner_id: string
  next_action: string | null
  next_action_date: string | null
  lost_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
  clients?: { id: string; name: string } | null
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  contacted: 'Contato Iniciado',
  meeting: 'Reunião Agendada',
  discovery: 'Discovery Realizado',
  proposal: 'Proposta Enviada',
  negotiation: 'Negociação',
  won: 'Contrato Assinado',
  lost: 'Negócio Perdido'
}

// Helpers para parse e formatação das notas de discovery em Markdown
function parseDiscoveryNotes(notes: string | null) {
  const defaultVal = { problema: '', impacto: '', expectativa: '', processo: '' }
  if (!notes) return defaultVal
  
  const problemaMatch = notes.match(/### 1\. Problema Central\n([\s\S]*?)(?=\n### 2\.|$)/)
  const impactoMatch = notes.match(/### 2\. Impacto Financeiro\/Tempo\n([\s\S]*?)(?=\n### 3\.|$)/)
  const expectativaMatch = notes.match(/### 3\. Expectativa da Solução\n([\s\S]*?)(?=\n### 4\.|$)/)
  const processoMatch = notes.match(/### 4\. Sistemas & Processo Atual\n([\s\S]*?)(?=$)/)
  
  return {
    problema: problemaMatch ? problemaMatch[1].trim() : '',
    impacto: impactoMatch ? impactoMatch[1].trim() : '',
    expectativa: expectativaMatch ? expectativaMatch[1].trim() : '',
    processo: processoMatch ? processoMatch[1].trim() : ''
  }
}

function formatDiscoveryNotes(vals: { problema: string; impacto: string; expectativa: string; processo: string }, otherNotes?: string) {
  const doc = `### 1. Problema Central
${vals.problema}

### 2. Impacto Financeiro/Tempo
${vals.impacto}

### 3. Expectativa da Solução
${vals.expectativa}

### 4. Sistemas & Processo Atual
${vals.processo}`

  if (otherNotes && !otherNotes.startsWith('### 1.')) {
    return doc + `\n\n### Observações Adicionais\n${otherNotes}`
  }
  return doc
}

export function DealDrawer({ 
  deal, 
  clients,
  onClose 
}: { 
  deal: Deal
  clients: any[]
  onClose: () => void 
}) {
  const [isPending, startTransition] = useTransition()
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [activeTab, setActiveTab] = useState<'timeline' | 'discovery'>('timeline')

  // Estados locais do Deal
  const [title, setTitle] = useState(deal.title)
  const [clientId, setClientId] = useState(deal.client_id || '')
  const [estimatedValue, setEstimatedValue] = useState(deal.estimated_value?.toString() || '')
  const [estimatedMrr, setEstimatedMrr] = useState(deal.estimated_mrr?.toString() || '')
  const [nextAction, setNextAction] = useState(deal.next_action || '')
  const [nextActionDate, setNextActionDate] = useState(deal.next_action_date || '')
  const [notes, setNotes] = useState(deal.notes || '')
  const [stage, setStage] = useState(deal.stage)

  // Motivo de perda
  const [lostReason, setLostReason] = useState(deal.lost_reason || '')
  const [showLostInput, setShowLostInput] = useState(deal.stage === 'lost')

  // Atividade rápida
  const [activityType, setActivityType] = useState<'note' | 'call' | 'email' | 'meeting'>('note')
  const [activityContent, setActivityContent] = useState('')

  // Discovery estruturado
  const [discovery, setDiscovery] = useState(parseDiscoveryNotes(deal.notes))

  // Carregar atividades
  useEffect(() => {
    setLoadingActivities(true)
    getDealActivities(deal.id).then(data => {
      setActivities(data)
      setLoadingActivities(false)
    })
  }, [deal.id])

  // Monitorar alterações nos campos do discovery
  const handleDiscoveryChange = (field: keyof typeof discovery, value: string) => {
    const updated = { ...discovery, [field]: value }
    setDiscovery(updated)
    
    // Formatar e salvar automaticamente no notes
    const formattedNotes = formatDiscoveryNotes(updated, notes)
    setNotes(formattedNotes)
    
    startTransition(async () => {
      await updateDeal(deal.id, {
        title,
        clientId: clientId || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        estimatedMrr: estimatedMrr ? parseFloat(estimatedMrr) : null,
        nextAction: nextAction || null,
        nextActionDate: nextActionDate || null,
        notes: formattedNotes
      })
    })
  }

  // Atualizar campo avulso (ao desfocar - blur)
  const handleFieldBlur = () => {
    startTransition(async () => {
      await updateDeal(deal.id, {
        title,
        clientId: clientId || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        estimatedMrr: estimatedMrr ? parseFloat(estimatedMrr) : null,
        nextAction: nextAction || null,
        nextActionDate: nextActionDate || null,
        notes
      })
    })
  }

  const handleStageChange = async (newStage: string) => {
    if (newStage === 'lost') {
      setShowLostInput(true)
      setStage(newStage)
      return
    }

    setShowLostInput(false)
    setStage(newStage)

    if (newStage === 'won') {
      // Comemoração épica
      playVictorySound()
      triggerConfetti(undefined, undefined, { goldOnly: true })
    } else {
      playPopSound()
    }

    startTransition(async () => {
      await updateDealStage(deal.id, newStage)
      const data = await getDealActivities(deal.id)
      setActivities(data)
    })
  }

  const handleSaveLostReason = () => {
    if (!lostReason.trim()) return
    startTransition(async () => {
      await updateDealStage(deal.id, 'lost', lostReason)
      const data = await getDealActivities(deal.id)
      setActivities(data)
    })
  }

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activityContent.trim()) return

    playPopSound()

    startTransition(async () => {
      const res = await addDealActivity(deal.id, activityType, activityContent)
      if (res.success) {
        setActivityContent('')
        const data = await getDealActivities(deal.id)
        setActivities(data)
      }
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 left-[240px] z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-[1050px] h-full bg-[#111113] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Oportunidade Comercial</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full capitalize">
                {stageLabels[stage] || stage}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleFieldBlur}
              className="text-lg font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full hover:bg-white/[0.02] rounded px-1 -ml-1"
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
          
          {/* Coluna Esquerda: Visão Geral & Métricas */}
          <div className="w-full md:w-[420px] shrink-0 border-r border-white/5 bg-[#0b0b0c] p-6 overflow-y-auto flex flex-col gap-6" style={{ scrollbarWidth: 'thin' }}>
            
            {/* Status & Funil */}
            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Estágio Comercial</label>
                <select
                  value={stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  className="w-full bg-[#111113] border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-200 font-medium focus:outline-none cursor-pointer"
                >
                  {Object.entries(stageLabels).map(([key, val]) => (
                    <option key={key} value={key} className="bg-[#18181b] text-white">{val}</option>
                  ))}
                </select>
              </div>

              {showLostInput && (
                <div className="border-t border-white/5 pt-3 space-y-2">
                  <label className="block text-[10px] font-bold text-red-400 uppercase tracking-wider">Motivo da Perda *</label>
                  <textarea
                    required
                    placeholder="Descreva o motivo da perda do negócio..."
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    className="w-full bg-[#111113] border border-red-500/20 focus:border-red-500/50 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none min-h-[60px]"
                  />
                  <button
                    onClick={handleSaveLostReason}
                    disabled={!lostReason.trim() || isPending}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                  >
                    Confirmar Perda do Negócio
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Cliente / Empresa</label>
                <select
                  value={clientId}
                  onChange={(e) => { setClientId(e.target.value); setTimeout(handleFieldBlur, 50); }}
                  className="w-full bg-[#111113] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#18181b] text-zinc-500">Sem Empresa / Avulso</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#18181b] text-white">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Valores Financeiros */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                Valores Estimados
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#18181b] border border-white/5 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-500 block mb-1">Setup (Valor Único)</span>
                  <div className="flex items-center">
                    <span className="text-zinc-500 text-xs mr-1">R$</span>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      onBlur={handleFieldBlur}
                      placeholder="0.00"
                      className="bg-transparent border-none p-0 text-sm font-bold text-white focus:outline-none focus:ring-0 w-full"
                    />
                  </div>
                </div>

                <div className="bg-[#18181b] border border-white/5 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-500 block mb-1">Recorrente (MRR)</span>
                  <div className="flex items-center">
                    <span className="text-zinc-500 text-xs mr-1">R$</span>
                    <input
                      type="number"
                      value={estimatedMrr}
                      onChange={(e) => setEstimatedMrr(e.target.value)}
                      onBlur={handleFieldBlur}
                      placeholder="0.00"
                      className="bg-transparent border-none p-0 text-sm font-bold text-white focus:outline-none focus:ring-0 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Planejamento de Contato */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Próximo Passo
              </h3>
              <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">Ação Planejada</label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    onBlur={handleFieldBlur}
                    placeholder="Ex: Ligar para confirmar proposta..."
                    className="w-full bg-[#111113] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-zinc-500 mb-1">Data Agendada</label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    onBlur={handleFieldBlur}
                    className="w-full bg-[#111113] border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/30"
                  />
                </div>
              </div>
            </div>

            {/* Anotações de Negociação */}
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                Anotações Gerais
              </h3>
              <textarea
                placeholder="Insira detalhes de concorrência, prazos solicitados pelo cliente ou histórico do lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleFieldBlur}
                className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none min-h-[120px] max-h-[220px] resize-y"
              />
            </div>
          </div>

          {/* Coluna Direita: Abas Timeline & Discovery */}
          <div className="flex-1 flex flex-col bg-[#111113] overflow-hidden">
            
            {/* Abas */}
            <div className="flex border-b border-white/5 bg-[#141416]/50 shrink-0 px-4">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'timeline' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Atividades & Contatos
              </button>
              <button
                onClick={() => setActiveTab('discovery')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === 'discovery' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Roteiro de Discovery
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
              
              {/* TAB: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Novo Log */}
                  <form onSubmit={handleAddActivity} className="bg-[#18181b] border border-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Registrar Atividade</span>
                      <div className="flex bg-[#111113] p-0.5 rounded-lg border border-white/5">
                        <button
                          type="button"
                          onClick={() => setActivityType('note')}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                            activityType === 'note' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Nota
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityType('call')}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                            activityType === 'call' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Ligação
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityType('email')}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                            activityType === 'email' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          E-mail
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityType('meeting')}
                          className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                            activityType === 'meeting' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Reunião
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        required
                        placeholder={
                          activityType === 'note' ? 'Escreva uma anotação sobre a oportunidade...' :
                          activityType === 'call' ? 'Resuma os pontos discutidos no telefonema...' :
                          activityType === 'email' ? 'Cole o teor do e-mail enviado/recebido...' :
                          'Descreva a pauta ou ata da reunião comercial...'
                        }
                        value={activityContent}
                        onChange={(e) => setActivityContent(e.target.value)}
                        className="w-full bg-[#111113] border border-white/5 rounded-lg p-3 text-xs text-white placeholder-zinc-600 focus:outline-none min-h-[60px]"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPending || !activityContent.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Registrar
                      </button>
                    </div>
                  </form>

                  {/* Lista de Atividades */}
                  {loadingActivities ? (
                    <div className="text-center text-xs text-zinc-500 py-10">Carregando histórico...</div>
                  ) : activities.length === 0 ? (
                    <div className="text-center text-xs text-zinc-500 py-10">Nenhuma atividade registrada ainda.</div>
                  ) : (
                    <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
                      {activities.map((act) => {
                        const dateFormatted = new Date(act.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        
                        let Icon = FileText
                        let color = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        
                        if (act.type === 'stage_change') {
                          Icon = Settings
                          color = 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        } else if (act.type === 'call') {
                          Icon = Phone
                          color = 'bg-green-500/10 text-green-400 border-green-500/20'
                        } else if (act.type === 'email') {
                          Icon = Mail
                          color = 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        } else if (act.type === 'meeting') {
                          Icon = Users
                          color = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        } else if (act.type === 'note') {
                          Icon = MessageSquare
                          color = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }

                        return (
                          <div key={act.id} className="relative">
                            {/* Icon Badge */}
                            <div className={`absolute -left-[37px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${color}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            
                            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-zinc-500">
                                  {act.profiles?.full_name || 'Usuário'}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-medium">
                                  {dateFormatted}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {act.content}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: DISCOVERY ROTEIRO */}
              {activeTab === 'discovery' && (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl mb-4">
                    <h4 className="text-xs font-semibold text-blue-400 mb-1">Roteiro Discovery de 45 minutos</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Aplique este questionário estruturado durante a reunião. O objetivo é mapear a dor comercial e demonstrar retorno (ROI) antes do fechamento. As respostas salvam-se nas notas do deal automaticamente.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        1. Qual é o problema central (o processo manual que drena mais tempo hoje)?
                      </label>
                      <textarea
                        value={discovery.problema}
                        onChange={(e) => handleDiscoveryChange('problema', e.target.value)}
                        placeholder="Ex: Conciliação de 3 bancos no Excel que leva 4 horas/dia de um analista..."
                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/30 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        2. Qual é o impacto financeiro / tempo de manter o cenário como está?
                      </label>
                      <textarea
                        value={discovery.impacto}
                        onChange={(e) => handleDiscoveryChange('impacto', e.target.value)}
                        placeholder="Ex: Custo de R$ 3.500/mês de analista sênior, atraso em fechamentos de balanço e erros ocasionais de digitação..."
                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/30 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        3. Qual é a expectativa da solução automatizada ideal?
                      </label>
                      <textarea
                        value={discovery.expectativa}
                        onChange={(e) => handleDiscoveryChange('expectativa', e.target.value)}
                        placeholder="Ex: Rodar diariamente às 07:00, cruzar dados com extrato OFX e lançar no ERP de forma totalmente autônoma..."
                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/30 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                        4. Quais sistemas, portais e etapas compõem o processo atual?
                      </label>
                      <textarea
                        value={discovery.processo}
                        onChange={(e) => handleDiscoveryChange('processo', e.target.value)}
                        placeholder="Ex: Banco Itaú (baixar OFX), Banco Bradesco (baixar extrato PDF), ERP Protheus, e planilha Excel de depara..."
                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/30 min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
