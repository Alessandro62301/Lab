---
status: active
tipo: retomada
modulo: Lab Core
fase: fundação funcional
rota_principal: /
atualizado_em: 2026-07-31
---

# Retomada — Lab Core

## Estado atual

- Monorepo Next.js, Prisma e PostgreSQL configurados.
- Sessão de desenvolvimento e isolamento por workspace preparados.
- Dashboard, projetos, notas, tarefas, Central de IA e sistema de módulos fazem parte da fundação.
- OpenAI e Claude possuem apenas contratos/configuração, sem chamadas reais.

## Próxima ação

Fortalecer autenticação real e permissões antes de disponibilizar o Lab fora do ambiente local.

## Pontos de entrada

- App: `apps/web/src/app`
- Módulos: `apps/web/src/config/module-registry.ts`
- Sessão: `apps/web/src/server/auth`
- Banco: `packages/database/prisma/schema.prisma`

Veja [[Visao Geral]], [[Decisoes]] e [[Backlog]].
