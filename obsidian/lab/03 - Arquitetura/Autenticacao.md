---
status: draft
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Autenticação

A sessão de desenvolvimento implementa o contrato mínimo esperado:

- `userId`
- `workspaceId`
- `role`
- perfil do usuário

Auth.js é a integração prevista. Regras de domínio dependem do contrato de sessão, não da biblioteca.
