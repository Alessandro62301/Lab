# Deploy do Lab na Hostinger

O ambiente de produção usa quatro serviços:

- `postgres`: banco privado, sem porta publicada;
- `migrate`: aplica migrations e cria o primeiro administrador de forma idempotente;
- `web`: aplicação Next.js em modo standalone;
- `caddy`: proxy reverso com HTTPS automático.

## 1. Pré-requisitos

- VPS Hostinger com o template Docker em Ubuntu 24.04;
- domínio ou subdomínio apontando um registro `A` para o IP da VPS;
- portas TCP 80 e 443 e UDP 443 liberadas no firewall da VPS;
- repositório disponível na VPS por Git/SSH.

Hospedagem compartilhada da Hostinger não executa este Compose. É necessário um plano VPS.

## 2. Preparar as variáveis

Na VPS:

```bash
git clone URL_DO_REPOSITORIO lab
cd lab
cp .env.production.example .env.production
openssl rand -base64 48
openssl rand -hex 32
```

Edite `.env.production` e substitua todos os valores de exemplo. Use a primeira saída aleatória como `AUTH_SECRET` e a segunda como `MEDIA_TOKEN_ENCRYPTION_KEY`.

Regras importantes:

- `APP_DOMAIN` contém somente o host, sem `https://`;
- `POSTGRES_PASSWORD` e a senha dentro de `DATABASE_URL` devem ser iguais;
- caracteres especiais na senha do banco precisam ser codificados na URL;
- `INITIAL_ADMIN_PASSWORD` precisa ter no mínimo 12 caracteres;
- nunca envie `.env.production` ao Git.

## 3. Subir

```bash
docker compose --env-file .env.production -f compose.production.yml config
docker compose --env-file .env.production -f compose.production.yml up -d --build
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs -f migrate web caddy
```

O serviço `migrate` precisa terminar com código zero. Depois, acesse `https://SEU_DOMINIO/login` e use `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` e `INITIAL_WORKSPACE_SLUG`.

O bootstrap não sobrescreve uma senha que já esteja cadastrada. Assim, uma futura alteração de senha não será revertida em novos deploys.

## 4. Atualizar

```bash
git pull --ff-only
docker compose --env-file .env.production -f compose.production.yml up -d --build
docker image prune -f
```

As migrations rodam antes da nova aplicação ficar saudável.

## 5. Backup

Crie um diretório privado para backups e agende este comando no cron:

```bash
mkdir -p backups
docker compose --env-file .env.production -f compose.production.yml exec -T postgres \
  pg_dump -U lab -d lab -Fc > "backups/lab-$(date +%F-%H%M).dump"
```

Também faça backup dos volumes `media_data` e `caddy_data`. Teste a restauração periodicamente.

## 6. Diagnóstico

```bash
curl -fsS https://SEU_DOMINIO/api/health
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs --tail=200 web
docker compose --env-file .env.production -f compose.production.yml logs --tail=200 caddy
```

Se o certificado não for emitido, confirme primeiro o DNS e as portas 80/443. Se `migrate` falhar, verifique `DATABASE_URL` e as credenciais iniciais antes de reiniciar o projeto.
