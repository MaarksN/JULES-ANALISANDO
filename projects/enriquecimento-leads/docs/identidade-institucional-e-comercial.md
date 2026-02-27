# Documento Corporativo e Comercial — Portal de Inteligência de Vendas com IA

## Quem somos
Somos uma operação de tecnologia comercial focada em **inteligência de prospecção B2B**, com produto orientado a captação, qualificação e enriquecimento de leads para equipes de vendas. O software combina uma interface única de operação (SPA), automações de CRM de prospecção e recursos de IA para acelerar pesquisa de contas e execução comercial.

Em termos institucionais, este projeto representa uma empresa de **Sales Intelligence aplicada ao mercado brasileiro**, com foco inicial em setores como automotivo, mas com arquitetura reutilizável para outros segmentos.

## O que resolvemos
Resolvemos o problema de baixa eficiência na prospecção ativa, que normalmente é fragmentada em múltiplas ferramentas e etapas manuais.

Na prática, o sistema:
- Centraliza cadastro, listagem e acompanhamento de leads.
- Valida CNPJ e usa CNAE para qualificação inicial.
- Enriquecimento de dados comerciais com IA (contato, decisores, contexto de mercado).
- Gera ativos de abordagem (e-mail, ligação, objeções, cadência).
- Registra operações sensíveis com trilha de auditoria.

Resultado operacional esperado: redução de tempo de pesquisa manual, aumento de consistência na abordagem e melhor priorização de oportunidades.

## Quem atendemos
Público-alvo principal:
- **Times comerciais B2B** (SDR, pré-vendas, inside sales, executivos de conta).
- **Gestores comerciais** que precisam padronizar playbooks e métricas de funil.
- **Operações com volume de leads no Brasil** que se beneficiam de validação CNPJ/CNAE.

Perfil de cliente ideal:
- Empresas de pequeno a médio porte com necessidade de acelerar outbound.
- Operações que ainda dependem de planilhas e processos pouco integrados.
- Times que precisam incorporar IA sem montar infraestrutura própria complexa.

## Por que somos os melhores (Nosso Diferencial)
Diferenciais competitivos convertidos de decisões técnicas:

1. **Arquitetura híbrida e evolutiva**
   - Produto funciona como SPA para operação rápida e menor fricção de uso.
   - Há migração/integração com Supabase (persistência, autenticação e RLS), permitindo evolução para cenário multiusuário e escalável.

2. **Governança comercial incorporada ao produto**
   - RBAC com papéis (admin e vendedor), trilhas de auditoria e ações de segurança simuladas para processos críticos.
   - Bloqueio de funcionalidades por status de assinatura (gating por `stripe_status`).

3. **Privacidade aplicada ao fluxo comercial**
   - Criptografia de campos sensíveis no cliente (e-mail/telefone) e mecanismo de anonimização LGPD (“esquecer dados”).

4. **Produtividade orientada a receita**
   - IA conectada ao contexto da conta para gerar kits de prospecção e análises acionáveis.
   - Hub de ferramentas de IA com estrutura configurável para múltiplos casos de uso (prospecção, estratégia, copy, fechamento).

## Missão
**Transformar dados comerciais dispersos em ações de prospecção claras, seguras e replicáveis para aumentar a conversão de vendas B2B.**

## Visão
Ser uma plataforma de referência em Sales Intelligence no Brasil, evoluindo de assistente de prospecção para camada operacional completa de aquisição B2B, com integrações de CRM, billing e automações de ponta a ponta.

## Valores e Cultura
Com base no repositório, a cultura de engenharia e produto indica:

- **Pragmatismo com foco em entrega:** estrutura simples de execução local (`vite`) e organização por componentes.
- **Experimentação orientada a valor:** combinação de protótipo funcional com recursos avançados (ferramentas IA, integrações simuladas, edge functions simuladas).
- **Segurança por design possível ao estágio atual:** autenticação, papéis, trilha de log e anonimização já modelados.
- **Escalabilidade progressiva:** coexistência entre legado em `localStorage` e trilha de migração para Supabase com RLS.
- **Lacuna atual de maturidade de processo:** não há evidência clara no repositório de pipeline CI/CD, suíte de testes automatizados robusta ou gestão formal de qualidade por ambiente.

## Conformidade e LGPD / Privacidade
Resumo objetivo das práticas identificadas no código (para base de política pública):

1. **Dados pessoais tratados**
   - Campos como nome, e-mail, telefone, informações de empresa e metadados de interação comercial.

