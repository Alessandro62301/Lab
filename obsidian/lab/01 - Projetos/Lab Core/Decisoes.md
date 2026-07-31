---
status: active
tipo: decisoes
projeto: lab-core
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Decisões

## ADR-001 — Monorepo simples

Usar npm workspaces com `apps/web` e `packages/database`. Não adicionar Turborepo enquanto houver apenas uma aplicação executável.

## ADR-002 — Módulos internos

Módulos são registros e rotas do mesmo Next.js. Extração para serviços separados só ocorre por necessidade operacional.

## ADR-003 — Markdown primeiro

Notas começam com Markdown e prévia. TipTap pode entrar quando edição rica colaborativa se tornar necessária.
