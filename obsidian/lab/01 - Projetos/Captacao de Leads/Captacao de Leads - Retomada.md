---
status: active
tipo: retomada
modulo: Captacao de Leads
fase: MVP em evolução
rota_principal: /forms
atualizado_em: 2026-07-31
---

# Retomada — Captação de Leads

## Estado atual

- Criação de formulários, fluxo público e consulta de respostas já existem.
- Máscaras, validações, busca por CEP e salvamento de respostas parciais foram definidos como requisitos centrais.
- Contratos permanecem fora deste módulo por enquanto.

## Próxima ação

Concluir o construtor de perguntas com reordenação por arrastar e validar a recuperação de respostas interrompidas.

## Pontos de entrada

- Páginas: `apps/web/src/app/(lab)/forms`
- Fluxo público: `apps/web/src/app/f`
- Domínio: `apps/web/src/features/forms`
- Banco: `packages/database/prisma/schema.prisma`

## Como validar

- Criar um formulário, publicar e preencher parcialmente.
- Reabrir a resposta e confirmar que os dados anteriores continuam disponíveis.

Veja [[MVP]], [[Arquitetura]], [[Modelo de Dados]] e [[Backlog]].
