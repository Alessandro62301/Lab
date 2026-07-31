---
status: active
tipo: arquitetura
criado_em: 2026-07-31
atualizado_em: 2026-07-31
---

# Modelo de Dados

- `Form`: configuração, publicação e identidade visual.
- `FormField`: pergunta, posição, obrigatoriedade, opções e condição.
- `FormLogicRule`: estrutura preparada para regras avançadas.
- `FormSubmission`: sessão iniciada no primeiro avanço, com status, etapa atual, percentual e última atividade.
- `FormAnswer`: resposta de cada campo.
- `Lead`: contato consolidado por e-mail ou telefone.

O histórico de respostas não é sobrescrito quando um lead volta a preencher outro formulário.
Uma sessão `IN_PROGRESS` aparece como resposta parcial recuperada e pode ser concluída
posteriormente usando sua `externalKey`.

Ver [[Arquitetura]].
