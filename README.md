# Sistema de Controle de Pastejo

Módulo agrícola de pastejo rotacionado (pasto, piquete, animal e alocado).

Deploy com containers. Back-end na porta 40000, front-end na porta 40100.

## Tecnologias e padrões

**Back-end:** Node.js + Express 5, API REST com respostas em JSON, banco PostgreSQL acessado pelo driver `pg` com consultas parametrizadas (protege contra SQL Injection).

**Front-end:** Express + Nunjucks (templates renderizados no servidor), Bootstrap 5, DataTables (listagens com busca, ordenação e paginação) e Select2 (campos de chave estrangeira). Os dados são consumidos da API com a Fetch API.

**Segurança:** autenticação com JWT, com todas as rotas da API protegidas por middleware, e senhas armazenadas com hash bcrypt.

**Arquitetura e padrões:**
- Separação em camadas *controller* / *model*, organizadas por módulo (`apps/pastos`, `apps/piquetes`, `apps/animais`, `apps/alocados`)
- Front-end e back-end independentes, cada um no seu servidor
- Exclusão lógica (*soft delete*) com o campo `removido`
- Configuração por variáveis de ambiente (`dotenv`)
- Testes das APIs em arquivos `.rest` (extensão REST Client)

## Deploy do sistema

### Banco de dados

Execute o script `SQLGerenciadorPastejo.sql` no PgAdmin (PostgreSQL) para criar as tabelas e inserir os registros iniciais de teste.
Usuários de teste: `admin`/`admin` e `qwe`/`qwe`.

### Back-end (diretório `backend/`)

```bash
cd backend
docker build -t pastejobackend_img:1.0 .

# Postgres rodando local (DB_HOST=host.docker.internal no .env)
docker run -d --name pastejobackend_ctner \
  --add-host host.docker.internal:host-gateway \
  --env-file .env -p 40000:40000 --restart unless-stopped \
  pastejobackend_img:1.0

# Postgres rodando em docker: remova o --add-host e ajuste DB_HOST no .env
```

### Front-end (diretório `frontend/`)

```bash
cd frontend
docker build -t pastejofrontend_img:1.0 .
docker run -d --name pastejofrontend_ctner \
  --env-file frontend.env -p 40100:40100 --restart unless-stopped \
  pastejofrontend_img:1.0
```

Acesse http://localhost:40100.

Para rodar sem Docker: `npm install && node app.js` em cada diretório
(no back-end, troque `DB_HOST` para `localhost`).
