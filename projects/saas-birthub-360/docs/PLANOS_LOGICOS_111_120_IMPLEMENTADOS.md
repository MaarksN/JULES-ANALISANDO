# Execução dos Próximos 10 Planos Lógicos (111–120)

1. Padronização do contrato de retorno do `BaseAgent` para expor simultaneamente `data` (novo) e `output` (compatibilidade).
2. Inclusão de `actions_taken` no retorno canônico do `BaseAgent` para rastreabilidade de execução.
3. Remoção de duplicidade de definição de `AgentResult` em `agents/shared/base_agent.py`.
4. Garantia de shape consistente também no caminho de erro e no fallback unreachable do `BaseAgent`.
5. Fortalecimento dos testes de contrato do runtime compartilhado (`agents/shared/tests/test_base_agent.py`) para validar `output` legado e `actions_taken`.
6. Refino estatístico de `run_ab_test_analysis` com fallback real de p-valor (aproximação normal bicaudal de Welch) quando `scipy` não estiver disponível.
7. Remoção de heurística hardcoded de p-valor no fallback de A/B test.
8. Preservação da recomendação orientada a significância com base em `p_value < 0.05`.
9. Atualização da documentação executiva para registrar a execução do lote 111–120.
10. Atualização do `EXECUTION_CHECKLIST.md` com timestamp e referência do novo lote executado.
