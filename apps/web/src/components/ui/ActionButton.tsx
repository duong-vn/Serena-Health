import type { CSSProperties, ReactNode } from 'react'
import './ActionButton.css'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type PrimaryButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  disabled?: boolean
  onClick?: () => void
  style?: CSSProperties
}

type IconButtonProps = {
  label: string
  children: ReactNode
  variant?: ButtonVariant
  onClick?: () => void
  style?: CSSProperties
}

export function PrimaryButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled,
  onClick,
  style,
}: PrimaryButtonProps) {
  return (
    <button className={`ui-button ui-button-${variant}`} type={type} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  )
}

export function IconButton({ label, children, variant = 'secondary', onClick, style }: IconButtonProps) {
  return (
    <button className={`ui-icon-button ui-button-${variant}`} type="button" aria-label={label} title={label} onClick={onClick} style={style}>
      {children}
    </button>
  )
}
