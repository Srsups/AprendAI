"""
Cliente para o Azure AI Foundry (Azure OpenAI).
Usa o SDK openai com AzureOpenAI — mesma interface, endpoint diferente.
"""
import json
import logging
from typing import Any
from urllib.parse import urlsplit, urlunsplit

from openai import AsyncAzureOpenAI, APIError, RateLimitError, APITimeoutError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _azure_resource_endpoint(endpoint: str) -> str:
    """Remove paths intended for the v1 OpenAI-compatible API."""
    parsed = urlsplit(endpoint.rstrip("/"))
    return urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))


def _get_client() -> AsyncAzureOpenAI:
    """Cria o cliente Azure OpenAI."""
    settings = get_settings()
    return AsyncAzureOpenAI(
        api_key  = settings.azure_openai_api_key,
        azure_endpoint = _azure_resource_endpoint(settings.azure_openai_endpoint),
        api_version    = settings.azure_openai_api_version,
    )


@retry(
    retry=retry_if_exception_type((RateLimitError, APITimeoutError)),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
    reraise=True,
)
async def call_model(
    system_prompt: str,
    user_prompt  : str,
    max_tokens   : int = 4096,
    temperature  : float = 0.4,
) -> dict[str, Any]:
    """
    Chama o Azure AI Foundry e retorna o JSON parseado.
    Retry automático em RateLimit e Timeout (máx 3 tentativas).
    """
    settings = get_settings()
    client   = _get_client()

    logger.info(f"[LLM] Chamando deployment '{settings.azure_openai_deployment}' | max_tokens={max_tokens}")

    response = await client.chat.completions.create(
        model    = settings.azure_openai_deployment,   # nome do deployment no Azure
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens      = max_tokens,
        temperature     = temperature,
        response_format = {"type": "json_object"},
    )

    raw = response.choices[0].message.content or ""
    logger.info(f"[LLM] Resposta recebida | tokens={response.usage.total_tokens}")

    return _parse_json(raw)


async def call_model_stream(
    system_prompt: str,
    user_prompt  : str,
    max_tokens   : int = 4096,
    temperature  : float = 0.4,
):
    """Versão streaming — retorna async generator de chunks de texto."""
    settings = get_settings()
    client   = _get_client()

    logger.info(f"[LLM STREAM] Iniciando | deployment={settings.azure_openai_deployment}")

    stream = await client.chat.completions.create(
        model    = settings.azure_openai_deployment,
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens = max_tokens,
        temperature = temperature,
        stream     = True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def _parse_json(raw: str) -> dict[str, Any]:
    """Parse seguro do JSON retornado pelo modelo."""
    cleaned = raw.strip()

    if cleaned.startswith("```"):
        lines   = cleaned.split("\n")
        cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"[LLM] Falha ao parsear JSON: {e}\nRaw: {raw[:300]}")
        raise ValueError(f"A IA retornou um formato inválido: {e}")