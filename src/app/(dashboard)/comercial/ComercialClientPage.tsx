'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Calendar, CheckSquare, MessageSquare, Plus, Copy, Check, ChevronDown, ChevronUp, Clock, DollarSign } from 'lucide-react'
import { DealDrawer } from '@/components/comercial/DealDrawer'
import { NewDealModal } from '@/components/comercial/NewDealModal'
import { playPopSound } from '@/lib/audio'

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
  clients?: { id: string; name: string; segment: string } | null
}

const stages = [
  { id: 'lead', name: 'Lead Identificado' },
  { id: 'contacted', name: 'Contato Iniciado' },
  { id: 'meeting', name: 'Reunião Agendada' },
  { id: 'discovery', name: 'Discovery Realizado' },
  { id: 'proposal', name: 'Proposta Enviada' },
  { id: 'negotiation', name: 'Em Negociação' },
  { id: 'won', name: 'Contrato Assinado 🎉' }
]

const cadenceToques = [
  { day: 'Dia 1', channel: 'LinkedIn', label: 'Conexão Sem Pitch', desc: 'Adicionar o lead no LinkedIn. Sem mensagem ou apenas uma nota curta focando em conexões de networking do setor (ex: "Vi seu perfil na área de operações e achei interessante o foco em automação").', template: 'Olá {{nome}}, vi sua atuação em operações na {{empresa}} e achei muito interessante. Trabalho com otimização de processos e gostaria de acompanhar suas publicações. Um abraço!' },
  { day: 'Dia 3', channel: 'E-mail', label: 'E-mail 1: Dor Comum', desc: 'Apresentação curta e direta destacando um problema que empresas similares enfrentam e como a Atlas ajuda a resolver. Foco em fatos, sem jargões comerciais.', template: 'Assunto: Operações manuais na {{empresa}}\n\nOlá {{nome}},\n\nTenho observado que diretores de operações no segmento de {{segmento}} gastam, em média, de 10 a 15 horas semanais com digitação de notas e conciliação bancária.\n\nNa Atlas, ajudamos empresas como a sua a eliminar esses gargalos automatizando esses processos com robôs RPA, gerando economia de tempo imediata.\n\nComo está essa rotina de processos manuais na {{empresa}} hoje?\n\nAbraços,\nDetlef' },
  { day: 'Dia 5', channel: 'WhatsApp', label: 'Contato Rápido', desc: 'Uma mensagem curta no WhatsApp fazendo gancho com o e-mail anterior, de forma amigável.', template: 'Olá {{nome}}, tudo bem? Enviei um e-mail para você na terça-feira sobre conciliação e processos manuais na {{empresa}}, mas sei que a rotina é corrida. Se fizer sentido, gostaria de agendar uma breve conversa de 5 min para entender se conseguimos otimizar seu tempo. O que acha?' },
  { day: 'Dia 8', channel: 'Ligação', label: 'Ligação de 2 Minutos', desc: 'Ligar para o lead. Objetivo: Agendar a videoconferência de Discovery (45min). Não tente vender a solução ao telefone, venda o agendamento da reunião de diagnóstico.', template: 'Script: Olá {{nome}}, aqui é o Detlef da Atlas. Fale rápido: Consigo falar com você por 1 minuto sem interromper uma reunião importante? Legal. Enviei um material sobre automação de conciliação. A razão da ligação é que temos visto ótimos resultados reduzindo o tempo operacional de empresas do seu setor. Queria agendar um discovery rápido de 20 minutos para entender seu cenário. Quinta às 14h é bom pra você?' },
  { day: 'Dia 11', channel: 'LinkedIn', label: 'Interação e Mensagem', desc: 'Comentar em algum post recente do prospect ou enviar mensagem focando em um case rápido (ex: "Automatizamos a conciliação de uma transportadora e reduzimos o tempo de 4h para 6 minutos").', template: 'Oi {{nome}}, tudo bem? Passando para compartilhar um resultado rápido: finalizamos um robô para um cliente do setor de {{segmento}} que eliminou 100% da digitação de notas fiscais deles, economizando cerca de 22 horas por mês. Achei que poderia ser um benchmark interessante para a {{empresa}}.' },
  { day: 'Dia 14', channel: 'E-mail', label: 'E-mail 2: Case Prático', desc: 'E-mail curto com números de ROI e benefícios concretos gerados para outro cliente similar.', template: 'Assunto: Case: Como reduzimos custos operacionais na prática\n\nOlá {{nome}},\n\nAutomatizamos a entrada de dados do financeiro da {{empresa_referencia}} e o resultado foi:\n- Tempo de execução: de 4h diárias para 8 minutos\n- Erro operacional: reduzido a 0%\n- ROI do projeto: obtido em menos de 45 dias\n\nAcredito que conseguimos fazer o mesmo pelo faturamento da {{empresa}}.\n\nPodemos fazer um bate-papo rápido de 15 min nesta semana?\n\nAbraços,\nDetlef' },
  { day: 'Dia 17', channel: 'Ligação', label: 'Segunda Tentativa', desc: 'Ligar em horários alternativos (ex: final da tarde ou início da manhã). Caso caia na caixa postal, não deixe recado.', template: 'Script alternativo: Focar na escassez de vagas de onboarding para projetos do mês. "Olá {{nome}}, estamos organizando o cronograma de implantação de robôs para este mês. Lembrei do seu processo e decidi ligar para ver se ainda faz sentido analisarmos a automação na {{empresa}} antes de preenchermos as datas."' },
  { day: 'Dia 21', channel: 'E-mail', label: 'E-mail 3: Breakup (Despedida)', desc: 'Mensagem informando que esta é a última tentativa de contato. Gera o gatilho de perda e costuma ter a maior taxa de resposta da cadência.', template: 'Assunto: Última tentativa: Automação na {{empresa}}\n\nOlá {{nome}},\n\nComo não obtive retorno, imagino que otimização de processos manuais ou robôs RPA não sejam prioridades para a {{empresa}} no momento.\n\nEstou encerrando minhas tentativas de contato para não encher sua caixa de entrada.\n\nSe as dores operacionais apertarem no futuro, sinta-se à vontade para me acionar.\n\nSucesso nos negócios!\n\nAbraços,\nDetlef' }
]

