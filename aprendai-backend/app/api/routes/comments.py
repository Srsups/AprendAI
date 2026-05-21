"""
Rotas de comentários por aula.

GET    /api/v1/plans/{plan_id}/lessons/{n}/comments        → lista comentários
POST   /api/v1/plans/{plan_id}/lessons/{n}/comments        → cria comentário
DELETE /api/v1/plans/{plan_id}/lessons/{n}/comments/{id}   → remove o próprio
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.db.repositories import CommentRepository, LessonRepository
from app.models.db_schemas import CommentCreate, CommentResponse, CommentAuthor

router = APIRouter(tags=["Comentários"])


def _serialize(comment, current_user_id: str) -> CommentResponse:
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        created_at=comment.created_at,
        user=CommentAuthor(id=comment.user.id, name=comment.user.name),
        is_own=comment.user_id == current_user_id,
    )


@router.get(
    "/plans/{plan_id}/lessons/{lesson_number}/comments",
    response_model=list[CommentResponse],
    summary="Lista comentários de uma aula",
)
async def list_comments(
    plan_id      : str,
    lesson_number: int,
    db           : AsyncSession = Depends(get_db),
    current_user : User         = Depends(get_current_user),
):
    lesson_repo  = LessonRepository(db)
    comment_repo = CommentRepository(db)

    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)
    if not lesson:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    comments = await comment_repo.list_by_lesson(lesson.id)
    return [_serialize(c, current_user.id) for c in comments]


@router.post(
    "/plans/{plan_id}/lessons/{lesson_number}/comments",
    response_model=CommentResponse,
    status_code=201,
    summary="Adiciona um comentário a uma aula",
)
async def create_comment(
    plan_id      : str,
    lesson_number: int,
    body         : CommentCreate,
    db           : AsyncSession = Depends(get_db),
    current_user : User         = Depends(get_current_user),
):
    lesson_repo  = LessonRepository(db)
    comment_repo = CommentRepository(db)

    lesson = await lesson_repo.get_by_plan_and_number(plan_id, lesson_number)
    if not lesson:
        raise HTTPException(status_code=404, detail="Aula não encontrada.")

    comment = await comment_repo.create(
        lesson_id=lesson.id,
        user_id=current_user.id,
        content=body.content.strip(),
    )

    # Recarrega com o relacionamento user populado
    comment = await comment_repo.get_by_id(comment.id)
    return _serialize(comment, current_user.id)


@router.delete(
    "/plans/{plan_id}/lessons/{lesson_number}/comments/{comment_id}",
    status_code=204,
    summary="Remove um comentário próprio",
)
async def delete_comment(
    plan_id      : str,
    lesson_number: int,
    comment_id   : str,
    db           : AsyncSession = Depends(get_db),
    current_user : User         = Depends(get_current_user),
):
    comment_repo = CommentRepository(db)
    comment = await comment_repo.get_by_id(comment_id)

    if not comment:
        raise HTTPException(status_code=404, detail="Comentário não encontrado.")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você só pode remover seus próprios comentários.")

    await comment_repo.delete(comment_id)