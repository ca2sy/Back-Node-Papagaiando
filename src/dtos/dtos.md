# src/dtos/

Define o **formato esperado** dos dados que chegam em cada requisição (cadastro de usuário, login, criar categoria etc.) e valida esses dados automaticamente. 

## O que é o Zod

[Zod](https://zod.dev) é uma biblioteca de validação de dados para TypeScript. Descrevemos o formato esperado como um objeto:

```ts
const schema = z.object({
  email: z.string().email("Email deve ser válido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
```

E depois validamos os dados recebidos com `.parse(...)`:

```ts
const dados = schema.parse(req.body);
// dados já vem tipado certinho: { email: string; senha: string }
```

Se algo não bater com o schema (campo faltando, email inválido, senha curta demais), o Zod **lança um erro automaticamente** (`ZodError`), ou seja, não precisa escrever `if` pra cada campo. Esse erro já é tratado pelo `middleware/errorHandler.middleware.ts` (que criamos antes), que transforma isso numa resposta `400 VALIDATION_ERROR` com a lista de campos problemáticos.

## Versão usada: Zod 4

O projeto usa a **versão 4** do Zod (`zod: ^4.6.5` no `package.json`). Isso importa porque a versão 4 mudou a forma de customizar mensagens de erro em campos obrigatórios: o antigo `z.string({ required_error: "..." })` (usado nas versões 3.x, e é o que aparece na maioria dos tutoriais na internet) **não existe mais**. Aqui, a mensagem de "campo obrigatório" é coberta pelo próprio `.min(1, "mensagem")`, que barra tanto string vazia quanto ausente.

Se você pesquisar exemplos de Zod na internet e ver `required_error`, ignore, é sintaxe de versão antiga e vai dar erro de compilação neste projeto.

## Arquivos

| Arquivo | Equivalente no Java | Schemas |
|---|---|---|
| `auth.dto.ts` | `AuthLoginDTO`, `PasswordResetDTO`, `PasswordVerifyDTO` | `authLoginSchema`, `passwordResetSchema`, `passwordVerifySchema` |
| `usuario.dto.ts` | `UsuarioCreateDTO`, `UsuarioUpdateDTO` | `usuarioCreateSchema`, `usuarioUpdateSchema` |
| `perfil.dto.ts` | `PerfilCreateDTO`, `PerfilUpdateDTO` | `perfilCreateSchema`, `perfilUpdateSchema` |
| `categoria.dto.ts` | `CategoriaCreateDTO`, `CategoriaUpdateDTO` | `categoriaCreateSchema`, `categoriaUpdateSchema` |
| `botao.dto.ts` | `BotaoCreateDTO`, `BotaoUpdateDTO` | `botaoCreateSchema`, `botaoUpdateSchema` |

Cada arquivo tem um schema de **criação** (campos obrigatórios) e um de **atualização** (todos os campos `.optional()`, só atualiza o que for enviado.).

Os schemas de `categoria` e `botao` também validam que `perfilId`/`categoriaId` são **UUIDs válidos** (`.uuid("ID inválido")`).

Cada arquivo também exporta o **tipo TypeScript** correspondente (ex: `UsuarioCreateInput`), gerado automaticamente a partir do schema com `z.infer<typeof schema>`.

## Como é usado nos controllers.

```ts
import { usuarioCreateSchema } from "../dtos/usuario.dto";

export async function criarUsuario(req: Request, res: Response) {
  const dados = usuarioCreateSchema.parse(req.body); // valida e já tipa
  const usuario = await usuarioService.criar(dados);
  res.status(201).json(usuario);
}
```

Se `req.body` não bater com o schema, o `.parse()` lança `ZodError`, que o Express 5 encaminha automaticamente pro `errorHandler` (não precisa de `try/catch`).