import { motion }    from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  title?      : string
  description?: string
  onRetry?    : () => void
  compact?    : boolean   // versão menor para usar dentro de cards
}

export default function ErrorState({
  title       = 'Erro ao carregar',
  description = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <AlertTriangle size={16} className="shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {onRetry && (
          <Button
            variant="outline" size="sm"
            onClick={onRetry}
            className="shrink-0 gap-1.5 border-destructive/20 text-xs"
          >
            <RefreshCw size={11} /> Tentar
          </Button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 py-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/8">
        <AlertTriangle size={24} className="text-destructive" />
      </div>
      <div>
        <p className="font-serif text-lg font-bold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="gap-2 border-border"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </Button>
      )}
    </motion.div>
  )
}