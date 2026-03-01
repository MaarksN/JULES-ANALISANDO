import { AgentType } from '../types';

export const QUICK_TEMPLATES = [
  {
    title: "Divórcio Consensual",
    desc: "Minuta completa com partilha de bens.",
    icon: "HeartHandshake",
    agent: AgentType.PETITION,
    initialPrompt: "Redija uma minuta de divórcio consensual. O casal possui um imóvel financiado e não tem filhos menores. Inclua cláusula de retomada do nome de solteiro."
  },
  {
    title: "Ação de Cobrança JEC",
    desc: "Para prestação de serviços não pagos.",
    icon: "Banknote",
    agent: AgentType.PETITION,
    initialPrompt: "Crie uma ação de cobrança para o Juizado Especial Cível. O cliente prestou serviços de marcenaria (valor R$ 5.000), emitiu nota fiscal, mas não recebeu o pagamento há 3 meses."
  },
  {
    title: "Contestação Bancária",
    desc: "Defesa contra juros abusivos.",
    icon: "Scale",
    agent: AgentType.PETITION,
    initialPrompt: "Elabore uma contestação em ação de busca e apreensão de veículo. Alegue a teoria do adimplemento substancial (pagou 80% das parcelas) e juros acima da taxa média de mercado."
  },
  {
    title: "Contrato de Honorários",
    desc: "Proteção de serviços advocatícios.",
    icon: "FileSignature",
    agent: AgentType.CONTRACT_REVIEW, // Pode ser usado para criar também
    initialPrompt: "Crie um contrato de honorários advocatícios robusto. Preveja honorários de êxito (30%), pro labore inicial e cláusula penal em caso de revogação do mandato."
  },
  {
    title: "Tutela de Urgência (Saúde)",
    desc: "Pedido liminar para cirurgia/medicamento.",
    icon: "Activity",
    agent: AgentType.PETITION,
    initialPrompt: "Redija um pedido de Tutela de Urgência contra Plano de Saúde para liberação imediata de cirurgia cardíaca, com base na negativa indevida e risco de vida."
  }
];