# src/types/

Arquivos de definição de tipos do TypeScript que não são "código" de verdade, só ensinam o compilador sobre formatos de dados extras que bibliotecas de fora não sabem.


## Arquivos

### `express.d.ts`
O Express, por padrão, não sabe que a gente guarda o `userId` e o `userEmail` dentro do `req` (isso é feito no `middleware/jwtAuth.middleware.ts`, depois de validar o token). Esse arquivo "avisa" o TypeScript que esses dois campos existem, opcionalmente, em toda requisição:

```ts
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}
```

Com isso, em qualquer controller dá pra escrever `req.userId` sem o TypeScript reclamar:

```ts
export async function buscarLogado(req: Request, res: Response) {
  const usuario = await usuarioService.buscarPorId(req.userId!);
  res.json(usuario);
}
```

(O `!` depois de `req.userId` diz "eu garanto que isso não é `undefined` aqui" — só é seguro usar em rotas que passam pelo `requireAuth` antes.)

Esse arquivo não precisa ser importado em lugar nenhum; o TypeScript o carrega automaticamente por estar listado no `include` do `tsconfig.json`.