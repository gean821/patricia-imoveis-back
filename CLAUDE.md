# CLAUDE.md — Contexto do projeto patricia-imoveis-back

> Arquivo carregado automaticamente em toda sessão Claude Code dentro desse repo.
> Mantém Gean alinhado com o assistente sem precisar re-explicar nada.

---

## O que é o projeto

API + base do CRM/vitrine imobiliária para a **Patricia Lima**, corretora em **Maringá-PR**. Cliente quer parar de mandar imóveis manualmente pelo WhatsApp e ter:

- CRM pra organizar imóveis angariados, clientes (leads) e timeline de interações (visita, proposta, negócio fechado…)
- Site público de vitrine (responsivo, com vídeo de abertura)
- Integração com portais (OLX, Chaves na Mão, Sub100, ZAP, VivaReal)

Referências visuais que ela enviou: `cayman.com.br` (clean, vídeo de abertura), `hauzapp.com.br` (UX que ela já conhece).

Front separado em outro repo (Next.js 15). Esse repo é só a API.

---

## Stack + decisões

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | Node 22 + NestJS 11 | padrão Aeco |
| ORM | Prisma 6 | padrão Aeco |
| Banco | Postgres 18 | padrão Aeco |
| Storage | Tigris (S3-compatible) | zero egress fee, SDK AWS funciona direto, endpoint `fly.storage.tigris.dev` |
| Auth | JWT HS256 via `jose` + bcrypt | mesmo do clinisys-api |
| Deploy | Railway (back) + Vercel (front) | barato, sem surpresa de billing |
| Pacote | pnpm | padrão Aeco |

**Não use AWS direto.** Gean considera "bazuka pra algo simples".

---

## Arquitetura — módulo por feature (sem domain layer rica)

Padrão simplificado do clinisys-api, sem multi-tenancy e sem entities/VOs ricos:

```
src/
├── main.ts, app.module.ts
├── config/configuration.ts        # carregamento de env
├── shared/
│   ├── prisma/                    # PrismaService global
│   ├── auth/                      # login, JWT, guards, decorators
│   ├── storage/                   # Tigris (S3 SDK)
│   └── filters/                   # PrismaExceptionFilter
└── modules/<feature>/
    ├── <feature>.module.ts        # NestJS module
    ├── application/<feature>.service.ts   # orquestração
    ├── presentation/
    │   ├── <feature>.controller.ts        # admin/protegido
    │   ├── <feature>-public.controller.ts # vitrine pública (quando faz sentido)
    │   └── dto/<feature>.dtos.ts
    └── repository/<feature>.repository.ts # injeta PrismaService
```

Módulos atuais: `imoveis`, `clientes`, `interacoes` (timeline), `matching`, `uploads`, `feed-portais`.

**Sem abstract repositories.** Repos concretos injetam `PrismaService` direto. Services só falam com repos. Controllers só delegam.

---

## REGRAS DE CÓDIGO — obrigatórias

Background Java/.NET do Gean. Quebrar essas regras é code smell:

1. **Listas sempre paginadas com DTO.** Toda rota que devolve coleção tem `List<X>QueryDto { page, limit, search, filtros }` e retorna `PaginatedResponse<T> { items, total, page, limit }`.

2. **Sempre `mapToResponse`.** Service nunca devolve payload bruto do Prisma pro controller. Existe um método (privado) que traduz `XDetailedType` (Prisma) → `XResponseDto`.

3. **`if` sempre com chaves.**
   ```ts
   // certo
   if (cond) {
     doStuff();
   }
   // errado
   if (cond) doStuff();
   ```

4. **`PrismaService` SÓ no repository.** Service injeta repos (e outros services). Service nunca importa `PrismaService`. Isso é dogma.

5. **`async/await` consistente.** Em repos e services, métodos que retornam `Promise` são `async` com `await` explícito — não retornar promise direto. Métodos síncronos podem ficar sem.

---

## Pendências conhecidas no scaffold inicial

Scaffold de 2026-05-13 foi feito rápido e tem violações conscientes das regras acima. Gean explicitamente disse "por hora não afeta". Lista pra refactor futuro:

