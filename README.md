# Papagaiando — Backend

API do **Papagaiando**, um aplicativo de comunicação alternativa e aumentativa (CAA). Pessoas que têm dificuldade de fala usam **botões com imagem e áudio** para se comunicar, organizados em categorias (Comidas, Emoções, Pessoas, Cores etc.).

Este repositório é o backend: autenticação, perfis, categorias, botões e as personalizações de cada perfil, com os dados guardados em PostgreSQL (Supabase).

## Tecnologias

| O quê | Para quê |
|---|---|
| Node.js 20.19+, 22.12+ ou 24+ | Ambiente de execução (exigência do Prisma 7) |
| TypeScript | Linguagem |
| Express 5 | Servidor HTTP e rotas |
| Prisma 7 + `@prisma/adapter-pg` | Acesso ao banco (PostgreSQL) |
| Zod 4 | Validação dos dados que chegam nas requisições |
| jsonwebtoken | Token de login (JWT) |
| bcrypt | Criptografia das senhas |

## Conceitos do sistema

- **Usuário**: a conta (email e senha).
- **Perfil**: dentro de uma conta pode haver vários perfis, por exemplo, uma pessoa diferente usando o aplicativo.
- **Categoria**: agrupa botões (ex.: "Comidas").
- **Botão**: tem nome, imagem e áudio.
- **Itens padrão**: categorias e botões do sistema, visíveis para todos os perfis.
- **Itens personalizados**: criados por um perfil e visíveis só para ele. Um botão personalizado pode ficar dentro de uma categoria padrão (ex.: uma comida nova em "Comidas").
- **Personalização de item padrão**: quando um perfil edita o nome, a imagem ou o áudio de um item padrão, o original **não muda para os outros**. Fica guardada só a versão daquele perfil, e dá para **restaurar o padrão** a qualquer momento.

Exemplo de categoria padrão já editada por um perfil (`personalizado: true`):

```json
{
  "id": "c89b320f-5853-45d6-88cd-1ccf888a5ea7",
  "nome": "Minhas comidas",
  "urlImagem": "https://.../Comidas.jpeg",
  "padrao": true,
  "perfilId": null,
  "personalizado": true
}
```

## Estrutura do projeto

```
.
├── prisma/            banco de dados: schema, migrations
├── src/
│   ├── config/        conexão com o banco
│   ├── controllers/   recebem a requisição e devolvem a resposta
│   ├── dtos/          validação dos dados de entrada (Zod)
│   ├── errors/        classes de erro do sistema
│   ├── middleware/    autenticação e tratamento de erros
│   ├── routes/        URLs da API
│   ├── services/      regras de negócio e acesso ao banco
│   ├── types/         ajustes de tipos do TypeScript
│   ├── utils/         JWT e funções auxiliares
│   ├── app.ts         monta o Express
│   └── server.ts      sobe o servidor
├── prisma.config.ts   configuração do Prisma (URL do banco)
└── package.json
```

Cada pasta tem um `README.md` explicando o que há dentro. O guia geral está em [`src/README.md`](./src/README.md).

## Como rodar localmente

**1. Clonar e instalar**

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm install
```

**2. Criar o arquivo `.env` na raiz** (veja a tabela de variáveis abaixo):

```
DATABASE_URL="postgresql://usuario:senha@host:5432/postgres"
JWT_SECRET="uma-chave-longa-e-aleatoria"
PORT=3000
EXPOSE_RESET_TOKEN=true
```

Para gerar uma chave segura para o `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**3. Preparar o banco**

```bash
npx prisma migrate dev
npx prisma generate
```

O `migrate` cria as tabelas. O `generate` cria o código do Prisma em `src/generated/` (essa pasta não vai para o Git; **rode o `generate` sempre que clonar o projeto ou mudar o `schema.prisma`**).

