# src/services/

Onde mora a **lógica de negócio**: as regras sobre o que pode e o que não pode acontecer com cada dado, a checagem de quem pode mexer em quê e as consultas ao banco (via `config/prisma.ts`).

Os controllers são enxutos justamente porque toda a regra pesada fica aqui. Os services **lançam erros** de `errors/` (`ResourceNotFoundError`, `AccessDeniedError`, `BusinessError`...) em vez de devolver `null` ou `false`; o erro sobe sozinho até o `errorHandler`.

## Arquivos

- [`authorization.service.ts`](#authorizationservicets): decide quem pode ver e mexer em quê
- [`usuario.service.ts`](#usuarioservicets): contas, login e recuperação de senha
- [`perfil.service.ts`](#perfilservicets): perfis
- [`categoria.service.ts`](#categoriaservicets): categorias
- [`botao.service.ts`](#botaoservicets): botões

## Regras de acesso

| Item | Ver e usar | Editar | Remover |
|---|---|---|---|
| **Perfil** | Só o dono da conta | Só o dono | Só o dono |
| **Categoria ou botão padrão** | Qualquer perfil | Qualquer perfil, mas só a **versão dele** muda (personalização) | Ninguém |
| **Categoria ou botão personalizado** | Só o perfil dono | Só o perfil dono (altera direto) | Só o dono |

## Como funciona a personalização

Itens padrão são compartilhados por todos. Quando um perfil edita um deles (por exemplo, grava a própria voz no botão "Sim"), o item original **não muda**: o service guarda, numa tabela à parte, só os campos que aquele perfil alterou (`PersonalizacaoCategoria` e `PersonalizacaoBotao`, veja [`../../prisma/README.md`](../../prisma/README.md)).

Na hora de listar ou buscar, o service pega o item original e aplica por cima os campos da personalização do perfil. Campo sem alteração (nulo) mantém o valor original:

```ts
nome: personalizacao?.nome ?? original.nome
```

Toda categoria e todo botão devolvido por essas funções traz o campo **`personalizado`**:

- `true`: o perfil tem uma versão própria desse item padrão (o front pode mostrar "restaurar padrão");
- `false`: está igual ao original, ou é um item criado pelo próprio perfil.

**Restaurar o padrão** apaga a personalização, e o item volta ao original.

## `authorization.service.ts`

Centraliza a pergunta **"esse usuário (ou perfil) pode mexer nesse recurso?"**, para que cada service não precise reimplementar essa checagem.

| Função | O que faz |
|---|---|
| `validarPropriedadePerfil(perfilId, usuarioId)` | `403` se o perfil não pertence ao usuário |
| `buscarPerfilComAutorizacao(perfilId, usuarioId)` | Valida a propriedade e já devolve o perfil |
| `validarAcessoCategoria(categoria, perfilId)` | Categoria padrão: liberada. Personalizada: `403` se o perfil informado não for o dono |
| `validarAcessoBotao(botao, perfilId)` | Mesma regra, para botões |
| `validarRemocaoCategoria(categoriaId, usuarioId)` | `404` se não existe; `403` se for padrão; `403` se não for do usuário |
| `validarRemocaoBotao(botaoId, usuarioId)` | Mesma regra, para botões |

Todas lançam erro quando algo não bate. Quem as usa só precisa chamá-las e seguir em frente.

## `usuario.service.ts`

| Função | O que faz |
|---|---|
| `registrarUsuario(dados)` | Cria a conta. Valida email ainda não usado, nome não vazio e senha com no mínimo 8 caracteres. Guarda a senha com hash (bcrypt, 10 rodadas). Dois cadastros simultâneos com o mesmo email também dão erro de email duplicado |
| `autenticarUsuario(email, senha)` | Confere as credenciais. Email inexistente e senha errada dão **a mesma mensagem** (`401`), e o tempo de resposta é parecido nos dois casos |
| `atualizarUsuario(id, dados)` | Atualiza só os campos enviados. Email novo precisa estar disponível; senha nova é validada e recebe novo hash |
| `buscarPorId(id)` | Devolve o usuário (`404` se não existir) |
| `listarUsuarios()` | Lista todos os usuários. **Não está exposta por nenhuma rota** |
| `deletarUsuario(id)` | Remove a conta. `400` se ainda houver perfis |
| `gerarTokenRecuperacao(email)` | Cria um token aleatório, válido por **1 hora**, e o guarda no usuário. `404` se o email não existir (o controller esconde isso do cliente) |
| `validarTokenRecuperacao(token)` | Diz se o token existe e ainda não expirou. **Não está exposta por rota** |
| `redefinirSenha(token, novaSenha)` | `400` se o token não existir ou tiver expirado. Valida a senha, grava o novo hash e **apaga o token** (uso único) |
| `verificarSenha(id, senha)` | Diz se a senha informada é a do usuário (`true`/`false`) |

**Nenhuma função devolve a senha nem os dados do token de recuperação.** Para fora do service saem apenas `id`, `nome` e `email`.

## `perfil.service.ts`

| Função | O que faz |
|---|---|
| `criarPerfil(dados, usuarioId)` | Cria um perfil na conta. Nome e foto não podem ser vazios |
| `atualizarPerfil(perfilId, dados, usuarioId)` | Só o dono. Campos em branco são ignorados |
| `buscarPorId(perfilId, usuarioId)` | Só o dono |
| `listarPerfisPorUsuario(usuarioId)` | Todos os perfis da conta |
| `deletarPerfil(perfilId, usuarioId)` | Só o dono. `400` se o perfil ainda tiver categorias ou botões criados por ele. As personalizações de itens padrão são apagadas junto, na mesma transação |

## `categoria.service.ts`

Todas as funções que recebem `perfilId` primeiro conferem que o perfil é do usuário logado.

| Função | O que faz |
|---|---|
| `criarCategoria(dados, usuarioId)` | Cria uma categoria **personalizada** no perfil informado |
| `listarPorPerfil(perfilId, usuarioId)` | Só as categorias criadas pelo perfil |
| `listarCategoriasPadrao()` | Categorias padrão, sem personalizações de ninguém |
| `listarCategoriasPerfilComPadrao(perfilId, usuarioId)` | A visão do perfil: primeiro as dele, depois as padrão já com as edições dele. Cada grupo ordenado por nome |
| `buscarPorId(categoriaId, perfilId, usuarioId)` | Devolve a categoria como o perfil a enxerga. `403` se for personalizada de outro perfil |
| `buscarPorNomePerfil(perfilId, nome, usuarioId)` | Procura (sem diferenciar maiúsculas de minúsculas) pelo nome que o perfil enxerga, incluindo categorias padrão renomeadas por ele |
| `atualizarCategoria(categoriaId, perfilId, dados, usuarioId)` | Padrão: cria/atualiza a personalização do perfil. Personalizada: altera direto. Se nada for enviado, nada muda |
| `restaurarCategoriaPadrao(categoriaId, perfilId, usuarioId)` | Apaga a personalização e devolve a categoria original. `400` se não for padrão |
| `deletarCategoria(categoriaId, usuarioId)` | Só categorias personalizadas, e só o dono. `400` se ainda houver botões nela |
| `getBotoesPadraoDaCategoria(categoriaId)` | Botões padrão de uma categoria padrão. `400` se a categoria não for padrão |

## `botao.service.ts`

| Função | O que faz |
|---|---|
| `criarBotaoPadrao(dados)` | Cria um botão padrão. **Sem checagem de admin** e **sem rota**; existe para uso interno/carga de dados. Não exponha em rota enquanto o sistema não tiver o conceito de administrador |
| `criarBotaoPersonalizado(dados, usuarioId)` | Cria um botão do perfil, em uma categoria **padrão** ou em uma categoria **do próprio perfil**. Só aquele perfil o enxerga |
| `listarPorCategoria(categoriaId, perfilId, usuarioId)` | Botões que o perfil enxerga na categoria: os padrão (com as edições dele) e os criados por ele. Padrão primeiro, depois por nome |
| `listarBotoesPadraoPorCategoria(categoriaId)` | Botões padrão, sem personalizações de ninguém |
| `listarBotoesPersonalizadosPorCategoria(categoriaId, perfilId, usuarioId)` | Só os botões criados pelo perfil na categoria |
| `buscarPorId(botaoId, perfilId, usuarioId)` | Devolve o botão como o perfil o enxerga. `403` se for personalizado de outro perfil |
| `atualizarBotao(botaoId, perfilId, dados, usuarioId)` | Padrão: cria/atualiza a personalização (nome, imagem, áudio) só para o perfil. Personalizado: altera direto. Se nada for enviado, nada muda |
| `restaurarBotaoPadrao(botaoId, perfilId, usuarioId)` | Apaga a personalização e devolve o botão original. `400` se não for padrão |
| `deletarBotao(botaoId, usuarioId)` | Só botões personalizados, e só o dono. Botão padrão dá `403` |

## Detalhes comuns

- Nas atualizações, campos enviados em branco (vazios ou só espaços) são **ignorados**, e os demais são atualizados normalmente.
- Os services não leem `req` nem `res`: recebem valores simples (ids e dados já validados) e devolvem dados. Isso mantém a regra de negócio independente do HTTP.
- Todas as funções são `async`, porque consultam o banco.

Exemplo de uso, como aparece nos controllers:

```ts
const categoria = await categoriaService.atualizarCategoria(
  categoriaId,   // qual categoria
  perfilId,      // em nome de qual perfil
  dados,         // { nome?, urlImagem? }, já validados pelo Zod
  usuarioId,     // quem está logado
);
```
