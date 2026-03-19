"""
Testes unitários dos serviços com LLM mockado.
Rode com: pytest tests/ -v
"""
import pytest
import json
from unittest.mock import AsyncMock, patch

from app.models.schemas import (
    PlanRequest, LessonRequest, QuizRequest, FlashcardsRequest,
    DifficultyLevel, ToneStyle,
)
from app.services.plan_service import generate_plan, _parse_plan_response
from app.services.lesson_service import generate_lesson, _parse_lesson_response
from app.services.assessment_service import generate_quiz, generate_flashcards


# ─── Fixtures ────────────────────────────────────────────────────────────────

MOCK_PLAN_RESPONSE = {
    "subject": "Segunda Guerra Mundial",
    "tags": ["História", "Política", "Séc. XX"],
    "lessons": [
        {"number": i+1, "title": f"Aula {i+1}", "description": f"Descrição da aula {i+1}"}
        for i in range(4)
    ],
    "total_lessons": 4,
}

MOCK_LESSON_RESPONSE = {
    "lesson_number": 1,
    "title": "Antecedentes da Guerra",
    "estimated_reading_minutes": 12,
    "sections": [
        {"heading": "Contexto Político", "body": "Texto sobre o contexto político..."},
        {"heading": "Causas Econômicas", "body": "Texto sobre causas econômicas..."},
    ],
    "key_concepts": ["Tratado de Versalhes", "Liga das Nações", "Grande Depressão"],
    "reflection_question": "Como a crise econômica de 1929 contribuiu para o radicalismo político?",
}

MOCK_QUIZ_RESPONSE = {
    "total_questions": 3,
    "questions": [
        {
            "number": 1,
            "question": "Qual foi o impacto do Tratado de Versalhes?",
            "options": [
                {"letter": "A", "text": "Trouxe prosperidade à Alemanha"},
                {"letter": "B", "text": "Impôs reparações que geraram ressentimento"},
                {"letter": "C", "text": "Criou uma aliança entre França e Alemanha"},
                {"letter": "D", "text": "Dividiu a Alemanha em dois países"},
            ],
            "correct_letter": "B",
            "explanation": "O tratado impôs reparações pesadas que humilharam a Alemanha...",
        }
    ] * 3,
}

MOCK_FLASHCARDS_RESPONSE = {
    "total_cards": 3,
    "cards": [
        {"front": "O que foi o Tratado de Versalhes?", "back": "Acordo de paz assinado em 1919..."},
        {"front": "O que é a Liga das Nações?", "back": "Organização internacional criada após a WWI..."},
        {"front": "Quando ocorreu a Grande Depressão?", "back": "A partir do crash de 1929..."},
    ],
}


# ─── Plan Service Tests ───────────────────────────────────────────────────────

class TestPlanService:

    @pytest.mark.asyncio
    async def test_generate_plan_success(self):
        with patch("app.services.plan_service.call_model", new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = MOCK_PLAN_RESPONSE

            request = PlanRequest(
                prompt="Quero aprender sobre a Segunda Guerra Mundial",
                num_lessons=4,
                level=DifficultyLevel.intermediate,
                tone=ToneStyle.academic,
            )
            result = await generate_plan(request)

            assert result.subject == "Segunda Guerra Mundial"
            assert len(result.lessons) == 4
            assert result.total_lessons == 4
            assert "História" in result.tags
            mock_llm.assert_called_once()

    def test_parse_plan_response_valid(self):
        result = _parse_plan_response(MOCK_PLAN_RESPONSE, expected_lessons=4)
        assert result.subject == "Segunda Guerra Mundial"
        assert len(result.lessons) == 4
        assert result.lessons[0].number == 1

    def test_parse_plan_response_missing_fields(self):
        """Deve usar fallbacks quando campos estão ausentes."""
        result = _parse_plan_response({}, expected_lessons=2)
        assert result.subject == "Tema não identificado"
        assert result.lessons == []


# ─── Lesson Service Tests ─────────────────────────────────────────────────────

class TestLessonService:

    @pytest.mark.asyncio
    async def test_generate_lesson_success(self):
        with patch("app.services.lesson_service.call_model", new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = MOCK_LESSON_RESPONSE

            request = LessonRequest(
                subject="Segunda Guerra Mundial",
                lesson_number=1,
                lesson_title="Antecedentes da Guerra",
                level=DifficultyLevel.intermediate,
                tone=ToneStyle.academic,
            )
            result = await generate_lesson(request)

            assert result.lesson_number == 1
            assert len(result.sections) == 2
            assert "Tratado de Versalhes" in result.key_concepts
            assert result.estimated_reading_minutes == 12

    def test_parse_lesson_response_sections(self):
        result = _parse_lesson_response(MOCK_LESSON_RESPONSE, lesson_number=1)
        assert result.sections[0].heading == "Contexto Político"
        assert len(result.key_concepts) == 3


# ─── Assessment Service Tests ─────────────────────────────────────────────────

class TestAssessmentService:

    @pytest.mark.asyncio
    async def test_generate_quiz_success(self):
        with patch("app.services.assessment_service.call_model", new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = MOCK_QUIZ_RESPONSE

            request = QuizRequest(
                lesson_content="Conteúdo da aula sobre a Segunda Guerra Mundial...",
                num_questions=3,
            )
            result = await generate_quiz(request)

            assert result.total_questions == 3
            assert result.questions[0].correct_letter == "B"
            assert len(result.questions[0].options) == 4

    @pytest.mark.asyncio
    async def test_generate_flashcards_success(self):
        with patch("app.services.assessment_service.call_model", new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = MOCK_FLASHCARDS_RESPONSE

            request = FlashcardsRequest(
                lesson_content="Conteúdo da aula sobre a Segunda Guerra Mundial...",
                num_cards=3,
            )
            result = await generate_flashcards(request)

            assert result.total_cards == 3
            assert result.cards[0].front != ""
            assert result.cards[0].back != ""

    @pytest.mark.asyncio
    async def test_quiz_invalid_correct_letter_fallback(self):
        """Resposta correta inválida deve usar fallback 'A'."""
        bad_response = {
            "total_questions": 1,
            "questions": [{
                "number": 1,
                "question": "Pergunta?",
                "options": [
                    {"letter": "A", "text": "Op A"},
                    {"letter": "B", "text": "Op B"},
                    {"letter": "C", "text": "Op C"},
                    {"letter": "D", "text": "Op D"},
                ],
                "correct_letter": "Z",  # inválido
                "explanation": "...",
            }]
        }
        with patch("app.services.assessment_service.call_model", new_callable=AsyncMock) as mock_llm:
            mock_llm.return_value = bad_response
            request = QuizRequest(lesson_content="x" * 100, num_questions=1)
            result = await generate_quiz(request)
            assert result.questions[0].correct_letter == "A"
