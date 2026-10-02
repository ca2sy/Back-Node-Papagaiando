# src/config/

Arquivos de configuração e inicialização de recursos compartilhados por todo o sistema (banco de dados, variáveis de ambiente etc.).

## Arquivos

### `prisma.ts`

Cria e exporta **uma única instância** do cliente do Prisma, que é o objeto usado em todos os `services/` para consultar e alterar o banco de dados.

```ts
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
```

Por que precisa desse "adapter" (`PrismaPg`)? A partir da versão 7 do Prisma, a URL de conexão com o banco não fica mais dentro do `schema.prisma` — ela é passada explicitamente na hora de criar o cliente, através de um *driver adapter*. O `@prisma/adapter-pg` é o adapter oficial para Postgres.

**Por que só uma instância?** Cada `PrismaClient` novo abre seu próprio conjunto de conexões com o banco. Se cada arquivo criasse o seu, o sistema rapidamente esgotaria o limite de conexões do banco. Por isso só se cria aqui, uma vez, e todo o resto do projeto importa esse mesmo `prisma`:

```ts
import { prisma } from "../config/prisma";

const usuario = await prisma.usuario.findUnique({ where: { id } });
```

## Sobre a pasta `src/generated/`

Você vai notar o import `from "../generated/prisma"` no arquivo acima, mas essa pasta **não existe no repositório Git** (ela está no `.gitignore`). 

- `src/generated/prisma/` é código **gerado automaticamente** a partir do `prisma/schema.prisma`, toda vez que você roda `npx prisma generate`.
- Esse código inclui as definições de tipo do TypeScript para cada tabela (`Usuario`, `Perfil`, `Categoria`, `Botao`) e os métodos de consulta (`.findUnique`, `.create`, `.update` etc.) — é como o Prisma "aprende" o formato do seu banco e oferece isso de forma tipada.
- Por ser gerado e nem sempre pequeno, não faz sentido guardar no Git. Cada pessoa que clonar o projeto (ou cada ambiente de deploy) gera essa pasta localmente com um único comando.

**Se você clonar o projeto em uma máquina nova e o `tsc`/`npm run dev` reclamar de "Cannot find module '../generated/prisma'"**, é só rodar:

```
npx prisma generate
```

Isso recria a pasta sem precisar mexer no banco nem rodar migration nenhuma. É um passo que deve ser lembrado sempre que o projeto for clonado do zero.