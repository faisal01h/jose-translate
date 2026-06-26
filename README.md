# José Translate

A Next.js web app for translating real languages into fictional constructed languages. Public users can translate without an account; admins manage linguistic data through a password-protected panel.

## Features

- Public translator (English → fictional language by default)
- Dictionaries, vocabulary, grammatical rules, and thesaurus support
- Admin dashboard for managing all language data
- PostgreSQL 17+ with Prisma ORM
- Docker Compose for local and production-style runs

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:3000 for the translator and http://localhost:3000/admin for the admin panel.

Default admin password: `changeme` (set `ADMIN_PASSWORD` in `.env`).

After the database is up, seed sample data:

```bash
docker compose exec app npm run db:seed
```

## Local development

1. Start PostgreSQL:

```bash
docker compose up db -d
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Install and migrate:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Admin access

- URL: `/admin`
- Auth: single shared password via `ADMIN_PASSWORD`
- No user registration for translators

## Translation engine

1. Tokenizes input and looks up words in the dictionary
2. Falls back to thesaurus synonyms when direct matches are missing
3. Applies grammatical rules (prefix, suffix, replace, regex, word order) by priority

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Admin panel password |
| `SESSION_SECRET` | HMAC secret for admin session cookies |
