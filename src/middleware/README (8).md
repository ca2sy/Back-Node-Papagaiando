# src/middleware/

Funções que rodam **entre** a chegada da requisição e a execução do controller.

## Arquivos

### `jwtAuth.middleware.ts`: `requireAuth`

Protege rotas exigindo um token de login válido.

O que faz:

1. Lê o header `Authorization: Bearer <token>`.
2. Valida o token (assinatura e validade) usando `utils/jwt.ts`.
3. Se for válido, preenche `req.userId` e `req.userEmail`. É assim que os controllers sabem **quem** está fazendo a requisição (ver `utils/request.ts`).
4. Se for inválido, expirado ou estiver ausente, repassa um `AuthenticationError` (401) ao `errorHandler`.

Nas rotas, é aplicado de duas formas:

```ts
// em uma rota específica
router.get("/me", requireAuth, usuarioController.buscarMeuPerfil);

// em todas as rotas de um arquivo (perfis, categorias e botões)
router.use(requireAuth);
```

**Rotas sem `requireAuth`** (públicas):

- `POST /usuarios` (cadastro)
- `POST /auth/login`
- `POST /usuarios/esqueci-senha` e `POST /auth/esqueci-senha`
- `POST /usuarios/redefinir-senha` e `POST /auth/redefinir-senha`

Todas as demais exigem login. A proteção é declarada rota por rota nos arquivos de `routes/`, então não existe uma lista de "exceções" escondida.

### `errorHandler.middleware.ts`

Recebe **todo** erro lançado em qualquer rota e responde sempre no mesmo formato:

```json
{
  "timestamp": "2026-10-14T12:00:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "VALIDATION_ERROR",
  "message": "Erro de validação nos dados fornecidos",
  "path": "/usuarios",
  "details": ["senha: Senha deve ter no mínimo 8 caracteres"]
}
```

Tipos de erro que ele reconhece:

| Erro recebido | Resposta |
|---|---|
| Classes de `errors/` (`AppError` e filhas) | O status e o `errorCode` da própria classe |
| `ZodError` (dados inválidos) | `400 VALIDATION_ERROR`, com a lista de campos em `details` |
| JSON malformado no corpo | `400 MALFORMED_JSON` |
| Qualquer outro erro | `500 INTERNAL_ERROR`. O erro real vai só para o log do servidor; o cliente recebe uma mensagem genérica |

Também exporta o **`notFoundHandler`**, que responde `404 RESOURCE_NOT_FOUND` em JSON quando a rota não existe (sem ele, o Express devolveria uma página HTML).

## Ordem de registro no `app.ts`

A ordem importa, porque a requisição passa por cada item em sequência:

```
1. cors()
2. express.json()          (lê o corpo da requisição)
3. rotas
4. notFoundHandler         (nenhuma rota respondeu)
5. errorHandler            (sempre por último)
```
