'use client'

import { useQuery } from '@tanstack/react-query'
import { plansApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import type { TrendingItem } from '@/lib/types'

interface Props {
  onSelect: (subject: string) => void
}

export default function TrendingList({ onSelect }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: () => plansApi.trending().then((r) => r.data as TrendingItem[]),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!data?.length) return null

  return (
    <div>
      <p className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Mais procurados
        <span className="h-px flex-1 bg-border" />
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.map((item) => (
          <button
            key={item.subject}
            onClick={() => onSelect(item.subject)}
            className="group rounded-xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <p className="text-sm font-semibold leading-tight text-foreground">
              {item.subject}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[11px] text-muted-foreground">
                {item.total_generations.toLocaleString()} gerações
              </span>
              {item.avg_rating && (
                <span className="text-[11px] text-yellow-400">
                  {'★'.repeat(Math.round(item.avg_rating))}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}