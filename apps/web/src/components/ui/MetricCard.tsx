import type { ReactNode } from 'react'
import './MetricCard.css'

export type MetricCardProps = {
  label: string
  value: string | number
  delta?: string
  icon: ReactNode
  iconClassName?: string
}

export function MetricCard({ label, value, delta, icon, iconClassName = '' }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={['metric-icon', iconClassName].filter(Boolean).join(' ')}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {delta ? <span>{delta}</span> : null}
      </div>
    </article>
  )
}
