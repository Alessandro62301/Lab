---
status: active
tipo: decisoes
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Decisões

## Uma pergunta por tela

Mantém a experiência curta e próxima da referência enviada, sem copiar sua interface.

## Condição junto ao campo

No MVP, a pergunta guarda uma condição simples em sua configuração. O modelo `FormLogicRule` permanece disponível para fluxos com múltiplas ações no futuro.

## Lead separado da resposta

Uma pessoa pode enviar vários formulários. O contato é consolidado em `Lead`, enquanto cada envio permanece em `FormSubmission`.

## Resposta existe antes da conclusão

Ao avançar uma etapa, o navegador cria ou atualiza uma `FormSubmission` com estado
`IN_PROGRESS`. As respostas já válidas são salvas individualmente e o progresso fica em
`metadataJson`. A conclusão reutiliza a mesma sessão e muda o estado para `COMPLETED`.
Falhas nesse salvamento auxiliar não bloqueiam o preenchimento público.

## Sem contratos nesta etapa

O módulo resolve primeiro captação e organização de leads. Documentos serão um módulo posterior.
