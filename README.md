# AprendAI

Motor de criação de conteúdo educacional com Inteligência Artificial. Projeto acadêmico (TCC) que simula um SaaS completo para geração de planos de estudo, aulas, quizzes e flashcards.

---

## Visão Geral

```
AprendAI/
├── aprendai-backend/    # API FastAPI + SQLite + GitHub Models
└── aprendai-frontend/   # Next.js 16 + Tailwind v4 + shadcn/ui
```

---

## Backend

### Estrutura

```
aprendai-backend/
├── app/
│   ├── main.py                      # Entrypoint FastAPI
│   ├── core/
│   │   ├── config.py                # Settings (pydantic-settings + .env)
│   │   ├── security.py              # Hash de senha + JWT
│   │   └── dependencies.py          # get_current_user, get_current_teacher
│   ├── db/
│   │   ├── database.py              # Engine async, sessão, create_tables
│   │   ├── models.py                # ORM: users, study_plans, lessons, quiz_attempts, plan_ratings
│   │   └── repositories.py          # Camada de acesso a dados (queries)
│   ├── models/
│   │   ├── schemas.py               # Schemas Pydantic dos agentes de IA
│   │   ├── db_schemas.py            # Schemas Pydantic dos endpoints com banco
│   │   └── auth_schemas.py          # Schemas de registro, login e token
│   ├── prompts/
│   │   └── agents.py                # System prompts dos 4 agentes de IA
│   ├── services/
│   │   ├── llm_client.py            # Cliente GitHub Models (retry + JSON parsing)
│   │   ├── plan_service.py          # Agente 1: Plano de Estudos
│   │   ├── lesson_service.py        # Agente 2: Conteúdo de Aulas (+ streaming)
│   │   └── assessment_service.py    # Agentes 3 e 4: Quiz + Flashcards
│   └── api/routes/
│       ├── auth.py                  # /register, /login, /me
│       ├── plan.py                  # POST /api/v1/plan/generate
│       ├── lesson.py                # POST /api/v1/lesson/generate[/stream]
│       ├── assessment.py            # POST /api/v1/assessment/quiz|flashcards
│       ├── plans_db.py              # CRUD de planos com persistência
│       ├── lessons_db.py            # Geração de aulas com cache no banco
│       └── assessment_db.py         # Tentativas de quiz e avaliações (0–5★)
└── tests/
    └── test_services.py             # Testes unitários com LLM mockado
```

### Setup

**Pré-requisitos:** Python 3.12+ · Token do GitHub com acesso ao GitHub Models

```bash
cd aprendai-backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
cp .env.example .env
# Edite .env e preencha as variáveis
```

**`.env` — variáveis necessárias:**

```env
GITHUB_TOKEN=seu_token_aqui
GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com
GITHUB_MODEL=gpt-4o

APP_ENV=development
DATABASE_URL=sqlite+aiosqlite:///./aprendai.db
CORS_ORIGINS_RAW=http://localhost:3000

SECRET_KEY=gere-com-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**Rodar:**

```bash
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

**Testes:**

```bash
pytest tests/ -v
```

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/v1/auth/register` | — | Cria conta e retorna JWT |
| POST | `/api/v1/auth/login` | — | Autentica e retorna JWT |
| GET  | `/api/v1/auth/me` | ✓ | Dados do usuário logado |
| POST | `/api/v1/plan/generate` | ✓ | Gera plano via IA (sem salvar) |
| POST | `/api/v1/lesson/generate` | ✓ | Gera conteúdo de aula (sem salvar) |
| POST | `/api/v1/lesson/generate/stream` | ✓ | Idem, com streaming SSE |
| POST | `/api/v1/assessment/quiz` | ✓ | Gera quiz baseado no conteúdo |
| POST | `/api/v1/assessment/flashcards` | ✓ | Gera flashcards |
| POST | `/api/v1/plans` | ✓ | Salva plano gerado no banco |
| GET  | `/api/v1/plans` | ✓ | Lista planos do usuário |
| GET  | `/api/v1/plans/{id}` | ✓ | Detalhe do plano com aulas |
| PATCH | `/api/v1/plans/{id}/progress` | ✓ | Atualiza progresso |
| DELETE | `/api/v1/plans/{id}` | ✓ | Remove plano |
| GET  | `/api/v1/plans/trending/list` | — | Temas mais gerados |
| POST | `/api/v1/plans/{id}/lessons/{n}/generate` | ✓ | Gera aula com cache |
| POST | `/api/v1/plans/{id}/lessons/{n}/generate/stream` | ✓ | Idem, com streaming |
| POST | `/api/v1/plans/{id}/lessons/{n}/attempts` | ✓ | Salva tentativa de quiz |
| GET  | `/api/v1/plans/{id}/lessons/{n}/attempts` | ✓ | Histórico de tentativas |
| POST | `/api/v1/plans/{id}/rating` | ✓ | Avalia plano (0–5★) |
| GET  | `/api/v1/plans/{id}/rating` | ✓ | Estatísticas de avaliação |

### Arquitetura dos Agentes de IA

```
Usuário
  │
  ▼
[Agente 1: Designer Instrucional]
  Recebe pedido livre → Devolve plano estruturado em JSON
  │
  ▼
