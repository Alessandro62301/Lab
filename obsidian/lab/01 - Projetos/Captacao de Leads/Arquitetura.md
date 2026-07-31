---
status: active
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Arquitetura

O módulo vive dentro do monorepo do Lab.

```text
apps/web/src/
  app/(lab)/forms/             administração
  app/f/[slug]/                formulário público
  app/api/forms/               criação e atualização
  app/api/public/forms/        recebimento de respostas
  features/forms/              UI, tipos e consultas

packages/database/prisma/
  schema.prisma
  seed.ts
```

As rotas administrativas usam a sessão de desenvolvimento para resolver o workspace. A rota pública só aceita formulários publicados. Todas as respostas mantêm vínculo com formulário, workspace e lead.

Ver [[Modelo de Dados]] e [[Decisoes]].
