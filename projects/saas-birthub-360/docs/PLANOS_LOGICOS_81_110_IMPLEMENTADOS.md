# Execução das Fases 3, 4 e 5 (lote adicional)

## Fase 3 — Financeiro (tools reais)
1. `trigger_invoice` agora integra com Asaas via HTTP assíncrono com timeout explícito (15s), retry exponencial (tenacity) e validação de env/config.
2. `emit_nfe` agora integra com Focus NFe via HTTP assíncrono com timeout explícito (15s), retry exponencial e erro estruturado.
3. Testes adicionados cobrindo sucesso e falha de configuração.

## Fase 4 — Jurídico (tool real)
4. `analyze_contract` agora chama Gemini via API HTTP com timeout explícito (15s), retry exponencial e validação de `GEMINI_API_KEY`.
5. Saída real baseada na resposta do modelo + detecção de red flags por padrões.
6. Testes adicionados para caminho de sucesso e falha por configuração ausente.

## Fase 5 — Marketing (tools reais)
7. `generate_ad_copy` agora usa Gemini via HTTP com timeout explícito (15s), retry exponencial e erro tipado.
8. `run_ab_test_analysis` passou a executar análise estatística (ttest quando `scipy` disponível, fallback controlado quando não disponível).
9. Testes adicionados para sucesso de copy, análise estatística e edge case de métricas inválidas.

## Requisitos de dependências
10. Atualização de requirements dos agentes Financeiro, Jurídico e Marketing para incluir `httpx` e `tenacity` (e `scipy` no Marketing).
