# Talento

Talento is a full-stack recruitment CRM. It lets recruitment agencies manage clients, job offers, candidates, and applications through a Kanban-style pipeline, with multi-tenant agency isolation, self-service signup, and team invitations.

## Stack

**Backend** — `talento-backend/`
- Java 21, Spring Boot 3.5
- Spring Web, Spring Data JPA, Spring Security (JWT via `jjwt`)
- PostgreSQL
- Maven

**Frontend** — `talento-frontend/`
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS
- TanStack Query, React Hook Form, Axios
- `@dnd-kit` for the Kanban drag-and-drop pipeline
- `next-intl` for i18n (English / French)

## Domain model

Agencies own clients, job offers, and candidates; candidates apply to job offers through an application pipeline, with a status history trail. Users belong to an agency and can invite teammates.

- `Agency`, `User`, `Invitation` — multi-tenant accounts and team management
- `Client`, `JobOffer` — recruitment clients and their open positions
- `Candidate`, `Application`, `ApplicationStatusHistory` — candidates and their pipeline progress

## Running locally

### With Docker Compose (recommended)

Spins up PostgreSQL, the backend API, and pgAdmin:

```bash
docker-compose up --build
```

- Backend API: http://localhost:8080
- pgAdmin: http://localhost:5050 (`admin@talento.com` / `admin`)
- PostgreSQL: `localhost:5432` (`postgres` / `postgres`, db `talento_db`)

Then run the frontend separately (see below) — it isn't part of the compose file.

### Backend only

Requires a running PostgreSQL instance matching the datasource config in `talento-backend/src/main/resources/application.yml` (or override via env vars `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).

```bash
cd talento-backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd talento-frontend
npm install
npm run dev
```

App runs at http://localhost:3000 and expects the backend API to be reachable (see the frontend's env config for the API base URL).

## Project layout

```
talento-backend/    Spring Boot API (controllers, services, JPA repositories, JWT security)
talento-frontend/   Next.js app (dashboard, clients, candidates, offers, team, auth flows)
docker-compose.yml  Postgres + backend + pgAdmin for local development
```
