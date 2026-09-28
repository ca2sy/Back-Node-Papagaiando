# src/errors/

Classes de erro customizadas do sistema. 

A ideia: em vez de lançar `throw new Error("mensagem qualquer")` espalhado pelo código, cada erro carrega também um **status HTTP** e um **código de erro** (`errorCode`), que o `middleware/errorHandler.middleware.ts` usa pra montar a resposta JSON padronizada.

## Arquivos

### `AppError.ts`
Classe base. Todas as outras estendem ela.

```ts
class AppError extends Error {
  statusCode: number; // ex: 404
  errorCode: string;  // ex: "RESOURCE_NOT_FOUND"
}
```

### `ResourceNotFoundError.ts` — 404
Quando algo não é encontrado (usuário, perfil, categoria, botão etc.).
```ts
throw ResourceNotFoundError.byId("Perfil", id);
// "Perfil com ID '...' não encontrado(a)"
```

### `AccessDeniedError.ts` — 403
Quando o usuário autenticado tenta mexer em algo que não é dele (ex: perfil de outro usuário).
```ts
throw AccessDeniedError.resource("Categoria", categoriaId);
```

### `AuthenticationError.ts` — 401
Problemas de login/token. Tem atalhos prontos:
```ts
AuthenticationError.invalidCredentials(); // email ou senha errados
AuthenticationError.invalidToken();
AuthenticationError.expiredToken();
AuthenticationError.missingToken();
```

### `BusinessError.ts` — 400 (por padrão)
Violação de regra de negócio (ex: tentar deletar uma categoria que ainda tem botões).
```ts
BusinessError.duplicateEmail(email);
BusinessError.invalidPassword();
BusinessError.invalidData("nome");
```

### `InvalidTokenError.ts` — 400
Especificamente para o token de **recuperação de senha** (diferente do token JWT de login).
```ts
InvalidTokenError.expired();
InvalidTokenError.invalid();
InvalidTokenError.notFound();
```

### `index.ts`
Reexporta tudo, pra poder importar de um lugar só:
```ts
import { ResourceNotFoundError, BusinessError } from "../errors";
```

## Como usar em services/controllers

Só dar `throw`. Não precisa de `try/catch` em volta — o Express 5 encaminha erros de funções `async` automaticamente pro `errorHandler`, que sabe transformar qualquer `AppError` na resposta JSON certa.

```ts
export async function buscarPerfil(id: string) {
  const perfil = await prisma.perfil.findUnique({ where: { id } });
  if (!perfil) throw ResourceNotFoundError.byId("Perfil", id);
  return perfil;
}
```
