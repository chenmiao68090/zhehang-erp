# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

浙杭集团 ERP/CRM — a multi-tenant enterprise management system. Spring Boot 3 backend + Vue 3 frontend, MySQL/Redis/Elasticsearch. The git repo root is `zhehang-erp/` (the parent `浙杭系统/` folder is not versioned).

The project is bilingual (zh-CN / en-US). Source code, comments, log module names, and UI strings are heavily Chinese. **Encoding matters**: the codebase has had GBK-as-UTF-8 corruption issues. The root-level `_fix*.js`, `_deep_scan.js`, `scan-corrupt.js`, `_create_mapper.js`, `_write_user.ps1` are one-off repair scripts (note their hardcoded `d:\zhehang-erp\...` Windows paths) — not part of the build, do not rely on them. Always write/save files as UTF-8.

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
- **zhehang-erp-security** — Spring Security + JWT. Stateless (`SessionCreationPolicy.STATELESS`), `JwtAuthenticationFilter` reads the `Authorization: Bearer` token, `@EnableMethodSecurity` enables `@PreAuthorize`. See `SecurityConfig` for the permit-all whitelist (`/auth/login`, `/auth/captcha`, `/auth/oauth/**`, `/openapi/**`, swagger).
- **zhehang-erp-modules** — all business domains, one package per domain under `com.zhehang.erp.modules.{domain}`, each with `controller`/`service`/`mapper`/`domain`. Domains: `auth org crm hrm finance project supply sales order contract receipt channel multidim workflow task report dashboard file ai system openapi`.
- **zhehang-erp-admin** — the only deployable module. Holds `ZhehangErpApplication` (main class) and `application*.yml`. Maven profiles map to Spring profiles `dev`/`prod`.

### Conventions
- Controllers return `R<T>` (use `R.ok(...)` / `R.fail(...)`), are `@RequestMapping`-prefixed by domain (e.g. `/crm/pool-config`), use `@RequiredArgsConstructor` constructor injection, and annotate mutating endpoints with `@Log(module="...", type=Log.OperationType.X)`.
- Persistence is MyBatis-Plus: entities extend `BaseEntity`, mapper XML lives in `classpath*:/mapper/**/*.xml`, `map-underscore-to-camel-case` is on, snowflake IDs (`ASSIGN_ID`), and logic-delete via the `deleted` column (1=deleted). `tenantId` on `BaseEntity` drives multi-tenancy — be aware of tenant scoping when writing queries.
- **OpenAPI module** (`/openapi/**`) is publicly routed but protected by its own servlet filters — HMAC `OpenapiSignFilter` (signature verification + `AesEncryptUtils`) and `OpenapiRateLimitFilter` — not by Spring Security auth.

## Frontend architecture

Vue 3 `<script setup>` + Composition API, Pinia, Vue Router, Element Plus, vue-i18n, ECharts. Path alias `@` → `src/`. Element Plus components and Vue/router/pinia/i18n APIs are **auto-imported** (`unplugin-auto-import` / `unplugin-vue-components`) — don't add manual imports for them; types are in generated `auto-imports.d.ts` / `components.d.ts`.

- **API layer** (`src/api/`): one file per backend domain plus `request.ts`. `request.ts` is the axios instance — request interceptor injects the Bearer token, response interceptor unwraps `R<T>` (returns `response.data` on code 200/0) and globally handles 401 (force re-login) / 403 / 404 / 500. Always call the per-domain api modules, not axios directly.
- **Auth & routing**: `router/guard.ts` loads roles + dynamic routes from the user/permission stores after login. **Mock mode**: a fixed `MOCK_TOKEN = 'mock_admin_token'` bypasses the backend and drives the UI from a `current_role` in localStorage (roles: admin/boss/manager/finance/sales) — used for backend-less local dev. `cleanupMockStorage()` runs at startup.
- **Permissions**: a `v-permission` directive (`directives/permission.ts`) plus `utils/permission.ts` / `utils/crm-permission.ts` gate UI by role/permission.
- **i18n** (`src/locales/`): split per-domain (`crm-`, `hrm-`, `sales-`, `cc-` call-center, `multidim-`, `biz-`) with `zh-CN`/`en-US` pairs, merged in `locales/index.ts`. Keep both languages in sync when adding strings.
- **Views** (`src/views/`) mirror the backend domains. Build does manual vendor chunk-splitting (element-plus, echarts, vue, i18n, dayjs, axios) and drops `console`/`debugger` via terser.

## Config & secrets

Backend config reads env vars with dev defaults: `DB_HOST`/`DB_USER`/`DB_PASSWORD`, `REDIS_*`, `ES_*`, `OPENAI_API_KEY`/`QWEN_API_KEY` (the `ai` module), and the `jwt.secret`. Dev defaults (e.g. DB password `123456`, the placeholder JWT secret) are committed in `application-dev.yml` — override via env/`application-prod.yml` for any real deployment. Frontend uses `VITE_API_BASE_URL` / `VITE_APP_TITLE` from `.env` files.
