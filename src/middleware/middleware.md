# src/middleware/

Funções que rodam **entre** a requisição chegar e o controller ser executado. 

## Arquivos

### `errorHandler.middleware.ts`
Pega qualquer erro lançado em qualquer rota e devolve sempre o mesmo formato de resposta:

```json
{
  "timestamp": "2026-09-28T10:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Perfil com ID '...' não encontrado(a)",
  "path": "/perfis/..."
}
```

Sabe tratar diferentes tipos de erro:
- **`AppError`** (e subclasses de `src/errors/`) → usa o `statusCode` e `errorCode` de cada uma.
- **`ZodError`** (validação de dados de entrada) → vira `400 VALIDATION_ERROR`, com a lista de campos inválidos em `details`.
- **JSON malformado no corpo da requisição** → `400 MALFORMED_JSON`.
- **Qualquer outro erro inesperado** → `500 INTERNAL_ERROR`. O erro real é logado no console do servidor, mas **não** é exposto pro cliente (evita vazar detalhes internos).

Também exporta `notFoundHandler`, que devolve um 404 em JSON quando a rota nem existe (sem isso, o Express mostraria uma página HTML de erro).

**Onde é usado:** precisa ser registrado no `app.ts`, **depois** de todas as rotas (é a última coisa que o Express confere).

### `jwtAuth.middleware.ts`
Protege uma rota exigindo um token JWT válido.

```ts
router.get("/usuarios/me", requireAuth, usuarioController.buscarLogado);
```

O que ele faz:
1. Lê o header `Authorization: Bearer <token>`.
2. Valida o token (assinatura e expiração) usando `utils/jwt.ts`.
3. Se válido, preenche `req.userId` e `req.userEmail` — os controllers usam esses campos pra saber **quem** está fazendo a requisição.
4. Se inválido/ausente/expirado, chama `next(err)` com o erro apropriado (`AuthenticationError`), que cai no `errorHandler`.


## Ordem de registro no `app.ts` (referência futura)

```
1. express.json() (parse do corpo da requisição)
2. cors()
3. rotas (cada uma decide se usa requireAuth ou não)
4. notFoundHandler
5. errorHandler   ← sempre por último
```