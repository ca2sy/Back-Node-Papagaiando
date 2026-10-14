# prisma/

Define a estrutura do banco de dados (PostgreSQL).

## Arquivos

- **`schema.prisma`**: descreve as tabelas e os relacionamentos.
- **`migrations/`**: histórico de mudanças do banco, gerado pelo `npx prisma migrate dev`. Não editar à mão.

Fora desta pasta, na raiz do projeto, o **`prisma.config.ts`** diz ao Prisma qual é a URL do banco (lida da variável `DATABASE_URL` do `.env`). A URL **não** fica dentro do `schema.prisma`.

O bloco `generator` do schema define que o código do Prisma é gerado em `src/generated/prisma` (veja [`../src/config/README.md`](../src/config/README.md)).

## Relacionamentos

```
Usuario ──< Perfil ──< Categoria ──< Botao
                │          │            │
                │          └──< PersonalizacaoCategoria
                │                       └──< PersonalizacaoBotao
                └── (Perfil também é dono de Categoria e Botao personalizados)
```

Lendo: um usuário tem vários perfis; um perfil tem várias categorias; uma categoria tem vários botões.

## Tabelas

### `Usuario` (`tb_usuarios`)

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | Gerado automaticamente |
| `email` | texto | Único |
| `senha` | texto | Guardada com hash (bcrypt), nunca em texto puro |
| `nome` | texto | |
| `tokenRecuperacao` | texto, opcional | Token do fluxo "esqueci minha senha" |
| `expiracaoToken` | data/hora, opcional | Validade do token acima |

### `Perfil` (`tb_perfis`)

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | |
| `nome` | texto | |
| `urlFoto` | texto | Link da foto |
| `usuarioId` | UUID | Dono do perfil (obrigatório) |

### `Categoria` (`tb_categorias`)

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | |
| `nome` | texto | |
| `urlImagem` | texto | Link da imagem |
| `padrao` | booleano | `true` = categoria do sistema (padrão: `true`) |
| `perfilId` | UUID, opcional | `null` nas categorias padrão; preenchido nas personalizadas (dono) |

### `Botao` (`tb_botoes`)

| Campo | Tipo | Observação |
|---|---|---|
| `id` | UUID | |
| `nome` | texto | |
| `urlImagem` | texto | Link da imagem |
| `urlAudio` | texto | Link do áudio |
| `padrao` | booleano | `true` = botão do sistema (padrão: `true`) |
| `categoriaId` | UUID | Categoria onde o botão está (obrigatório) |
| `perfilId` | UUID, opcional | `null` nos botões padrão; nos personalizados é o perfil dono, mesmo quando o botão está numa categoria padrão |

### `PersonalizacaoCategoria` (`tb_personalizacoes_categoria`)

A versão que **um perfil** fez de uma categoria **padrão**. O original não é alterado.

| Campo | Tipo | Observação |
|---|---|---|
| `categoriaId` | UUID | Categoria padrão que foi editada |
| `perfilId` | UUID | Perfil que fez a edição |
| `nome` | texto, opcional | Nulo = usa o nome original |
| `urlImagem` | texto, opcional | Nulo = usa a imagem original |

Existe no máximo **uma** personalização por par (`categoriaId`, `perfilId`).

### `PersonalizacaoBotao` (`tb_personalizacoes_botao`)

Igual à anterior, mas para botões padrão: campos `botaoId`, `perfilId`, e `nome`, `urlImagem`, `urlAudio` (opcionais; nulo = usa o original). Único por par (`botaoId`, `perfilId`).

**Restaurar o padrão** significa apenas apagar a linha da personalização.

## Padrão x personalizado

| | Padrão | Personalizado |
|---|---|---|
| Categoria | `padrao = true`, `perfilId = null` | `padrao = false`, `perfilId` = dono |
| Botão | `padrao = true`, `perfilId = null` | `padrao = false`, `perfilId` = dono |
| Quem vê | Todos os perfis | Só o perfil dono |
| Editar | Cria/atualiza uma personalização do perfil | Altera direto |
| Remover | Não é permitido | Só o dono |

## Exclusão em cadeia

Os relacionamentos **não** têm `onDelete: Cascade`. A remoção de perfis, categorias e usuários é controlada pelos services, que bloqueiam a exclusão quando ainda existem itens ligados (veja [`../src/services/README.md`](../src/services/README.md)). A única exceção é a remoção de um perfil, que apaga junto as personalizações dele.

## Comandos

```bash
npx prisma validate                 # confere se o schema está correto
npx prisma migrate dev --name nome  # cria e aplica uma migration
npx prisma generate                 # recria o código em src/generated
```

Depois de **qualquer** mudança no `schema.prisma`, rode `migrate dev` e em seguida `generate`. Se o Prisma perguntar se pode **resetar** o banco, responda **não**: isso apagaria os dados.

## Dados padrão

As categorias e os botões padrão não vêm das migrations. São carregados por scripts SQL depois que as tabelas existem (primeiro categorias, depois botões). Veja a seção "Dados padrão" do [README principal](../README.md#dados-padrão).
