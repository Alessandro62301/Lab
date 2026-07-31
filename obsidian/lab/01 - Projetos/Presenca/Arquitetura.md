---
status: planned
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Arquitetura

## Entidades previstas

- `PublicPage`: identidade, slug, estado e tema.
- `PageBlock`: tipo, posição, conteúdo e regras de exibição.
- `TrackedLink`: destino, UTM, agendamento e estado.
- `AudienceContact`: contato captado e consentimento.
- `AnalyticsEvent`: evento imutável compartilhado pelo Lab.
- `DailyMetric`: agregação para painéis rápidos.

## Rotas previstas

- `/presence`: administração.
- `/presence/[id]/editor`: editor.
- `/p/[slug]`: página pública.
- `/r/[key]`: redirecionamento rastreável.
- `/api/analytics/events`: coleta em lote.

Cliques devem passar pelo redirecionamento interno para registrar o evento antes do
destino. Visualizações usam sessão anônima, com deduplicação de eventos e sem IP bruto.

Ver [[Sistema de Metricas]].
