import { motion } from 'framer-motion'
import Link       from 'next/link'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon       : LucideIcon
  title      : string
  description: string
  cta?       : { label: string; href?: string; onClick?: () => void }
  compact?   : boolean
}

export default function EmptyState({ icon: Icon, title, description, cta, compact }: Props) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <Icon size={20} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {cta && (
          cta.href ? (
            <Link href={cta.href}>
              <Button variant="outline" size="sm">{cta.label}</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={cta.onClick}>
              {cta.label}
            </Button>
          )
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-5 py-16 text-center"
    >
      <div className="relative">
        {/* Glow sutil */}
        <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
        <div className="relative rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm">
          <Icon size={32} className="text-primary/60" />
        </div>
      </div>

      <div>
        <h3 className="font-serif text-xl font-bold text-foreground">{title}</h3>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {cta && (
        cta.href ? (
          <Link href={cta.href}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              {cta.label}
            </Button>
          </Link>
        ) : (
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={cta.onClick}
          >
            {cta.label}
          </Button>
        )
      )}
    </motion.div>
  )
}