# src/controllers/

Recebem a requisição HTTP, chamam o service certo e devolvem a resposta. São deliberadamente **enxutos**: não têm regra de negócio (essa fica em `services/`).

Cada função de controller faz, em geral, três coisas:

1. **Valida a entrada** com um schema de `dtos/` (corpo, parâmetros da URL, `?perfilId=`...).
2. **Chama o service**, passando o usuário logado (`getUsuarioLogadoId(req)`).
3. **Responde** com o status e o JSON adequados.

```ts
export async function atualizarCategoria(req: Request, res: Response) {
  const dados = categoriaUpdateSchema.parse(req.body);       // 1. valida

  const categoria = await categoriaService.atualizarCategoria( // 2. chama o service
    getUuidParam(req, "id"),
    getPerfilIdQuery(req),
    dados,
    getUsuarioLogadoId(req),
  );

  res.json(categoria);                                         // 3. responde
}
```

Não há `try/catch`: se a validação ou o service lançar um erro, o Express 5 o encaminha ao `errorHandler`.

As funções auxiliares `getUsuarioLogadoId`, `getUuidParam` e `getPerfilIdQuery` vêm de [`utils/request.ts`](../utils/README.md).

## Arquivos

### `auth.controller.ts`

| Função | Resposta |
|---|---|
| `login` | `200` com `{ token, email, userId, nome }` |
| `verificarSenha` | `200` com `{ valido: true }`, ou `401` com `{ valido: false, message: "Senha incorreta" }` |

### `usuario.controller.ts`

| Função | Resposta |
|---|---|
| `criarUsuario` | `201` com `{ usuario: { id, nome, email }, token }` |
| `buscarMeuPerfil` | `200` com `{ id, nome, email }` |
| `atualizarMeuPerfil` | `200` com `{ id, nome, email }` |
| `deletarMinhaConta` | `204` sem corpo |
| `esqueciSenha` | `200` com `{ message }` (e `token`, só se `EXPOSE_RESET_TOKEN=true`) |
| `redefinirSenha` | `200` com `{ message: "Senha redefinida com sucesso!" }` |

Sobre o `esqueciSenha`:

- O email pode vir na URL (`?email=...`) ou no corpo (`{ "email": "..." }`).
- A resposta é **sempre a mesma**, exista ou não uma conta com aquele email, para não revelar quem está cadastrado.
- O token **não** é devolvido por padrão. Ele só aparece na resposta se a variável `EXPOSE_RESET_TOKEN=true` estiver definida (apenas para desenvolvimento). O envio do token por email ainda não foi implementado.

### `perfil.controller.ts`

| Função | Resposta |
|---|---|
| `criarPerfil` | `201` com o perfil |
| `listarMeusPerfis` | `200` com a lista de perfis do usuário logado |
| `buscarPorId` | `200` com o perfil |
| `atualizarPerfil` | `200` com o perfil |
| `deletarPerfil` | `204` |

### `categoria.controller.ts`

| Função | Resposta |
|---|---|
| `criarCategoria` | `201` com a categoria |
| `listarCategoriasPadrao` | `200` com as categorias padrão (sem personalizações) |
| `listarCategoriasPerfil` | `200` com as categorias do perfil + padrão, já com as edições do perfil |
| `buscarPorNomePerfil` | `200` com a lista filtrada pelo `?nome=` |
| `buscarPorId` | `200` com a categoria como o perfil a enxerga |
| `getBotoesPadraoDaCategoria` | `200` com os botões padrão da categoria |
| `atualizarCategoria` | `200` com a categoria já atualizada |
| `restaurarCategoria` | `200` com a categoria original |
| `deletarCategoria` | `204` |

### `botao.controller.ts`

| Função | Resposta |
|---|---|
| `criarBotaoPersonalizado` | `201` com o botão |
| `listarPorCategoria` | `200` com os botões que o perfil enxerga na categoria |
| `listarBotoesPadrao` | `200` com os botões padrão (sem personalizações) |
| `listarBotoesPersonalizados` | `200` com os botões criados pelo perfil |
| `buscarPorId` | `200` com o botão como o perfil o enxerga |
| `atualizarBotao` | `200` com o botão já atualizado |
| `restaurarBotao` | `200` com o botão original |
| `deletarBotao` | `204` |

Não existe controller para listar todos os usuários nem para criar botão padrão: o sistema não tem o conceito de administrador, então essas rotas não foram expostas.

## Como adicionar um controller

1. Crie o schema de entrada em `dtos/`, se precisar.
2. Crie (ou use) a função no service.
3. Crie a função no controller: valide, chame o service, responda.
4. Ligue a URL ao controller em `routes/`.
