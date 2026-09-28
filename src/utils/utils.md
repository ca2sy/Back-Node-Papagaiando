# src/utils/

Funções auxiliares usadas em várias partes do sistema. 

## Arquivos

### `jwt.ts`
Gera e valida os tokens de autenticação.

| Função | Para quê serve |
|---|---|
| `generateToken(email, userId)` | Cria um token novo (usado no login e no cadastro) |
| `extractUsername(token)` | Pega o email de dentro do token |
| `extractUserId(token)` | Pega o ID do usuário de dentro do token (valida que é um UUID) |
| `extractTokenFromHeader(authHeader)` | Tira o `"Bearer "` do início do header `Authorization` |

Todas essas funções **lançam erro** (`AuthenticationError`, de `src/errors/`) se o token for inválido, expirado ou estiver ausente — não retornam `null`/`false` silenciosamente. Isso é usado pelo `middleware/jwtAuth.middleware.ts`.

**Configuração via variáveis de ambiente (`.env`):**
```
JWT_SECRET=uma-string-longa-e-aleatoria
JWT_EXPIRATION=36000   # em segundos; 36000 = 10 horas (mesmo padrão do Java)
```

⚠️ O `JWT_SECRET` **precisa** ser trocado por um valor novo e aleatório, o valor usado no projeto Java está exposto publicamente no GitHub e não deve ser reaproveitado.

