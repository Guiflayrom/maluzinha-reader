# Maluzinha

## Docker

Com o Docker Desktop iniciado:

1. Copie `.env.example` para `.env`.
2. Preencha `NGROK_AUTHTOKEN` com o token da sua conta ngrok.
3. Suba tudo com `pnpm docker:up` ou `docker compose up --build -d`.

O app fica em `http://localhost:3000`.

O inspetor local do ngrok fica em `http://localhost:4040`.

Para descobrir a URL publica do tunel:

```powershell
pnpm ngrok:url
```

Ou:

```powershell
Invoke-RestMethod http://localhost:4040/api/tunnels |
  Select-Object -ExpandProperty tunnels |
  Select-Object public_url
```

Para acompanhar os logs:

```powershell
pnpm docker:logs
```

Para derrubar a stack:

```powershell
pnpm docker:down
```

O banco SQLite fica persistido em `./data`.