const objeccoes = [
  { q: '1. "RPA e automação são muito caros / coisa de multinacional."', r: 'Entendo perfeitamente, esse é o maior mito sobre robôs. No passado, apenas grandes bancos tinham acesso a isso. Na Atlas, nós desenvolvemos automações modulares no modelo SaaS. Isso significa que o investimento é extremamente acessível e, como o robô elimina horas de trabalho manual imediatamente, o projeto costuma se pagar logo no primeiro mês de funcionamento.' },
  { q: '2. "Não temos tempo nem equipe para implementar isso agora."', r: 'Essa é a melhor parte: você não precisa de tempo. Nós cuidamos de todo o processo. Nosso discovery leva apenas 45 minutos com seu operador e a homologação toma cerca de 1 hora. Nós desenhamos, construímos, testamos e colocamos para rodar sem sugar a rotina da sua equipe.' },
  { q: '3. "Prefiro contratar um desenvolvedor interno."', r: 'Contratar um dev interno custa caro (CLT, benefícios, impostos) e exige tempo de recrutamento. Além disso, se ele sair da empresa, a automação vira uma "caixa preta" sem manutenção. Ao contratar a Atlas, você tem uma equipe especialista dedicada, documentação técnica atualizada, e suporte diário com garantia de funcionamento em contrato pelo valor de uma fração de um salário mínimo.' },
  { q: '4. "Tenho receio de que o robô quebre se os sites ou ERP mudarem de layout."', r: 'Os sites e sistemas mudam e é normal que robôs precisem de ajustes. Por isso a Atlas inclui manutenção ativa na nossa mensalidade. Nós monitoramos as execuções e, caso ocorra qualquer mudança de layout, nossa equipe faz a correção no código do robô em até 24 horas úteis sem custo adicional, garantindo que sua operação nunca pare.' },
  { q: '5. "Já tentamos fazer com Make ou Zapier e não deu certo."', r: 'Make e Zapier são fantásticos para integrar APIs prontas. Porém, eles falham quando o processo envolve baixar arquivos, acessar sistemas legados, contornar captchas ou navegar em portais governamentais instáveis. Nós desenvolvemos robôs baseados em programação de alto nível (Python e Node), simulando cliques e teclado reais, o que nos permite automatizar absolutamente qualquer coisa que um humano consiga fazer na tela.' }
]

