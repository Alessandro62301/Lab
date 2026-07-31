# Lab

O Lab é uma aplicação central para organizar projetos, conhecimento, tarefas e infraestrutura de IA em um único workspace. O Data Inbox começa como o primeiro módulo de produto registrado, sem processamento próprio nesta etapa.

## O que já existe

- Dashboard de trabalho com foco, projetos e notas recentes
- Projetos com contexto e progresso
- Notas em Markdown com edição e prévia local
- Tarefas em lista e Kanban
- Central de IA preparada para OpenAI e Claude, sem chamadas reais
- Registro de módulos internos
- Sessão de desenvolvimento preparada para ser substituída por Auth.js
- Modelo multiworkspace em Prisma
- PostgreSQL local com Docker Compose
- Seed com o workspace Mavi Lab
- Base de conhecimento em `obsidian/lab`

## Estrutura

```text
apps/
  web/                 Next.js App Router e APIs
packages/
  database/            Prisma schema e seed
obsidian/
  lab/                 Documentação global e templates
```

O monorepo usa npm workspaces sem um orquestrador adicional. Isso mantém a fundação pequena; Turborepo só deve ser considerado quando houver mais aplicações ou pipelines que realmente o justifiquem.

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Docker Desktop

## Início rápido

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Abra `http://localhost:3000`.

No Windows PowerShell, copie o ambiente com:

```powershell
Copy-Item .env.example .env
```

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run test:coverage
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Estratégia de testes

O desenvolvimento segue uma abordagem orientada a testes para regras de negócio e correções:

1. escrever um teste que descreve o comportamento esperado;
2. confirmar que ele falha pelo motivo correto;
3. implementar a solução mais simples;
4. executar testes, tipos e lint;
5. refatorar mantendo a suíte verde.

Todo bug corrigido deve ganhar um teste de regressão. A primeira suíte cobre máscaras,
CPF, CNPJ, telefone, obrigatoriedade e endereço dos formulários. O relatório de cobertura
exige no mínimo 90% de linhas e funções e 85% de ramificações nesse núcleo.

## Autenticação

`apps/web/src/server/auth/session.ts` expõe o contrato usado pelo servidor e retorna um usuário de desenvolvimento. Ao conectar Auth.js, mantenha `userId`, `workspaceId` e `role` como saída confiável da sessão. O frontend nunca deve escolher livremente o `workspaceId` de uma operação.

## Central de IA

Os contratos de provedor ficam em `apps/web/src/server/ai`. OpenAI e Claude têm adapters desativados por desenho. Mesmo com chaves no ambiente, `complete()` ainda lança um erro explícito até a implementação real ser autorizada.

## Obsidian

Abra `obsidian/lab` como vault ou copie a pasta para um vault existente. Comece em `00 - Inicio/Home.md`. Para um novo subprojeto, duplique `07 - Templates/Subprojeto Completo` e ajuste as propriedades e links.

## Próxima etapa sugerida

1. Conectar as telas aos repositórios Prisma.
2. Implementar Auth.js e seleção segura de workspace.
3. Persistir notas e movimentações do Kanban.
4. Adicionar a primeira chamada de IA com auditoria e limites.
5. Iniciar o fluxo funcional do Data Inbox.
## Módulo de captação de leads

O Lab inclui um primeiro fluxo funcional de formulários em `/forms`. O seed cria o formulário de exemplo da Mavi, respostas e leads. A experiência pública fica em `/f/encomenda-mavi`.

O projeto mantém também `apps/web/.env.example`, porque o Next.js executa a partir dessa pasta no monorepo. A configuração local já aponta para o PostgreSQL na porta `5433`.