2. **Controles implementados**
   - Criptografia com AES-GCM para dados sensíveis antes de persistência local.
   - Mecanismo de anonimização de registros por e-mail (direito ao esquecimento, em escopo funcional).
   - Restrição de acesso por papel para logs de auditoria.
   - RLS em tabela de leads no Supabase com política por `auth.uid() = user_id`.

3. **Riscos e limites atuais**
   - Chaves de API em frontend são explicitamente um risco (documentação já alerta para não publicar).
   - Parte da segurança é simulada para demonstração arquitetural (2FA fixo, alguns fluxos mockados).
   - Recomenda-se mover chamadas sensíveis para backend/edge function real e formalizar retenção, consentimento e base legal por finalidade.

4. **Diretriz de comunicação pública sugerida**
   - Informar de forma transparente quais dados são coletados, por qual finalidade comercial e por quanto tempo.
   - Explicitar direitos do titular (acesso, correção, exclusão/anonimização) e canal de atendimento.

## Brandbook (Identidade da Marca)

### Tom de Voz
- Consultivo, objetivo e orientado a ação.
- Linguagem comercial clara, sem promessas vagas.
- Equilíbrio entre precisão técnica e aplicabilidade para time de vendas.

### Paleta de Cores Sugerida
Baseada nos padrões visuais já usados (Tailwind/estilos):
- **Azul primário:** `#3B82F6`
- **Índigo de apoio:** `#4F46E5`
- **Slate escuro (texto):** `#1E293B`
- **Slate médio (interface):** `#334155`
- **Verde sucesso:** `#22C55E`
- **Vermelho alerta:** `#EF4444`
- **Fundo neutro:** `#F1F5F9`

### Tipografia
- **Principal:** Inter (já utilizada no projeto).
- **Fallbacks:** `system-ui`, `-apple-system`, `Segoe UI`, `sans-serif`.

## Conceito do Logo
Conceito recomendado: **“Radar de Conversão”**.

Elementos visuais:
- Um símbolo circular de radar (inteligência/descoberta de oportunidades).
- Um ponto destacado em crescimento (lead qualificado virando oportunidade).
- Um traço de conexão ou funil estilizado (orquestração do processo comercial).

Aplicação semântica:
- O radar comunica enriquecimento e pesquisa de mercado.
- O ponto convertido comunica foco em resultado comercial.
- O funil comunica método, previsibilidade e gestão de pipeline.

## Estrutura do Site de Vendas (Landing Page)

### Headline principal
**Enriqueça, qualifique e converta leads B2B com IA em um único fluxo.**

### Sub-headline
Centralize dados comerciais, valide empresas, gere abordagem personalizada e opere com mais velocidade e governança.

### Seção de Benefícios
- **Menos trabalho manual:** cadastro, validação e enriquecimento em fluxo único.
- **Abordagem mais assertiva:** kit de prospecção com contexto do lead.
- **Mais controle de operação:** papéis de acesso, logs e histórico de ações.
- **Pronto para escalar:** base com Supabase e política de acesso por usuário (RLS).
- **Aderência ao contexto brasileiro:** validação CNPJ/CNAE e linguagem de operação local.

### Planos de Assinatura (Pricing)
Modelagem baseada em papéis e limites inferidos do código:

#### 1) Plano Start (R$ 199/mês)
Indicado para profissional autônomo ou operação inicial.
- 1 usuário (papel vendedor).
- Até **500 leads ativos**.
- Cadastro e diretório de leads.
- Validação CNPJ básica.
- Geração de conteúdo de prospecção com IA (limite sugerido: **200 execuções/mês**).
- Sem acesso a logs de auditoria.
- Sem recurso LGPD administrativo.

#### 2) Plano Growth (R$ 699/mês)
Indicado para pequeno time comercial.
- Até 5 usuários (1 admin + 4 vendedores).
- Até **5.000 leads ativos**.
- Enriquecimento avançado e kits de prospecção.
- Ferramentas de análise estratégica e concorrência.
- Acesso a dashboard e backup/restauração.
- Logs de auditoria para admin.
- Limite sugerido de IA/API: **2.000 execuções/mês**.

#### 3) Plano Scale (R$ 1.999/mês)
Indicado para operação com governança e volume.
- Usuários conforme contrato (multi-time).
- Leads ativos sob política dedicada.
- Priorização de suporte e onboarding.
- Contexto de IA por conta e personalização de playbooks.
- Relatórios executivos avançados e integrações assistidas.
- Controles de compliance e revisão de fluxo LGPD.
- Limite sugerido de IA/API: **10.000 execuções/mês** + excedente por consumo.

> Observação: os limites comerciais acima são proposta de empacotamento. O código atual possui bloqueio funcional por status de assinatura ativa e controles de papel, mas não implementa quota rígida de consumo por plano no backend nesta versão.