[Agente 2: Professor Especialista]
  Recebe contexto da aula → Devolve conteúdo em seções (com cache no banco)
  │
  ├──▶ [Agente 3: Avaliador]
  │      Baseado exclusivamente no conteúdo gerado → Devolve quiz (sem alucinações)
  │
  └──▶ [Agente 4: Flashcard Creator]
         Baseado exclusivamente no conteúdo gerado → Devolve flashcards
```

---

## Frontend

### Estrutura

```
aprendai-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                        # Landing page pública
│   │   ├── layout.tsx                      # Layout raiz (fontes, providers)
│   │   ├── globals.css                     # Design system + Tailwind v4
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              # Página de login
│   │   │   └── register/page.tsx           # Página de cadastro
│   │   └── (app)/
│   │       ├── layout.tsx                  # Layout com Navbar
│   │       ├── dashboard/page.tsx          # Home logada (input principal)
│   │       ├── explorar/page.tsx           # Carrossel + coleções + trending
│   │       ├── perfil/page.tsx             # Minha área + estatísticas
│   │       └── plans/
│   │           ├── page.tsx                # Lista de planos
│   │           └── [id]/page.tsx           # Detalhe do plano + aulas
│   ├── components/
│   │   ├── ui/                             # Componentes shadcn/ui (Nova)
│   │   ├── layout/
│   │   │   └── Navbar.tsx                  # Navbar responsiva com auth
│   │   ├── home/
│   │   │   ├── SearchInput.tsx             # Input com chips de opções
│   │   │   └── TrendingList.tsx            # Lista de trending da API
│   │   ├── plans/
│   │   │   ├── LessonSidebar.tsx           # Sidebar com progresso por aula
│   │   │   └── LessonContent.tsx           # Renderizador de conteúdo de aula
│   │   └── shared/
│   │       └── StarRating.tsx              # Avaliação interativa 0–5★
│   ├── hooks/
│   │   ├── useAuth.ts                      # Login, registro, logout
│   │   └── usePlan.ts                      # Gerar plano, buscar aula
│   ├── lib/
│   │   ├── api.ts                          # Cliente Axios com interceptors JWT
│   │   ├── auth.ts                         # Helpers de token em cookie
│   │   └── types.ts                        # Tipos TypeScript do backend
│   └── providers/
│       └── Providers.tsx                   # React Query configurado
└── .env.local
```

### Setup

**Pré-requisitos:** Node.js 18+ · npm

```bash
cd aprendai-frontend
npm install
cp .env.local.example .env.local
# ou crie manualmente o .env.local
```

**`.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Rodar:**

```bash
npm run dev
# http://localhost:3000
```

### Dependências principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| next | 16.x | Framework React |
| tailwindcss | 4.x | Estilização |
| shadcn/ui | 4.x (Nova) | Componentes base |
| framer-motion | latest | Animações e transições |
| @tanstack/react-query | latest | Cache e estado servidor |
| axios | latest | Cliente HTTP |
| js-cookie | latest | Armazenamento do JWT |
| sonner | latest | Notificações toast |
| lucide-react | latest | Ícones |

### Páginas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page com hero, como funciona, recursos, planos e CTA |
| `/login` | Público | Autenticação |
| `/register` | Público | Cadastro (estudante ou professor) |
| `/dashboard` | Logado | Input principal de geração de planos |
| `/explorar` | Logado | Carrossel de coleções, categorias e trending |
| `/perfil` | Logado | Estatísticas, progresso e planos do usuário |
| `/plans` | Logado | Lista completa de planos salvos |
| `/plans/[id]` | Logado | Visualização de aulas com sidebar e avaliação |

### Design System

- **Tema:** Dark, fundo `#0a0a08`
- **Cor primária:** Verde limão `hsl(77 83% 66%)` — `#c8f060`
- **Tipografia:** Playfair Display (serif) · DM Sans (sans) · DM Mono (mono)
- **Estilo shadcn:** Nova
- **Efeitos:** Canvas de partículas interativo, orbs de gradiente animados, cursor personalizado, reveals com Framer Motion

---

## Banco de Dados

SQLite em desenvolvimento, PostgreSQL em produção. Troca feita alterando `DATABASE_URL` no `.env` — sem mudança de código.

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários (estudante ou professor) |
| `study_plans` | Planos de estudo gerados |
| `lessons` | Aulas de cada plano (com cache do conteúdo gerado) |
| `quiz_attempts` | Tentativas de quiz por usuário/aula |
| `plan_ratings` | Avaliações 0–5★ por usuário/plano |

---

## Roadmap

- [x] Backend FastAPI com 4 agentes de IA
- [x] Persistência com SQLite + SQLAlchemy async
- [x] Autenticação JWT (registro, login, logout)
- [x] Cache de conteúdo gerado por aula
- [x] Sistema de avaliação 0–5★
- [x] Frontend Next.js com design system completo
- [x] Landing page pública com pricing
- [x] Página Explorar com coleções e trending
- [x] Página Minha Área com estatísticas de progresso
- [ ] Exportação PDF com `reportlab`
- [ ] Comentários por aula
- [ ] Coleções dinâmicas (via banco)
- [ ] Modo Professor com painel de turmas
- [ ] Rate limiting por plano de assinatura
- [ ] Migração para PostgreSQL em produção
