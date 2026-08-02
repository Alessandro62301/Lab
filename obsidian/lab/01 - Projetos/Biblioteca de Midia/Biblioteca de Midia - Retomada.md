---
status: active
tipo: retomada
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Biblioteca de Mídia — Retomada

## Onde está

- UI global: `/media`
- seletor: `apps/web/src/features/media/media-picker.tsx`
- API: `apps/web/src/app/api/media`
- modelos: `MediaAsset` e `StorageConnection`

## Estado atual

Upload local, galeria, reuso, recorte, resize e integração no Presence estão implementados. O fluxo OAuth do Google Drive está preparado e depende apenas das credenciais do projeto Google Cloud.

## Próximos passos

1. Conectar uma conta Google real e validar upload/download.
2. Criar busca, tags, pastas virtuais e exclusão recuperável.
3. Gerar miniaturas e variantes em worker.
4. Adicionar seleção múltipla nativa no modal.
5. Reutilizar `MediaInput` nos formulários e demais módulos.
