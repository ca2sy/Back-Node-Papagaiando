# src/errors/

Classes de erro do sistema. Em vez de lançar `new Error("mensagem")`, cada erro carrega também um **status HTTP** e um **código de erro** (`errorCode`). O `errorHandler` (em `middleware/`) usa esses dados para montar a resposta JSON padronizada.

## Classes

| Arquivo | Classe | Status | `errorCode` | Quando usar |
|---|---|---|---|---|
| `AppError.ts` | `AppError` | (qualquer) | (qualquer) | Classe base. As outras estendem esta |
| `ResourceNotFoundError.ts` | `ResourceNotFoundError` | 404 | `RESOURCE_NOT_FOUND` | Item não encontrado |
| `AccessDeniedError.ts` | `AccessDeniedError` | 403 | `ACCESS_DENIED` | Usuário tentou acessar algo que não é dele |
| `AuthenticationError.ts` | `AuthenticationError` | 401 | `AUTHENTICATION_FAILED` | Login ou token inválido, expirado ou ausente |
| `BusinessError.ts` | `BusinessError` | 400 | `BUSINESS_RULE_VIOLATION` | Regra de negócio violada |
| `InvalidTokenError.ts` | `InvalidTokenError` | 400 | `INVALID_TOKEN` | Token de **recuperação de senha** inválido, expirado ou inexistente |

Além desses, o `errorHandler` também gera `VALIDATION_ERROR` (400, dados inválidos), `MALFORMED_JSON` (400, JSON quebrado) e `INTERNAL_ERROR` (500, erro inesperado).

O `index.ts` reexporta tudo, para importar de um lugar só:

```ts
import { ResourceNotFoundError, BusinessError } from "../errors";
```

## Atalhos prontos

```ts
ResourceNotFoundError.byId("Perfil", id);
// "Perfil com ID '...' não encontrado(a)"

AccessDeniedError.resource("Categoria", id);
// "Acesso negado ao recurso: Categoria (ID: ...)"

AuthenticationError.invalidCredentials(); // "Email ou senha inválidos"
AuthenticationError.invalidToken();
AuthenticationError.expiredToken();
AuthenticationError.missingToken();

BusinessError.duplicateEmail(email);
BusinessError.invalidPassword();       // senha com menos de 8 caracteres
BusinessError.invalidData("nome");

InvalidTokenError.expired();
InvalidTokenError.invalid();
InvalidTokenError.notFound();
```

Também dá para criar com mensagem própria: `new BusinessError("Mensagem")` ou `new AccessDeniedError("Mensagem")`.

## Como usar

Basta dar `throw`. Não precisa de `try/catch`: o Express 5 encaminha automaticamente os erros de funções `async` para o `errorHandler`.

```ts
export async function buscarPerfil(id: string) {
  const perfil = await prisma.perfil.findUnique({ where: { id } });
  if (!perfil) throw ResourceNotFoundError.byId("Perfil", id);
  return perfil;
}
```

## Resposta que o cliente recebe

```json
{
  "timestamp": "2026-10-14T12:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Perfil com ID '...' não encontrado(a)",
  "path": "/perfis/..."
}
```
