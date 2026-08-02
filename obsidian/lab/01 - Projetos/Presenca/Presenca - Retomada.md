---
status: active
tipo: retomada
modulo: Presenca
fase: MVP funcional
rota_principal: /modules/presence
atualizado_em: 2026-07-31
---

# Retomada — Presença

## Estado atual

- Página pública customizada disponível em `/p/mavi`, inspirada na identidade visual da Mavi.
- Editor visual com blocos de link, destaque, texto, imagem, galeria e formulário.
- Aparência editável: foto, descrição, cores, arredondamento, slug e publicação.
- Fonte selecionável para a página inteira, tamanho tipográfico ajustável de 11–24 px,
  biblioteca Lucide com ícone individual por link e tamanho global dos ícones de 16–48 px.
- Reordenação simples de blocos e prévia ao vivo.
- Visualizações e cliques anônimos são gravados e resumidos no painel.
- Schema, migração e seed do PostgreSQL concluídos.

## Próxima ação

Adicionar criação e duplicação de páginas, upload real de imagens e reordenação por arrastar.

## Pontos de entrada

- Painel: `apps/web/src/app/(lab)/modules/presence/page.tsx`
- Editor: `apps/web/src/features/presence/components/presence-editor.tsx`
- Catálogo de fontes e ícones: `apps/web/src/features/presence/appearance.ts`
- Página pública: `apps/web/src/features/presence/components/public-presence-page.tsx`
- Dados: `apps/web/src/features/presence/server.ts`
- Eventos: `apps/web/src/app/api/public/presence` e `apps/web/src/app/r`
- Banco: `packages/database/prisma/schema.prisma`
- Testes: `apps/web/src/features/presence/*.test.ts`

## Decisões que não devem ser perdidas

- Presença é um compositor de marca, não uma pilha genérica de botões.
- O tema é salvo por página; cada marca pode ter identidade diferente.
- Eventos usam identificador anônimo e não armazenam IP bruto.
- Formulários são conectados por bloco; sua lógica continua no módulo [[Captacao de Leads]].

## Como validar

- Rode `npm test` e o typecheck do app web.
- Abra `/modules/presence`, edite a página Mavi e salve.
- Abra `/p/mavi`; uma nova visualização deve aparecer no painel.

Veja também [[Visao Geral]], [[MVP]], [[Arquitetura]], [[Metricas]] e [[Backlog]].
