---
status: draft
tipo: arquitetura
projeto: data-inbox
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Arquitetura

Fluxo planejado:

`Source → ProcessingJob → ExtractedRecord → Review → Domain records`

O módulo reutilizará sessão, workspace, tarefas, notas e [[Sistema de IA]] do Lab. Processamentos pesados deverão usar uma fila através de contrato próprio.
