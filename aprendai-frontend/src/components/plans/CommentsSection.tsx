'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { commentsApi } from '@/lib/api'
import type { Comment } from '@/lib/types'

interface Props {
  planId      : string
  lessonNumber: number
  userName    : string   // nome do usuário logado para o avatar
}

// ─── Avatar com inicial ────────────────────────────────────────────────────────

function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  return (
    <div className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-serif text-sm font-bold text-primary`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── Formata data relativa ─────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)     return 'agora mesmo'
  if (diff < 3600)   return `${Math.floor(diff / 60)} min atrás`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h atrás`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

// ─── Card de comentário ────────────────────────────────────────────────────────

function CommentCard({
  comment, planId, lessonNumber,
}: {
  comment     : Comment
  planId      : string
  lessonNumber: number
}) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => commentsApi.delete(planId, lessonNumber, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments', planId, lessonNumber],
      })
      toast.success('Comentário removido.')
    },
    onError: () => toast.error('Erro ao remover comentário.'),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3 }}
      className="group flex gap-3"
    >
      <Avatar name={comment.user.name} />

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-1.5 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">
            {comment.user.name}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {timeAgo(comment.created_at)}
          </span>
          {comment.is_own && (
            <span className="rounded-md border border-primary/20 bg-primary/8 px-1.5 py-0.5 font-mono text-[9px] text-primary">
              você
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>

        {/* Ação de deletar — só aparece para comentários próprios */}
        {comment.is_own && (
          <div className="mt-2">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 size={11} /> remover
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Tem certeza?
                </span>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="font-mono text-[11px] text-destructive hover:underline"
                >
                  {deleteMutation.isPending ? 'removendo…' : 'sim, remover'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="font-mono text-[11px] text-muted-foreground hover:underline"
                >
                  cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Seção principal ───────────────────────────────────────────────────────────

export default function CommentsSection({ planId, lessonNumber, userName }: Props) {
  const queryClient = useQueryClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')

  // ── Query de comentários ────────────────────────────────────────────────────
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', planId, lessonNumber],
    queryFn:  () => commentsApi.list(planId, lessonNumber).then((r) => r.data as Comment[]),
  })

  // ── Mutation de criar ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => commentsApi.create(planId, lessonNumber, content),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({
        queryKey: ['comments', planId, lessonNumber],
      })
    },
    onError: () => toast.error('Erro ao publicar comentário.'),
  })

  const handleSubmit = () => {
    if (!content.trim()) return
    createMutation.mutate()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  const count = comments?.length ?? 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">
          Discussão
        </h3>
        {count > 0 && (
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {count}
          </span>
        )}
      </div>

      {/* Input de novo comentário */}
      <div className="flex gap-3">
        <Avatar name={userName} />
        <div className="flex-1 space-y-2">
          <div className="rounded-xl border border-border bg-secondary/30 transition-all focus-within:border-primary/30 focus-within:bg-card">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Compartilhe uma dúvida, insight ou comentário sobre esta aula…"
              className="min-h-[72px] resize-none border-0 bg-transparent text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                ⌘ + Enter para publicar
              </span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || createMutation.isPending}
                className="h-7 gap-1.5 bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                {createMutation.isPending
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Send size={12} />
                }
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      {isLoading ? (
        <div className="space-y-4 pl-11">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-11 text-sm text-muted-foreground"
        >
          Nenhum comentário ainda. Seja o primeiro a comentar!
        </motion.div>
      ) : (
        <div className="space-y-5 pl-11">
          <AnimatePresence initial={false}>
            {comments!.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                planId={planId}
                lessonNumber={lessonNumber}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}