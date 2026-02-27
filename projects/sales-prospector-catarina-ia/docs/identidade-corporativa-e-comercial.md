# Documento Corporativo e Comercial — Sales Prospector Catarina IA

## Quem somos
Somos uma equipe de produto B2B que constrói uma plataforma SaaS de prospecção comercial com foco em operações de vendas multicanal, automação assistida por IA e gestão multiempresa (multi-tenant). A arquitetura indica um produto em evolução para operação enterprise: monorepo com API NestJS, banco PostgreSQL via Prisma, aplicação web React e módulos para IA, billing, telephony, webhooks e auditoria.

## O que resolvemos
Resolvemos o gargalo operacional de times comerciais que trabalham com dados dispersos, baixo contexto de contato e pouca previsibilidade de execução.

Na prática, o sistema:
- Centraliza leads, status e histórico de comunicação em um único back-end.
- Acelera ações de prospecção com cadastro/listagem de leads e busca local otimizada.
- Adiciona memória de negócio com base de conhecimento indexada por embeddings.
- Suporta interação por múltiplos canais (telefone/voz, WhatsApp, webhooks e integrações).
- Cria base para monetização por consumo com carteira (wallet), razão (ledger) e planos.

## Quem atendemos
Público-alvo principal:
- Empresas B2B com time de SDR/closer.
- Operações de inside sales e pré-vendas consultivas.
- Agências e squads comerciais que gerenciam múltiplos clientes/contas.

Usuários diretos inferidos pelo código:
- Donos de organização (OWNER), administradores (ADMIN) e membros operacionais (MEMBER).
- Usuários que precisam de CRM leve + automação de prospecção + IA aplicada ao contexto da venda.

## Por que somos os melhores (Nosso diferencial)
Diferenciais competitivos derivados da arquitetura atual:
- **Base multi-tenant nativa**: entidades já modeladas por organização, com relacionamento de membros e trilha de auditoria.
- **Arquitetura pronta para escala incremental**: cache, throttling, observabilidade inicial (logger), Swagger e separação por módulos de domínio.
- **IA aplicada ao fluxo comercial**: geração textual, embeddings, busca semântica e armazenamento vetorial com pgvector.
- **Estratégia de monetização embutida**: modelo de planos, limites e saldo transacional para controle de uso.
- **Produto orientado a expansão omnichannel**: componentes para voz, mensageria, webhooks e integrações CRM.

## Missão
Aumentar produtividade e conversão de equipes comerciais por meio de uma plataforma única que combina prospecção, contexto e automação com IA.

## Visão
Evoluir para uma infraestrutura comercial inteligente de padrão global, com segurança enterprise, governança de dados e escala multi-região para operações B2B de alto volume.

## Valores e Cultura
Padrões de trabalho inferidos:
- **Pragmatismo técnico**: entrega rápida com estrutura modular e otimizações de performance já embutidas (cache, debounce, memoização).
- **Evolução contínua**: presença de testes, lint/format e configuração de monorepo para crescimento coordenado.
- **Responsabilidade operacional**: uso de health endpoint, documentação de API (Swagger), interceptação de exceções e logs.
- **Foco em produto**: UX orientada a rotina real de vendas (lead list, busca por atalho, feedback por toaster, base de conhecimento).

## Conformidade e LGPD / Privacidade
Resumo objetivo das práticas deduzidas do código:

### Pontos positivos já presentes
- Segmentação por organização nas principais entidades de negócio.
- Registro de auditoria para mutações (ações POST/PUT/DELETE/PATCH).
- Middleware e guardas para autenticação/tenant (embora ainda incompletos).
- Sanitização de PII com redator para CPF e cartão em textos.
- Cabeçalhos de segurança via Helmet e CORS configurável.

### Riscos e lacunas atuais (importante para política pública)
- Autenticação ainda com trecho mock e fallback de segredo JWT em desenvolvimento.
- Algumas rotas críticas sem guardas ativas.
- Dependência de `x-tenant-id` no header sem vínculo robusto obrigatório com claim do token em todos os fluxos.
- Validação de API key pública ainda simulada (`mock_key`).
- Ausência explícita de política de retenção/anonimização e DSR (acesso, portabilidade, exclusão) no código.

### Diretriz recomendada para texto de privacidade
- Declarar base legal por finalidade (prospecção, atendimento, cobrança, segurança).
- Declarar minimização de dados e segregação por organização.
- Formalizar prazos de retenção por tipo de dado (contato, comunicação, auditoria, billing).
- Formalizar direitos do titular e canal de solicitação.
- Declarar controles de segurança (criptografia em trânsito, autenticação forte, trilhas de auditoria, gestão de acesso por papéis).

