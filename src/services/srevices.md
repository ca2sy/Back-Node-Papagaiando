# src/services/

Onde mora a lógica de negócio do sistema: as regras sobre o que pode e não pode acontecer com cada dado. 

> 🚧 Esta pasta ainda está em construção. Por enquanto só tem `authorization.service.ts`. Conforme os outros arquivos forem criados (`usuario`, `perfil`, `categoria`, `botao`), este documento será atualizado.

## Arquivos

### `authorization.service.ts`

Centraliza toda a pergunta **"esse usuário pode mexer nesse recurso?"**. Em vez de cada service reimplementar essa checagem, todos chamam as funções daqui.

A regra geral do sistema:
- **Perfis** só pertencem e só podem ser acessados pelo próprio dono (usuário).
- **Categorias** e **botões** podem ser:
  - **padrão** (`padrao: true`) — pertencem ao sistema, qualquer usuário autenticado pode ver/usar, ninguém pode editar ou apagar.
  - **personalizados** (`padrao: false`) — pertencem a um perfil específico, e só o dono daquele perfil pode ver, editar ou apagar.

| Função | O que faz |
|---|---|
| `validarPropriedadePerfil(perfilId, usuarioId)` | Lança `AccessDeniedError` se o perfil não pertencer ao usuário |
| `validarPropriedadeCategoria(categoriaId, usuarioId)` | Categoria padrão → libera sem checar dono. Categoria personalizada → lança `AccessDeniedError` se o dono do perfil dela não for o usuário |
| `validarCriacaoCategoria` | Mesma regra de `validarPropriedadePerfil` (quem pode criar categoria num perfil é quem é dono do perfil) |
| `validarCriacaoBotaoPersonalizado` | Mesma regra de `validarPropriedadeCategoria` |
| `validarPropriedadeBotao(botaoId, usuarioId)` | Botão padrão → libera. Botão personalizado → verifica se o perfil da categoria dele pertence ao usuário |
| `buscarPerfilComAutorizacao(perfilId, usuarioId)` | Valida propriedade **e** já devolve o perfil encontrado (evita repetir a consulta no service que chamou) |
| `buscarCategoriaComAutorizacao(categoriaId, usuarioId)` | Mesma ideia, mas para categoria (pula a validação se for padrão) |

Todas essas funções lançam os erros de `src/errors/` (`AccessDeniedError`, `ResourceNotFoundError`) quando algo não bate, não retornam `true`/`false`. Isso significa que, nos services que as usam, basta chamar e seguir em frente; se der problema, o erro já sobe sozinho até o `errorHandler`.

**Exemplo de uso (como vai aparecer nos próximos services):**

```ts
import { validarPropriedadePerfil } from "./authorization.service";

export async function atualizarPerfil(perfilId: string, dados: PerfilUpdateInput, usuarioId: string) {
  await validarPropriedadePerfil(perfilId, usuarioId); // lança erro se não for o dono

  return prisma.perfil.update({ where: { id: perfilId }, data: dados });
}
```

Todas as funções são `async` porque fazem consultas ao banco através do `prisma` (ver `src/config/prisma.ts`).