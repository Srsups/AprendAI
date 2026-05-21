"""
Configuração de limites por plano de assinatura.
None = ilimitado.
"""
from typing import TypedDict


class PlanLimits(TypedDict):
    plans_per_month : int | None
    max_lessons     : int
    flashcards      : bool
    export_pptx     : bool
    methodology     : bool   # metodologias de ensino (professor)
    label           : str
    description     : str


PLAN_LIMITS: dict[str, PlanLimits] = {
    "free": {
        "plans_per_month" : 2,
        "max_lessons"     : 8,
        "flashcards"      : False,
        "export_pptx"     : False,
        "methodology"     : False,
        "label"           : "Gratuito",
        "description"     : "2 planos/mês · até 8 aulas",
    },
    "pro": {
        "plans_per_month" : None,
        "max_lessons"     : 16,
        "flashcards"      : True,
        "export_pptx"     : True,
        "methodology"     : False,
        "label"           : "Pro",
        "description"     : "Planos ilimitados · até 16 aulas",
    },
    "teacher": {
        "plans_per_month" : None,
        "max_lessons"     : 16,
        "flashcards"      : True,
        "export_pptx"     : True,
        "methodology"     : True,
        "label"           : "Professor",
        "description"     : "Tudo do Pro + metodologias de ensino",
    },
    "institutional": {
        "plans_per_month" : None,
        "max_lessons"     : 16,
        "flashcards"      : True,
        "export_pptx"     : True,
        "methodology"     : True,
        "label"           : "Institucional",
        "description"     : "Multi-usuário · SLA garantido",
    },
}


def get_limits(plan: str) -> PlanLimits:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])


def is_within_limit(plan: str, plans_this_month: int) -> bool:
    limits = get_limits(plan)
    if limits["plans_per_month"] is None:
        return True
    return plans_this_month < limits["plans_per_month"]