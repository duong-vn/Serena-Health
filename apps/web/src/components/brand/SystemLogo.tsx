type SystemLogoProps = {
  className?: string
}

export function SystemLogo({ className = 'system-logo' }: SystemLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 30"
      role="img"
      aria-label="System logo"
    >
      <path d="M2 15 10 3l8 12-8 12L2 15Z" fill="#9AC9FF" />
      <path d="M10 15 18 3l8 12-8 12-8-12Z" fill="#76B5FF" />
      <path d="M18 15 26 3l8 12-8 12-8-12Z" fill="#9AC9FF" />
      <path d="M10 15 18 3l8 12-8 12-8-12Z" fill="#6CACFF" fillOpacity=".42" />
    </svg>
  )
}