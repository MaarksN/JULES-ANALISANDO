import { AIToolConfig } from '../../types';

export const TOOLS_REGISTRY: AIToolConfig[] = [
  {
    id: 'prospecting_tool_01',
    name: 'Prospecção Tool 01',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 1' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_02',
    name: 'Prospecção Tool 02',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 2' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_03',
    name: 'Prospecção Tool 03',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 3' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_04',
    name: 'Prospecção Tool 04',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 4' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_05',
    name: 'Prospecção Tool 05',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 5' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_06',
    name: 'Prospecção Tool 06',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 6' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_07',
    name: 'Prospecção Tool 07',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 7' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_08',
    name: 'Prospecção Tool 08',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 8' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_09',
    name: 'Prospecção Tool 09',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 9' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_10',
    name: 'Prospecção Tool 10',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 10' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_11',
    name: 'Prospecção Tool 11',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 11' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_12',
    name: 'Prospecção Tool 12',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 12' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_13',
    name: 'Prospecção Tool 13',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 13' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_14',
    name: 'Prospecção Tool 14',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 14' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_15',
    name: 'Prospecção Tool 15',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 15' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_16',
    name: 'Prospecção Tool 16',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 16' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_17',
    name: 'Prospecção Tool 17',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 17' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_18',
    name: 'Prospecção Tool 18',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 18' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_19',
    name: 'Prospecção Tool 19',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 19' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'prospecting_tool_20',
    name: 'Prospecção Tool 20',
    description: 'Gerador especializado para cenários de prospecção com foco em conversão.',
    category: 'prospecting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 20' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em prospecção. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Prospecção'
  },
  {
    id: 'enrichment_tool_01',
    name: 'Enriquecimento Tool 01',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 1' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_02',
    name: 'Enriquecimento Tool 02',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 2' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_03',
    name: 'Enriquecimento Tool 03',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 3' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_04',
    name: 'Enriquecimento Tool 04',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 4' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_05',
    name: 'Enriquecimento Tool 05',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 5' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_06',
    name: 'Enriquecimento Tool 06',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 6' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_07',
    name: 'Enriquecimento Tool 07',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 7' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_08',
    name: 'Enriquecimento Tool 08',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 8' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_09',
    name: 'Enriquecimento Tool 09',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 9' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_10',
    name: 'Enriquecimento Tool 10',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 10' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_11',
    name: 'Enriquecimento Tool 11',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 11' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_12',
    name: 'Enriquecimento Tool 12',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 12' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_13',
    name: 'Enriquecimento Tool 13',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 13' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_14',
    name: 'Enriquecimento Tool 14',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 14' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_15',
    name: 'Enriquecimento Tool 15',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 15' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_16',
    name: 'Enriquecimento Tool 16',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 16' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_17',
    name: 'Enriquecimento Tool 17',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 17' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_18',
    name: 'Enriquecimento Tool 18',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 18' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_19',
    name: 'Enriquecimento Tool 19',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 19' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'enrichment_tool_20',
    name: 'Enriquecimento Tool 20',
    description: 'Gerador especializado para cenários de enriquecimento com foco em conversão.',
    category: 'enrichment',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 20' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em enriquecimento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Enriquecimento'
  },
  {
    id: 'copywriting_tool_01',
    name: 'Copywriting Tool 01',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 1' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_02',
    name: 'Copywriting Tool 02',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 2' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_03',
    name: 'Copywriting Tool 03',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 3' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_04',
    name: 'Copywriting Tool 04',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 4' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_05',
    name: 'Copywriting Tool 05',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 5' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_06',
    name: 'Copywriting Tool 06',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 6' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_07',
    name: 'Copywriting Tool 07',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 7' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_08',
    name: 'Copywriting Tool 08',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 8' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_09',
    name: 'Copywriting Tool 09',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 9' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_10',
    name: 'Copywriting Tool 10',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 10' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_11',
    name: 'Copywriting Tool 11',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 11' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_12',
    name: 'Copywriting Tool 12',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 12' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_13',
    name: 'Copywriting Tool 13',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 13' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_14',
    name: 'Copywriting Tool 14',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 14' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_15',
    name: 'Copywriting Tool 15',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 15' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_16',
    name: 'Copywriting Tool 16',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 16' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_17',
    name: 'Copywriting Tool 17',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 17' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_18',
    name: 'Copywriting Tool 18',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 18' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_19',
    name: 'Copywriting Tool 19',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 19' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'copywriting_tool_20',
    name: 'Copywriting Tool 20',
    description: 'Gerador especializado para cenários de copywriting com foco em conversão.',
    category: 'copywriting',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 20' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em copywriting. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Copywriting'
  },
  {
    id: 'strategy_tool_01',
    name: 'Estratégia Tool 01',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 1' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_02',
    name: 'Estratégia Tool 02',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 2' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_03',
    name: 'Estratégia Tool 03',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 3' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_04',
    name: 'Estratégia Tool 04',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 4' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_05',
    name: 'Estratégia Tool 05',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 5' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_06',
    name: 'Estratégia Tool 06',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 6' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_07',
    name: 'Estratégia Tool 07',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 7' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_08',
    name: 'Estratégia Tool 08',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 8' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_09',
    name: 'Estratégia Tool 09',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 9' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_10',
    name: 'Estratégia Tool 10',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 10' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_11',
    name: 'Estratégia Tool 11',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 11' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_12',
    name: 'Estratégia Tool 12',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 12' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_13',
    name: 'Estratégia Tool 13',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 13' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_14',
    name: 'Estratégia Tool 14',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 14' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_15',
    name: 'Estratégia Tool 15',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 15' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_16',
    name: 'Estratégia Tool 16',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 16' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_17',
    name: 'Estratégia Tool 17',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 17' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_18',
    name: 'Estratégia Tool 18',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 18' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_19',
    name: 'Estratégia Tool 19',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 19' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'strategy_tool_20',
    name: 'Estratégia Tool 20',
    description: 'Gerador especializado para cenários de estratégia com foco em conversão.',
    category: 'strategy',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 20' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em estratégia. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Estratégia'
  },
  {
    id: 'closing_tool_01',
    name: 'Fechamento Tool 01',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 1' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_02',
    name: 'Fechamento Tool 02',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 2' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_03',
    name: 'Fechamento Tool 03',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 3' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_04',
    name: 'Fechamento Tool 04',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 4' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_05',
    name: 'Fechamento Tool 05',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 5' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_06',
    name: 'Fechamento Tool 06',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 6' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_07',
    name: 'Fechamento Tool 07',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 7' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_08',
    name: 'Fechamento Tool 08',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 8' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_09',
    name: 'Fechamento Tool 09',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 9' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_10',
    name: 'Fechamento Tool 10',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 10' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_11',
    name: 'Fechamento Tool 11',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 11' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_12',
    name: 'Fechamento Tool 12',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 12' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_13',
    name: 'Fechamento Tool 13',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 13' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_14',
    name: 'Fechamento Tool 14',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 14' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_15',
    name: 'Fechamento Tool 15',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 15' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_16',
    name: 'Fechamento Tool 16',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 16' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_17',
    name: 'Fechamento Tool 17',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 17' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_18',
    name: 'Fechamento Tool 18',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 18' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_19',
    name: 'Fechamento Tool 19',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 19' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  },
  {
    id: 'closing_tool_20',
    name: 'Fechamento Tool 20',
    description: 'Gerador especializado para cenários de fechamento com foco em conversão.',
    category: 'closing',
    inputs: [
      { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Ex: Empresa 20' },
      { name: 'segmento', label: 'Segmento', type: 'text', placeholder: 'Ex: SaaS B2B' },
      { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Resultado desejado para esta execução' }
    ],
    promptTemplate: 'Atue como especialista em fechamento. Contexto: empresa {{empresa}}, segmento {{segmento}}. Objetivo: {{objetivo}}. Gere um plano prático com passos acionáveis, exemplos e checklist final.',
    systemRole: 'Consultor Sênior de Fechamento'
  }
];
