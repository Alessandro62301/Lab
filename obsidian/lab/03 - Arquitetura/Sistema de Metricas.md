---
status: planned
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Sistema de Metricas

O Lab terá uma camada única de eventos usada pela aplicação principal e pelos módulos.
Ela deve responder o que foi visto, clicado, iniciado, concluído ou abandonado sem cada
produto inventar sua própria definição.

## Identificadores

- `workspaceId`: proprietário dos dados.
- `moduleKey`: módulo que originou o evento.
- `projectId`: projeto opcional.
- `entityType` e `entityId`: página, formulário, link ou tarefa.
- `anonymousId`: visitante anônimo persistido no navegador.
- `sessionId`: visita atual.
- `userId`: somente quando autenticado.

## Eventos iniciais

- `page_view`
- `link_click`
- `form_started`
- `form_step_completed`
- `form_completed`
- `form_abandoned`
- `lead_identified`
- `qr_scanned`

## Contexto

Guardar rota, origem, UTM, dispositivo, navegador, país/cidade quando disponível,
horário e metadados específicos. Não salvar IP bruto. Dados pessoais devem permanecer
nos domínios de leads e formulários, e não dentro da telemetria.

## Métricas derivadas

- visualizações totais e únicas;
- visitantes e sessões;
- cliques totais e únicos;
- taxa de clique;
- conversão por página, link, formulário e campanha;
- abandono por etapa;
- origem, UTM, dispositivo e localização;
- tempo até conversão;
- respostas parciais recuperadas.

Ver [[Metricas]] e [[Arquitetura]] do projeto [[Presenca]].