export function ComercialClientPage({ 
  initialDeals, 
  clients 
}: { 
  initialDeals: Deal[]
  clients: any[] 
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [activeTab, setActiveTab] = useState<'funil' | 'cadencia' | 'roteiro' | 'objecoes'>('funil')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [openObjIndex, setOpenObjIndex] = useState<number | null>(null)
  
  // Drag to scroll
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const [streakCount, setStreakCount] = useState(0)

  useEffect(() => {
    setDeals(initialDeals)
  }, [initialDeals])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const todayStr = new Date().toLocaleDateString('sv')
      const stored = localStorage.getItem('atlas_tasks_streak')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.date === todayStr) setStreakCount(data.count)
        } catch (e) {}
      }

      const handleUpdate = () => {
        const updatedStored = localStorage.getItem('atlas_tasks_streak')
        if (updatedStored) {
          try {
            const data = JSON.parse(updatedStored)
            if (data.date === todayStr) setStreakCount(data.count)
          } catch (e) {}
        }
      }
      window.addEventListener('atlas_streak_update', handleUpdate)
      return () => window.removeEventListener('atlas_streak_update', handleUpdate)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-deal-id]')) return
    setIsMouseDown(true)
    const container = e.currentTarget
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return
    e.preventDefault()
    const container = e.currentTarget
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX) * 1.5
    container.scrollLeft = scrollLeft - walk
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    playPopSound()
    setTimeout(() => setCopiedText(null), 2000)
  }

  const activeDeals = deals.filter(d => d.stage !== 'lost')
  const totalWonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.estimated_value || 0), 0)
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0)

  return (
    <div>
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-[#111113] border border-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('funil')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'funil' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Funil de Vendas
          </button>
          <button
            onClick={() => setActiveTab('cadencia')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'cadencia' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Cadência de Prospecção
          </button>
          <button
            onClick={() => setActiveTab('roteiro')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'roteiro' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Roteiro Discovery
          </button>
          <button
            onClick={() => setActiveTab('objecoes')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'objecoes' ? 'bg-[#18181b] text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Objeções
          </button>
        </div>

        <div className="flex items-center gap-3">
          {streakCount > 0 && (
            <span className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
              🔥 Combo: {streakCount} concluídas!
            </span>
          )}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Lead
          </button>
        </div>
      </div>

      {/* TAB: FUNIL DE VENDAS (KANBAN) */}
      {activeTab === 'funil' && (
        <div>
          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Leads Ativos</p>
              <p className="text-2xl font-bold text-zinc-100 font-outfit">{activeDeals.length}</p>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Valor do Pipeline</p>
              <p className="text-2xl font-bold text-zinc-100 font-outfit">
                R$ {totalPipelineValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Contratos Ganhos (Won)</p>
              <p className="text-2xl font-bold text-green-400 font-outfit">
                R$ {totalWonValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Kanban Container */}
          <div 
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsMouseDown(false)}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseMove={handleMouseMove}
            className={`flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 h-[calc(100vh-270px)] cursor-grab ${
              isMouseDown ? 'cursor-grabbing select-none' : ''
            }`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.id)
              const stageSum = stageDeals.reduce((sum, d) => sum + (d.estimated_value || 0), 0)

              return (
                <div key={stage.id} className="min-w-[260px] max-w-[260px] flex flex-col bg-[#111113]/50 rounded-xl border border-white/5 p-4 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-xs text-zinc-300 truncate max-w-[170px]">{stage.name}</h3>
                    <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-zinc-500 font-bold shrink-0">
                      {stageDeals.length}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-zinc-600 font-medium mb-4">
                    R$ {stageSum.toLocaleString('pt-BR')}
                  </div>

                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    {stageDeals.map(deal => {
                      const clientName = deal.clients?.name || 'Lead Avulso'
                      const valueFormatted = deal.estimated_value 
                        ? `R$ ${deal.estimated_value.toLocaleString('pt-BR')}`
                        : 'Valor a definir'
                      
                      const mrrFormatted = deal.estimated_mrr 
                        ? `+ R$ ${deal.estimated_mrr.toLocaleString('pt-BR')}/mês`
                        : ''

                      const actionDateFormatted = deal.next_action_date
                        ? deal.next_action_date.split('-').reverse().join('/')
                        : null

                      return (
                        <div 
                          key={deal.id} 
                          data-deal-id={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                          className="bg-[#18181b] border border-white/10 rounded-lg p-3.5 cursor-pointer hover:border-blue-500/50 hover:bg-[#1b1b1e] transition-all select-none group"
                        >
                          <div className="text-[9px] text-zinc-500 mb-1 truncate">{clientName}</div>
                          <div className="font-semibold text-xs text-zinc-200 mb-2 group-hover:text-white transition-colors truncate">{deal.title}</div>
                          
                          <div className="text-[11px] font-bold text-zinc-400 mb-2.5">
                            {valueFormatted} <span className="text-[9px] text-zinc-600 font-semibold">{mrrFormatted}</span>
                          </div>

                          {deal.next_action && (
                            <div className="pt-2 border-t border-white/5 space-y-1">
                              <div className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Próximo Passo:</div>
                              <div className="text-[10px] text-zinc-400 truncate leading-relaxed">{deal.next_action}</div>
                              {actionDateFormatted && (
                                <div className="text-[9px] text-zinc-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Até {actionDateFormatted}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: CADÊNCIA DE PROSPECÇÃO */}
      {activeTab === 'cadencia' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#111113] border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Cadência B2B: 8 Toques em 21 Dias</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Sequência de abordagens desenhada para converter leads frios em reuniões de discovery. A regra central é: gere valor e curiosidade, nunca tente empurrar venda nas mensagens iniciais.
            </p>
          </div>

          <div className="space-y-4">
            {cadenceToques.map((toque, idx) => {
              const isCopied = copiedText === toque.day
              let color = 'text-blue-400 border-blue-500/20 bg-blue-500/5'
              if (toque.channel === 'WhatsApp') color = 'text-green-400 border-green-500/20 bg-green-500/5'
              if (toque.channel === 'LinkedIn') color = 'text-purple-400 border-purple-500/20 bg-purple-500/5'

              return (
                <div key={idx} className="bg-[#111113] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row gap-5">
                  <div className="md:w-32 shrink-0">
                    <span className="text-xs text-zinc-500 font-bold block">{toque.day}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mt-1.5 ${color}`}>
                      {toque.channel}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200">{toque.label}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1">{toque.desc}</p>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 relative group/temp">
                      <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Template Copiável:</div>
                      <pre className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                        {toque.template}
                      </pre>
                      
                      <button
                        onClick={() => copyToClipboard(toque.template, toque.day)}
                        className="absolute top-3 right-3 p-2 bg-[#18181b] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md border border-white/5 transition-all opacity-0 group-hover/temp:opacity-100 focus:opacity-100 flex items-center gap-1.5 text-[10px] font-bold tracking-wider"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB: ROTEIRO DISCOVERY */}
      {activeTab === 'roteiro' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-[#111113] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-bold text-zinc-200 mb-2">Guia Estruturado: Discovery de 45 Minutos</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              O objetivo do discovery não é apresentar a Atlas ou fechar contrato na hora — é diagnosticar se o cliente tem um problema real, qualificar o lead e fazer ele sentir o peso da ineficiência atual.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-500/10 rounded-full text-blue-400 flex items-center justify-center text-[10px]">1</span>
                Introdução e Contexto (5 min)
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                Definir a pauta: "O objetivo hoje é entender o fluxo de trabalho de vocês, ver onde o tempo operacional está concentrado e descobrir se faz sentido desenharmos uma automação. Não vou te vender nada hoje, ok?" (Desarma o cliente).
              </p>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-500/10 rounded-full text-blue-400 flex items-center justify-center text-[10px]">2</span>
                Mapeamento das Dores (15 min)
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                Fazer perguntas abertas: "Se você pudesse estalar os dedos e sumir com um processo manual chato que seu time faz todo dia, qual seria?", "Como isso é feito hoje?", "Quem executa?", "Quais sistemas utilizam?"
              </p>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-500/10 rounded-full text-blue-400 flex items-center justify-center text-[10px]">3</span>
                Cálculo de Impacto e ROI (15 min)
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                Conectar a dor a números: "Quantas horas por semana o operador gasta nisso?", "Quanto custa essa hora?", "Se o robô fizer em 5 minutos o que leva 4 horas, o que esse operador faria no tempo livre?", "Qual é o custo de um erro de digitação nesse processo?"
              </p>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 bg-blue-500/10 rounded-full text-blue-400 flex items-center justify-center text-[10px]">4</span>
                Próximo Passo e Fechamento (10 min)
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed pl-7">
                Definir compromisso: "Consegui mapear as dores e vejo muito potencial de automação. Vou montar a proposta técnica comercial detalhada com o desenho do processo e o ROI exato. Conseguimos revisar juntos na quinta-feira às 15h?" (Nunca envie proposta por e-mail sem marcar a call de revisão).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OBJEÇÕES */}
      {activeTab === 'objecoes' && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-[#111113] border border-white/5 rounded-xl p-5 mb-2">
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Banco de Objeções Atlas RPA</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Como contornar as barreiras mais comuns de prospects na hora da venda, gerando segurança e alterando a percepção de custo para retorno sobre investimento (ROI).
            </p>
          </div>

          {objeccoes.map((obj, index) => {
            const isOpen = openObjIndex === index
            return (
              <div 
                key={index} 
                className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => {
                    playPopSound()
                    setOpenObjIndex(isOpen ? null : index)
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left"
                >
                  <span className="text-xs font-bold text-zinc-200">{obj.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5">
                    <p className="text-xs text-zinc-400 leading-relaxed bg-black/40 border border-white/5 rounded-lg p-3">
                      {obj.r}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL & DRAWER */}
      {isModalOpen && (
        <NewDealModal 
          clients={clients} 
          onClose={() => {
            setIsModalOpen(false)
            // Atualizar deals
            window.location.reload()
          }} 
        />
      )}

      {selectedDeal && (
        <DealDrawer 
          deal={selectedDeal} 
          clients={clients}
          onClose={() => {
            setSelectedDeal(null)
            window.location.reload()
          }} 
        />
      )}
    </div>
  )
}
