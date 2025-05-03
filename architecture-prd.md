# Auth Platform – Architecture PRD  
*Version 0.4 (2025‑05‑03) – Draft for discussion*

---

## 1 · Purpose  
Design a **secure, horizontally‑scalable authentication platform** that can be plugged into any product team’s stack while remaining developer‑friendly (Type‑safe TS/Node, monorepo, pnpm).

---

## 2 · Goals & Success Metrics  

| Goal | KPI / Target |
|------|--------------|
| Stateless auth with low latency | **TP99 < 300 ms** for `/login` at 5 k rps |
| Fault‑tolerant multi‑AZ deployments | **≥ 99.95 % monthly uptime** |
| Fast onboarding & DX | New engineer contributes PR in **≤ 1 day** |
| Abuse‑resilient API | ≤ 0.5 % requests throttled erroneously (false positives) |

---

## 3 · System Context & Topology  

```text
┌──────────────┐          ┌───────────────────┐
│ Next.js FE   │  HTTPS   │  Fastify API      │
│ (Edge / SSR) │◀️────────▶️│  auth‑backend     │
└──────────────┘          └──────┬────────────┘
        ▲ React‑Query            │ Prisma
        │                        ▼
  Browser JS SDK           PostgreSQL (Users, MFA)
                            ▲
                            │ Redis 7 (cache / ratelimit / JTI‑blacklist)
```

* **Edge Middleware** (Next.js) performs cookie inspection for fast 401s.  
* **Zod** schemas shared via `packages/shared-schemas`.  
* **OpenTelemetry** traces span FE → API → DB/Redis.

---

## 4 · Tech Stack & Justification  

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Package mgmt | **pnpm workspaces** | deterministic, fast |
| Runtime | **Node 20 LTS + TypeScript** | ESM top‑level await, Web Crypto |
| API | **Fastify 4** | 100 k req/s, rich plugin‑eco |
| ORM | **Prisma 5** | type‑safe, declarative migrations |
| Cache / ratelimit | **Redis 7** | sub‑millisecond ops, Lua |
| Tokens | **JWT (RS256)** + rotating refresh | stateless, safe key rotation |
| Front‑end | **Next.js 14 (App Router)** | SSR, Edge Functions |
| State on FE | **React Query** | cache, dedup, optimistic |
| Styling | **Tailwind CSS + shadcn/ui** | rapid prototyping |
| Validation | **Zod** | single‑source‑of‑truth DTOs |
| Tests | Vitest + Supertest (BE) / Playwright (E2E) / Pact | full‑stack + contract coverage |
| CI/CD | GitHub Actions → Vercel (FE) + Fly.io (BE) | preview envs per PR |
| Observability | Pino JSON → Loki, Prometheus + Grafana Cloud, Sentry, Tempo | structured logs + metrics + traces |

---

## 5 · Repository Layout  

```text
/apps
  /auth-frontend   (Next.js)
  /auth-backend    (Fastify)
  /docs                      (ADR, PRD)
/packages
  /shared-schemas            (Zod models)
  /auth-sdk                  (Typed JS client, autogen)
  /config                    (ESLint, tsconfig, tailwind-preset)
/infra                       (Terraform / Pulumi)
/tests                       (Pact & zod‑snapshot contracts)
pnpm-workspace.yaml
```

---

## 6 · Data & Control Flows  

1. **Sign‑in**  
   1. FE `POST /auth/login` → Fastify validates credentials.  
   2. Prisma fetches user; bcrypt compare.  
   3. Issue **Access JWT** (15 m) + **rotating Refresh JWT** (30 d) → HTTP‑only cookies.  
   4. Store refresh fingerprint in DB; log audit.  

2. **Token Refresh**  
   Refresh cookie → `/auth/refresh` → verify fingerprint & JTI not black‑listed → new pair; invalidate old refresh.

3. **Rate‑Limit & Anti‑Spam**  
   * Token‑bucket in Redis: **5 req / 10 s / IP** for login, **20 req / h / user** for forgot‑password.  
   * Exceeding soft limit triggers **hCaptcha** challenge (edge middleware); hard limit returns `429 TOO MANY REQUESTS`.  
   * Offending IPs stored in Redis‑Set for 30 min (“quarantine”).  

---

## 7 · Security, Compliance & Abuse Protection  

| Area | Measure |
|------|---------|
| Password hashing | **bcrypt cost = 12** |
| Token signing | **RS256**, keys in AWS KMS, JWKS endpoint |
| Refresh tokens | **Rotating, one‑time‑use**, fingerprints stored in DB |
| CSRF | SameSite `Lax` cookies + double‑submit token |
| MFA (future) | TOTP & WebAuthn tables present |
| Anti‑Spam | Redis rate‑limit + hCaptcha fallback + IP quarantine |
| GDPR / CCPA | Export & delete endpoints |
| CSP | strict‑dynamic via `next-safe-middleware` |

---

## 8 · Secrets & Configuration  

* **Secret store**: AWS Secrets Manager (or Vault) via Fastify plugin.  
* **Runtime validation**: `@anatine/zod-env`; app fails fast on invalid config.  
* **Dev containers** with Docker Compose (Postgres, Redis, Mailpit) guarantee env parity.

---

## 9 · Logging & Observability  

| Aspect | Choice | Notes |
|--------|--------|-------|
| Logger | **Pino** structured JSON | adds `traceId` from OTEL |
| Aggregation | **Grafana Loki** | logQL queries |
| Alerts | 5xx > 1 % 5 min, Redis p99 > 15 ms, login latency > 300 ms |
| Abuse metrics | Rate‑limit hits, CAPTCHA solves logged & dashboarded |
| Tracing | **OpenTelemetry** auto‑instrumentation |

---

## 10 · Front‑end Hardening  

| Measure | Implementation |
|---------|----------------|
| CSP | strict‑dynamic, hashed inline scripts |
| Helmet | Fastify‑Helmet for previews |
| Password strength | `zxcvbn` meter on Sign‑Up |
| Component tests | Playwright Component Tests |
| Accessibility | Axe‑lint + WCAG 2.2 AA |

---

## 11 · Contract Testing  

| Layer | Tool | Coverage |
|-------|------|----------|
| FE ↔️ BE DTOs | zod‑snapshot tests | schema drift detection |
| Service contracts | Pact (consumer‑driven) | prevents breaking API changes |

---

## 12 · Performance Budgets  

| Path | TP99 target | Notes |
|------|-------------|-------|
| `/auth/login` | ≤ 300 ms | DB < 50 ms, Redis < 5 ms |
| Cold start (API) | ≤ 1 s | Fly .io min‐size VM |
| FE bundle (gz) | ≤ 120 kB | auth widget only |

---

## 13 · Dev Workflow & Tooling  

* **`pnpm dev`** – Turbo‑repo runs BE & FE concurrently.  
* Husky pre‑commit: lint → type‑check → unit tests → contract tests.  
* **ADR** directory for numbered architectural decisions.
