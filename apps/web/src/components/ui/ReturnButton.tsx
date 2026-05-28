import './ReturnButton.css'

interface ReturnButtonProps {
  onClick: () => void
  label?: string
  className?: string
  title?: string
  style?: React.CSSProperties
}

export function ReturnButton({ onClick, label = 'Quay lại', className = '', title, style }: ReturnButtonProps) {
  return (
    <button
      type="button"
      className={`ui-return-button ${className}`}
      onClick={onClick}
      title={title}
      style={style}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="ui-return-arrow-svg">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}
