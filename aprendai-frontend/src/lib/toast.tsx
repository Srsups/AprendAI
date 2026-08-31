import { toast } from 'sonner'

export const notify = {
  success: (title: string, description?: string) =>
    toast.success(title, { description }),

  error: (title: string, description?: string) =>
    toast.error(title, { description: description ?? 'Tente novamente em instantes.' }),

  loading: (title: string) =>
    toast.loading(title),

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),

  // Mensagens padronizadas do app
  planSaved    : () => notify.success('Plano salvo!', 'Seu plano de estudos foi criado.'),
  planDeleted  : () => notify.success('Plano removido.'),
  ratingSaved  : () => notify.success('Avaliação salva!', 'Obrigado pelo feedback.'),
  commentAdded : () => notify.success('Comentário publicado!'),
  commentDeleted: () => notify.success('Comentário removido.'),
  exportDone   : (format: string) => notify.success(`Exportado em ${format.toUpperCase()}!`, 'Arquivo baixado com sucesso.'),
  upgradeDone  : (plan: string) => notify.success(`Plano ${plan} ativado! 🎉`, 'Todos os recursos já estão disponíveis.'),
  sessionExpired: () => notify.error('Sessão expirada', 'Faça login novamente para continuar.'),
  copySuccess  : () => notify.success('Copiado!'),
}