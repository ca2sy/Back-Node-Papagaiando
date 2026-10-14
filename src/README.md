# src/

Todo o código da API. Este arquivo é o **guia**: mostra como as pastas se conectam e leva para o `README.md` de cada uma.

## Pastas

| Pasta | O que tem | Documentação |
|---|---|---|
| `config/` | Conexão com o banco (cliente do Prisma) | [config](./config/README.md) |
| `controllers/` | Recebem a requisição, chamam o service e devolvem a resposta | [controllers](./controllers/README.md) |
| `dtos/` | Schemas Zod que validam os dados de entrada | [dtos](./dtos/README.md) |
| `errors/` | Classes de erro (404, 403, 401...) | [errors](./errors/README.md) |
| `middleware/` | Autenticação (`requireAuth`) e tratamento de erros | [middleware](./middleware/README.md) |
| `routes/` | Liga cada URL ao controller certo | [routes](./routes/README.md) |
| `services/` | Regras de negócio, autorização e consultas ao banco | [services](./services/README.md) |
| `types/` | Ajustes de tipos do TypeScript | [types](./types/README.md) |
| `utils/` | Funções de JWT e leitura de dados da requisição | [utils](./utils/README.md) |
| `generated/` | Código gerado pelo Prisma. **Não editar e não commitar** | [config](./config/README.md#a-pasta-srcgenerated) |

O banco de dados (tabelas e relacionamentos) está descrito em [`../prisma/README.md`](../prisma/README.md).

## Arquivos da raiz de `src/`

- **`server.ts`**: ponto de entrada. Carrega o `.env` (precisa ser o primeiro import) e sobe o servidor na porta configurada.
- **`app.ts`**: monta o Express. Registra, nesta ordem: CORS, leitura de JSON, `GET /health`, as rotas, o tratador de rota inexistente e, por último, o tratador de erros.

## Caminho de uma requisição

```
Requisição
   │
   ▼
app.ts ── cors + express.json()
   │
   ▼
routes/ ── encontra a URL e o método; as rotas protegidas passam pelo requireAuth
   │         (middleware/jwtAuth.middleware.ts → confere o token e preenche req.userId)
   ▼
controllers/ ── valida a entrada (dtos/ + Zod) e lê o usuário logado (utils/request.ts)
   │
   ▼
services/ ── aplica as regras de negócio e a autorização, e consulta o banco (config/prisma.ts)
   │
   ▼
Resposta JSON
```

Se em **qualquer** ponto acontecer um erro (validação, item não encontrado, acesso negado...), ele é lançado com `throw` e vai direto para o `errorHandler` (`middleware/errorHandler.middleware.ts`), que devolve a resposta de erro padronizada. Não é preciso `try/catch` nos controllers nem nos services: o Express 5 encaminha sozinho os erros de funções `async`.

## Onde mexer para...

| Quero... | Mexer em |
|---|---|
| Criar uma rota nova | `routes/` (URL) + `controllers/` (resposta) + `services/` (regra) |
| Mudar uma regra de negócio | `services/` |
| Mudar o que é aceito numa requisição | `dtos/` |
| Criar um novo tipo de erro | `errors/` |
| Mudar uma tabela ou coluna | `../prisma/schema.prisma` e depois `npx prisma migrate dev` + `npx prisma generate` |

## Convenções

- Arquivos nomeados pelo tipo: `usuario.service.ts`, `usuario.controller.ts`, `usuario.routes.ts`, `usuario.dto.ts`.
- Os controllers ficam enxutos; a lógica fica nos services.
- Services lançam erros de `errors/` em vez de devolver `null` ou `false`.
- Nunca devolver senha ou tokens de recuperação nas respostas.
