# src/utils/

Funções auxiliares usadas em várias partes do sistema.

## Arquivos

### `jwt.ts`: token de login

Gera e valida os tokens JWT (o "crachá" que o usuário usa depois do login).

| Função | O que faz |
|---|---|
| `generateToken(email, userId)` | Cria um token novo (usado no cadastro e no login) |
| `extractUsername(token)` | Devolve o email guardado no token |
| `extractUserId(token)` | Devolve o id do usuário guardado no token (confere que é um UUID) |
| `extractTokenFromHeader(authHeader)` | Tira o `Bearer ` do início do header `Authorization` |

Todas as funções **lançam erro** (`AuthenticationError`, de `errors/`) se o token for inválido, expirado ou estiver ausente. Não devolvem `null` ou `false`. Quem as usa é o `middleware/jwtAuth.middleware.ts`.

O token é assinado com HS256 e leva o email (como *subject*) e o `userId`.

**Variáveis de ambiente:**

```
JWT_SECRET=chave-longa-e-aleatoria    # obrigatória; sem ela o servidor nem inicia
JWT_EXPIRATION=36000                  # opcional, em SEGUNDOS (36000 = 10 horas)
```

Use um `JWT_SECRET` diferente em cada ambiente. Quem tem essa chave consegue forjar tokens de qualquer usuário.

### `request.ts`: ler dados da requisição

Funções que os controllers usam para ler informações da requisição já validadas.

| Função | O que faz |
|---|---|
| `getUsuarioLogadoId(req)` | Devolve o id do usuário logado (preenchido pelo `requireAuth`). Dá `401` se não houver |
| `getUuidParam(req, "id")` | Lê um parâmetro da URL (ex.: `/:id`) e confere que é um UUID. Se não for, dá `400 VALIDATION_ERROR` |
| `getPerfilIdQuery(req)` | Lê `?perfilId=...` da URL e confere que é um UUID. Se faltar ou for inválido, dá `400` |

Exemplo:

```ts
const categoria = await categoriaService.buscarPorId(
  getUuidParam(req, "id"),     // /categorias/:id
  getPerfilIdQuery(req),       // ?perfilId=...
  getUsuarioLogadoId(req),     // quem está logado
);
```

Validar o UUID antes de chegar ao banco evita erro interno quando alguém manda um id mal formado.