**4. Carregar os dados padrão** (categorias e botões do sistema), veja a seção [Dados padrão](#dados-padrão).

**5. Subir o servidor**

```bash
npm run dev
```

Deve aparecer `Servidor rodando na porta 3000`. Para conferir: `GET http://localhost:3000/health` devolve `{"status":"ok"}`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Conexão com o PostgreSQL. Para rodar migrations, use a conexão direta (porta 5432), não o pooler de transações |
| `JWT_SECRET` | Sim | Chave que assina os tokens de login. Use um valor longo, aleatório e **exclusivo** deste ambiente |
| `JWT_EXPIRATION` | Não | Validade do token em **segundos**. Padrão: `36000` (10 horas) |
| `PORT` | Não | Porta do servidor. Padrão: `3000` |
| `CORS_ORIGINS` | Não | Origens permitidas, separadas por vírgula (ex.: `http://localhost:5173,https://meusite.com`). Vazio = libera todas |
| `EXPOSE_RESET_TOKEN` | Não | Se `true`, a resposta de "esqueci a senha" inclui o token. **Use só em desenvolvimento** |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor e reinicia sozinho a cada alteração |
| `npx tsc --noEmit` | Confere se o código TypeScript tem erros, sem gerar arquivos |
| `npx prisma migrate dev` | Aplica mudanças do `schema.prisma` no banco |
| `npx prisma generate` | Recria o código do Prisma em `src/generated/` |

## Dados padrão

As categorias e os botões padrão (o conteúdo do sistema) **não fazem parte das migrations**: são carregados por scripts SQL, depois que as tabelas existem. Sugestão: guardar os scripts em `prisma/seed/` (`categorias.sql` e `botoes.sql`) e rodá-los no SQL Editor do Supabase, **primeiro as categorias e depois os botões**, porque os botões dependem delas.

Os scripts usam `ON CONFLICT (id) DO NOTHING`, então podem ser rodados mais de uma vez sem duplicar nada. Para conferir, `SELECT count(*) FROM tb_categorias WHERE padrao = true;` deve dar **9** e `SELECT count(*) FROM tb_botoes WHERE padrao = true;` deve dar **59**.

As colunas de imagem e áudio guardam apenas os **links** dos arquivos (hospedados no Storage do Supabase).

## Endpoints

Resumo. A lista completa, com parâmetros e respostas, está em [`src/routes/README.md`](./src/routes/README.md).

| Recurso | Rotas |
|---|---|
| Autenticação | `POST /auth/login`, `POST /auth/verificar-senha` |
| Usuários | `POST /usuarios` (cadastro), `GET`/`PUT`/`DELETE /usuarios/me`, `POST /usuarios/esqueci-senha`, `POST /usuarios/redefinir-senha` |
| Perfis | `POST /perfis`, `GET /perfis/me`, `GET`/`PUT`/`DELETE /perfis/:id` |
| Categorias | `/categorias/...` (criar, listar por perfil, buscar, editar, restaurar, remover) |
| Botões | `/botoes/...` (criar personalizado, listar por categoria, editar, restaurar, remover) |
| Saúde | `GET /health` |

**Rotas públicas** (não exigem login): `POST /usuarios`, `POST /auth/login`, `POST /usuarios/esqueci-senha`, `POST /usuarios/redefinir-senha` (também disponíveis em `/auth/...`) e `GET /health`. Todas as outras exigem o header:

```
Authorization: Bearer <token>
```

O token é devolvido no cadastro e no login.

Várias rotas de categorias e botões recebem o perfil na URL (`?perfilId=...`), porque o que cada perfil enxerga depende das personalizações dele.

## Formato de erro

Todo erro volta no mesmo formato:

```json
{
  "timestamp": "2026-10-14T12:00:00.000Z",
  "status": 404,
  "error": "Not Found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "Perfil com ID '...' não encontrado(a)",
  "path": "/perfis/..."
}
```

Erros de validação trazem também `details` (lista de campos inválidos). Os códigos possíveis estão em [`src/errors/README.md`](./src/errors/README.md).

## Regras de negócio principais

- Email único por conta. Senha com no mínimo 8 caracteres.
- Cada perfil só pode ser acessado pelo dono da conta.
- Categorias e botões **padrão** não podem ser removidos; editá-los cria uma versão só do perfil, que pode ser restaurada.
- Categorias e botões **personalizados** só podem ser vistos, editados e removidos pelo dono do perfil.
- Não é possível remover um perfil que ainda tenha categorias ou botões criados por ele, nem uma categoria que ainda tenha botões, nem uma conta que ainda tenha perfis.
- As respostas **nunca** incluem senha nem token de recuperação.

Os detalhes de cada regra estão em [`src/services/README.md`](./src/services/README.md).

## Segurança

- **Nunca** commite o `.env`. Ele já está no `.gitignore`, assim como `src/generated/`.
- Use um `JWT_SECRET` e uma senha de banco diferentes em cada ambiente, e troque imediatamente se algum deles for exposto (em chat, print, commit etc.).
- Senhas são guardadas com hash (bcrypt). O login responde com a mesma mensagem para email inexistente e senha errada.
- Recuperação de senha: o token vale por 1 hora e só pode ser usado uma vez. Por padrão a API **não** devolve o token; ele só aparece com `EXPOSE_RESET_TOKEN=true` (apenas para desenvolvimento).

## Pendências

- Envio do token de recuperação de senha por **email** (hoje o token não chega ao usuário em produção).
- `Dockerfile` e deploy.
- Limite de tentativas (rate limit) nas rotas de login e recuperação de senha.
- Testes automatizados.
