import type { HTMLAttributes, ReactNode } from 'react'
import './ScrollArea.css'

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function ScrollArea({ children, className = '', ...props }: ScrollAreaProps) {
  return (
    <div className={['soft-scrollbar', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}
