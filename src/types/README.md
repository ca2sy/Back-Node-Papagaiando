# src/types/

Arquivos de definição de tipos do TypeScript. Não contêm lógica: só ensinam o compilador sobre formatos que bibliotecas de fora não conhecem.

## Arquivos

### `express.d.ts`

O Express, por padrão, não sabe que o `userId` e o `userEmail` ficam guardados dentro do `req` (isso é feito no `middleware/jwtAuth.middleware.ts`, depois de validar o token). Este arquivo avisa o TypeScript que esses dois campos existem, de forma opcional, em toda requisição:

```ts
import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export {};
```

Com isso, `req.userId` pode ser lido em qualquer controller sem erro de tipo. Como o campo é opcional, o jeito seguro de lê-lo é a função `getUsuarioLogadoId(req)` de `utils/request.ts`, que dá erro 401 se ele não existir.

O `import "express"` e o `export {}` fazem o TypeScript tratar o arquivo como módulo e aplicar a extensão globalmente.

Este arquivo não precisa ser importado em lugar nenhum: o TypeScript o encontra pelo `include` do `tsconfig.json`.
