# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

浙杭集团 ERP/CRM — a multi-tenant enterprise management system. Spring Boot 3 backend + Vue 3 frontend, MySQL/Redis/Elasticsearch. The git repo root is `zhehang-erp/` (the parent `浙杭系统/` folder is not versioned).

The project is bilingual (zh-CN / en-US). Source code, comments, log module names, and UI strings are heavily Chinese. **Encoding matters**: the codebase has had GBK-as-UTF-8 corruption issues. Always write/save files as UTF-8. (The old one-off repair scripts `_fix*.js`, `_deep_scan.js`, `scan-corrupt.js`, `_create_mapper.js`, `_write_user.ps1`, `_test.txt` were removed 2026-06-20 — they were not part of the build.)

## Layout

Three top-level pieces under `zhehang-erp/`:
- `zhehang-erp-server/` — Spring Boot 3.2.5 multi-module Maven project (Java 17)
- `zhehang-erp-ui/` — Vue 3 + Vite + TypeScript SPA
- `zhehang-erp-db/` — SQL schema (`init/`, run in numeric filename order) and versioned `migration/` scripts

## Commands

### Backend (`zhehang-erp-server/`)
```bash
mvn clean package -DskipTests              # build all modules
mvn -pl zhehang-erp-admin -am spring-boot:run   # run the app (only admin is bootable)
mvn -pl zhehang-erp-modules test           # test a single module
mvn -pl zhehang-erp-modules -Dtest=SomeTest test   # single test class
```
The app runs on `http://localhost:8080/api` (note the `/api` context-path). API docs (knife4j): `http://localhost:8080/api/doc.html`.

### Frontend (`zhehang-erp-ui/`)
```bash
npm run dev        # vite dev server on :3000, proxies /api -> :8080
npm run build      # vue-tsc + vite build -> dist/
npm run lint       # eslint --fix over .vue/.ts/.js
```

### Full stack
```bash
docker-compose up --build   # server + mysql + redis + elasticsearch
```

## Backend architecture

Maven module dependency chain (defined in root `pom.xml`):
- **zhehang-erp-common** — shared core. `R<T>` (universal `{code,message,data,timestamp}` API envelope — code 200 = success), `BaseEntity` (every table gets `id`/`createTime`/`updateTime`/`createBy`/`updateBy`/`deleted`/`tenantId`), `BusinessException`+`ErrorCode`+`GlobalExceptionHandler`, the `@Log` annotation + `LogAspect` for operation auditing, i18n (`MessageUtils`), and MyBatis-Plus/Redis/Jackson config.
- **zhehang-erp-security** — Spring Security + JWT. Stateless (`SessionCreationPolicy.STATELESS`), `JwtAuthenticationFilter` reads the `Authorization: Bearer` token, `@EnableMethodSecurity` enables `@PreAuthorize`. See `SecurityConfig` for the permit-all whitelist (`/auth/login`, `/auth/captcha`, swagger).
- **zhehang-erp-modules** — all business domains, one package per domain under `com.zhehang.erp.modules.{domain}`, each with `controller`/`service`/`mapper`/`domain`. Domains: `auth org crm hrm finance project supply sales order contract receipt channel multidim workflow task report dashboard file ai system`.
- **zhehang-erp-admin** — the only deployable module. Holds `ZhehangErpApplication` (main class) and `application*.yml`. Maven profiles map to Spring profiles `dev`/`prod`.

### Conventions
- Controllers return `R<T>` (use `R.ok(...)` / `R.fail(...)`), are `@RequestMapping`-prefixed by domain (e.g. `/crm/pool-config`), use `@RequiredArgsConstructor` constructor injection, and annotate mutating endpoints with `@Log(module="...", type=Log.OperationType.X)`.
- Persistence is MyBatis-Plus: entities extend `BaseEntity`, mapper XML lives in `classpath*:/mapper/**/*.xml`, `map-underscore-to-camel-case` is on, snowflake IDs (`ASSIGN_ID`), and logic-delete via the `deleted` column (1=deleted). `tenantId` on `BaseEntity` drives multi-tenancy — be aware of tenant scoping when writing queries.
- Third-party OAuth and the legacy public OpenAPI shell are not active. Their old provider/sample chains and anonymous security routes were removed because production had no configured OAuth provider, OpenAPI app, or call log. Historical tables and migrations remain for audit and a future real integration.

## Frontend architecture

Vue 3 `<script setup>` + Composition API, Pinia, Vue Router, Element Plus, vue-i18n, ECharts. Path alias `@` → `src/`. Element Plus components and Vue/router/pinia/i18n APIs are **auto-imported** (`unplugin-auto-import` / `unplugin-vue-components`) — don't add manual imports for them; types are in generated `auto-imports.d.ts` / `components.d.ts`.

- **API layer** (`src/api/`): one file per backend domain plus `request.ts`. `request.ts` is the axios instance — request interceptor injects the Bearer token, response interceptor unwraps `R<T>` (returns `response.data` on code 200/0) and globally handles 401 (force re-login) / 403 / 404 / 500. Always call the per-domain api modules, not axios directly.
- **Auth & routing**: `router/guard.ts` loads identity, roles and dynamic routes only from the real backend session. Fixed mock tokens, local role impersonation and demo-account login fallback are forbidden; `cleanupMockStorage()` only clears historical browser leftovers.
- **Permissions**: a `v-permission` directive (`directives/permission.ts`) plus the backend session's roles/permissions gate UI; CRM contact formatting reads the same real permission set and must not accept local role impersonation.
- **i18n** (`src/locales/`): shared `zh-CN`/`en-US` plus the active `crm-`, `hrm-` and `biz-zh-CN` domain files, merged in `locales/index.ts`. Keep both languages in sync when adding bilingual strings.
- **Views** (`src/views/`) mirror the backend domains. Build does manual vendor chunk-splitting (element-plus, echarts, vue, i18n, dayjs, axios) and drops `console`/`debugger` via terser.

## Config & secrets

Backend config reads credentials from environment variables: `DB_HOST`/`DB_USER`/`DB_PASSWORD`, `REDIS_*`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `ES_*`, and external-provider keys. Database and Redis passwords have no committed fallback. Production must provide independent random JWT and MFA keys through `.env`; real secrets must never be committed. Frontend uses `VITE_API_BASE_URL` / `VITE_APP_TITLE` from `.env` files.
