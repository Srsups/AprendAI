"""
Cliente para o GitHub Models (Azure OpenAI endpoint).
Encapsula todas as chamadas à API com retry, timeout e parsing de JSON.
"""
import json
import logging
from typing import Any

from openai import AsyncOpenAI, APIError, RateLimitError, APITimeoutError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _get_client() -> AsyncOpenAI:
    """Cria o cliente OpenAI apontando para o GitHub Models."""
    settings = get_settings()
    return AsyncOpenAI(
        base_url=settings.github_models_endpoint,
        api_key=settings.github_token,
    )


@retry(
    retry=retry_if_exception_type((RateLimitError, APITimeoutError)),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    reraise=True,
)
async def call_model(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4096,
    temperature: float = 0.3,
) -> dict[str, Any]:
    """
    Faz uma chamada ao GitHub Models e retorna o JSON parseado.

    - Retry automático em RateLimit e Timeout (máx 3 tentativas).
    - Temperatura baixa (0.3) para respostas mais determinísticas e factuais.
    - Retorna dict Python com o conteúdo da resposta.

    Raises:
        ValueError: Se a resposta não for JSON válido.
        APIError: Para erros da API não recuperáveis.
    """
    settings = get_settings()
    client   = _get_client()

    logger.info(f"[LLM] Chamando modelo {settings.github_model} | max_tokens={max_tokens}")

    response = await client.chat.completions.create(
        model=settings.github_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        response_format={"type": "json_object"},  # Força JSON no gpt-4o
    )

    raw = response.choices[0].message.content or ""
    logger.info(f"[LLM] Resposta recebida | tokens={response.usage.total_tokens}")

    return _parse_json(raw)


async def call_model_stream(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 4096,
    temperature: float = 0.4,
):
    """
    Versão streaming do call_model.
    Retorna um async generator de chunks de texto.
    Útil para o endpoint SSE do conteúdo das aulas.
    """
    settings = get_settings()
    client   = _get_client()

    logger.info(f"[LLM STREAM] Iniciando stream | modelo={settings.github_model}")

    stream = await client.chat.completions.create(
        model=settings.github_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def _parse_json(raw: str) -> dict[str, Any]:
    """
    Tenta parsear o JSON da resposta.
    Remove possíveis blocos ```json ... ``` que o modelo pode inserir.
    """
    cleaned = raw.strip()

    # Remove fences se existirem
    if cleaned.startswith("```"):
        lines   = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"[LLM] Falha ao parsear JSON: {e}\nRaw: {raw[:300]}")
        raise ValueError(f"A IA retornou um formato inválido. Detalhe: {e}")
