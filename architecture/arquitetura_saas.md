# Arquitetura Consolidada AtlasOps SaaS

Este documento serve como a fonte única de verdade (Single Source of Truth) para o ecossistema AtlasOps, consolidando inteligência operacional, estratégica e técnica.

## 1. Módulo Comercial (Vendas e Prospecção)
**Objetivo:** Transformar contatos frios em contratos de RPA.

### Funil de Vendas (Etapas e Gatilhos)
- **Prospecção (Lead):** Identificação de empresas com processos manuais volumosos.
- **Conexão (L1):** Primeiro contato humano. Foco em curiosidade e dor.
- **Discovery (L2):** Reunião técnica para mapear o processo e estimar ROI.
- **Proposta (L3):** Apresentação de valores, prazos e modelo de cobrança.
- **Fechamento (Win):** Assinatura de contrato e NDA.

### Cadência de Prospecção (18 Dias)
- **Dia 1:** LinkedIn (Pedido de conexão sem mensagem).
- **Dia 2:** LinkedIn (Mensagem de aproximação focada em dor comum do setor).
- **Dia 4:** E-mail 1 (Case rápido de 3 frases).
- **Dia 7:** Ligação 1 (Tentativa de contato direto).
- **Dia 10:** LinkedIn (Comentário em post do prospect).
- **Dia 13:** WhatsApp (Vídeo curto de um bot funcionando).
- **Dia 18:** E-mail de 'Despedida' (Foco em 'não é o momento agora').

### Script de Discovery (Ganchos)
- "Quanto tempo seu time gasta hoje apenas movendo dados de um sistema para outro?"
- "O que acontece se esse processo parar por 2 dias?"
- "Qual o custo de um erro humano nesse lançamento específico?"

---

## 2. Módulo Delivery (Execução e Qualidade)
**Objetivo:** Entrega técnica impecável dentro do prazo e escopo.

### Ciclo de Vida do Projeto (6 Fases)
1. **Kickoff:** Alinhamento de expectativas e coleta de acessos.
2. **Design (PDD):** Documentação detalhada 'as-is' e 'to-be'. Assinatura do cliente obrigatória.
3. **Desenvolvimento:** Construção do robô em sprints.
4. **Testes (UAT):** Validação pelo cliente em ambiente de homologação.
5. **Go-Live:** Implantação em produção e monitoramento assistido (Hypercare).
6. **Encerramento:** Entrega do termo de aceite e migração para CS.

### Quality Gates (Critérios de Saída)
- **Fase 2:** PDD assinado é o bloqueador para o desenvolvimento.
- **Fase 4:** Termo de Aceite assinado é o bloqueador para o Go-Live.

---

## 3. Módulo Customer Success (Retenção e Expansão)
**Objetivo:** Garantir que o cliente perceba o valor e compre mais.

### Jornada do Cliente
- **Onboarding (0-30 dias):** Foco em 'Primeiro Valor Percebido'.
- **Adoção (31-90 dias):** Estabilização e rituais de acompanhamento.
- **Expansão (90+ dias):** Identificação de novos processos para automatizar.

### Rituais e Saúde (Health Score)
- **Relatório Mensal:** ROI acumulado, horas salvas e volume de transações.
- **Sinais de Alerta:** Bot parado por mais de 4h, falta de resposta do cliente em check-ins.

---

## 4. Módulo Marketing B2B (Autoridade e Inbound)
**Objetivo:** Gerar demanda qualificada através de conteúdo estratégico.

### Canais Prioritários
- **LinkedIn (Pessoal):** Autoridade dos fundadores (posts 3x/semana).
- **Cases de Sucesso:** Vídeos curtos de 'Antes vs Depois'.
- **Indicações:** Programa formal de indicação para clientes ativos.

### Personas (ICP)
- **Diretor Financeiro:** Foco em redução de custos e compliance.
- **Controller:** Foco em agilidade no fechamento e precisão de dados.
- **Gerente de RH:** Foco em experiência do colaborador e automação de folha.

---

## 5. Módulo Financeiro e Precificação
**Objetivo:** Garantir margem e previsibilidade de caixa.

### Modelos de Cobrança
- **Projeto Fechado:** R$3k - R$35k (dependendo da complexidade).
- **Managed Service (MRR):** R$800 - R$5k/mês por cliente (suporte e manutenção).
- **Success Fee:** % da economia gerada (ideal para processos de altíssimo volume).

### Calculadora de ROI (Venda)
- **Fórmula:** (Horas mensais salvas x Custo da hora humana) - Custo da automação.
- **Meta de Payback:** Menor que 6 meses.

---

## 6. Módulo Jurídico (Contratos e Riscos)
**Objetivo:** Proteção legal contra 'escopo-creep' e falhas sistêmicas.

### Cláusulas Inegociáveis
1. **Limitação de Responsabilidade:** Teto de indenização vinculado ao valor do contrato.
2. **Propriedade Intelectual:** Definição de quem detém o código (licença de uso).
3. **SLA de Suporte:** Horários e tempos de resposta para incidentes.
4. **LGPD:** Atlas como operadora de dados, cliente como controlador.

---

## 7. Plano de 12 Meses (Estratégia de Escala)
**Objetivo:** Roadmap da fundação à escala de R$30k MRR.

- **Q1 (Fundação):** Validar o modelo com os 3 primeiros clientes.
- **Q2 (Tração):** Estruturar máquina de vendas e migrar para recorrente.
- **Q3 (Escala):** Contratação do primeiro dev RPA e expansão de portfólio.
- **Q4 (Otimização):** Foco em eficiência operacional e novos nichos.
