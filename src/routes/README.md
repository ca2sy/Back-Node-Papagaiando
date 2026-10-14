# src/routes/

Liga cada **URL + método HTTP** ao controller certo e define **quais rotas exigem login**.

## Arquivos

| Arquivo | Prefixo | Proteção |
|---|---|---|
| `index.ts` | | Junta todos os arquivos abaixo |
| `auth.routes.ts` | `/auth` | Por rota (veja as tabelas) |
| `usuario.routes.ts` | `/usuarios` | Por rota (veja as tabelas) |
| `perfil.routes.ts` | `/perfis` | Todas exigem login |
| `categoria.routes.ts` | `/categorias` | Todas exigem login |
| `botao.routes.ts` | `/botoes` | Todas exigem login |

Nos arquivos em que **todas** as rotas são protegidas, a proteção vem de uma linha só no topo, `router.use(requireAuth)`, para que nenhuma rota nova fique desprotegida por esquecimento.

A rota `GET /health` não está aqui: é definida em `app.ts`.

## Convenções destas tabelas

- **Login**: "sim" significa que exige o header `Authorization: Bearer <token>`.
- **`:id`** e similares são parâmetros da URL e precisam ser UUIDs válidos (senão: `400 VALIDATION_ERROR`).
- **`?perfilId=`** é obrigatório onde indicado, e o perfil precisa pertencer ao usuário logado (senão: `403`).
- Todo erro volta no formato padrão descrito em [`../errors/README.md`](../errors/README.md). Erros comuns: `400` (dados inválidos), `401` (sem login), `403` (sem permissão), `404` (não encontrado).

## Autenticação (`/auth`)

| Método | URL | Login | Entrada | Resposta |
|---|---|---|---|---|
| POST | `/auth/login` | não | corpo: `{ email, senha }` | `200` `{ token, email, userId, nome }` |
| POST | `/auth/verificar-senha` | sim | corpo: `{ senha }` | `200` `{ valido: true }` ou `401` `{ valido: false, message }` |
| POST | `/auth/esqueci-senha` | não | igual a `/usuarios/esqueci-senha` | igual |
| POST | `/auth/redefinir-senha` | não | igual a `/usuarios/redefinir-senha` | igual |

## Usuários (`/usuarios`)

| Método | URL | Login | Entrada | Resposta |
|---|---|---|---|---|
| POST | `/usuarios` | não | corpo: `{ nome, email, senha }` | `201` `{ usuario: { id, nome, email }, token }` |
| POST | `/usuarios/esqueci-senha` | não | `?email=` ou corpo `{ email }` | `200` `{ message }` (+ `token` só com `EXPOSE_RESET_TOKEN=true`) |
| POST | `/usuarios/redefinir-senha` | não | corpo: `{ token, novaSenha }` | `200` `{ message }` |
| GET | `/usuarios/me` | sim | | `200` `{ id, nome, email }` |
| PUT | `/usuarios/me` | sim | corpo: `{ nome?, email?, senha? }` | `200` `{ id, nome, email }` |
| DELETE | `/usuarios/me` | sim | | `204` |

## Perfis (`/perfis`), todas com login

| Método | URL | Entrada | Resposta |
|---|---|---|---|
| POST | `/perfis` | corpo: `{ nome, urlFoto }` | `201` perfil |
| GET | `/perfis/me` | | `200` lista de perfis do usuário |
| GET | `/perfis/:id` | | `200` perfil |
| PUT | `/perfis/:id` | corpo: `{ nome?, urlFoto? }` | `200` perfil |
| DELETE | `/perfis/:id` | | `204` |

## Categorias (`/categorias`), todas com login

| Método | URL | Entrada | Resposta |
|---|---|---|---|
| POST | `/categorias` | corpo: `{ nome, urlImagem, perfilId }` | `201` categoria personalizada |
| GET | `/categorias/padrao` | | `200` categorias padrão (sem personalizações) |
| GET | `/categorias/perfil/:perfilId` | | `200` categorias do perfil + padrão, com as edições do perfil |
| GET | `/categorias/perfil/:perfilId/buscar` | `?nome=` | `200` categorias cujo nome contém o texto |
| GET | `/categorias/:categoriaId/botoes-padrao` | | `200` botões padrão da categoria |
| GET | `/categorias/:id` | `?perfilId=` | `200` categoria |
| PUT | `/categorias/:id` | `?perfilId=` + corpo: `{ nome?, urlImagem? }` | `200` categoria |
| POST | `/categorias/:id/restaurar` | `?perfilId=` | `200` categoria original |
| DELETE | `/categorias/:id` | | `204` |

## Botões (`/botoes`), todas com login

| Método | URL | Entrada | Resposta |
|---|---|---|---|
| POST | `/botoes/personalizados` | corpo: `{ nome, urlImagem, urlAudio, categoriaId, perfilId }` | `201` botão |
| GET | `/botoes/categoria/:categoriaId` | `?perfilId=` | `200` botões que o perfil enxerga na categoria |
| GET | `/botoes/categoria/:categoriaId/padrao` | | `200` botões padrão (sem personalizações) |
| GET | `/botoes/categoria/:categoriaId/personalizados` | `?perfilId=` | `200` botões criados pelo perfil |
| GET | `/botoes/:id` | `?perfilId=` | `200` botão |
| PUT | `/botoes/:id` | `?perfilId=` + corpo: `{ nome?, urlImagem?, urlAudio? }` | `200` botão |
| POST | `/botoes/:id/restaurar` | `?perfilId=` | `200` botão original |
| DELETE | `/botoes/:id` | | `204` |

Categorias e botões voltam com o campo `personalizado` (`true` quando o perfil editou um item padrão).

## Exemplo de requisição

```http
PUT /categorias/c89b320f-5853-45d6-88cd-1ccf888a5ea7?perfilId=ab1bf7bf-e9b9-4489-9a81-4d0f6a6780c4
Authorization: Bearer <token>
Content-Type: application/json

{ "nome": "Minhas comidas" }
```

## Ordem das rotas importa

O Express usa a **primeira** rota que combinar. Por isso as rotas específicas vêm antes das genéricas:

- `GET /perfis/me` antes de `GET /perfis/:id` (senão `me` seria lido como um id);
- `GET /categorias/padrao` antes de `GET /categorias/:id`.

## Como adicionar uma rota

1. Escreva o controller (veja [`../controllers/README.md`](../controllers/README.md)).
2. Registre a rota no arquivo do recurso, por exemplo `router.get("/:id/algo", categoriaController.algo)`.
3. Se o recurso não for protegido por `router.use(requireAuth)`, acrescente `requireAuth` na rota.
4. Se for um recurso novo, crie `novo.routes.ts` e registre-o em `index.ts` com `router.use("/novo", novoRoutes)`.
5. Atualize esta tabela.
