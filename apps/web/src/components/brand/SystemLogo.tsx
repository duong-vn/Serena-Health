import logoWebp from '../../assets/logo.webp'

type SystemLogoProps = {
  className?: string
  alt?: string
}

export function SystemLogo({ className = 'system-logo', alt = 'Serene Health' }: SystemLogoProps) {
  return (
    <img
      src={logoWebp}
      alt={alt}
      className={className}
      width={32}
      height={32}
      loading="eager"
      decoding="async"
    />
  )
}

