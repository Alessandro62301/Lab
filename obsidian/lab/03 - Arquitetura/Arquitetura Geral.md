---
status: active
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Arquitetura Geral

```text
Browser
  ↓
Next.js App Router
  ├─ Server Components
  ├─ Client islands
  └─ Route Handlers
       ↓
Services / repositories
       ↓
Prisma → PostgreSQL
```

O projeto usa um monorepo com uma aplicação web e um pacote de banco. Consulte [[Banco de Dados]], [[Autenticacao]], [[Sistema de Modulos]] e [[Decisoes de Arquitetura]].
