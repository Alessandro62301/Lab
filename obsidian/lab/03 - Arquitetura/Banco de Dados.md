---
status: active
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Banco de Dados

PostgreSQL é o banco principal e Prisma é o ORM.

Entidades iniciais:

- User, Workspace e Membership
- Project
- Note
- Task
- ModuleDefinition e WorkspaceModule
- AiProviderConfig

Todas as entidades de domínio mantêm o limite de [[Usuarios e Permissoes]] por workspace.
