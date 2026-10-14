# src/dtos/

Define o **formato esperado** dos dados que chegam em cada requisição (cadastro, login, criar categoria etc.) e valida esses dados automaticamente. DTO significa *Data Transfer Object*, o "molde" dos dados de entrada.

## Zod

A validação usa o [Zod](https://zod.dev). Em vez de escrever `if` para cada campo, descreve-se o formato esperado:

```ts
const schema = z.object({
  email: z.string().email("Email deve ser válido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
```

E valida-se com `.parse(...)`:

```ts
const dados = schema.parse(req.body);
// dados já vem tipado: { email: string; senha: string }
```

Se algo não bater (campo faltando, email inválido, senha curta), o Zod lança um `ZodError`. O `errorHandler` transforma isso em `400 VALIDATION_ERROR`, com a lista de campos problemáticos em `details`.

Campos que não estão no schema são **descartados** do resultado, então ninguém consegue enviar campos extras para dentro dos services.

### Versão

O projeto usa o **Zod 4** (`zod ^4.x`). Atenção a uma diferença importante em relação a muitos tutoriais: a opção `required_error` (do Zod 3) **não existe** nesta versão e causa erro de compilação. Aqui, a mensagem de campo obrigatório vem do próprio `.min(1, "mensagem")` (texto) ou de uma mensagem passada ao construtor, como em `z.string("perfilId é obrigatório")`.

## Arquivos

### `auth.dto.ts`

| Schema | Campos | Usado em |
|---|---|---|
| `authLoginSchema` | `email` (válido), `senha` | `POST /auth/login` |
| `esqueciSenhaSchema` | `email` (válido) | `POST /usuarios/esqueci-senha` |
| `passwordResetSchema` | `token`, `novaSenha` (mín. 8 caracteres) | `POST /usuarios/redefinir-senha` |
| `passwordVerifySchema` | `senha` | `POST /auth/verificar-senha` |

### `usuario.dto.ts`

| Schema | Campos |
|---|---|
| `usuarioCreateSchema` | `nome`, `email` (válido), `senha` (mín. 8 caracteres), todos obrigatórios |
| `usuarioUpdateSchema` | `nome`, `email`, `senha`, todos **opcionais**; só atualiza o que for enviado |

### `perfil.dto.ts`

| Schema | Campos |
|---|---|
| `perfilCreateSchema` | `nome`, `urlFoto`, obrigatórios |
| `perfilUpdateSchema` | `nome`, `urlFoto`, opcionais |

### `categoria.dto.ts`

| Schema | Campos |
|---|---|
| `categoriaCreateSchema` | `nome`, `urlImagem`, `perfilId` (UUID), obrigatórios |
| `categoriaUpdateSchema` | `nome`, `urlImagem`, opcionais |

### `botao.dto.ts`

| Schema | Campos |
|---|---|
| `botaoCreateSchema` | `nome`, `urlImagem`, `urlAudio`, `categoriaId` (UUID). Base de botão **padrão** (hoje sem rota; usado apenas pelo service) |
| `botaoPersonalizadoCreateSchema` | Os campos acima **+ `perfilId`** (UUID). Usado em `POST /botoes/personalizados` |
| `botaoUpdateSchema` | `nome`, `urlImagem`, `urlAudio`, opcionais |

### `common.dto.ts`

Schemas reutilizados pelas funções de `utils/request.ts` e pelos controllers.

| Schema | O que valida |
|---|---|
| `uuidSchema` | Que o valor é um UUID válido |
| `perfilIdQuerySchema` | `?perfilId=...` na URL (obrigatório, UUID) |
| `nomeQuerySchema` | `?nome=...` na URL (obrigatório, sem espaços nas pontas, não vazio) |

## Tipos gerados

Cada arquivo também exporta o **tipo TypeScript** de cada schema, criado automaticamente com `z.infer`. Assim não é preciso escrever a interface duas vezes:

```ts
export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
```

Os `services/` usam esses tipos nos parâmetros (`registrarUsuario(dados: UsuarioCreateInput)`).

## Como é usado

```ts
export async function criarUsuario(req: Request, res: Response) {
  const dados = usuarioCreateSchema.parse(req.body); // valida e tipa
  const usuario = await usuarioService.registrarUsuario(dados);
  res.status(201).json({ usuario, token });
}
```

Se `req.body` não bater com o schema, o `.parse()` lança `ZodError`, que o Express 5 encaminha ao `errorHandler` sem precisar de `try/catch`.

As regras mais profundas (por exemplo, "email já cadastrado") não ficam aqui: ficam nos `services/`. Os DTOs só validam o **formato** dos dados.
