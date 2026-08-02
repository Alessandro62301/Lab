---
status: active
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Arquitetura

`MediaAsset` guarda metadados, dimensões, origem, workspace e identificador do provedor. O binário fica no disco local ou no Google Drive. `StorageConnection` mantém a conexão por workspace; tokens OAuth são criptografados antes de ir ao banco.

O frontend usa um único `MediaPickerDialog`. Ao escolher uma imagem, o componente consumidor recebe a URL interna `/api/media/assets/{id}/content`, portanto não depende de links públicos do Drive.

## Pontos principais

- API: `apps/web/src/app/api/media`
- domínio e UI: `apps/web/src/features/media`
- tela global: `/media`
- armazenamento local: `.data/media`
- escopo Google: `drive.file`
