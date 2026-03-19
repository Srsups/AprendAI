from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import LessonRequest, LessonResponse
from app.services.lesson_service import generate_lesson, generate_lesson_stream

router = APIRouter(prefix="/lesson", tags=["Conteúdo de Aulas"])


@router.post(
    "/generate",
    response_model=LessonResponse,
    summary="Gera o conteúdo completo de uma aula",
    description="""
Recebe o contexto da aula (tema, número, título, nível) e retorna
o conteúdo estruturado em seções, conceitos-chave e pergunta de reflexão.
    """,
)
async def create_lesson(request: LessonRequest) -> LessonResponse:
    try:
        return await generate_lesson(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar aula: {str(e)}")


@router.post(
    "/generate/stream",
    summary="Gera o conteúdo de uma aula via Server-Sent Events (streaming)",
    description="""
Versão streaming do endpoint de geração de aulas.
Retorna chunks de texto em tempo real via SSE para o frontend.

**Como consumir no frontend (Next.js):**
```js
const res = await fetch('/api/lesson/generate/stream', { method: 'POST', body: ... })
const reader = res.body.getReader()
// leia os chunks com reader.read()
```
    """,
    response_class=StreamingResponse,
)
async def create_lesson_stream(request: LessonRequest):
    try:
        return StreamingResponse(
            generate_lesson_stream(request),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",  # Importante para Nginx
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no stream: {str(e)}")