## Brandbook (Identidade da Marca)

### Tom de Voz
- Direto, consultivo e orientado a resultado.
- Linguagem objetiva de operação comercial (sem jargão técnico para cliente final).
- Postura de parceiro de performance: clareza, previsibilidade e ação.

### Paleta de Cores Sugerida
Baseada em tokens do front-end e contexto SaaS B2B:
- Primária: **#4C3DF5** (hsl 247 90% 60%)
- Fundo claro: **#FFFFFF**
- Texto principal: **#020817** (aprox. hsl 222.2 84% 4.9%)
- Neutro de superfície: **#F1F5F9** (aprox. hsl 210 40% 96.1%)
- Borda: **#E2E8F0** (aprox. hsl 214.3 31.8% 91.4%)
- Alerta/erro: **#EF4444** (aprox. hsl 0 84.2% 60.2%)

### Tipografia
- Primária sugerida: **Inter** (já usada em documento institucional do repositório e adequada a produto SaaS).
- Fallbacks: `system-ui`, `Segoe UI`, `Roboto`, `Arial`, sans-serif.
- Aplicação: títulos com peso 700, texto operacional com 400/500 para legibilidade em dashboards.

## Conceito do Logo
Proposta de conceito:
- **Símbolo**: fusão de um funil de vendas com um balão de conversa estilizado, representando conversão + comunicação.
- **Elemento de IA**: três nós conectados no topo do funil, sugerindo inteligência contextual (embeddings/memória).
- **Forma geral**: geométrica, simples e escalável para ícone de app e favicon.
- **Cores**: roxo primário (#4C3DF5) com neutros escuros para contraste.
- **Sentido visual**: fluxo de entrada (leads) para saída (oportunidades qualificadas), conectando dados e ação comercial.

## Estrutura do Site de Vendas (Landing Page)

### Headline principal
**Prospecção comercial com IA, contexto e execução em um único sistema.**

### Sub-headline
Gerencie leads, interações e conhecimento do time em uma plataforma multi-tenant pronta para escalar operação B2B.

### Seção de Benefícios
- **Mais produtividade do time comercial**: lista, busca e organização de leads com UX orientada a rotina.
- **Mais qualidade de abordagem**: base de conhecimento indexada para respostas e contexto de contato.
- **Mais controle financeiro da operação**: carteira e razão de consumo para governança de créditos.
- **Mais segurança operacional**: trilha de auditoria, segregação por organização e base para RBAC.
- **Mais previsibilidade técnica**: API documentada, throttling e arquitetura modular.

### Planos de Assinatura (Pricing)
> Estrutura baseada nos tiers e limites já definidos no código (`FREE`, `PRO`, `ENTERPRISE` + `PLAN_LIMITS`), combinada com papéis (`OWNER`, `ADMIN`, `MEMBER`).

#### 1) Starter (FREE)
- Perfil ideal: profissional solo ou operação em validação.
- Inclui:
  - 1 assento (papel OWNER).
  - 10 minutos de voz/mês.
  - 10.000 tokens de IA/mês.
  - Gestão básica de leads e histórico.
  - API pública com limite padrão de requisições por minuto (throttling global).
- Limitações:
  - Sem administração avançada de equipe.
  - Sem suporte prioritário.

#### 2) Growth (PRO)
- Perfil ideal: equipe comercial pequena/média em crescimento.
- Inclui:
  - Até 5 assentos (OWNER + ADMIN + MEMBER).
  - 500 minutos de voz/mês.
  - 1.000.000 tokens de IA/mês.
  - Base de conhecimento com indexação vetorial.
  - Controles de operação por organização e trilha de auditoria.
  - Integrações padrão e suporte comercial em horário útil.
- Limitações:
  - Limites mensais de uso definidos por plano.

#### 3) Enterprise (ENTERPRISE)
- Perfil ideal: operação com alto volume e exigência de governança.
- Inclui:
  - Assentos ilimitados.
  - Minutos de voz e tokens de IA ilimitados (conforme política de uso justo).
  - Recursos avançados de segurança e compliance sob contrato.
  - SLA dedicado, onboarding técnico e suporte prioritário.
  - Governança customizada de integrações e rollout.
- Condições:
  - Preço sob proposta conforme volume, integrações e SLA.

---

## Nota de transparência técnica
Este posicionamento é uma inferência baseada no estado atual do repositório. Há sinais claros de produto robusto em evolução, mas também existem componentes ainda em modo parcial/mock (principalmente em autenticação e enforcement total de permissões) que devem ser tratados antes de comunicação de compliance em nível enterprise.