- [ ] `MatchingService` injeta `PrismaService` direto → criar `MatchingRepository`
- [ ] Services devolvem tipos Prisma (`ImovelDetailed`, `ClienteDetailed`, etc) → adicionar `mapToResponse` + DTOs de resposta
- [ ] `MatchingController` lista sem paginação → paginar
- [ ] Varrer `if` em uma linha e corrigir
- [ ] Auditar `async/await` consistente
- [ ] Migrar `package.json#prisma.seed` pra `prisma.config.ts` (Prisma 7 vai remover)

---

## Como rodar local

```powershell
copy .env.example .env
# ajuste STORAGE_* se for testar uploads contra Tigris real

docker-compose up -d postgres
pnpm install
pnpm prisma migrate dev --name init
pnpm db:seed           # cria admin com ADMIN_EMAIL/PASSWORD do .env
pnpm start:dev

# Swagger: http://localhost:3000/docs
```

Variáveis críticas no `.env`:
- `DATABASE_URL` — Postgres
- `JWT_SECRET` — chave longa em prod (`openssl rand -base64 64`)
- `ADMIN_EMAIL/PASSWORD/NAME` — seed do admin no primeiro boot
- `STORAGE_*` — credenciais Tigris (sem isso uploads falham, mas API sobe)
- `PUBLIC_SITE_URL` — usado no `<DetailViewUrl>` do feed XML

---

## Endpoints

| Método | Rota | Auth |
|---|---|---|
| POST | `/auth/login` `/auth/refresh` | público |
| GET | `/auth/me` | bearer |
| `*` | `/admin/imoveis` `/admin/clientes` `/admin/interacoes` `/admin/matching/*` `/admin/uploads/*` | bearer (ADMIN/CORRETOR) |
| GET | `/imoveis` `/imoveis/destaques` `/imoveis/:codigo` | público (vitrine) |
| GET | `/feed/imoveis.xml` | público (portais consomem) |
| GET | `/docs` | Swagger |

---

## Integração com portais — estratégia

V1: **feed XML pull**. Endpoint `GET /feed/imoveis.xml` no padrão GrupoZAP/VivaReal-compatible. Portais (OLX, ZAP, VivaReal, ChavesNaMão) puxam por crawler agendado deles. Sem credencial nem push ativo.

Cada imóvel tem flags `publicadoOlx`, `publicadoChavesNaMao`, `publicadoSub100`, `publicadoZap`, `publicadoVivaReal`, `publicadoFeed`. O feed inicial só respeita `publicadoFeed`. As outras flags ficam prontas pra quando v2 fizer push ativo via API dos portais (OLX Pro tem API oficial paga; ChavesNaMão tem API com doc limitada).

Alternativa de longo prazo: usar **Tecimob/Jetimob** (plataformas intermediárias que já integram com todos os portais) — fica a critério da Patricia se quer pagar essa camada.

---

## Modelo de dados (resumo)

- `User` — admin/corretora (single user no v1, mas tabela já suporta múltiplos com role)
- `Imovel` — código único, título, tipo, finalidade, status, endereço, valores, área, quartos/suites/banheiros/vagas, características (string[]), mídia (video, planta, tour virtual), flags de publicação
- `ImovelFoto` — 1:N com Imovel, com `ordem` e `isCapa`
- `Cliente` — nome, contato, preferências (tipo, finalidade, bairro/cidade, faixa de valor, quartos min, vagas min)
- `ClienteImovel` — N:N Cliente↔Imovel com `interesse` (1-5) e `nota`
- `Interacao` — timeline do CRM: CONTATO/VISITA_AGENDADA/VISITA_REALIZADA/PROPOSTA/CONTRAPROPOSTA/NEGOCIO_FECHADO/PERDIDO/DESISTENCIA/NOTA

Todos os modelos principais têm soft delete (`deletedAt`). Cascade configurado nas FKs.

---

## Notas operacionais

- **Hauzapp** é a referência do app que ela já usa — Patricia disse que passa a senha pra eu fuçar.
- Fotos/material visual da casa dela vão chegar dela — usado no front.
- Cliente é não-técnica — UX precisa ser óbvio. Não inventar fluxos exóticos.
- Maringá-PR é mercado regional, sem volume monstro — não dimensionar pra escala absurda.
