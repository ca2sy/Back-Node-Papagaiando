# src/config/

Configuração e inicialização de recursos compartilhados por todo o sistema.

## Arquivos

### `prisma.ts`

Cria e exporta **uma única instância** do cliente do Prisma, usada em todos os `services/` para consultar e alterar o banco.

```ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
```

- **Por que o `adapter`?** No Prisma 7 a URL do banco não fica no `schema.prisma`; ela é passada na criação do cliente, por meio de um *driver adapter*. O `@prisma/adapter-pg` é o oficial para PostgreSQL.
- **Por que só uma instância?** Cada `PrismaClient` abre o seu próprio conjunto de conexões. Se cada arquivo criasse um, o sistema esgotaria o limite de conexões do banco.
- **Como usar:**

```ts
import { prisma } from "../config/prisma";

const usuario = await prisma.usuario.findUnique({ where: { id } });
```

O arquivo lê `DATABASE_URL` do ambiente. Por isso o `server.ts` carrega o `.env` antes de qualquer outro import.

## A pasta `src/generated/`

O import `../generated/prisma/client` aponta para uma pasta que **não está no Git** (está no `.gitignore`). É proposital:

- `src/generated/prisma/` é código **gerado automaticamente** a partir do `prisma/schema.prisma` pelo comando `npx prisma generate`.
- Ele contém os tipos de cada tabela (`Usuario`, `Perfil`, `Categoria`, `Botao`, `PersonalizacaoCategoria`, `PersonalizacaoBotao`) e os métodos de consulta (`findUnique`, `create`, `update`...), tudo tipado.
- O ponto de entrada é o arquivo `client.ts`, por isso o import termina em `/client`.
- Como é gerado, não faz sentido versioná-lo. Cada pessoa (e cada ambiente de deploy) gera a sua cópia.

**Quando rodar `npx prisma generate`:**

- Depois de clonar o projeto.
- Depois de qualquer mudança no `schema.prisma`. No Prisma 7, o `migrate dev` **não** gera o cliente sozinho.
- Se o editor ou o `tsc` reclamar de `Cannot find module '../generated/prisma/client'`.
