# prisma/

Define a estrutura do banco de dados. É o equivalente aos models.

## Arquivos

- **`schema.prisma`** — define as 4 tabelas e seus relacionamentos.
- **`migrations/`** — histórico de mudanças no banco, gerado automaticamente pelo comando `prisma migrate dev`. Não editar esses arquivos manualmente.

O `prisma.config.ts`, que fica na **raiz do projeto** (fora dessa pasta), é quem diz ao Prisma onde buscar a `DATABASE_URL` no `.env`. Isso é necessário porque, a partir do Prisma 7, a URL do banco não pode mais ficar direto no `schema.prisma`.

## Models

### `Usuario`
Tabela `tb_usuarios`. Um usuário pode ter vários perfis (`perfis`).

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | gerado automaticamente |
| `email` | String | único |
| `senha` | String | fica **hasheada** (bcrypt), nunca em texto puro |
| `nome` | String | |
| `tokenRecuperacao` | String? | usado no fluxo de "esqueci minha senha" |
| `expiracaoToken` | DateTime? | validade do token acima |

### `Perfil`
Tabela `tb_perfis`. Pertence a um `Usuario` e tem várias `categorias`.

| Campo | Tipo | Observação |
|---|---|---|
| `usuarioId` | UUID | obrigatório — todo perfil pertence a um usuário |

### `Categoria`
Tabela `tb_categorias`. Pode ser **padrão** (do sistema, visível pra todo mundo) ou **personalizada** (criada dentro de um perfil específico).

| Campo | Tipo | Observação |
|---|---|---|
| `padrao` | Boolean | `true` = categoria do sistema |
| `perfilId` | UUID? | `null` quando `padrao = true`; obrigatório quando é personalizada |

### `Botao`
Tabela `tb_botoes`. Sempre pertence a uma `Categoria`. Segue a mesma lógica de padrão/personalizado que `Categoria`.

| Campo | Tipo | Observação |
|---|---|---|
| `urlImagem` / `urlAudio` | String | links pro Storage (Supabase); o banco só guarda o link, não o arquivo |
| `categoriaId` | UUID | obrigatório |


## Dados padrão (seed)

As 9 categorias e os 59 botões padrão do sistema original foram migrados via scripts SQL manuais (não fazem parte deste schema/migrations), mantendo os mesmos IDs do banco antigo. Ver `categorias.sql` e `botoes.sql`.