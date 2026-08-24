# Problem 5: A CRUD Backend Server

## Summary

An ExpressJS + TypeScript CRUD API for a **Product** resource (`id`,
`name`, `description`, `category`, `price`, `createdAt`, `updatedAt`),
backed by PostgreSQL via TypeORM. The task didn't specify a resource
domain, so "Product" was chosen as something generic enough to
demonstrate meaningful filtering (category, text search, price range).

Assumptions / decisions made where the task left things open-ended:

- **Update is a `PATCH`, not a `PUT`.** All fields are optional on
  update (partial update), which is what `PATCH` semantically means; a
  `PUT` would imply replacing the whole resource.
- **Schema is managed by hand-written TypeORM migrations, not
  `synchronize: true`.** TypeORM's `synchronize` auto-generates/alters
  tables from the entity definitions, similar in spirit to
  auto-migration tooling — the schema here is instead defined by an
  explicit, reviewable SQL migration file (see
  [src/migrations](src/migrations)) that's run manually, and
  `synchronize` is hard-disabled in the datasource config.
- **Pagination on `GET /api/products`** (`page`/`limit`) wasn't
  explicitly requested but is standard practice for any "list" endpoint
  once a filter can match many rows.
- **Validation via [Zod](https://zod.dev)** — request bodies/query
  params are parsed against schemas in
  [src/dtos/product.dto.ts](src/dtos/product.dto.ts), which double as
  the TypeScript request/response types (`z.infer`) and the runtime
  validators, returning a `400` with per-field issues on failure rather
  than letting bad input reach the database layer.
- **No auth.** Not mentioned in the task, and adding one would need a
  user/session model out of scope here.

## Tech Stack

- **Express** + **TypeScript**
- **TypeORM** (Repository + QueryBuilder) — **PostgreSQL** driver in
  production, an in-memory **SQLite** (`better-sqlite3`) driver in tests
- **Zod** for request/response DTOs and validation
- **swagger-jsdoc** + **swagger-ui-express** for interactive API docs
- **Vitest** + **Supertest** for automated tests
- **Docker Compose** for a one-command local Postgres

## Project Structure

```
src/
  entities/Product.ts          TypeORM entity
  migrations/                  Hand-written schema migration (raw SQL)
  dtos/product.dto.ts          Zod schemas + inferred types + response mapper
  services/product.service.ts  Business logic (filtering, CRUD), DB-agnostic
  controllers/product.controller.ts   HTTP request/response glue
  routes/product.routes.ts     Route wiring + OpenAPI (@openapi) annotations
  middleware/                  Zod-validation middleware, centralized error handler
  docs/swagger.ts              swagger-jsdoc config, served at /docs
  config/data-source.ts        TypeORM DataSource for the real Postgres database
  test/test-data-source.ts     In-memory SQLite DataSource used only by tests
  app.ts                       createApp(repo) factory — no module-level singleton,
                                so tests can inject a different repository
  index.ts                     Entrypoint: connects to Postgres, then createApp + listen
```

## Configuration

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

| Variable      | Default     | Description                          |
|---------------|-------------|---------------------------------------|
| `PORT`        | `3000`      | HTTP port the API listens on          |
| `DB_HOST`     | `localhost` | Postgres host                         |
| `DB_PORT`     | `5432`      | Postgres port                         |
| `DB_USERNAME` | `postgres`  | Postgres user                         |
| `DB_PASSWORD` | `postgres`  | Postgres password                     |
| `DB_DATABASE` | `problem5`  | Database name                         |
| `DB_LOGGING`  | `false`     | Set `true` to log every SQL statement |

## Running the Application

### 1. Start PostgreSQL

Easiest via the included Docker Compose file:

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with the credentials/database
name matching `.env.example`. (If you already have a local Postgres
instance you'd rather use, just point the `DB_*` variables at it and
create the `problem5` database yourself instead.)

### 2. Install dependencies and run the migration

```bash
npm install
npm run migration:run
```

This creates the `products` table (see
[src/migrations/1735000000000-CreateProducts.ts](src/migrations/1735000000000-CreateProducts.ts))
— it only needs to be run once (and again for any future migration
that gets added).

### 3. Start the server

```bash
npm run dev     # ts-node/tsx with file-watch, for local development
# or
npm run build && npm start   # compiled production build
```

The API is served at `http://localhost:3000/api/products`, and
interactive Swagger docs at `http://localhost:3000/docs`.

## API Reference

| Method | Path                 | Description                          |
|--------|----------------------|---------------------------------------|
| POST   | `/api/products`      | Create a product                      |
| GET    | `/api/products`      | List products, with filters (below)   |
| GET    | `/api/products/:id`  | Get one product by id                 |
| PATCH  | `/api/products/:id`  | Partially update a product            |
| DELETE | `/api/products/:id`  | Delete a product                      |

**List filters** (`GET /api/products`, all optional, combinable):

| Query param | Type   | Behavior                                  |
|-------------|--------|---------------------------------------------|
| `category`  | string | Exact match, case-insensitive               |
| `search`    | string | Case-insensitive substring match on `name`  |
| `minPrice`  | number | `price >= minPrice`                         |
| `maxPrice`  | number | `price <= maxPrice`                         |
| `page`      | int    | Default `1`                                 |
| `limit`     | int    | Default `20`, max `100`                     |

Full request/response schemas (including validation error shapes) are
documented at `/docs`; every route is annotated with `@openapi` JSDoc in
[src/routes/product.routes.ts](src/routes/product.routes.ts).

### Example requests

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mechanical Keyboard","category":"Electronics","price":149.99}'

curl "http://localhost:3000/api/products?category=electronics&minPrice=50"

curl -X PATCH http://localhost:3000/api/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"price":129.99}'

curl -X DELETE http://localhost:3000/api/products/<id>
```

## How to Test

```bash
npm install
npm run typecheck   # tsc --noEmit, strict mode
npm test            # vitest run
```

No Postgres/Docker needed for `npm test` — it runs against an in-memory
SQLite database (see [src/test/test-data-source.ts](src/test/test-data-source.ts)),
so the suite is fully self-contained. 25 cases across two files:

- [src/services/product.service.test.ts](src/services/product.service.test.ts)
  — business logic directly against the repository: create, get (found
  and 404), update (partial-only fields, 404), delete (success, 404,
  double-delete), and every list filter (category, search, price range,
  pagination) individually.
- [src/app.test.ts](src/app.test.ts) — the actual Express app via
  Supertest: full HTTP status codes and JSON response shapes for every
  route, validation errors (`400` with `issues[]`) for bad input on both
  create and list, `404` for a well-formed-but-missing id vs `400` for a
  malformed (non-UUID) id, and that unknown routes get a JSON `404`
  instead of Express's default HTML error page.
