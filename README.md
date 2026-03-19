# AprendAI — Backend

Motor de aprendizado com IA. Gera planos de estudo, conteúdo de aulas, quizzes e flashcards usando GitHub Models (gpt-4o).

## Estrutura do Projeto

```
aprendai-backend/
├── app/
│   ├── main.py                  # Entrypoint FastAPI
│   ├── core/
│   │   └── config.py            # Settings (pydantic-settings + .env)
│   ├── models/
│   │   └── schemas.py           # Modelos Pydantic de request/response
│   ├── prompts/
│   │   └── agents.py            # System prompts dos 4 agentes de IA
│   ├── services/
│   │   ├── llm_client.py        # Cliente GitHub Models (com retry)
│   │   ├── plan_service.py      # Agente 1: Plano de Estudos
│   │   ├── lesson_service.py    # Agente 2: Conteúdo de Aulas (+ streaming)
│   │   └── assessment_service.py # Agentes 3 e 4: Quiz + Flashcards
│   └── api/routes/
│       ├── plan.py              # POST /api/v1/plan/generate
│       ├── lesson.py            # POST /api/v1/lesson/generate[/stream]
│       └── assessment.py        # POST /api/v1/assessment/quiz|flashcards
└── tests/
    └── test_services.py         # Testes unitários com LLM mockado
```

## Setup

### 1. Pré-requisitos
- Python 3.12+
- Token do GitHub (com acesso ao GitHub Models)

### 2. Instalação

```bash
cd aprendai-backend
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### 3. Configuração

```bash
cp .env.example .env
# Edite .env e adicione seu GITHUB_TOKEN
```

Para obter o token: https://github.com/settings/tokens
- Não precisa de nenhuma permissão especial para acessar o GitHub Models.

### 4. Rodar

```bash
uvicorn app.main:app --reload --port 8000
```

Acesse:
- **API Docs (Swagger):** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

### 5. Rodar os testes

```bash
pytest tests/ -v
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/plan/generate` | Gera plano de N aulas |
| POST | `/api/v1/lesson/generate` | Gera conteúdo de uma aula |
| POST | `/api/v1/lesson/generate/stream` | Idem, com streaming SSE |
| POST | `/api/v1/assessment/quiz` | Gera quiz baseado no conteúdo |
| POST | `/api/v1/assessment/flashcards` | Gera flashcards |
| GET  | `/health` | Health check |

## Exemplo de uso

### 1. Gerar um plano

```bash
curl -X POST http://localhost:8000/api/v1/plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Quero 8 aulas sobre a Segunda Guerra Mundial, foco em tratados",
    "num_lessons": 8,
    "level": "intermediario",
    "tone": "academico"
  }'
```

### 2. Gerar conteúdo de uma aula

```bash
curl -X POST http://localhost:8000/api/v1/lesson/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Segunda Guerra Mundial",
    "lesson_number": 1,
    "lesson_title": "Antecedentes e a Crise do Entreguerras",
    "level": "intermediario",
    "tone": "academico",
    "previous_lessons": []
  }'
```

### 3. Gerar quiz (baseado no conteúdo retornado)

```bash
curl -X POST http://localhost:8000/api/v1/assessment/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_content": "<cole aqui o conteúdo completo das seções>",
    "num_questions": 5,
    "level": "intermediario"
  }'
```

## Arquitetura dos Agentes

```
Usuário
  │
  ▼
[Agente 1: Designer Instrucional]
  Recebe o pedido livre → Devolve plano estruturado em JSON
  │
  ▼
[Agente 2: Professor Especialista]
  Recebe contexto da aula → Devolve conteúdo em seções
  │
  ├──▶ [Agente 3: Avaliador]
  │      Recebe o conteúdo gerado → Devolve quiz (sem alucinações)
  │
  └──▶ [Agente 4: Flashcard Creator]
         Recebe o conteúdo gerado → Devolve flashcards
```

## Próximos passos

- [ ] Persistência com SQLite → PostgreSQL
- [ ] Autenticação com JWT
- [ ] Histórico de planos por usuário
- [ ] Sistema de avaliação/nota das aulas (0–5 estrelas)
- [ ] Exportação PDF com `reportlab`
- [ ] Rate limiting por usuário
